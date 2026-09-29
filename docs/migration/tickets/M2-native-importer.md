---
id: M2
title: 2.0 Native Importer
status: 미착수 (핵심 가정 검증 완료 — design.md 7절)
repo: yona-projects/yona (next, Kotlin) — 로컬 작업 위치: `~/yona-convert/yona`(`next` 브랜치, origin=yona-projects/yona, 확인 시점 0 ahead/12 behind — `git pull`로 최신화 후 작업). 로컬 `~/yona`는 1.16 별도 리팩터링 브랜치라 2.0 작업과 무관.
depends_on: [M1]
---

# M2. 2.0 Native Importer

## 목표
M1 포맷의 아카이브를 업로드받아 비동기로 프로젝트를 생성하는 2.0 내장 기능. 목표1(1.6→2.0)과 목표2(2.0→2.0) 공용 핵심 컴포넌트.

## 범위
- `ImportJob` 엔티티/테이블 (상태, 진행률, 체크포인트, 결과 리포트) 영속화
- 기존 `AsyncConfig` taskExecutor 활용 + 잡 재개(resume) 로직
- **처리 순서 및 id 매핑** (design.md 3-2-a 표 참고, 2026-09-29 최종 정리): 사전검증 → 1 users(+credentials+UserSetting) → 2 project(+설정 필드) → 3 labels → 4 milestones → 5 issues(+댓글, sharers/voters/IssueEvent는 이슈 생성 시점에 인라인 처리) → **5b 서브태스크 부모 연결(5 전체 완료 후 별도 패스 — 댓글과 달리 재부모화 가능해서 순서를 못 믿음)** → 7 posts(+댓글) → 9 attachments → **9b Watch/구독자(모든 리소스 타입을 참조할 수 있어 9단계 이후)** → 10 마무리(카운터 보정+검증)
- **⭐ 아키텍처 변경(design.md 12절, 2026-09-29 결정) — M2는 project를 생성하지 않는다**:
  - 타깃 project는 **운영자가 2.0에서 평범하게 "새 프로젝트 만들기"로 미리 생성**해둔 것을 전제로 한다(빈 저장소 자동 생성 + `siteurl` 정상 세팅은 이 정상 흐름의 일부 — `createProject()`의 `siteurl`/`createdDate` 하드코딩, 빈 저장소 생성 부작용을 M2가 신경 쓸 필요 자체가 없어짐).
  - M2는 project를 **조회만** 하고, `ProjectService.updateProject(projectId, UpdateProjectParam)`으로 설정 필드(`projectScope`/`isCodeAccessibleMemberOnly`/`isUsingReviewerCount`/`defaultReviewerCount`/`isCodeEnabled`/`isIssueEnabled`/`isPullRequestEnabled`/`isReviewEnabled`/`isMilestoneEnabled`/`isBoardEnabled`)만 반영한다 — **확인 완료**: `param.xxx != null`일 때만 반영하는 부분 업데이트, 알림·저장소 부작용 없음(design.md 12절). **`isCodeAccessibleMemberOnly`는 보안 설정이라 값 유실 시 멤버 전용이던 코드가 공개로 노출될 수 있어 필수 필드로 취급.**
  - **⚠️ `param.overview`는 null-가드가 없다**(design.md 13절) — 항상 아카이브의 `projectDescription`을 명시적으로 채워 넘긴다. `null`을 넘기면 설명이 지워진다.
  - `project.json`의 `assignees`/`authors`는 파생값(derived)이라 M2가 이 단계에서 쓸 일이 없다(design.md 13절) — issues/posts를 올바른 `authorLoginId`/`assigneeLoginId`로 만들면 자연히 재구성됨
  - `Project.createdDate`는 M2가 손대지 않는다(의도된 트레이드오프, design.md 13절 — 프로젝트 껍데기는 운영자가 오늘 만든 새 레코드)
  - `siteurl`은 아카이브 값으로 덮어쓰지 않는다 — 새 인스턴스의 실제 URL이 맞는 값이므로 참고용으로만 두고 import 시 무시.
  - **새 사전검증**: 아카이브의 `projectVcs`가 미리 만들어둔 프로젝트의 실제 `vcs`와 일치하는지 확인, 불일치 시 즉시 실패
  - 나머지 멤버(creator 외)는 `ProjectUser(project, user, role)`를 직접 구성해 `projectUserRepository.save()`로 추가(전용 서비스 메서드 없음, 알림 위험 없음 확인됨)
  - user 생성 시 `UserSetting.loginDefaultPage`도 함께 저장(`users.ndjson`의 `loginDefaultPage`)
  - user 생성 시 `additionalEmails`가 있으면 `User.addEmail(Email(...))`로 추가 등록(design.md 14절 결정)
  - `Watch`/`Unwatch`/`UserProjectNotification`(구독자 목록) — 누가 이슈/프로젝트를 구독 중이었는지 복원. 없으면 이관 후 원래 구독자가 알림을 못 받음
  - `IssueEvent` 타임라인(상태/담당자/라벨 변경 이력) — `changeState()`를 여러 번 호출해 역사적으로 재현하기보다, import 시 `IssueEvent` 레코드를 직접 구성해 저장하는 편이 정확하고 부작용(알림 재발행)도 없음
  - `legacyId → 신규 id` 매핑은 milestone/issue/comment(이슈·포스트 공통)/post 4종류만 필요(loginId/labelName은 이름으로 직접 참조하므로 매핑 불필요)
  - **사전검증은 잡의 "최초 시도" 시점에만 수행** — 체크포인트 재개 시에는 건너뜀(재개 시점엔 이미 이 잡이 만든 부분 데이터가 있어 "비어있음" 검사가 항상 실패하므로 최초 1회만 검사)
  - 댓글은 `legacyId` 오름차순(부모 먼저)으로 온다는 M1 포맷 불변식을 전제로, 매핑에 없는 `parentLegacyId`만 "진짜 고아"로 처리
