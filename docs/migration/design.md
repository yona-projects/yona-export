# Yona Import/Export 설계 문서

관련 이슈: [yona-projects/yona#828](https://github.com/yona-projects/yona/issues/828)

## 0. 전제 조건 (확정된 제약)

| 항목 | 내용 |
|---|---|
| yona 1.6 | `../yona` 저장소 `v1.6` 브랜치. **빌드 불가 → 코드 수정/신규 배포 절대 불가.** 읽기는 DB+파일시스템만 가능, 라이브 API 호출 금지(운영 중인 인스턴스에 부하를 주면 안 됨) |
| yona 2.0 | `../yona` 저장소 `next` 브랜치. 이관 시 **반드시 2.0 REST/서비스 계층을 통해서만 쓰기** (DB 직접 insert 금지 — 검증/권한/사이드이펙트 우회 방지) |
| 규모 | 소규모~대용량(GB급) 프로젝트를 **같은 경로**로 처리. 크기별 분기 없이 항상 스트리밍/페이징 전제 |
| 운영 영향 | 소스(1.6)·타깃(2.0) 모두 운영 중인 서비스에 부하를 주면 안 됨 → 비동기 잡, 자원 제한, 소스는 replica/스냅샷에서 읽기 |
| 알림 | import/export 진행 중 프로젝트 멤버/워처에게 알림 발송 금지 |
| 2.0 자체 도구 | 대용량이어도 요청-응답으로 안 막힘 — 비동기로 생성 후 **나중에 다운로드**(S3 호환 업로드 등) |
| 범위 제외 | git/svn 저장소 본체, LFS 객체는 **사람이 수동 이관** — 도구 범위 아님 |
| 완전성 | 1.6의 모든 데이터가 2.0으로 **빠짐없이** 이관되어야 함(조용히 스킵 금지) |
| 목표1 | yona 1.6 → yona 2.0 |
| 목표2 | yona 2.0 → yona 2.0 (같은 엔진 재사용) |
| 압축 | 산출되는 모든 아카이브는 **반드시 압축** |
| 단위 | export/import는 항상 **프로젝트 단위**로 수행 (사이트 전체 일괄 이관 아님, 회사/프로젝트별로 개별 일정으로 진행 가능) |
| 전제 | 타깃 project의 owner(유저 또는 조직)와 **project 자체(빈 상태, 올바른 vcs 타입)**는 import 시작 전 2.0에 **이미 존재**해야 함 — 운영자가 2.0의 정상적인 "새 프로젝트 만들기"로 미리 생성(12절). M2는 project를 생성하지 않음 |

> ✅ **해결(2026-09-29)**: 로컬 `~/yona` 저장소의 `next` 브랜치(234 ahead / 294 behind, Java/Play 코드)는 1.16에 대한 별도 리팩터링 작업이고 2.0과 무관함이 확인됐다. **실제 2.0(Kotlin/Spring) 작업 위치는 `~/yona-convert/yona`**(`next` 브랜치, `origin`=`yona-projects/yona`, 확인 시점 0 ahead / 12 behind — 484개 Kotlin 파일 확인, `git pull`만 하면 최신화됨). M2/M3/M6 구현은 여기서 진행한다.

## 1. 핵심 아이디어: 1개의 아카이브 포맷, 1개의 네이티브 Importer, 2개의 Producer

```
                      ┌─────────────────────────┐
  [yona 1.6 DB/파일]  │                         │
   (읽기 전용, 스냅샷) │   1.6 Extractor (CLI)    │──┐
                      │  yona-export 저장소 upgrade│  │
                      └─────────────────────────┘  │
                                                    │  project-archive.tar.gz
  [yona 2.0 자신]      ┌─────────────────────────┐  │  (표준 포맷, 압축)
                      │  2.0 Native Exporter    │  │
                      │  (비동기 잡, 목표2용)     │──┤
                      └─────────────────────────┘  │
                                                    ▼
                                    ┌───────────────────────────┐
                                    │   2.0 Native Importer      │
                                    │  (비동기 잡, 서비스 계층 직접 호출)│
                                    │  = 목표1·목표2 공용 단일 경로     │
                                    └───────────────────────────┘
```

**왜 이렇게 나누는가**
- 목표1(1.6→2.0)에서 진짜 어려운 부분은 "1.6을 어떻게 읽느냐"뿐입니다. 쓰는 쪽은 어차피 2.0 API/서비스 계층을 써야 하므로, 목표2(2.0→2.0)의 네이티브 importer를 그대로 재사용하면 됩니다.
- 목표2에서 진짜 필요한 건 "2.0 자체의 export"입니다. 이것도 같은 아카이브 포맷으로 내보내면, 1.6 extractor와 2.0 exporter가 **같은 importer 하나만** 상대하면 됩니다.
- 즉 **importer 1개(신규, 2.0 내부) + exporter 2개(1.6용 외부 CLI, 2.0용 네이티브 잡)** 구조입니다. 개발량이 가장 큰 importer/포맷이 공용이라 투자 대비 효율이 좋습니다.

## 2. 아카이브 포맷 (양쪽 producer 공통)

```
{owner}-{project}-{yyyyMMddHHmmss}.tar.gz
├─ manifest.json            # 필수. 아래 참고
├─ users.ndjson
├─ project.json
├─ labels.ndjson
├─ milestones.ndjson
├─ issues.ndjson            # 이슈 + 인라인 댓글 트리
├─ posts.ndjson             # 게시글 + 인라인 댓글 트리
└─ attachments/
   ├─ manifest.ndjson       # id/containerType/containerId/name/hash/mimeType/size
   └─ {attachmentId}/{원본파일명}
```

- **NDJSON**: 엔티티별로 한 줄에 레코드 하나. 읽기/쓰기 모두 라인 스트림 처리 — 절대 `JSON.parse(전체파일)` 금지.
- **manifest.json 필수 필드**:
  - `formatVersion` (예: `"1"`) — 훗날 2.x가 스키마를 깨도 importer가 버전별 매핑 가능
  - `sourceType`: `"yona-1.6"` | `"yona-2.0"`
  - `owner`, `projectName`, `exportedAt`
  - `counts`: 엔티티별 레코드 수 (`issues: 4213`, `attachments: 891`, …) — **import 후 정합성 검증용**
  - `checksums`: 파일별 sha256
- **필드 상세**: 기존 legacy 포맷(`docs/export-file-spec.md`)의 필드를 최대한 재사용한다. 2.0 `ProjectApiController.exports()`(P2-46)가 이미 거의 동일한 필드 구조로 포팅되어 있어 매핑 비용이 낮다.
- **압축**: tar 스트림 자체를 gzip 파이프로 흘려서 생성 — 압축 전 전체를 디스크/메모리에 풀어두지 않음.
- **git/svn/LFS 미포함**: manifest에 `repositoryMigration: "manual"` 같은 플래그만 남겨, importer가 "저장소는 사람이 옮겨야 함"을 알 수 있게 함.

## 3. 컴포넌트별 설계

### 3-1. 1.6 Extractor (yona-export 저장소 업그레이드, 추출 전용으로 범위 축소)

- **기술 스택(2026-09-29 결정, M4 티켓 참고)**: Node.js를 폐기하고 **Kotlin/JVM**으로 전면 재작성 — M2(2.0)와 같은 언어를 씀으로써 아카이브 포맷(날짜/enum/null 처리 등)의 크로스랭귀지 드리프트 리스크를 구조적으로 제거. Spring 없이 Clikt 기반 가벼운 CLI + MariaDB JDBC + `kotlinx-serialization-json` + `commons-compress`. 저장소 이름/위치(`yona-export`)는 유지, 내부만 Gradle 프로젝트로 교체.
- **입력**: 1.6 DB(운영 primary 아님 — **replica 또는 스냅샷 복원본**)에 read-only 접속, `yona_data` 첨부파일 디렉터리 직접 읽기
- 지금의 REST 기반 `unirest` 호출을 전부 제거 — 1.6 앱을 살아있게 유지하거나 API를 새로 만들 필요 자체가 없어짐(빌드 불가 제약과 정확히 맞음)
- 엔티티별 **키셋 페이징 SQL**(`WHERE id > ? ORDER BY id LIMIT N`)로 순회하며 NDJSON에 바로 스트리밍 기록
- 첨부파일은 HTTP 다운로드 대신 **파일시스템 스트림 복사**
- 출력은 2절 포맷의 `.tar.gz` 하나. 이 파일을 2.0 admin에 업로드하면 끝 — extractor는 import 로직을 전혀 갖지 않음
- 지금의 `pushPost`/`pushFiles`/`YonaExport.js`의 import 관련 코드는 전부 제거 대상 (책임이 2.0 native importer로 이동)

### 3-2. 2.0 Native Importer (신규, 목표1·목표2 공용 핵심)

- **트리거**: admin이 아카이브 업로드(직접 업로드 또는 S3 호환 스토리지의 키 지정) → 비동기 잡 생성
- **잡 영속화**: 기존 `AsyncConfig`(core 5 / max 10 / queue 100)는 인메모리라 재시작 시 유실됨 → `ImportJob` 엔티티 신설 필요
  - `id, status(PENDING/RUNNING/COMPLETED/FAILED/PARTIAL), sourceArchiveKey, progress(entity별 처리 개수), checkpoint(마지막 처리 id), resultReport, createdAt/updatedAt`
  - 잡이 중간에 죽어도 checkpoint부터 재개 가능하도록 엔티티 단위로 진행 상태 기록
- **처리 순서**: 뒷단계가 앞단계에서 생성된 **2.0 쪽 새 id**를 참조하므로, 순서뿐 아니라 단계별로 `legacyId → 신규 id` 매핑 테이블을 유지해 다음 단계에 넘겨야 한다(아래 3-2-a).
- **쓰기 경로**: HTTP로 자기 자신을 호출하지 않고, REST 컨트롤러가 호출하는 **동일 서비스 빈을 프로세스 내부에서 직접 호출**. 이렇게 하면
  - 검증/권한/cascade 같은 비즈니스 로직은 그대로 보존되고(= "2.0 API를 통해서 import"라는 요구사항의 본질을 만족)
  - HTTP 왕복 오버헤드 없이 배치/동시성 제어 가능
- **동시성**: 엔티티 타입 내부에서 바운디드 워커 풀(예: 8~16)로 병렬 처리, 타입 간에는 의존 순서 유지
- **알림 억제**: import 잡 컨텍스트에 `suppressNotifications=true` 플래그를 태워, 알림 발송 서비스가 이 플래그를 보면 실제 발송을 건너뛰되 감사 로그에는 "발송되었을 알림"을 기록(추적 가능하게)
- **완전성 검증**: 처리 끝나면 `manifest.counts`와 실제 생성된 레코드 수를 비교. 불일치·실패 항목은 **조용히 스킵하지 않고** `resultReport`에 항목별로 남김(예: 부모가 없는 중첩 답글은 스킵이 아니라 최상위로 승격해서 보존 + 리포트에 "원래 부모 id" 기록)
- **결과**: import 완료 리포트(성공/부분성공/실패 + 항목별 사유)를 admin이 조회 가능하게
- **API 세부 스펙**: 업로드/상태조회 엔드포인트, 인증 헤더, 응답 스키마는 [m2-admin-api-spec.md](m2-admin-api-spec.md) 참고 — 기존 `/site/import`(`SiteApiController`)의 `MultipartFile.bytes` 전체 메모리 적재 안티패턴을 재사용하지 않도록 명시

#### 3-2-a. 단계별 순서와 id 매핑

| 순서 | 단계 | 참조하는 것 | 참조 방식 | 다음 단계로 넘기는 매핑 |
|---|---|---|---|---|
| 0 | 사전검증 | 타깃 project owner(유저/조직) | 2.0에 **이미 존재해야 함** — owner/조직 생성은 이 도구 책임 아님 | - |
| 0 | 사전검증 | 타깃 project | **미리 존재**해야 함(운영자가 2.0에서 직접 생성 — 12절), 내용은 비어 있어야 함(4절), `vcs`가 아카이브의 `projectVcs`와 일치해야 함 | - |
| 1 | users(+credentials) | - | loginId 충돌 시 명시적 해결 | `legacyLoginId → finalLoginId` |
| 2 | project | 기존 project 조회(생성 아님, 12절) + `updateProject()`로 설정 필드 반영, members 추가 | members는 최종 loginId로 바로 연결(숫자 id 매핑 불필요) | - |
| 3 | labels | project | project에 귀속 | (이름+category로 참조, id 매핑 불필요) |
| 4 | milestones | project | project에 귀속 | `legacyMilestoneId → newMilestoneId` |
| 5 | issues | project, author/assignees(loginId), labels(이름), milestone | milestone은 4의 매핑으로 조회 | `legacyIssueId → newIssueId` |
| 6 | issue 댓글 | issue(5의 매핑), author, 부모 댓글 | **댓글 배열은 반드시 legacyId 오름차순**(부모가 자식보다 먼저) — M1 포맷 불변식 | `legacyCommentId → newCommentId` |
| 7 | posts | project, author | - | `legacyPostId → newPostId` |
| 8 | post 댓글 | post(7의 매핑), author, 부모 댓글 | 6과 동일하게 부모 먼저 | `legacyCommentId → newCommentId` |
| 9 | attachments | containerType별로 5/6/7/8의 매핑에서 실제 컨테이너의 새 id 조회 | - | - |
| 10 | 마무리 | - | 이슈/포스트 번호 카운터 보정(4절), `manifest.counts` 대비 검증 | - |

- `@멘션` 텍스트 치환(4절)은 별도 단계가 아니라, 1단계에서 확정된 매핑을 5~8단계에서 `body`를 쓰기 직전에 그대로 적용하면 된다.
- `loginId`/`labelName`으로 참조하는 관계는 **숫자 id 매핑이 필요 없다** — 매핑 테이블이 실제로 필요한 건 milestone/issue/post/comment 4종류뿐이다.
- 3단계(labels)는 `IssueLabelService.newLabelByCategoryName()` 하나로 카테고리 find-or-create + 라벨 생성이 끝나므로 실제로는 더 세분화할 필요 없다(아래 "라벨 ↔ 카테고리 선행관계" 절).
- 4단계(milestones)·5단계(issues)에서 원본 상태가 CLOSED였던 항목은, 생성 직후 각각 `updateMilestone(..., State.CLOSED)`/`changeState(..., State.CLOSED, ...)`를 추가로 호출해야 한다(아래 "강제 OPEN 상태" 절) — 표에는 안 드러나지만 실제로는 4/5단계 각각에 "생성 → (CLOSED면) 상태 보정" 두 개의 하위 스텝이 있는 셈이다.

### 3-3. 2.0 Native Exporter (신규, 목표2 전용 — 목표1엔 필수 아님)

- 현재 `ProjectApiController.exports()`(단일 JSON 응답)를 대체하는 **비동기 버전**
- 같은 페이징/스트리밍 방식으로 2절 포맷 아카이브 생성
- 완료되면 S3 호환 스토리지에 업로드하고, admin에게 다운로드 링크 제공(요청자에게만 — "알림 금지"는 워처/멤버 대상이지 요청한 관리자 본인의 완료 통지까지 막을 필요는 없다고 판단됨, 필요시 이 부분도 옵트인/아웃 설계)
- 이 exporter가 생기면 **목표1의 리허설**로도 쓸 수 있음 — 실제 1.6 데이터를 만지기 전에, 2.0→2.0 export/import 왕복으로 importer를 먼저 검증 가능

## 4. 본문 내 상호참조(`#이슈`, `@멘션`, 커밋 id) 처리

Yona 본문/댓글 텍스트는 `#N`(이슈·PR 번호), `@loginId`(멘션), 커밋 해시를 자동 링크로 인식한다. 이관 과정에서 이 값들이 **"문법적으로는 유효하지만 실제로는 엉뚱한 대상을 가리키는"** 상태가 되면, 완전성 요구사항(빠짐없이 이관)을 만족해도 의미적으로는 깨진 데이터가 된다. 텍스트를 사후에 정규식으로 치환하는 방식은 코드블록/URL/색상 코드(`#fff`) 등과 헷갈리기 쉬워 신뢰하기 어렵다 — 대신 **애초에 참조 대상 자체가 바뀌지 않게** 만드는 걸 원칙으로 한다.

### `#N` (이슈/포스트 번호) — 가장 중요한 케이스
- **원칙**: M2 importer는 이슈/포스트 생성 시 원본 `number`(아카이브 포맷의 필수 필드, M1 참고)를 auto-increment로 새로 받지 않고 **그대로 명시적으로 설정**한다. 서비스 계층을 직접 호출하는 구조(3-2절)라 REST의 "다음 번호 자동 발급" 경로를 안 타도 된다.
- 번호가 원본과 동일하게 유지되면 본문의 `#N`은 **아무것도 고치지 않아도 여전히 같은 이슈를 가리킨다.** 같은 원칙으로 이관된 다른 프로젝트를 향한 `owner/project#N` 크로스 레퍼런스도 그 프로젝트가 같은 전략으로 이관됐다면 자동으로 유지된다.
- **전제조건**: 번호 충돌이 없으려면 **타깃 프로젝트가 import 시작 시점에 비어 있어야** 한다. M2는 이를 사전 검증으로 강제한다(비어있지 않으면 import 거부 — 비어있지 않은 프로젝트로의 병합은 이번 범위에서 다루지 않음).
- import 완료 후 2.0 프로젝트의 "다음 이슈/포스트 번호" 카운터를 `max(imported numbers) + 1`로 맞춰야 이후 신규 생성이 정상 동작한다.

### `@loginId` (멘션)
- 계정 충돌이 없어 loginId가 원본 그대로 유지된 유저는 멘션도 자동으로 유효하다.
- 충돌 해결 과정(3-2절 — 자동 병합 금지, 명시적 해결)에서 loginId가 바뀐 유저가 있다면, 그 매핑(원본 loginId → 최종 loginId)을 본문/댓글 텍스트에 **2차 치환 패스**로 적용한다. 처리 순서상 users가 issues/posts보다 먼저이므로(3-2절) 매핑 테이블은 이미 준비돼 있다.

### 커밋 id
- git/svn 저장소 자체는 도구 범위 밖(수동 이관)이라, 이관 후 커밋 해시가 그대로 유지되는지는 **이 도구가 보장할 수 없다**(예: `git clone --mirror`로 옮기면 해시가 유지되지만, svn→git 변환처럼 히스토리를 다시 쓰는 방식이면 깨진다).
- 본문에서 커밋 해시로 보이는 패턴(hex 7~40자)의 건수만 감지해 import 리포트에 "저장소 히스토리 보존 여부를 확인하세요" 경고로 남긴다. 매핑을 알 수 없으므로 자동 치환은 시도하지 않는다.

## 5. 구현 순서 제안

1. **아카이브 포맷 확정 + 2.0 Native Importer** (핵심, 목표1·2 공용) — [M1](tickets/M1-archive-format.md), [M2](tickets/M2-native-importer.md)
2. **2.0 Native Exporter** (목표2 완성 + 목표1 importer 검증용 리허설 도구 확보) — [M3](tickets/M3-native-exporter.md)
3. **1.6 Extractor로 yona-export 축소/개편** (목표1 완성) — [M4](tickets/M4-legacy-extractor.md). `export` 서브커맨드는 M1만 있으면 1번 단계와 병행 착수 가능, `import` 서브커맨드(M2 API 클라이언트)는 M2의 API 계약이 확정된 뒤 구현
4. 실제 대용량 합성 데이터(수만 이슈, GB급 첨부)로 왕복 벤치마크 — [M5](tickets/M5-validation.md)

## 6. 열린 질문 (2026-09-29 일괄 점검 — 최신 상태는 14절)

이 절에 나열했던 질문들을 14절에서 전부 재점검했다. 코드로 확인되어 해결된 것, 지금 엔지니어링 판단으로 결정한 것, 여전히 조직/운영 결정이 필요해서 열려 있는 것으로 분류했다 — **최신 상태는 항상 14절을 기준으로 본다.** 이 절은 최초 작성 시점의 스냅샷으로만 남겨둔다.

- ~~S3 호환 스토리지 자격증명/버킷~~ → 14절: **해결**, 지금 당장 이슈 아님(M2는 무관, M3 착수 시점으로 미룸)
- ~~import 완료/실패 알림 채널~~ → 14절: **해결**, 알림 채널 없음(콘솔 출력으로 대체)
- ~~1.6 DB replica/스냅샷 접근 경로~~ → 14절: **해결**, 이 설계 문서의 관심사 밖으로 확정(순수 운영 이슈)
- ~~로컬 `~/yona` `next` 브랜치 분기 정리~~ → 14절: **해결.** `~/yona`는 1.16 별도 리팩터링용이고 무관, 실제 2.0 작업 위치는 `~/yona-convert/yona`로 확인됨
- ~~번호가 이미 채워진 프로젝트로 이관~~ → 14절: **해결(닫음)**, 12절 워크플로우상 발생 안 함
- ~~유저의 추가 등록 이메일(`emails`)~~ → 14절: **해결**, 포함하기로 결정
- ~~1.6 `UserState` 매핑~~ → 14절: **해결**, 2.0과 완전히 동일함을 확인

## 7. 검증된 사실 (upstream `next` 실제 코드 확인, 2026-09-28)

로컬 `~/yona`가 아니라 `yona-projects/yona`의 실제 `next`(Kotlin) 브랜치를 세션 스크래치패드에 별도로 받아 직접 확인함(이 세션 시점엔 `~/yona-convert/yona`의 존재를 몰랐음). **향후 작업은 이미 로컬에 있는 `~/yona-convert/yona`를 쓰면 된다(14절 참고) — 매번 새로 클론할 필요 없음.**

- **`number`는 실제로 앱이 관리하는 프로젝트별 카운터**이지 DB auto-increment가 아님을 확인. `Project.kt`에 `var lastIssueNumber: Long = 0`, `var lastPostingNumber: Long = 0`이 평범한 컬럼으로 있고, `ProjectRepository`가 `UPDATE Project SET lastIssueNumber = lastIssueNumber + 1`로 원자적 채번한다.
- **`explicitNumber` 파라미터가 이미 있음** — `IssueService.createIssue(..., explicitNumber: Long?, sendNotification: Boolean)`, `PostingService.createPosting(..., explicitNumber: Long?)`. 전달 시 `lastIssueNumber`/`lastPostingNumber` 카운터를 건드리지 않고 번호를 그대로 쓴다(legacy `saveWithNumber()` 재현). 4절의 번호 보존 전략이 그대로 성립하고, 카운터 보정(`max+1`)이 필요하다는 설계도 정확히 들어맞는다.
- **알림 억제도 이슈에는 이미 있음** — `IssueService.createIssue()`의 `sendNotification: Boolean` 파라미터. 코드 주석: *"sendNotification=false는 마이그레이션으로 과거 이슈를 대량 삽입할 때 알림 폭주를 막는 용도."* 이미 legacy 호환 벌크 생성 API(`POST /-_-api/v1/owners/{owner}/projects/{projectName}/issues`, `IssueApiController.newIssuesLegacyPath()`)가 이 파라미터들을 그대로 쓰고 있음.
- **DB에 `UNIQUE(project_id, number)` 제약**이 Issue/Posting 테이블 모두에 있어, 번호 충돌 시 애플리케이션 버그가 있어도 DB가 막아준다(사전검증의 백업).

### 새로 발견한 갭
같은 알림 억제 패턴이 **posting/댓글에는 없다**:
- `PostingServiceImpl.createPosting()`은 `explicitNumber`는 있지만 `sendNotification`이 없어 생성 시 무조건 `publishNotification(..., EventType.NEW_POSTING, ...)` 호출
- `CommentService.createIssueComment()`/`createPostingComment()`는 억제 파라미터 자체가 없어 무조건 `EventType.NEW_COMMENT` 발행

→ M2 착수 전, `PostingService`/`CommentService`에 `IssueService`와 동일한 패턴으로 `sendNotification: Boolean = true` 파라미터를 추가하는 작은 선행 PR이 필요하다(패턴이 이미 있어 구현 난이도는 낮음).

### users → issues 순서와 관련해 추가로 확인한 사실

- **순서 강제는 실제 시그니처로 확인됨**: `createIssue(author: User, assigneeUser: User?, ...)`는 loginId 문자열이 아니라 이미 조회된 `User` 엔티티를 받는다 — author가 먼저 존재해야 호출 자체가 불가능하다(3-2-a 표와 일치).
- **⚠️ 기존 legacy 호환 API의 "조용한 대체"는 M2가 재사용하면 안 됨**: `IssueApiController.newIssuesLegacyPath()`는 `author` loginId 조회 실패 시 **조용히 import를 실행한 관리자 본인(`currentUser`)으로 대체**하고, milestone/label 조회 실패 시 조용히 필드를 빠뜨린다. 이건 "조용한 스킵 금지" 원칙과 정면 충돌하는 기존 코드 동작이다 — M2는 이 fallback을 쓰지 말고, 참조 대상을 못 찾으면 그 항목을 실패 처리하고 리포트에 남겨야 한다.
- **⚠️ 기존 유저 벌크 생성 API(`POST /-_-api/v1/users`, `UserController.createUserNode()`)는 이번 요구사항과 안 맞음**: `SecureRandom`으로 만든 불투명한 임의 비밀번호를 Argon2id로 인코딩해 저장한다 — 코드 주석: *"결과적으로 어떤 실제 비밀번호로도 로그인할 수 없는 계정이 되며, 별도의 비밀번호 재설정 절차를 거쳐야 한다."* 이 경로를 쓰면 credentials.ndjson으로 만든 요구사항("계정 재생성 없이 기존 비밀번호로 로그인")을 만족하지 못한다.
  - **실제로 필요한 메커니즘은 다른 곳에 있고, 확인 완료**: `PasswordEncodingService.legacyHash(password, salt)` = `SHA-256(salt + password)`를 시작으로 총 1024회 반복 재해싱한 뒤 Base64 인코딩(정확한 알고리즘, M1 `credentials.ndjson`의 `passwordHashAlgorithm` 값과 일치시켜야 함). `YonaAuthenticationProvider.onLoginSuccess()`가 로그인 성공 시 `passwordEncodingService.needsUpgrade(storedHash)`가 true면 그 자리에서 Argon2id로 재해싱해 저장한다.
  - `userService.createUser(user: User)`(`UserServiceImpl`)는 `createdDate` 설정과 `name.trim()`뿐인 단순 저장 — 비밀번호를 건드리지 않는다.
  - **결론**: M2는 `createUserNode()`를 호출하지 말고, `User(loginId=..., name=..., email=..., password=<credentials.ndjson의 passwordHash>, passwordSalt=<passwordSalt>)`를 직접 구성해 `userService.createUser()`로 저장해야 한다. 그러면 마이그레이션된 계정이 기존 비밀번호로 로그인 가능하고, 첫 로그인 성공 시 자동으로 Argon2id로 업그레이드된다.

### `User` 엔티티 전체 필드 감사 (upstream 실제 코드 확인)

`User.kt` 전체를 확인한 결과, credentials 외에도 반영/제외 여부를 정해야 하는 필드가 더 있었다.

- **⚠️ 보안 — `UserState.SITE_ADMIN`은 그대로 옮기면 안 됨**: `isSiteManager`는 별도 플래그가 아니라 `state == UserState.SITE_ADMIN`으로 판정된다. 1.6에서 admin이었던 유저의 상태를 그대로 복사하면 2.0에서도 자동으로 사이트 관리자 권한이 생긴다. **M2는 import 시 `SITE_ADMIN` 상태를 절대 그대로 반영하지 않고 강등(예: `ACTIVE`)해야 하며, 관리자 권한 부여는 이관 후 2.0 운영자가 수동으로 한다.**
- **`UserState` 전체 값 확인**: `ACTIVE`, `LOCKED`, `DELETED`, `GUEST`, `SITE_ADMIN`. `credentials.ndjson`의 `accountStatus`는 이 값 중 `SITE_ADMIN`을 제외한 나머지만 매핑 대상으로 한다(구체적 매핑 정책은 M4에서 1.6 쪽 실제 상태값과 대조해 확정).
- **유저 아바타도 첨부파일 시스템에 있음**: `Attachment(containerType = ResourceType.USER_AVATAR, containerId = user.id.toString())`로 조회된다(`UserViewController.fillAvatarId()`). M1의 `attachments/manifest.ndjson` `containerType` enum에 `USER_AVATAR`가 빠져 있었다 — 추가 필요, `containerLegacyId`는 다른 유저 참조와 마찬가지로 loginId 기준으로 둔다.
- **제외하기로 결정(의도적 스코프 제외, 보안/정합성상 옮기지 않는 게 맞음)**:
  - `token`(레거시 전권 API 토큰) — 자격증명과 동급 민감정보. 새 시스템에서는 새로 발급받는 게 원칙.
  - `rememberMe`/`failedLoginAttempts`/`lockedUntil`/`lastStateModifiedDate` — 세션/브루트포스 방어 상태. 이관 대상 데이터가 아니라 "새로 시작"해야 하는 런타임 상태.
  - 2FA 관련 필드(`isTwoFactorEnabled` 등) — 1.6(legacy Play 앱)에는 2FA 개념 자체가 없어 자연히 비활성으로 생성됨. **확인 완료(14절)**: 1.6 소스 전수 검색으로 2FA 코드 전무 확인, 별도 처리 불필요.
- **부차 — `emails`(멀티 이메일)**: `User`가 `email` 외에 추가 등록 이메일 목록(`emails: MutableList<Email>`)을 가질 수 있다. **결정 완료(14절)**: 포함하기로 함, `users.ndjson`에 `additionalEmails` 필드 추가(archive-format-spec.md 3-2절).

### ⚠️ `createdDate`/`updatedDate`가 전부 `Instant.now()`로 하드코딩됨 — 별도 대응 필요

`IssueServiceImpl.createIssue()`(3곳), `PostingServiceImpl.createPosting()`, `CommentServiceImpl.createIssueComment()`/`createPostingComment()` **전부** 생성 시각을 파라미터로 안 받고 내부에서 `Instant.now()`로 못박는다. `MigrationService`(GitHub 이관)에서 선례를 찾아봤지만 이건 **내보내기 전용**(Yona→GitHub용 JSON 조립만 함, 실제 생성 로직 없음)이라 "날짜를 보존하며 대량 생성"하는 기존 코드가 어디에도 없다.

이대로 두면 이관된 모든 이슈/포스트/댓글의 생성일이 전부 "import를 실행한 시각"이 되어, 완전성 요구사항(원본 그대로)을 정면으로 깬다.

- **댓글은 서비스가 엔티티를 내부에서 직접 생성**(`IssueComment(...)`을 서비스 메서드 안에서 construct)하므로, 캐치할 방법이 서비스 파라미터 확장(새 PR) 아니면 없다.
- **이슈/포스트는 호출자가 미리 만든 엔티티를 넘기지만**, 서비스가 그 안의 `createdDate`를 무조건 덮어쓴다 — 호출자가 미리 세팅해도 소용없다.
- **채택한 전략**: 서비스 메서드 시그니처를 또 확장하지 않고, **생성 직후 raw 엔티티 갱신으로 2차 보정**한다. `createIssue()`/`createPosting()`/`createIssueComment()`/`createPostingComment()`를 정상 호출해 번호채번·알림억제·멘션인덱싱 등 비즈니스 로직을 그대로 태운 뒤, 반환된 엔티티의 `createdDate`/`updatedDate`만 원본 값으로 바꿔 해당 리포지토리로 한 번 더 `save()`한다(알림·멘션 로직은 재호출 안 되므로 사이드이펙트 없음). 서비스 코드를 더 건드리지 않아도 되는 게 장점.

M2 범위·AC에 반영.

### 첨부파일(Attachment) 서비스 계층 확인

- **`AttachmentService.store(inputStream, name, containerType, containerId, ownerLoginId)`** — Spring `MultipartFile`이 아니라 **순수 `InputStream`**을 받는다. 아카이브에서 압축 해제한 로컬 파일을 `FileInputStream`으로 열어 그대로 넘기면 된다(멀티파트로 감쌀 필요 없음).
- **해시는 내부에서 자체 계산**: `MessageDigest.getInstance("SHA-256")`로 스트림을 읽으며 직접 해시를 구하고, `File(uploadDir, hex(hash))`로 콘텐츠 주소화 저장한다 — M1의 `sha256` 필드와 알고리즘이 정확히 일치한다. M2는 import 후 `store()`가 반환한 `Attachment.hash`와 아카이브에 미리 계산해 둔 `sha256`을 대조해 전송 중 손상 여부를 한 번 더 검증할 수 있다.
- **`mimeType`은 실제 바이트에서 Tika로 재감지**한다(호출자가 넘긴 값을 안 씀) — 아카이브의 `mimeType` 필드는 참고용일 뿐 강제로 반영할 필요 없음.
- **⚠️ 여기도 `createdDate = Instant.now()` 하드코딩** — 위와 동일하게 생성 직후 반환된 `Attachment`의 `createdDate`만 2차로 재저장해야 한다.
- **`containerId`는 검증 없이 그대로 저장되는 문자열**이라, M2가 항상 **2.0 쪽 신규 숫자 id를 문자열로** 넘겨야 한다(존재 검증은 서비스가 안 해줌 — 잘못된 값을 넘기면 조용히 고아 첨부가 생김). 특히 `USER_AVATAR`는 `containerId`가 **유저의 신규 숫자 id**다(`UserViewController.fillAvatarId()`에서 `user.id.toString()`로 조회 확인) — **loginId가 아니다.** 지난 턴에 M1에 "containerLegacyId는 loginId로 매칭"이라고 적은 건 정정 필요 — 아카이브 안에서는 loginId로 참조해도 되지만, M2가 실제로 `store()`에 넘길 때는 1단계에서 만든 유저의 신규 id를 loginId로 조회해서 써야 한다.
- 알림/멘션 관련 부작용 없음(별도 억제 불필요).

### 게시판(Posting) 전용 필드 확인

`Posting.kt` 엔티티를 전체 확인한 결과, M1 스펙에 빠진 필드가 있었다.

- **`notice`(공지 고정)/`readme`(프로젝트 README 지정 게시글)**: M1에 없었음, 추가함. `readme`의 git 커밋 로직(`commitReadmeFile()`)은 `PostingServiceImpl.updatePosting()`에만 있고 `createPosting()`에는 없음을 코드로 확인 — 생성 시점엔 git repo에 아무 부작용이 없어 그대로 값을 넣어도 안전하다.
- **⭐ `labels`(게시글 라벨) — 지금까지 어떤 이관 도구도 옮긴 적 없던 데이터를 찾음**: 2.0 `Posting`에 `posting_issue_label` 조인 테이블로 라벨 연관관계가 있다. `docs/export-file-spec.md`/legacy `exports()` API 예시엔 게시글에 라벨이 없어 "게시글은 라벨이 없다"고 여겨왔는데, 로컬 `~/yona`(1.16 레거시) `app/models/Posting.java`를 직접 확인하니 **정확히 동일한 `posting_issue_label` 테이블이 이미 있었다** — 즉 1.16 시절부터 있던 기능인데 옛 export API가 애초에 이 필드를 JSON에 담은 적이 없어서 지금까지 어떤 이관 경로로도 옮겨진 적이 없다. M4는 1.6 DB를 직접 읽으므로 이 옛 API의 한계를 물려받지 않고 제대로 캡처할 수 있다.
  - `PostingService.createPosting()`은 `labelIds` 같은 파라미터가 없다 — M2는 `Posting(...)` 생성자에 `labels = resolvedLabelSet`을 직접 채워서 넘겨야 한다(`createPosting()` 내부에서 `posting.labels`를 건드리지 않는 것도 확인함, 그대로 저장됨).
- **`parent`(Posting 자기참조)**: 2.0 코드 전체에서 실제로 값이 대입되는 곳이 한 곳도 없음(`grep`으로 확인) — 사실상 미사용 필드. 이관 대상에서 제외.

### 라벨 ↔ 카테고리 선행관계 확인 + 새로 발견한 강제 OPEN 상태 문제

**라벨/카테고리**: `IssueLabel.category`가 `IssueLabelCategory`를 가리키는 필수(`nullable = false`) FK라, 카테고리가 먼저 있어야 라벨을 만들 수 있다 — 3-2-a 표에서 "labels"를 한 단계로 뭉뚱그렸는데 실제로는 카테고리 선행이 필요하다는 게 맞았다. 다행히 **`IssueLabelService.newLabelByCategoryName(projectId, categoryName, categoryIsExclusive, labelName, labelColor)`가 이미 "카테고리를 찾거나 없으면 만들고, 라벨을 추가"하는 find-or-create를 한 번에 처리**한다(legacy `IssueLabelApp.newLabel()` 대응) — M2는 이 메서드 하나로 라벨을 순서대로 넣으면 카테고리 생성까지 자동으로 해결된다. 별도 "카테고리 생성 단계"를 만들 필요 없음.
- **주의**: 동일 카테고리+이름의 라벨이 이미 있으면 `null`을 반환한다(legacy `noContent()` 대응) — 타깃 프로젝트가 비어 있다는 전제(4절)상 정상 흐름에선 발생하지 않아야 하며, 발생하면 아카이브 데이터 자체에 중복이 있다는 뜻이므로 **조용히 넘기지 말고 실패 처리**해야 한다.
- `isExclusive`는 실제로는 카테고리 소속 속성이라, 같은 카테고리의 라벨 레코드마다 값이 달라선 안 된다(M1 `labels.ndjson`이 편의상 레코드마다 들고 있지만, 같은 category 값끼리는 항상 동일해야 함 — 다르면 추출 시점 데이터 이상으로 M4가 경고해야 함).

**⚠️ 새로 발견 — `createMilestone()`도 `createIssue()`와 같은 문제(강제 OPEN)를 갖고 있음**: `MilestoneServiceImpl.createMilestone()`은 파라미터로 어떤 state를 넘기든 **무조건 `milestone.state = State.OPEN`으로 덮어쓴다.** `createIssue()`가 `issue.state = if (isDraft) DRAFT else OPEN`으로 강제하는 것과 같은 패턴 — **CLOSED 상태의 과거 이슈/마일스톤을 생성 시점에 바로 만들 방법이 없다.** 지금까지 이 문제 자체를 문서화하지 않고 있었다(이번에 라벨/카테고리를 확인하다 같이 발견).

- **이슈 CLOSED**: 생성 후 `IssueService.changeState(issueId, State.CLOSED, updaterLoginId)`를 호출해야 한다. 단 이 메서드는 `sendNotification` 파라미터가 없어 **무조건 `EventType.ISSUE_STATE_CHANGED` 알림을 발행**하고, `issue.updatedDate = Instant.now()`로 재설정한다. → (a) `PostingService`/`CommentService`와 마찬가지로 `changeState()`에도 `sendNotification: Boolean = true` 파라미터 추가가 필요한 선행 작업 목록에 들어간다. (b) 날짜 2차 보정(위 "createdDate 하드코딩" 절)은 **`changeState()` 호출 이후에** 해야 한다 — 순서가 바뀌면 `changeState()`가 `updatedDate`를 다시 지금 시각으로 덮어써 버린다.
- **마일스톤 CLOSED**: 생성 후 `MilestoneService.updateMilestone(milestoneId, title, contents, dueDate, State.CLOSED)`를 호출해야 한다. 이 메서드는 알림 발행이 없음(코드 확인 완료, 안전). 다만 title/contents/dueDate를 **원래 값 그대로 다시 넘겨야** 한다 — 안 그러면 이 호출이 그 필드들을 덮어써 버린다.

## 8. 1.6 전체 기능 감사 (누락 요소 점검)

로컬 `~/yona`(`v1.6` 브랜치) `app/models/*.java` 74개 엔티티 전수 확인 결과.

### 이미 스코프에 있음
User, Project/ProjectUser, Issue/IssueComment, Posting/PostingComment, Label/IssueLabel/IssueLabelCategory, Milestone, Attachment, Assignee — M1/M2에 반영됨.

### 의도적 제외(기존 결정 유지)
- **코드/저장소 자체와 직결된 것**: CodeComment/CodeCommentThread/CodeRange/NonRangedCodeCommentThread/SimpleCommentThread/CommitComment/ReviewComment/CommentThread, PushedBranch, PostReceiveMessage, Webhook/WebhookThread — "git/svn 저장소는 사람이 수동" 결정 범위(design.md 0절).
- **보안/세션 상태**: SiteAdmin(=SITE_ADMIN 강등으로 이미 처리), UserCredential/LinkedAccount(OAuth 소셜 로그인 연결 — 토큰류라 `token` 필드와 동일 사유로 재발급 원칙), UserVerification, AuthInfo.
- **런타임/파생/캐시 데이터**: Search/SearchResult/TitleHead(검색 인덱스, 2.0이 자체 재생성), Statistics(집계 캐시), UserAction/RecentIssue/RecentProject(개인 최근활동 로그), MailRecipient/NotificationMail/NotificationEvent(발신 큐 — 알림 자체를 안 보내기로 했으므로 무관), CandidateUser/IssueMassUpdate(임시 폼 상태), PageParam/NullUser/TimelineItem(인터페이스)/Role(정적 정의) 등 구조적 헬퍼.
- **개인 취향/저비중**: FavoriteIssue/FavoriteOrganization/FavoriteProject, UserSetting, Property(사이트 전역 설정, 프로젝트 스코프 밖).

### ⚠️ 새로 발견 — 포함 여부를 결정했거나 추가 검토가 필요한 것

| 항목 | 내용 | 결정 |
|---|---|---|
| **Pull Request** | title/body/state/브랜치/커밋id 등 — git 저장소 본체와 별개인 진짜 앱 데이터 | **포함하기로 결정(선생님 확인)**. 다만 이슈/포스트와 메커니즘이 달라 별도 티켓 필요(아래 M6) |
| Issue 타임라인(`IssueEvent`, `eventType`/`oldValue`/`newValue`/`senderLoginId`/`created`) | 이슈 상세의 "히스토리" 탭 — 상태·담당자·라벨 변경 이력 | 권장: 포함. `changeState()` 등을 여러 번 호출하는 것보다, import 시 `IssueEvent` 레코드를 직접 재구성해 저장하는 게 더 정확 (M2 범위 추가 후보) |
| Watch(구독자), Unwatch, UserProjectNotification | 누가 이 이슈/프로젝트를 구독 중인지 | 권장: 포함(낮은 비용, "완전성"에 해당). 없으면 이관된 이슈에 대한 향후 알림을 원래 구독자가 못 받음 |
| ProjectMenuSetting | 프로젝트별 메뉴(게시판/이슈 등) 노출 설정 | 포함 확정, **정정**: 2.0엔 별도 엔티티가 아니라 `Project`에 `isCodeEnabled`/`isIssueEnabled`/`isPullRequestEnabled`/`isReviewEnabled`/`isMilestoneEnabled`/`isBoardEnabled`(1.6 `ProjectMenuSetting.code/issue/pullRequest/review/milestone/board` 1:1 대응)로 평탄화되어 있음(`isWikiEnabled`는 2.0 신규, 1.6 대응 값 없음 → 기본값 사용) |
| `UserSetting.loginDefaultPage` | 로그인 후 이동할 기본 페이지 | **포함으로 정정**(선생님 확인) — 2.0에도 동일 필드 그대로 존재, `users.ndjson`에 추가 |
| **Project 설정 필드 추가 발견** | `siteurl`(외부 사이트 URL), `isCodeAccessibleMemberOnly`, `isUsingReviewerCount`+`defaultReviewerCount`(PR 리뷰 요건) | 포함. 2.0 `Project.kt`에 1:1 대응 필드 확인됨 |
| ⚠️ `isCodeAccessibleMemberOnly` | 코드 브라우징을 멤버 전용으로 제한하는 보안 설정 | **주의**: 이 값이 이관 중 유실되면 1.6에서 멤버 전용이던 코드가 2.0에서 공개로 노출될 수 있음 — SITE_ADMIN 강등과 반대 방향의 리스크(제한이 느슨해지는 쪽). project.json 필수 필드로 취급 |
| `emails`(멀티 이메일) | 유저 추가 등록 이메일 | **결정(14절)**: 포함, `users.ndjson`에 `additionalEmails` 필드 추가 완료. `UserCredential.emailValidated`(이메일 인증 여부)는 아직 미결 — 낮은 우선순위로 남겨둠 |
| ProjectTransfer | 프로젝트 소유권 이전 이력 | 낮은 우선순위(이벤트 로그성) — 제외해도 무방, 필요하면 IssueEvent처럼 별도 검토 |
| IssueSharer | 이슈 단위 외부 공유 권한 | **확인 완료(9·11절)** — 실제로 쓰이는 기능, `issues.ndjson`에 `sharers` 필드로 포함 확정. `IssueShareService.changeSharer()`는 알림을 보내 사용 금지, raw 저장 방식 채택 |

### M6. Pull Request 이관 (신규 티켓, 별도 분리 권장)

- **번호 보존 불가(as-is)**: `PullRequestService.createPullRequest()`에 `explicitNumber` 파라미터가 없다 — Issue/Posting과 동일한 패턴의 선행 PR(파라미터 추가) 필요.
- **번호 시퀀스가 이슈와 별개**: `(to_project_id, number)` UNIQUE — 이슈 `#N`과 PR `#N`이 같은 프로젝트에 동시에 존재 가능. **확인 완료(14절)**: `AutoLinkRenderer`는 PR을 아예 지원하지 않고 `#N`은 항상 이슈만 가리키므로, 두 시퀀스가 겹쳐도 텍스트 해석 충돌은 없다.
- **⚠️ `createPullRequest()`가 `processMergeCheck()`를 호출해 실제 JGit 병합/diff 계산을 수행** — PR 생성 시점에 실제 git 저장소가 이미 올바르게 존재해야 한다. 즉 **PR 이관은 M2(DB 이관)와 같은 타이밍에 자동 실행할 수 없고, 사람이 저장소를 수동으로 다 옮긴 뒤에 별도로 실행**해야 한다. M1/M2가 "저장소 없이도 완결"되게 설계한 것과 근본적으로 다른 제약.
- `created`/`updated`도 동일하게 `Instant.now()` 하드코딩 — 같은 2차 보정 필요.
- **확인 완료(14절)**: `processMergeCheck()`를 스킵하는 내장 메커니즘은 없다 — 대량의 이미 종결된 과거 PR은 `createPullRequest()`를 쓰지 말고 `PullRequest` 엔티티를 직접 구성해 repository로 저장하는 방식을 채택(비용/정확성 문제 해소).

## 9. `Issue` 엔티티 전체 필드 감사 (upstream 실제 코드 확인)

User/Project/Posting은 전수 확인했는데 Issue는 안 했었다 — 확인해보니 세 가지가 더 나왔다.

- **⭐ `parent: Issue?` — 서브태스크 계층, 실제로 쓰이는 기능**: Posting의 `parent`(미사용 확인됨)와 달리 이건 `IssueViewController.kt`에서 실제로 대입되는 곳이 있다(서브태스크 지정 UI). `issues.ndjson`에 `parentLegacyId` 추가 필요. **주문 문제**: `createIssue()`엔 parent 파라미터가 없어 구성한 엔티티에 직접 세팅해야 하는데, 부모 이슈가 먼저 생성되어 있어야 한다 — 댓글 부모-자식처럼 "legacyId 오름차순 = 부모 먼저"를 전제할 수도 있지만, 더 안전하게는 **1차로 이슈를 전부 생성한 뒤, 2차로 `parentLegacyId`가 있는 이슈만 순회하며 부모를 연결**하는 2-pass 방식을 권장.
- **⚠️ `history` 필드가 `createIssue()` 내부에서 무조건 `""`로 초기화됨**(`issue.history = ""`, line 180) — `createdDate`와 같은 패턴. **단, `createPosting()`은 `history`를 전혀 건드리지 않는다**(코드로 확인, `updatePosting()`에서만 사용) — 즉 Posting은 생성 전 엔티티에 `history`를 세팅해두면 그대로 저장되지만, **Issue만 생성 후 2차 보정이 필요**하다(createdDate 보정과 같은 타이밍에 같이 처리하면 됨).
- **`voters`(Issue·IssueComment 둘 다)와 `weight`는 사실 한 쌍**: `voteIssue()`/`unvoteIssue()`를 보면 `weight`는 독립 필드가 아니라 `voters.size()`를 반영하는 **비정규화 캐시**다(`issue.weight = issue.weight + 1`을 `voters.add()`와 항상 같이 호출). 아카이브에 `weight`를 별도로 담지 말고 `voters`(loginId 목록)만 담아, import 시 `weight = voters.size`로 M2가 직접 계산해서 넣는다(드리프트 방지).
- **`sharers: MutableSet<IssueSharer>`** — 이슈 단위로 비멤버 외부 유저에게 공유 권한을 주는 기능(`IssueSharer(loginId, user, issue, created)`). 이전에 "확인 필요"로 남겨뒀던 `IssueSharer`가 실제로 쓰이는 기능임을 확인 — `issues.ndjson`에 `sharers`(loginId 목록) 추가 필요.

## 10. 뒤늦게 검증한 것들(Watch/IssueEvent/댓글 엔티티)

`Watch`/`IssueEvent`를 M2 스코프(8절)에 "포함 권장"으로 넣을 때 1.6 필드만 보고 판단했었다 — 다른 항목들과 달리 2.0 쪽 실제 코드 검증이 빠져 있어 뒤늦게 확인.

- **`Watch`/`Unwatch`는 2.0에 1:1로 존재하고 구조가 단순하다**: `Watch(id, user, resourceType, resourceId)` — 날짜 필드조차 없다. `WatchService.watch(user, resourceType, resourceId)`/`unwatch(...)` 호출 하나면 끝, 확인된 알림 부작용도 없음. 걱정했던 것보다 훨씬 저위험.
- **`IssueEvent`도 2.0에 1:1로 존재**: `id/issue/senderLoginId/senderEmail/oldValue/newValue/created/eventType` — 1.6 필드와 정확히 대응. `created`도 여기 그대로 세팅 가능한 생성자 파라미터라 별도 2차 보정 불필요(다른 곳처럼 서비스가 강제로 now()를 박는 구조가 아님, 단순 엔티티라 직접 repository.save()).
- **`IssueComment`/`PostingComment` 전체 필드 재확인**: `history` 필드는 둘 다 없음(기존 판단 유지). **새 발견**: `IssueComment`에만 `voters: MutableSet<User>`가 있다(`issue_comment_voter` 조인 테이블) — 이슈 댓글은 투표 가능, 게시글 댓글은 불가능. `issues.ndjson` 댓글 항목에 `voters` 필드 추가.
- **`Assignee(id, user, project)`**: project 스코프의 "담당 가능 후보" 풀 엔티티(이슈에 직접 달리는 게 아니라, project.json의 `assignees` 목록과 1:1 대응) — 기존 설계와 정확히 일치, 새로운 이슈 없음.

## 11. 알림 재점검 — 라벨/투표/공유/프로젝트 생성 (선생님 재확인 요청)

"import 중엔 알림이 절대 가면 안 된다"는 요구를 다시 강조받아, 지금까지 명시적으로 안 짚었던 나머지 쓰기 경로를 전부 재확인했다.

- **라벨(`newLabelByCategoryName`)·투표(`voteIssue`/`unvoteIssue`)**: 코드에 알림 관련 호출이 전혀 없음 확인 — 안전. 투표는 어차피 M2가 `voters`를 엔티티에 직접 세팅하는 방식(9절)이라 이 서비스 메서드 자체를 호출하지 않으므로 이중으로 안전.
- **⚠️ `sharers` — `IssueShareService.changeSharer()`는 실제로 알림을 보낸다**: `add`/`delete` 액션마다 무조건 `sendNotification()`을 호출한다(억제 파라미터 없음). 다행히 실제 저장 로직(`addSharerInternal()`)은 private 헬퍼로 `IssueSharer(...)` 생성 + `issueSharerRepository.save()`뿐이라, **M2는 `changeSharer()`를 호출하지 말고 `IssueSharer` 엔티티를 직접 구성해 repository로 저장**해야 한다(다른 곳과 동일한 "비즈니스 메서드 우회, raw 저장" 패턴).
- **⚠️ `ProjectService.createProject()`에서 알림과 무관한 버그 두 개를 추가로 발견**:
  1. `project.siteurl = "http://localhost:9000/${project.name}"` — 파라미터로 뭘 넘기든 **무조건 이 값으로 덮어씀**. 어제 추가한 `project.json`의 `siteurl` 필드가 생성 시점에 그대로 날아간다 — `createdDate`/`history`와 같은 2차 보정 대상 목록에 `Project.siteurl`도 추가해야 한다.
  2. `project.createdDate = Instant.now()`도 동일하게 하드코딩 — Project도 2차 날짜 보정 대상에 포함.
  3. `repositoryService.getRepository(savedProject).create()`가 `createProject()` 안에서 호출되어 **실제 빈 git/svn bare 저장소를 생성하는 부작용**이 있다. 즉 M2가 project를 생성하는 순간 그 경로에 빈 저장소가 이미 생긴다 — 저장소 수동 이관을 맡을 운영자에게 "새로 만들지 말고 이 경로에 이미 있는 빈 저장소에 push/복원하라"고 안내해야 한다(M6/운영 절차에 반영 필요).
  4. `createProject(project, creator)`는 `creator` 한 명만 MANAGER로 등록한다 — project.json의 나머지 멤버는 별도로 `ProjectUser(project, user, role)`를 직접 구성해 `projectUserRepository.save()`로 추가해야 한다(전용 "멤버 추가" 서비스 메서드가 없음, 확인된 다른 `ProjectUser` 생성 지점들도 전부 raw 저장 방식이라 알림 위험 없음).

## 12. 아키텍처 변경 — M2는 project를 생성하지 않는다 (2026-09-29 결정)

11절 4번(빈 저장소 부작용)을 해결하는 방법으로 두 가지를 검토했다: (1) 저장소 자체도 아카이브에 포함해서 이관, (2) 저장소 이관은 계속 사람이 하되 프로젝트 생성 시점 자체를 조정. **(2)를 선택**했다 — (1)은 이슈 #828의 발단이었던 "GB급 저장소" 문제를 같은 파이프라인에 재도입하는 것이라 범위가 급격히 커지고, git/svn/hg 세 가지 백업/복원을 각각 새로 구현해야 한다.

### 결정 내용

**M2는 `ProjectService.createProject()`를 아예 호출하지 않는다.** 대신:

- 기존 전제 "owner는 미리 존재해야 함"(0절)을 **"project 자체(빈 상태, 올바른 vcs 타입)도 미리 존재해야 함"으로 확장**한다.
- 운영 절차: **① 운영자가 2.0에서 평범하게 "새 프로젝트 만들기"로 프로젝트를 생성**(이 정상적인 흐름 안에서 `createProject()`가 호출되어 올바른 타입의 빈 저장소가 자동으로 생기고 `siteurl`도 이 인스턴스 기준으로 정상 세팅됨 — "부작용"이 아니라 "원래 그런 동작") **→ ② 그 빈 저장소에 1.6 저장소를 수동으로 push/복원 → ③ M2로 DB 데이터(유저/이슈/게시글/라벨/마일스톤/첨부 등)만 import.**
- 이 순서는 M6(PR 이관)이 요구하던 "PR 생성 시점에 저장소가 이미 있어야 함" 전제도 자동으로 만족시킨다 — 운영 절차가 **프로젝트 껍데기 생성(수동) → 저장소 push(수동) → M2 DB import(자동) → M6 PR import(자동)** 하나로 통일된다.
- 11절 1·2·3번(siteurl/createdDate 하드코딩, 빈 저장소 부작용)은 **M2가 project를 안 건드리니 전부 해소**된다. `siteurl`은 오히려 아카이브 값으로 덮어쓰면 안 된다 — 새 인스턴스의 실제 URL이 맞는 값이므로, 굳이 옛 값을 이관할 이유가 없다(project.json `siteurl` 필드 자체를 참고용으로만 남기고 import 시 무시).
- **`updateProject(projectId, UpdateProjectParam)` 확인 완료**: `isCodeAccessibleMemberOnly`/`isUsingReviewerCount`/`defaultReviewerCount`/`isXEnabled` 7종 전부 `param.xxx != null`일 때만 반영하는 부분 업데이트라 정확히 필요한 용도에 맞는다. 이름 변경(`param.name`) 분기 이외엔 알림·저장소 부작용 전혀 없음(코드 확인). M2는 project 조회 후 이 메서드로 설정 필드만 반영한다.
- **새 사전검증**: 아카이브의 `projectVcs`가 미리 만들어둔 프로젝트의 실제 `vcs`와 일치하는지 확인 — 불일치 시 즉시 실패(다른 타입의 저장소를 잘못 이관하는 사고 방지).
- 멤버 추가(creator 외 나머지)는 11절 4번 그대로 — `ProjectUser` 직접 구성 + repository 저장.

### API 전송 프로토콜: HTTP/2 vs gRPC (같은 날 논의)

m2-admin-api-spec.md의 업로드/폴링 API는 **평범한 REST/HTTP로 유지**하고 gRPC는 채택하지 않는다.
- 이 기능은 관리자가 가끔 실행하는 저빈도 작업이라, gRPC가 강점을 갖는 "고빈도 폴리글랏 마이크로서비스 RPC" 상황이 아니다.
- gRPC는 메시지당 기본 4MB 제한이 있어 GB급 아카이브 전송에 오히려 수동 청킹이 필요 — HTTP multipart/청크 전송이 이미 이 문제를 프로토콜 레벨에서 해결해준다.
- 2.0은 이미 Spring MVC REST 스택(`SiteApiController` 등)이라, 이 기능 하나 때문에 별도 포트의 gRPC 서버를 새로 띄우는 건 비용 대비 이득이 없다.
- HTTP/2 자체는 애플리케이션 코드가 결정할 문제가 아니라 배포 인프라(TLS 종료 리버스 프록시) 문제에 가깝다 — 서버가 지원하면 Java 11+ `HttpClient`가 자동 협상한다. M4 CLI는 이 클라이언트를 사용.
- 업로드 안정성(대용량 전송 중 끊김)은 프로토콜 선택이 아니라 **재개 가능한 업로드** 설계로 해결한다 — **결정(2026-09-29)**: 처음부터 재전송하지 않고 끊긴 지점부터 이어서 보내는 청크 업로드 프로토콜을 채택(m2-admin-api-spec.md 3절). GB급 데이터·불안정한 전송이 이 프로젝트의 출발 전제라 M5까지 미룰 문제가 아니라고 판단.

## 13. Export/Import 정합성 최종 점검 ("완전히 맞물렸는가" 재확인)

M1(아카이브가 담는 필드) ↔ M2(그 필드로 실제로 하는 일)를 끝까지 대조해봤다 — 12절 아키텍처 변경(M2가 project를 안 만듦) 이후 project.json의 일부 필드가 "누가 쓰는지" 불분명해진 채 방치돼 있었다.

- **⚠️ 진짜 버그 발견 — 이슈 담당자는 단수인데 배열로 잘못 적어뒀었다**: `Issue.assignee: Assignee?`(2.0)도 `Issue.assignee`(1.6 `app/models/Issue.java`)도 **이슈당 담당자 1명**만 지원한다. `issues.ndjson`에 `"assignees": [...]`(배열)로 적어둔 건 오기 — `assigneeLoginId`(단수, nullable) 하나로 정정했다(archive-format-spec.md 3-6절). `createIssue(assigneeUser: User?)`가 이미 단수 파라미터라 M2 구현 자체는 원래 계획대로면 되고, **아카이브 필드 이름/형태만 틀려 있었다.**
- **`project.json`의 `assignees`/`authors`는 파생값(derived), M2가 쓸 일이 없다**: `ProjectApiController.findAuthors()`가 이슈/게시글을 스캔해서 그때그때 계산하는 값이고, `Assignee` 엔티티 자체도 project 레벨 "후보 풀"이 아니라 `createIssue()`/`changeAssignee()` 안에서 이슈 배정마다 그때그때 새로 생성된다(project 공용으로 미리 만들어두는 게 아님). 그래서 M2가 project 단계에서 이 두 필드로 뭘 할 필요가 없다 — issues/posts를 올바른 `authorLoginId`/`assigneeLoginId`로 만들면 자연히 재구성된다. M2 티켓에 "안 쓴다"는 게 빠져 있어서 마치 누락처럼 보였을 뿐, 실제로는 할 일이 없는 게 맞다.
- **`projectScope`가 project 업데이트 호출 목록에서 빠져 있었다**: `updateProject()`의 `param.projectScope`는 null-가드가 있어(다른 설정 필드들과 동일 패턴) 안전하게 반영 가능한데, M2 범위에 명시가 안 돼 있었다 — 추가.
- **⚠️ `project.overview`는 null-가드가 없다**: `updateProject()` 안에서 `project.overview = param.overview`가 조건 없이 실행된다(다른 필드들과 다름). M2가 `overview`를 안 건드리려고 `null`을 넘기면 **설명이 지워진다.** 항상 아카이브의 `projectDescription` 값을 명시적으로 채워 넘겨야 한다.
- **`Project.createdDate`는 이번 아키텍처 변경으로 "이관 대상에서 자연히 제외"됐다**: `updateProject()`가 이 필드를 아예 안 건드리고, M2도 더 이상 `createProject()`를 호출하지 않으므로 손댈 지점이 없다. 프로젝트 껍데기는 운영자가 오늘 만드는 새 레코드이므로, **1.6의 원래 생성일을 억지로 이식하지 않고 2.0에서 실제로 만들어진 날짜를 그대로 두는 걸 의도된 트레이드오프로 채택**한다(별도 보정 안 함).

### 결론
M1 필드 중 실제로 쓰이지 않는 게 있다는 걸 명확히 하고(파생값 2개), 진짜 빠졌던 것(단수/배열 오기, projectScope, overview 널가드)을 채워 넣은 지금 시점에서 M1↔M2는 필드 단위로 맞물렸다고 볼 수 있다. 다만 이건 "설계 문서 레벨"의 정합성이고, 실제 구현 코드가 나온 뒤엔 M5(대용량 검증)에서 왕복 테스트로 다시 한번 실증해야 한다.

## 14. 미결 질문 일괄 점검 (2026-09-29)

여러 티켓에 흩어진 "미결 질문"/"열린 질문"을 모아 코드로 검증 가능한 건 검증하고, 엔지니어링 판단으로 지금 정할 수 있는 건 정했다. 조직/운영 차원의 결정이 필요한 것만 진짜로 열어둔다.

### ✅ 코드로 확인되어 해결됨

| 질문 | 출처 | 결론 |
|---|---|---|
| `AutoLinkRenderer`가 `#N`을 이슈/PR 중 어떻게 구분해 해석하는지 | M6 | **PR을 아예 지원 안 함** — `toValidIssueLink()`가 `issueRepository`만 조회하고 `pullRequestRepository` 참조가 코드 어디에도 없다. `#N`은 항상 이슈만 가리킨다. 즉 "이슈 #N과 PR #N이 같은 프로젝트에 공존"해도 본문 텍스트에서 헷갈릴 위험 자체가 없다 — M6의 우려가 기우였음이 확인됨. |
| 종결된 PR의 `processMergeCheck()` 스킵 가능 여부 | M6 | **스킵 메커니즘 없음**(코드 확인) — `createPullRequest()`는 항상 `processMergeCheck()`를 무조건 호출한다. **권장**: M6은 `createPullRequest()`를 쓰지 말고, `PullRequest` 엔티티를 직접 구성해 `pullRequestRepository.save()`로 저장(다른 곳과 동일한 "비즈니스 메서드 우회, raw 저장" 패턴) — 대량의 이미 종결된 과거 PR에 실제 JGit 병합 재계산을 매번 돌릴 필요가 없다. |
| PR 리뷰 코멘트(`ReviewComment`/`CommentThread`)를 어디까지 포함할지 | M6 | **결정(2026-09-29)**: 포함한다. `CommentThread`가 `commitId`/`prevCommitId`로 특정 커밋에 구조적으로 고정되므로, 저장소 이관은 이미 결정된 대로 사람이 직접 하되(0절) **커밋 해시를 보존하는 방식(`git clone --mirror` 등)으로 하라는 요건을 운영 절차 문서에 명시**한다 — 이건 "우리가 못 정하는 질문"이 아니라 "운영자에게 요구할 조건"이었을 뿐. |
| 1.6 `UserState`가 정확히 몇 가지이고 2.0과 어떻게 매핑되는지 | 6절 | `../yona`(v1.6) `models/enumeration/UserState.java` 확인 — **2.0과 완전히 동일**: `ACTIVE, LOCKED, DELETED, GUEST, SITE_ADMIN`. 매핑 로직 불필요, 값 그대로 대응(SITE_ADMIN→ACTIVE 강등 규칙만 예외 적용). |
| 1.6에 2FA 개념이 정말 없는지 | 7절(가정) | `app/models`/`app/controllers`에 TwoFactor/TOTP/WebAuthn 관련 코드 전무 확인 — 가정 확정, 별도 처리 불필요. |

### ✅ 엔지니어링 판단으로 지금 결정

| 질문 | 출처 | 결정 |
|---|---|---|
| 유저의 추가 등록 이메일(`emails`)을 `users.ndjson`에 포함할지 | 6절 | **포함한다** — `loginDefaultPage` 때와 같은 논리(완전성 원칙, 비용 낮음). `users.ndjson`에 `additionalEmails: string[]` 필드 추가(M1 후속 작업). |
| `ImportJob` 실패 시 부분 생성된 데이터의 롤백/정리 정책 | M2 | **자동 롤백 안 함.** 상태를 `FAILED`/`PARTIAL`로 남기고 상세 리포트 제공 — 운영자가 (a) 프로젝트를 지우고 재시도하거나 (b) 아카이브를 고쳐 체크포인트부터 재개할지 직접 선택. 자동 롤백은 "부분 성공"이라는 유용한 정보(어디까지 됐는지)를 지워버려서 채택 안 함. |
| 업로드 임시 파일 보존/삭제 정책 | m2-admin-api-spec.md | **성공 시 즉시 삭제, 실패/PARTIAL 시 7일 보관 후 정리**(감사 목적) — 정확한 보관 기간은 배포 시 설정값으로 뺀다. |
| `report.failures`가 많을 때 페이로드 크기 | m2-admin-api-spec.md | **응답에 최대 500건까지 inline, 초과분은 "N건 더 있음" 표시만** — 그 이상 상세가 필요한 경우는 1차 범위 밖(필요성이 실제로 확인되면 별도 페이지네이션 엔드포인트 추가). |
| 번호가 이미 채워진(비어있지 않은) 프로젝트로 이관해야 하는 경우 | 6절 | **현재 워크플로우에서는 발생하지 않음 — 닫음.** 12절 결정으로 타깃 프로젝트는 항상 운영자가 이관 전용으로 새로 만드는 빈 프로젝트라, 번호 충돌 시나리오 자체가 안 생긴다. 향후 "같은 프로젝트에 반복/증분 이관"이 실제 요구로 나오면 그때 재검토. |

### ✅ 추가로 결정됨 (2026-09-29, 선생님 확인)

| 질문 | 결정 |
|---|---|
| import 완료/실패를 요청 관리자에게 알릴 채널(이메일/인앱) | **알림 채널 없음.** M4 CLI의 콘솔 출력(폴링 결과 stdout 출력)이 유일한 확인 수단 — m2-admin-api-spec.md 5절 흐름 그대로, 별도 이메일/인앱 발송 기능은 만들지 않는다. |
| S3 호환 스토리지 자격증명/버킷 준비 여부 | **지금 당장의 이슈 아님 — M3(2.0 Native Exporter) 착수 시점으로 미룸.** M2(import)는 이미 로컬 스트리밍 업로드로 설계돼 있어 S3와 무관하다(m2-admin-api-spec.md 0-a절). S3는 M3의 "나중에 다운로드" 기능에만 필요하므로, M3 세부 설계 시 재논의. |
| 1.6 DB의 read-only replica/스냅샷 접근 경로 확보 | **이 설계 문서의 관심사 밖으로 확정.** M4 구현 시점에 운영진이 알아서 처리할 순수 운영 이슈 — 더 이상 열린 질문으로 추적하지 않는다. |

### ⏳ 여전히 조직/운영 차원의 결정이 필요함 (코드로 못 닫음)

(현재 없음 — 마지막 항목이었던 로컬 브랜치 정리는 위에서 해결됨)
