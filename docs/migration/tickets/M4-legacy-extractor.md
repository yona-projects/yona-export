---
id: M4
title: 1.6 Extractor (yona-export 개편)
status: 미착수 (기술 스택 결정 완료)
repo: yona-export (Node.js → Kotlin/Gradle로 전면 교체, 저장소/이름은 유지)
depends_on: [M1, M2]
---

# M4. 1.6 Extractor (yona-export 개편)

## 목표
현재 REST API 호출 기반인 yona-export를, 1.6 DB(read-only, replica/스냅샷)와 `yona_data` 파일을 직접 읽어 M1 포맷 아카이브를 생성하는 추출 전용 CLI로 개편한다. **실제 import 로직(데이터 쓰기)은 전량 제거하고 M2(2.0 내부)로 이동**하지만, CLI 자체는 `export`/`import` 두 서브커맨드를 모두 제공한다 — `import`는 DB에 직접 쓰지 않고 **M2의 admin 업로드 API를 호출해 잡을 트리거하고 진행 상황을 폴링해서 보여주는 얇은 클라이언트**다. 옛 yona-export가 CLI 하나로 export/import를 다 다뤘던 사용자 경험을 유지하기 위함(2026-09-29 결정).

## 기술 스택 (2026-09-29 결정)

이슈/포스트/댓글 4개 메서드가 각기 다른 이유로 실패했던 것처럼(번호채번/알림/비밀번호/날짜), extractor와 importer가 **서로 다른 언어**면 아카이브 포맷의 미묘한 불일치(날짜 포맷, enum 대소문자, null 처리 등)가 컴파일 타임에 안 잡히고 실제 이관 시점에야 터진다는 게 이번 설계 과정 전체에서 반복 확인된 리스크였다. 이를 근본적으로 없애기 위해 M2(2.0, Kotlin)와 **같은 언어**로 간다.