- 서비스 계층 직접 호출(REST 왕복 아님) — `IssueService.createIssue(..., explicitNumber, sendNotification)`/`PostingService.createPosting(..., explicitNumber)`를 그대로 재사용(design.md 7절에서 실제 코드로 확인됨)
- **user 생성은 전용 경로 필요, 기존 벌크 API 재사용 금지**: `POST /-_-api/v1/users`(`UserController.createUserNode()`)는 임의 비밀번호로 계정을 잠가버려 "기존 비밀번호로 로그인 유지" 요건을 깬다(design.md 7절). 대신 `credentials.ndjson`의 `passwordHash`/`passwordSalt`를 그대로 넣은 `User` 엔티티를 구성해 `userService.createUser()`(단순 저장)로 저장한다.
- **⚠️ 보안 — `UserState.SITE_ADMIN` 강제 강등**: `users.ndjson`의 `accountStatus`가 `SITE_ADMIN`이어도 M2는 무조건 `ACTIVE`로 바꿔서 생성한다(design.md 7절). 관리자 권한이 import 한 번으로 자동 부여되면 안 됨.
- **유저 아바타**: `attachments`의 `containerType: "USER_AVATAR"` 항목을 유저 생성 이후 단계에서 연결(다른 첨부파일과 동일하게 9단계에서 처리, 아카이브의 `containerLegacyId`(loginId)를 1단계에서 만든 유저의 **신규 숫자 id**로 변환해 `containerId`로 넘김 — loginId 그대로 넘기면 안 됨)
- **게시글 라벨**: `PostingService.createPosting()`에 `labelIds` 파라미터가 없으므로, `Posting(...)` 생성자에 `labels = resolvedLabelSet`을 직접 채워 넘긴다(design.md 7절). `notice`/`readme`는 그대로 값 전달(생성 시점엔 git 부작용 없음, 확인됨).
- **라벨 생성**: `IssueLabelService.newLabelByCategoryName(projectId, categoryName, categoryIsExclusive, labelName, labelColor)` 하나로 카테고리 find-or-create + 라벨 생성이 한 번에 처리된다(별도 카테고리 단계 불필요, design.md 7절). 동일 카테고리+이름 라벨이 이미 있어 `null`이 반환되면 — 빈 프로젝트 전제상 정상 흐름에선 없어야 하므로 — 실패 처리하고 리포트에 남긴다.
- **⚠️ 이슈/마일스톤도 생성 시 CLOSED로 바로 못 만듦(추가 발견)**: `createMilestone()`은 무조건 `state = OPEN`으로 강제하고, `createIssue()`도 `isDraft`에 따라 DRAFT/OPEN만 가능하다(design.md 7절). CLOSED 상태 이력을 보존하려면:
  - 이슈: 생성 후 `IssueService.changeState(issueId, State.CLOSED, updaterLoginId)` 호출 필요 — 이 메서드도 `sendNotification` 파라미터가 없어 무조건 `ISSUE_STATE_CHANGED` 알림을 쏘고 `updatedDate`를 다시 `Instant.now()`로 덮어쓴다. **날짜 2차 보정은 반드시 `changeState()` 호출 다음에** 실행해야 한다(순서 바뀌면 도로 덮어써짐).
  - 마일스톤: 생성 후 `MilestoneService.updateMilestone(milestoneId, title, contents, dueDate, State.CLOSED)` 호출 필요(알림 없음, 안전) — 단 title/contents/dueDate를 원본 값 그대로 다시 넘겨야 한다(안 그러면 그 필드들이 지워짐).
