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
- 업로드 안정성(대용량 전송 중 끊김) 문제는 프로토콜 선택이 아니라 **재개 가능한 업로드**(tus 프로토콜, 청크+재시도 등)로 별도 해결할 문제 — 6절 열린 질문 참고, M5 벤치마크에서 실제 필요성이 확인되면 그때 설계.

## 1. 경로 규칙

기존 `SiteApiController`와 같은 계열의 컨트롤러(`MigrationApiController` 또는 `SiteApiController`에 메서드 추가)에 `/site/migration/imports` 하위로 둔다. 아카이브 자체(`manifest.json`)에 owner/projectName이 이미 있으므로 URL 경로에 프로젝트를 넣지 않는다.

| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | `/site/migration/imports` | 아카이브 업로드 + `ImportJob` 생성(비동기 시작) |
| GET | `/site/migration/imports/{jobId}` | 진행률/결과 조회 |

## 2. 인증

기존 legacy 전권 토큰 컨벤션 그대로 재사용(`ApiTokenAuthenticationFilter` 확인됨): 요청 헤더에 `Authorization: token <값>` 또는 `Yona-Token: <값>` 중 하나. 내부 권한 체크는 `SiteApiController.checkAdmin()`과 동일한 패턴(`loginUser.isSiteManager` — `UserState.SITE_ADMIN`만 허용) 재사용. **M2의 기존 미결 질문("서비스 계층 직접 호출 시 권한 체크를 어느 계층에서 재현할지")은 이걸로 해결** — 컨트롤러 계층에서 `checkAdmin()`으로 처리한다.

M4 CLI는 `import --server <url> --token <token>` 형태로 토큰을 받아 `Yona-Token` 헤더로 보낸다(옛 yona-export의 `config.YONA.TO.USER_TOKEN` 관례와 동일해 CLI 사용자 입장에서 낯설지 않음).

## 3. `POST /site/migration/imports`

- Content-Type: `multipart/form-data`, 필드명 `file`(아카이브 `.tar.gz`)
- **서버 구현 원칙(0절 반면교사 반영)**: `MultipartFile.bytes` 금지. `multipartFile.transferTo(File(uploadDir, "$jobId.tar.gz"))` 또는 `.inputStream`을 스트림으로 디스크에 흘려쓴다 — 메모리에 전체를 올리지 않는다. Spring의 멀티파트 리졸버가 임계치 이상 업로드를 이미 디스크로 스필오버하므로, 컨트롤러 코드가 `.bytes`를 안 쓰는 것만 지키면 충분하다.
- 저장 완료 후 `ImportJob(status=PENDING, sourceArchivePath=...)` 생성, 기존 `AsyncConfig` executor로 비동기 처리 시작
- 응답: `202 Accepted`
  ```jsonc
  {
    "jobId": "b3f1...",
    "status": "PENDING",
    "statusUrl": "/site/migration/imports/b3f1..."
  }
  ```
- 에러: `403`(비관리자), `400`(파일 없음/`manifest.json` 파싱 실패/`formatVersion` 미지원), `404`(owner 또는 타깃 project가 2.0에 미리 존재하지 않음 — design.md 12절, M2는 project를 생성하지 않음), `409`(타깃 프로젝트 내용이 비어있지 않음 — design.md 4절 / 아카이브 `projectVcs`가 프로젝트의 실제 `vcs`와 불일치 — design.md 12절)

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

1. POST {server}/site/migration/imports  (multipart, file=out.tar.gz)   → jobId
2. GET  {server}/site/migration/imports/{jobId} 를 폴링(예: 5초 간격)
3. status가 COMPLETED/FAILED/PARTIAL이 되면 report를 표준출력에 출력하고 종료
   - PARTIAL/FAILED면 CLI 종료 코드를 0이 아닌 값으로(운영 스크립트가 실패를 감지할 수 있게)
```

## 6. 열린 질문

- 업로드 임시 저장 디렉터리(`uploadDir`)와 최종 처리 후 보존/삭제 정책(성공 후 즉시 삭제 vs 감사 목적 일정 기간 보관)
- 업로드 도중 네트워크 끊김에 대한 재개(resume) 지원 여부 — 1차 범위에서는 CLI가 처음부터 재시도하는 것으로 충분한지, 아니면 청크 업로드/재개가 필요한지(M5 대용량 검증에서 실제로 문제가 되는지 확인 후 결정)
- `report.failures`가 아주 많을 때(수백~수천 건) 응답 페이로드 크기 — 페이징이 필요할 수 있음
