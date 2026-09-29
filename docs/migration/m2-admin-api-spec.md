# M2 세부 스펙 — Admin Import API

[design.md](design.md) 3-2절의 상세 스펙. M4의 `import` 서브커맨드가 호출하는 유일한 API 계약이다.

## 0. 기존 선례 확인 및 반면교사

2.0에 이미 `SiteApiController`(`@RequestMapping(["/site", "/sites"])`)의 `/site/export`/`/site/import`가 있어 컨벤션을 그대로 따르되, 구현 하나는 **재사용하면 안 된다**:

```kotlin
@PostMapping("/import")
fun importData(@RequestParam("data") file: MultipartFile, ...) {
    checkAdmin(authentication)
    dataBackupService.importAll(file.bytes)   // ⚠️ 전체를 메모리에 올림
}
```

`file.bytes`는 멀티파트 업로드 전체를 메모리에 적재한다 — 이건 이 설계 전체가 없애려던 바로 그 안티패턴(`DataBackupServiceImpl.exportAll()`과 동일 계열)이다. **재사용할 것은 `checkAdmin()` 권한 체크 패턴과 `/site` 경로 컨벤션뿐**이고, 업로드 처리 자체는 스트리밍으로 새로 짠다.

## 0-a. 전송 프로토콜: REST/HTTP (gRPC 아님, 2026-09-29 결정)

평범한 REST/HTTP(멀티파트 업로드 + JSON 응답)로 간다. gRPC는 채택하지 않는다.

- 관리자가 가끔 실행하는 저빈도 admin 작업이라, gRPC가 강점을 갖는 "고빈도 폴리글랏 마이크로서비스 RPC" 상황이 아니다.
- gRPC는 메시지당 기본 4MB 제한이 있어 GB급 아카이브 전송에 오히려 수동 청킹이 필요하다 — HTTP multipart/청크 전송이 이미 이 문제를 프로토콜 레벨에서 해결해준다.
- 2.0은 이미 Spring MVC REST 스택(`SiteApiController` 등)이다. 이 기능 하나 때문에 별도 포트의 gRPC 서버(별도 인증/인터셉터/헬스체크 필요)를 새로 띄우는 건 비용 대비 이득이 없다.
- **HTTP/2 자체는 애플리케이션이 결정할 일이 아니라 배포 인프라(TLS 종료 리버스 프록시) 문제**다. 서버가 지원하면 클라이언트가 자동 협상한다 — M4 CLI는 Java 11+ `HttpClient`(HTTP/2 네이티브 지원)를 사용해 별다른 설정 없이 이 이점을 얻는다.
- 업로드 안정성(대용량 전송 중 끊김)은 프로토콜 선택 문제가 아니라 **재개 가능한 업로드** 설계로 별도 해결한다 — **결정(2026-09-29): 처음부터 다시 보내지 않고, 끊긴 지점부터 이어서 보낸다.** 이 프로젝트의 출발점 자체가 "GB급 데이터, 느리고 불안정할 수 있는 전송"이라, 매번 처음부터 재전송하는 방식은 연결이 조금만 불안정해도 영영 완료 못 할 위험이 있다. 3절에 청크 업로드 프로토콜로 반영.

## 1. 경로 규칙

기존 `SiteApiController`와 같은 계열의 컨트롤러(`MigrationApiController` 또는 `SiteApiController`에 메서드 추가)에 `/site/migration/imports` 하위로 둔다. 아카이브 자체(`manifest.json`)에 owner/projectName이 이미 있으므로 URL 경로에 프로젝트를 넣지 않는다.

| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | `/site/migration/imports/uploads` | 청크 업로드 세션 생성 |
| PUT | `/site/migration/imports/uploads/{uploadId}/chunks/{chunkIndex}` | 청크 하나 업로드(재시도/재개 단위) |
| GET | `/site/migration/imports/uploads/{uploadId}` | 이미 받은 청크 목록 조회(재개 시 사용) |
| POST | `/site/migration/imports/uploads/{uploadId}/complete` | 업로드 완료 확정 + `ImportJob` 생성(비동기 시작) |
| GET | `/site/migration/imports/{jobId}` | 진행률/결과 조회 |

## 2. 인증