- **⭐ 이슈 서브태스크(`parent`)**: `issues.ndjson`의 `parentLegacyId`를 2-pass로 연결 — 1차로 모든 이슈를 생성해 `legacyIssueId → newIssueId` 매핑을 완성한 뒤, 2차로 `parentLegacyId`가 있는 이슈만 순회하며 `issue.parent`를 설정하고 재저장한다(design.md 9절, `createIssue()`엔 parent 파라미터가 없음).
- **⚠️ `history`(편집 이력) — Issue만 2차 보정 필요**: `createIssue()`는 `issue.history`를 무조건 `""`로 초기화한다(design.md 9절) — 아카이브에 `history` 값이 있으면 `createdDate` 보정과 같은 타이밍에 같이 재저장한다. **Posting은 `createPosting()`이 `history`를 안 건드려서** 생성 전 엔티티에 세팅해두면 그대로 저장됨(2차 보정 불필요).
- **투표(`voters`)/`weight`**: `weight`는 `voters.size()`의 비정규화 캐시일 뿐이다(design.md 9절) — 아카이브의 `voters`(loginId 목록)를 해당 유저들의 신규 id로 채운 뒤, `weight`는 M2가 `voters.size`로 직접 계산해 설정한다(아카이브 값을 그대로 믿지 않음).
- **⚠️ 이슈 공유(`sharers`) — `IssueShareService.changeSharer()` 호출 금지**: 이 메서드는 add/delete마다 무조건 알림을 발행한다(억제 옵션 없음, design.md 11절). 대신 `IssueSharer(loginId, user, issue, created)`를 직접 구성해 `issueSharerRepository.save()`로 저장한다(실제 저장 로직인 private `addSharerInternal()`과 동일한 방식, 알림 없음).
- **첨부파일은 `AttachmentService.store(inputStream, name, containerType, containerId, ownerLoginId)`로 생성**(design.md 7절): `MultipartFile` 불필요, 추출한 로컬 파일을 `FileInputStream`으로 열어 그대로 전달. 내부적으로 SHA-256을 자체 재계산하므로, 반환된 `Attachment.hash`를 아카이브의 `sha256`과 대조해 전송 손상 검증에 활용할 수 있다. `containerId`는 검증 없이 그대로 쓰이므로 9단계(attachments) 처리 시 5~8단계 매핑에서 조회한 **신규 id**를 정확히 넘겨야 한다(틀리면 조용히 고아 첨부가 생김).
- **⚠️ `createdDate`/`updatedDate` 2차 보정 필요**: `createIssue()`/`createPosting()`/`createIssueComment()`/`createPostingComment()`/`AttachmentService.store()` **전부** 생성 시각을 `Instant.now()`로 하드코딩한다(design.md 7절, 기존 코드에 날짜 보존 선례 없음 확인됨). Project는 M2가 생성하지 않으므로(12절) 해당 없음. 각 엔티티 생성 직후, 반환된 엔티티의 해당 필드만 원본 값으로 바꿔 리포지토리로 재저장한다(번호채번/알림/멘션 로직은 재실행되지 않으므로 사이드이펙트 없음).
- **author/assignee/milestone/label 조회 실패 시 기존 legacy 호환 API의 "조용한 대체/누락" 패턴을 재사용하지 않는다**: `IssueApiController.newIssuesLegacyPath()`는 author를 못 찾으면 조용히 `currentUser`로 바꾸고, milestone/label은 조용히 빠뜨린다(design.md 7절). M2는 참조 대상을 못 찾으면 해당 항목을 실패 처리하고 리포트에 남긴다.
- **선행 작업(M2 착수 전 작은 PR)**: `PostingService.createPosting()`, `CommentService.createIssueComment()`/`createPostingComment()`, **`IssueService.changeState()`** 에 `IssueService.createIssue()`와 동일한 패턴으로 `sendNotification: Boolean = true` 파라미터 추가 — 현재 이 넷은 억제 수단이 없어 무조건 알림을 발행함(design.md 7절 "새로 발견한 갭")
- 알림 억제: 이슈는 기존 `sendNotification` 파라미터를 `false`로 호출, 나머지는 위 선행 작업으로 확보한 동일 파라미터 사용 — 별도의 `suppressNotifications` 컨텍스트/스레드로컬을 새로 만들 필요 없음
- `manifest.counts` 대비 완전성 검증 + 실패/스킵 항목의 명시적 리포트(조용한 스킵 금지)
- **admin 업로드 API는 청크 업로드(재개 가능)로 설계**(2026-09-29 결정, m2-admin-api-spec.md 3절) — 업로드 세션 생성/청크별 PUT/재개용 상태조회/완료확정 4개 엔드포인트. `UploadSession` 엔티티(uploadId, totalChunks, receivedChunks, fileSize, fileSha256, expiresAt) 신설. 청크는 목적 파일의 해당 오프셋에 `RandomAccessFile`로 바로 써서 별도 조립 단계 없음. 미완료 세션은 48시간 후 정리.
- 진행률/결과 조회 API — 세부 스펙: [m2-admin-api-spec.md](../m2-admin-api-spec.md)
- **본문 내 상호참조 보존** (design.md 4절)
  - 타깃 프로젝트가 비어 있는지 사전 검증(비어있지 않으면 import 거부)
  - 이슈/포스트를 원본 `number` 그대로 명시적으로 생성(auto-increment 미사용), import 완료 후 프로젝트의 다음 번호 카운터를 `max+1`로 보정
  - loginId 충돌 해결 시 매핑 테이블(원본→최종)을 만들고, 본문/댓글의 `@loginId` 멘션에 2차 치환 패스로 반영
  - 본문 내 커밋 해시 패턴(hex 7~40자) 건수를 감지해 import 리포트에 "저장소 히스토리 보존 여부 확인" 경고로 남김(치환은 시도 안 함)