- **언어/런타임**: Kotlin/JVM. Node.js(현재 yona-export) 전면 폐기 — import 로직 제거뿐 아니라 export 쪽도 REST→DB 직접조회로 아키텍처가 바뀌므로 사실상 전면 재작성이라, 언어 교체 비용이 낮다.
- **CLI 프레임워크**: Clikt(Kotlin 네이티브) — Spring Boot 등 프레임워크 의존 없이 `fun main()` 하나로 시작하는 가벼운 CLI. DI 컨테이너/웹서버/오토컨피그가 전혀 필요 없음.
- **DB 접근**: `org.mariadb.jdbc:mariadb-java-client` JDBC 직접 사용(ORM 불필요, 읽기 전용 페이징 쿼리만 수행)
- **아카이브 포맷 직렬화**: `kotlinx-serialization-json`으로 `manifest.json`/NDJSON 레코드를 `@Serializable data class`로 정의(Spring/JPA 애너테이션 없는 순수 데이터 클래스)
- **tar.gz 스트리밍**: `org.apache.commons:commons-compress`(tar) + `java.util.zip.GZIPOutputStream`(gzip)
- **패키징**: Gradle `application` + `shadow` 플러그인으로 단일 실행 fat jar (`java -jar yona-extractor.jar export --owner ... --project ...`). 필요시 추후 GraalVM native-image로 전환 가능(1차 범위 아님)
- **저장소**: 이름/위치는 `yona-export` 그대로 유지(이슈 #828 등 기존 문서·조직 인지도가 이미 이 이름을 가리킴) — 내부만 Node.js에서 Gradle 프로젝트로 통째로 교체
- **스키마 공유 전략**: 1차는 M2(2.0 앱)와 데이터 클래스 정의를 **복사**해서 쓴다(같은 언어라 필드명·null 처리·날짜 포맷이 코드로 강제되어 크로스랭귀지 드리프트 문제는 이미 해소됨). M4/M2가 안정화된 뒤, 필요하면 이 데이터 클래스만 별도 Gradle 모듈로 뽑아 GitHub Packages로 배포해 양쪽이 실제로 같은 클래스를 의존성으로 참조하도록 리팩터링(2차, 지금 범위 아님)

## 범위
- 1.6 MariaDB 스키마 매핑 (`../yona`(`v1.6` 브랜치) `conf/evolutions/default/*.sql`, `app/models/*.java` 74개 엔티티 기준)
- MariaDB JDBC 드라이버로 키셋 페이징 쿼리
- **댓글 조회는 반드시 `ORDER BY id ASC`** — `issues.ndjson`/`posts.ndjson`의 `comments` 배열이 부모→자식 순서를 지켜야 한다는 M1 포맷 불변식을 만족시키기 위함(archive-format-spec.md 3-6절)
- 첨부파일 파일시스템 스트림 복사 (HTTP 다운로드 제거)
- **게시글 라벨(`posting_issue_label`) 조회 포함** — 옛 export API가 캡처한 적 없는 데이터(archive-format-spec.md 3-7절), 1.6 `app/models/Posting.java`에 실존 확인됨
- **유저 아바타(`USER_AVATAR` 컨테이너 첨부) 조회 포함** — **확인 완료(2026-09-29)**: 1.6도 `ResourceType.USER_AVATAR("user_avatar")` + `containerId = user.id.toString()`로 동일한 Attachment 컨테이너 방식(`app/models/enumeration/ResourceType.java:43`, `User.avatarAsResource()`) — 2.0과 완전히 동일한 조회 쿼리로 추출 가능
- M1 포맷 tar.gz 스트리밍 생성
- **`import` 서브커맨드(신규, M2 API 클라이언트)**: `yona-extractor import --archive <path> --server <url> --token <admin-token>` 형태로. 세부 API 계약: [m2-admin-api-spec.md](../m2-admin-api-spec.md)
  - **청크 업로드(재개 가능, 2026-09-29 결정)**: 아카이브를 로컬 파일 경로+크기+SHA-256으로 식별하는 **로컬 재개 상태 파일**(예: `~/.yona-extractor/uploads/<archive-sha256>.json`, `{uploadId, chunkSize, server}` 저장)을 둔다.
    - 상태 파일 없음(최초 실행): `fileSha256` 계산 → `POST .../uploads`로 세션 생성 → 응답의 `uploadId`를 상태 파일에 **즉시** 기록(청크 전송 시작 전에 먼저 저장해야, 첫 청크 전송 중 끊겨도 다음 실행이 세션을 재사용할 수 있음)
    - 상태 파일 있음(재시도/재개): `GET .../uploads/{uploadId}`로 이미 받은 청크 목록 조회 후, 빠진 것만 전송
    - 청크는 `PUT .../uploads/{uploadId}/chunks/{i}` + `X-Chunk-SHA256` 헤더로 순서 무관하게 전송, 실패한 청크만 백오프 재시도(전체 재시작 아님)
    - 전부 전송 후 `POST .../uploads/{uploadId}/complete` → `jobId` 수신, 로컬 상태 파일 삭제
  - 인증은 `Yona-Token: <token>` 헤더(옛 yona-export `config.YONA.TO.USER_TOKEN` 관례와 동일, 2.0의 `ApiTokenAuthenticationFilter` 컨벤션 재사용)
  - `GET {server}/site/migration/imports/{jobId}`를 폴링(진행률/결과 조회)
  - 완료 시 M2의 완료 리포트(성공/부분성공/실패 + 항목별 사유)를 CLI 표준출력에 그대로 보여줌, PARTIAL/FAILED면 0이 아닌 종료 코드
  - **이 서브커맨드는 DB에 직접 쓰지 않는다** — 순수 HTTP 클라이언트. 실제 쓰기 로직은 M2에만 있음(재확인)
- Gradle 프로젝트 스캐폴딩(`application`+`shadow` 플러그인) — 기존 `package.json`/`YonaExport.js`/`download.js`/`app.js`/Babel 설정 등 Node.js 자산 전체 제거

## 의존성
M1 (아카이브 포맷) — `export` 서브커맨드는 M1만 있으면 독립적으로 구현/테스트 가능.
M2 (2.0 Native Importer) — `import` 서브커맨드는 M2의 admin 업로드/상태조회 API 계약이 확정돼야 구현 가능(M2보다 나중에 착수).

## Acceptance Criteria
- [ ] 실제(또는 대표성 있는 합성) 1.6 DB 스냅샷에서 프로젝트 1개 추출 성공
- [ ] 1.6 운영 DB(primary)가 아닌 replica/스냅샷에서만 동작함을 문서화 및 접속 설정으로 강제
- [ ] 생성된 아카이브가 M1 manifest 검증을 통과
- [ ] `import` 서브커맨드로 M2 admin API에 아카이브 업로드 → 잡 생성 → 폴링 → 완료 리포트 출력까지 왕복 성공
- [ ] `import` 서브커맨드가 실제로 DB에 아무것도 쓰지 않고 순수 HTTP 호출만 함을 코드 리뷰로 확인
- [ ] 업로드 도중 CLI 프로세스를 강제 종료하고 재실행하면, 로컬 재개 상태 파일을 읽어 이미 보낸 청크를 재전송하지 않고 이어서 완료함을 검증

## 미결 질문
(없음)

## 결정됨 (design.md 14절, 2026-09-29)
- ~~1.6 DB의 read-only replica/스냅샷 접근 경로를 어떻게 확보할지~~ → 이 설계 문서의 관심사 밖으로 확정. M4 구현 시점에 운영진이 알아서 처리할 순수 운영 이슈, 더 이상 추적 안 함