기존 legacy 전권 토큰 컨벤션 그대로 재사용(`ApiTokenAuthenticationFilter` 확인됨): 요청 헤더에 `Authorization: token <값>` 또는 `Yona-Token: <값>` 중 하나. 내부 권한 체크는 `SiteApiController.checkAdmin()`과 동일한 패턴(`loginUser.isSiteManager` — `UserState.SITE_ADMIN`만 허용) 재사용. **M2의 기존 미결 질문("서비스 계층 직접 호출 시 권한 체크를 어느 계층에서 재현할지")은 이걸로 해결** — 컨트롤러 계층에서 `checkAdmin()`으로 처리한다.

M4 CLI는 `import --server <url> --token <token>` 형태로 토큰을 받아 `Yona-Token` 헤더로 보낸다(옛 yona-export의 `config.YONA.TO.USER_TOKEN` 관례와 동일해 CLI 사용자 입장에서 낯설지 않음).

## 3. 청크 업로드 프로토콜 (재개 가능, 2026-09-29 결정)

큰 아카이브를 고정 크기 청크로 쪼개 업로드한다. 끊기면 **이미 받은 청크는 다시 안 보내고, 안 받은 청크부터** 이어서 보낸다. 자체 구현(tus 같은 표준 프로토콜 도입 대신) — CLI(클라이언트)와 M2(서버) 양쪽을 우리가 다 통제하므로, 범용성을 위한 tus 스펙 전체를 끌어올 필요 없이 딱 필요한 만큼만 만든다.

### 3-1. `POST /site/migration/imports/uploads` — 세션 생성

```jsonc
// 요청
{ "fileName": "yona-projects-yona-help-20260929.tar.gz", "fileSize": 5368709120, "fileSha256": "..." }
```
- `fileSha256`: 클라이언트가 로컬 파일 전체를 미리 해시해서 보낸다 — 업로드 완료 후 조립본이 손상 없이 도착했는지 최종 검증용.
- 응답:
  ```jsonc
  { "uploadId": "up_9f2...", "chunkSize": 16777216, "totalChunks": 320 }
  ```
- 서버는 `fileSize`만큼의 빈 파일을 미리 할당(sparse file)하고, `UploadSession(uploadId, totalChunks, receivedChunks, fileSize, fileSha256, expiresAt)`을 영속화한다.

### 3-2. `PUT /site/migration/imports/uploads/{uploadId}/chunks/{chunkIndex}` — 청크 하나 업로드

- 요청 바디: 해당 청크의 raw bytes(마지막 청크만 `chunkSize`보다 작을 수 있음), 헤더 `X-Chunk-SHA256: <이 청크의 sha256>`
- **서버 구현 원칙(0절 반면교사 반영, 여기도 동일)**: 청크를 메모리에 전부 올리지 않고 스트리밍으로 읽으며 목적 파일의 `chunkIndex * chunkSize` 오프셋에 `RandomAccessFile`로 바로 쓴다 — 청크를 순서대로 받을 필요도, 별도 조립 단계도 없음.
- 청크 해시가 안 맞으면 `409`로 거부(그 청크만 재전송하면 됨, 다른 청크에 영향 없음)
- 성공 시 `204 No Content`, `UploadSession.receivedChunks`에 이 인덱스 기록

### 3-3. `GET /site/migration/imports/uploads/{uploadId}` — 재개용 상태 조회

```jsonc
{ "uploadId": "up_9f2...", "totalChunks": 320, "receivedChunks": [0,1,2,3,4,5,6,7,8], "complete": false }
```
- CLI가 재시작/재시도할 때 이걸 먼저 호출해서, **이미 받아진 청크는 건너뛰고 나머지만** 업로드한다.

### 3-4. `POST /site/migration/imports/uploads/{uploadId}/complete` — 업로드 확정 + Job 생성

- 모든 청크가 도착했는지 확인, 조립된 파일의 SHA-256을 재계산해 세션 생성 시 받은 `fileSha256`과 대조(불일치 시 `409`, 전체 재업로드 필요)
- 검증 통과 시 `manifest.json` 파싱 후 `ImportJob(status=PENDING, sourceArchivePath=...)` 생성, 기존 `AsyncConfig` executor로 비동기 처리 시작
- 응답: `202 Accepted`
  ```jsonc
  { "jobId": "b3f1...", "status": "PENDING", "statusUrl": "/site/migration/imports/b3f1..." }
  ```