## 의존성
M1 (아카이브 포맷)

## Acceptance Criteria
- [ ] M1 샘플 아카이브로 소규모 프로젝트 import 성공
- [ ] 서버 재시작 후 중단된 잡이 체크포인트부터 재개됨을 통합테스트로 검증
- [ ] import 중 알림이 실제로 발송되지 않음을 테스트로 검증
- [ ] 의도적으로 깨뜨린 fixture(고아 답글 등)로 "조용한 스킵이 아니라 리포트에 기록"됨을 검증
- [ ] import 후 원본과 동일한 `#N`으로 이슈/포스트가 조회됨을 검증(같은 아카이브를 두 번째 빈 프로젝트에 import해도 번호가 동일)
- [ ] loginId가 충돌해 이름이 바뀐 fixture로 `@멘션` 텍스트가 새 loginId로 치환됨을 검증
- [ ] 커밋 해시 패턴이 포함된 fixture로 리포트에 경고가 남는지 검증(본문 자체는 치환되지 않음을 함께 확인)
- [ ] owner 또는 타깃 project가 2.0에 미리 존재하지 않는 아카이브로 시도하면 명확한 에러로 즉시 거부됨을 검증
- [ ] 아카이브의 `projectVcs`가 미리 만들어둔 프로젝트의 실제 `vcs`와 다르면 즉시 거부됨을 검증
- [ ] 강제 중단 후 재개 시나리오에서 "비어있음" 검증이 재실행되지 않고(이미 부분 데이터가 있어도) 정상 재개됨을 검증
- [ ] `credentials.ndjson`의 legacy 해시로 만든 계정이 원래 비밀번호로 로그인 성공하고, 성공 직후 Argon2id로 재해싱됨을 검증
- [ ] author loginId가 존재하지 않는 fixture로, 해당 이슈가 (조용한 대체 없이) 실패 처리되고 리포트에 남는지 검증
- [ ] `accountStatus: "SITE_ADMIN"`인 fixture로 import해도 생성된 계정이 `ACTIVE`임을 검증
- [ ] import된 이슈/포스트/댓글의 `createdDate`가 원본 아카이브 값과 정확히 일치함을 검증(오늘 날짜가 아님)
- [ ] `USER_AVATAR` 첨부가 포함된 fixture로 유저 생성 후 아바타가 정상 연결됨을 검증
- [ ] 첨부파일의 `createdDate`도 원본 값으로 보정됨을 검증
- [ ] import된 첨부파일의 `Attachment.hash`(2.0이 재계산)와 아카이브 `sha256`이 일치함을 검증(불일치 시 리포트에 손상 경고)
- [ ] 라벨이 붙은 게시글 fixture로 import 후 게시글에 라벨이 정상 연결됨을 검증
- [ ] `isCodeAccessibleMemberOnly: true`인 fixture로 import 후 실제로 코드 접근이 멤버 전용으로 제한됨을 검증
- [ ] `loginDefaultPage`가 설정된 유저 fixture로 import 후 해당 값이 `UserSetting`에 저장됨을 검증
- [ ] 서브태스크(부모-자식 이슈) fixture로 import 후 `parent` 관계가 정확히 연결됨을 검증
- [ ] `history`가 있는 이슈 fixture로 import 후 값이 유실되지 않음을 검증(Posting도 동일 검증)
- [ ] 투표자가 있는 이슈 fixture로 import 후 `voters`와 `weight`가 일치함을 검증
- [ ] `sharers`가 있는 이슈 fixture로 import 후 공유 대상이 정확히 연결됨을 검증
- [ ] 같은 카테고리에 라벨이 여러 개인 fixture로 import 후 카테고리가 중복 생성되지 않고 하나로 공유됨을 검증
- [ ] CLOSED 상태였던 이슈/마일스톤 fixture로 import 후 실제 상태가 CLOSED이고, `createdDate`/`updatedDate`가 여전히 원본 값과 일치함을 검증(changeState 이후 날짜가 덮어써지지 않았는지)
- [ ] GB급 아카이브 업로드 시 컨트롤러 코드가 `MultipartFile.bytes`를 쓰지 않고 스트리밍으로 처리함을 확인(m2-admin-api-spec.md 0절 — `/site/import`의 기존 안티패턴 재발 방지)
- [ ] 업로드 도중 일부 청크만 보낸 상태에서 연결을 끊고 재시작 → `GET .../uploads/{uploadId}`가 이미 받은 청크를 정확히 보고하고, 나머지만 이어서 보내 최종 파일이 원본과 바이트 단위로 동일함을 검증
- [ ] 청크 해시가 조작된 요청을 보내면 해당 청크만 409로 거부되고 다른 청크에는 영향이 없음을 검증
- [ ] 48시간 초과한 미완료 업로드 세션이 정리됨을 검증
- [ ] 비관리자 토큰으로 업로드/조회 API 호출 시 403 반환을 검증
- [ ] 대응하는 M4 `import` 서브커맨드로 업로드→폴링→리포트 출력 전체 왕복이 성공함을 검증(M4 AC와 공유)
- [ ] import 중 `IssueShareService.changeSharer()`가 호출되지 않음을 코드 리뷰/테스트로 확인(공유 대상에게 알림이 안 감을 직접 검증)
- [ ] import 전후로 `Project.siteurl`이 바뀌지 않음을 검증(미리 만들어둔 프로젝트의 값을 그대로 유지, 아카이브 값으로 덮어쓰지 않음)
- [ ] import 후에도 사전에 만들어둔 프로젝트의 저장소가 그대로 남아있고 새로 생성/초기화되지 않음을 검증(M2가 `createProject()`를 호출하지 않음을 간접 확인)
- [ ] creator 외 나머지 멤버(project.json의 members)가 올바른 role로 전부 추가됨을 검증
- [ ] project/이슈/게시글을 각각 구독하는 Watch fixture로 import 후 전부 정확한 리소스에 연결됨을 검증(5b/9b 단계 순서 확인)
- [ ] 이슈 A가 나중에 생성된 이슈 B의 서브태스크인 fixture(= legacyId 역순 부모)로 import해도 정상적으로 연결됨을 검증(단일 패스였다면 실패했을 케이스)
- [ ] `assigneeLoginId`가 있는 이슈 fixture로 import 후 담당자가 정확히 1명 연결됨을 검증(배열 아님)
- [ ] import 전 프로젝트에 미리 채워둔 `overview`가, `projectDescription`이 없는 아카이브를 import해도 임의로 지워지지 않음을 검증(항상 명시적으로 채워 넘기는지 확인)
- [ ] import 후 `Project.projectScope`가 아카이브 값과 일치함을 검증