- 에러: `403`(비관리자), `400`(청크 누락/`manifest.json` 파싱 실패/`formatVersion` 미지원/전체 해시 불일치), `404`(owner 또는 타깃 project가 2.0에 미리 존재하지 않음 — design.md 12절, M2는 project를 생성하지 않음), `409`(타깃 프로젝트 내용이 비어있지 않음 — design.md 4절 / 아카이브 `projectVcs`가 프로젝트의 실제 `vcs`와 불일치 — design.md 12절)

### 3-5. 세션 정리

미완료 `UploadSession`이 일정 시간(예: 48시간) 지나면 배치/스케줄러가 임시 파일+세션 레코드를 정리한다(업로드 임시 파일 보존 정책과 동일한 정신 — 결정됨 항목 참고).

## 4. `GET /site/migration/imports/{jobId}`

```jsonc
{
  "jobId": "b3f1...",
  "status": "RUNNING",              // PENDING | RUNNING | COMPLETED | FAILED | PARTIAL
  "progress": {
    "users": { "processed": 12, "total": 12 },
    "labels": { "processed": 5, "total": 5 },
    "milestones": { "processed": 3, "total": 3 },
    "issues": { "processed": 2210, "total": 4213 },
    "posts": { "processed": 0, "total": 340 },
    "attachments": { "processed": 0, "total": 891 }
  },
  "startedAt": "2026-09-29T10:00:00+09:00",
  "completedAt": null,
  "report": null                    // COMPLETED/FAILED/PARTIAL일 때만 채워짐
}
```

- `report`(완료 시): 항목별 실패/스킵 사유 배열(design.md 3-2절의 "조용한 스킵 금지" 원칙 그대로 노출)
  ```jsonc
  "report": {
    "summary": { "succeeded": 4200, "failed": 13 },
    "failures": [
      { "entityType": "issue", "legacyId": 4177, "reason": "author loginId 'ghost' not found" }
    ]
  }
  ```
- 에러: `403`(비관리자), `404`(jobId 없음)

## 5. M4 `import` 서브커맨드 ↔ API 매핑

```
yona-extractor import --archive out.tar.gz --server https://yona2.example.com --token $TOKEN

1. 로컬에 이 아카이브(파일 경로+크기+해시로 식별)에 대한 이전 업로드 재개 상태 파일이 있는지 확인
   - 없으면: fileSha256 계산 → POST .../uploads로 세션 생성 → 재개 상태 파일에 uploadId 즉시 저장
   - 있으면: GET .../uploads/{uploadId}로 이미 받아진 청크 목록 조회
2. 아직 안 보낸 청크만 순서대로 PUT .../uploads/{uploadId}/chunks/{i} (청크별 X-Chunk-SHA256 포함)
   - 청크 전송 실패 시 그 청크만 재시도(백오프), 전체 재시작 아님
   - CLI 프로세스 자체가 죽어도 재개 상태 파일이 남아있어 다음 실행에서 1번부터 이어감
3. 모든 청크 전송 완료 후 POST .../uploads/{uploadId}/complete → jobId 수신, 재개 상태 파일 삭제
4. GET {server}/site/migration/imports/{jobId} 를 폴링(예: 5초 간격)
5. status가 COMPLETED/FAILED/PARTIAL이 되면 report를 표준출력에 출력하고 종료
   - PARTIAL/FAILED면 CLI 종료 코드를 0이 아닌 값으로(운영 스크립트가 실패를 감지할 수 있게)
```

## 6. 결정됨 (design.md 14절 및 후속 결정, 2026-09-29)
- ~~업로드 도중 네트워크 끊김에 대한 재개(resume) 지원 여부~~ → **지원한다.** 3절의 청크 업로드 프로토콜로 끊긴 지점부터 이어서 전송(전체 재시작 아님) — GB급 데이터·불안정한 전송이라는 이 프로젝트의 출발 전제상, M5까지 미룰 문제가 아니라고 판단해 지금 확정.
- ~~업로드 임시 저장 디렉터리와 최종 처리 후 보존/삭제 정책~~ → 성공 시 즉시 삭제, 실패/PARTIAL 시 7일 보관 후 정리(정확한 기간은 배포 시 설정값). 미완료 업로드 세션은 48시간 후 정리(3-5절)
- ~~`report.failures`가 아주 많을 때 응답 페이로드 크기~~ → 최대 500건까지 inline, 초과분은 건수만 표시(1차 범위)