## 미결 질문
(없음)

## 결정됨 (design.md 14절 및 후속 결정, 2026-09-29)
- ~~업로드 재개 지원 여부~~ → **지원한다.** 청크 업로드 프로토콜로 끊긴 지점부터 이어서 전송(m2-admin-api-spec.md 3절) — M5까지 미룰 문제가 아니라고 판단해 지금 확정
- ~~S3 호환 스토리지 자격증명/버킷이 2.0 배포 환경에 이미 있는지~~ → 지금 당장 이슈 아님. M2(import)는 로컬 스트리밍 업로드라 S3와 무관 — M3 착수 시점으로 미룸
- ~~import 완료/실패를 요청 관리자에게 알릴 채널(이메일/인앱)~~ → **알림 채널 없음.** M4 CLI의 콘솔 출력(폴링 결과)이 유일한 확인 수단
- ~~`ImportJob` 실패 시 부분 생성된 데이터의 롤백/정리 정책~~ → 자동 롤백 안 함. `FAILED`/`PARTIAL` 상태 + 상세 리포트로 남기고, 운영자가 프로젝트 삭제 후 재시도 또는 아카이브 수정 후 체크포인트 재개 중 선택
- ~~비어있지 않은 프로젝트로 import해야 하는 요구~~ → 12절 결정(타깃 프로젝트는 항상 이관 전용으로 새로 만든 빈 프로젝트)상 발생하지 않음, 닫음
- ~~업로드 임시 파일 보존/삭제 정책~~ → 성공 시 즉시 삭제, 실패/PARTIAL 시 7일 보관 후 정리(정확한 기간은 배포 시 설정값)
- ~~report 페이로드가 커질 때 페이징 필요 여부~~ → 최대 500건 inline, 초과분은 건수만 표시(1차 범위)

## 해결된 질문 (design.md 7절, 실제 코드 확인 완료)
- ~~이슈/포스트 번호를 서비스 계층에서 명시적으로 설정하는 게 실제 엔티티 구조상 가능한지~~ → 가능. `explicitNumber` 파라미터가 이미 존재(`IssueService`/`PostingService` 둘 다).
- ~~서비스 계층을 "직접 호출"할 때 기존 컨트롤러의 권한 체크를 어느 계층에서 재현할지~~ → admin API 컨트롤러 계층에서 `SiteApiController.checkAdmin()`과 동일한 패턴(`isSiteManager` 체크) 재사용. m2-admin-api-spec.md 2절.
