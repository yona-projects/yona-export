# M1 세부 스펙 — 프로젝트 아카이브 포맷 v1

[design.md](design.md) 2절의 상세 스펙. 1.6 Extractor, 2.0 Native Exporter가 생성하고 2.0 Native Importer가 소비하는 유일한 포맷이다.

## 1. 파일 레이아웃

```
{owner}-{projectName}-{yyyyMMddHHmmss}.tar.gz
└─ {owner}-{projectName}/              # 최상위 폴더로 감싼다 (수동 압축 해제 시 tar bomb 방지)
   ├─ manifest.json
   ├─ users.ndjson                     # 공개 프로필만
   ├─ credentials.ndjson               # 민감정보 분리 (아래 4절)
   ├─ project.json
   ├─ labels.ndjson
   ├─ milestones.ndjson
   ├─ issues.ndjson                    # 댓글 인라인 포함
   ├─ posts.ndjson                     # 댓글 인라인 포함
   └─ attachments/
      ├─ manifest.ndjson
      └─ {legacyId}/{원본파일명}
```

- 압축: gzip 스트림(tar → gzip 파이프). 압축 해제된 전체를 디스크/메모리에 동시에 들고 있지 않는다.
- 인코딩: UTF-8, 개행 `\n`(NDJSON 한 줄 = 레코드 하나, 줄 끝에 트레일링 콤마 없음).
- 생성 절차(extractor/exporter 공통): ① 로컬 스테이징 디렉터리에 NDJSON/첨부파일을 스트리밍으로 써낸다 → ② 스테이징 디렉터리를 tar+gzip으로 묶는다. 1단계가 중간에 실패해도 엔티티별로 재시도 가능하고, 2단계는 순수 I/O라 실패 시 그냥 재실행하면 된다.

## 2. manifest.json

```jsonc
{
  "formatVersion": "1",
  "sourceType": "yona-1.6",            // "yona-1.6" | "yona-2.0"
  "sourceDetail": "v1.6@<git-sha>",    // 추적용, 선택
  "owner": "yona-projects",
  "projectName": "yona-help",
  "projectVcs": "GIT",                 // GIT | SVN | HG
  "projectScope": "PUBLIC",            // PUBLIC | PRIVATE | PROTECTED
  "projectCreatedDate": "2016-02-23T06:33:34+09:00",
  "exportedAt": "2026-09-28T16:00:00+09:00",
  "repositoryMigration": "manual",     // 코드 저장소(git/svn)·LFS는 이 아카이브에 없고 수동 이관 대상임을 명시
  "counts": {                          // import 후 정합성 검증 기준값
    "users": 12,
    "labels": 5,
    "milestones": 3,
    "issues": 4213,
    "issueComments": 9021,
    "posts": 340,
    "postComments": 812,
    "attachments": 891
  },
  "checksums": {                       // 파일 단위 sha256, 전송/보관 중 손상 검증용
    "users.ndjson": "sha256:...",
    "credentials.ndjson": "sha256:...",
    "project.json": "sha256:...",
    "labels.ndjson": "sha256:...",
    "milestones.ndjson": "sha256:...",
    "issues.ndjson": "sha256:...",
    "posts.ndjson": "sha256:...",
    "attachments/manifest.ndjson": "sha256:..."
  }
}
```

- `formatVersion`은 문자열(숫자 비교 아님, "1", "2", … 순차 증가). importer는 자신이 지원하는 최대 버전 이하를 모두 읽을 수 있어야 하고, 버전별 매핑 로직은 **아카이브가 아니라 importer 코드**가 가진다(아카이브는 항상 생성 시점의 원본 그대로).
- producer(extractor/exporter)는 항상 자신이 아는 최신 `formatVersion`으로만 쓴다 — 과거 버전으로 쓸 필요 없음.
- `counts`는 의미 단위 카운트(댓글 포함 이슈/포스트 개수 등)로, M2 importer가 import 완료 후 실제 생성 개수와 대조해 완전성을 검증하는 데 쓰인다.

## 3. 엔티티별 NDJSON 스키마

### 3-1. `project.json` (NDJSON 아님, 단일 객체)
```jsonc
{
  "owner": "yona-projects",
  "projectName": "yona-help",
  "projectDescription": "요나 설명을 위한 프로젝트",
  "projectVcs": "GIT",
  "projectScope": "PUBLIC",
  "projectCreatedDate": "2016-02-23T06:33:34+09:00",
  "siteurl": null,                       // 없으면 생략
  "isCodeAccessibleMemberOnly": false,    // ⚠️ 보안 설정 — 반드시 원본 값 그대로(design.md 8절)
  "isUsingReviewerCount": false,
  "defaultReviewerCount": 1,
  "isCodeEnabled": true,
  "isIssueEnabled": true,
  "isPullRequestEnabled": true,
  "isReviewEnabled": true,
  "isMilestoneEnabled": true,
  "isBoardEnabled": true,
  // isWikiEnabled는 담지 않음 — 1.6엔 대응 값이 없는 2.0 신규 필드, import 시 기본값(true) 사용
  "members": [{ "loginId": "doortts", "role": "manager" }],  // role: manager | member
  "assignees": ["doortts"],   // 참고용(derived) — project 내 어떤 이슈에든 담당자로 지정된 적 있는 유저 목록. 2.0에도 저장 API가 없는 파생값이라 M2가 import 시 별도로 쓰지 않음(design.md 13절)
  "authors": ["doortts"]      // 참고용(derived) — 이슈/게시글 작성자 집합. 마찬가지로 M2가 직접 쓰지 않음, issues/posts를 만들면 자연히 재구성됨
}
```
- `siteurl`/`isCodeAccessibleMemberOnly`/`isUsingReviewerCount`/`defaultReviewerCount`/`isXEnabled` 6종은 2.0 `Project.kt`에 1:1 대응 필드 확인됨(design.md 8절). `isXEnabled` 6개는 1.6 `ProjectMenuSetting.code/issue/pullRequest/review/milestone/board`에서 그대로 가져온다(2.0엔 별도 엔티티가 아니라 `Project`에 평탄화되어 있음).

### 3-2. `users.ndjson` (공개 프로필, 한 줄 = 유저 1명)
```jsonc
{ "loginId": "doortts", "name": "doortts", "email": "doortts@gomail.com", "additionalEmails": [], "accountStatus": "ACTIVE", "avatarAttachmentLegacyId": 42, "loginDefaultPage": null }
```
- 이 프로젝트에 **연관된 유저만** 포함(멤버+작성자+담당자). 사이트 전체 유저 덤프 아님 — M1 스코프가 "프로젝트 단위"이기 때문.
- `accountStatus`는 2.0 `UserState`(`ACTIVE`/`LOCKED`/`DELETED`/`GUEST`/`SITE_ADMIN`) 중 하나로 매핑하되, **`SITE_ADMIN`은 M2가 무조건 `ACTIVE`로 강등**한다(design.md 7절 — 권한 상승 방지). **1.6 `UserState`는 2.0과 완전히 동일**(`ACTIVE/LOCKED/DELETED/GUEST/SITE_ADMIN`)함을 확인, 값 그대로 대응(design.md 14절).
- `loginDefaultPage`는 `UserSetting.loginDefaultPage`(로그인 후 이동 페이지) 대응, 2.0에도 동일 필드 존재(design.md 8절) — 없으면 생략.
- `additionalEmails`는 `email`(대표 이메일) 외 추가 등록 이메일 목록 — 완전성 원칙에 따라 포함하기로 결정(design.md 14절), 없으면 빈 배열 또는 필드 생략.
- `avatarAttachmentLegacyId`는 없으면 생략. 있으면 `attachments/manifest.ndjson`에 `containerType: "USER_AVATAR"`, `containerLegacyId: "<loginId>"`인 항목이 대응한다(아래 3-8절).
- **의도적으로 담지 않는 필드**: 레거시 API 토큰(`token`), 세션/브루트포스 상태(`rememberMe`/`failedLoginAttempts`/`lockedUntil`), 2FA 상태(1.6에 개념 자체가 없음을 코드로 확인, design.md 14절).

### 3-3. `credentials.ndjson` (민감정보, 별도 파일로 분리)
```jsonc
{ "loginId": "doortts", "passwordHashAlgorithm": "legacy-sha256-1024", "passwordHash": "...", "passwordSalt": "", "accountStatus": "ACTIVE" }
```
- 이슈 #828 코멘트에서 Clickin 님이 요구한 "계정 재생성 없이 이전" 요건 충족용.
- **알고리즘 확정(upstream 실제 코드 확인, design.md 7절)**: 2.0 `PasswordEncodingService.legacyHash(password, salt)` = `SHA-256(salt + password)`를 시작으로 총 1024회 반복 재해싱 후 Base64 인코딩. `passwordHash`/`passwordSalt`는 이 함수가 그대로 소비할 수 있는 값이어야 한다. salt가 없는 계정은 `passwordSalt: ""`(빈 문자열)로 — 2.0 쪽도 `storedSalt ?: ""` 관례를 그대로 따른다.
- **M2가 이 값을 쓰는 방법**: `User(loginId=..., password=passwordHash, passwordSalt=passwordSalt)`를 직접 구성해 `userService.createUser()`로 저장한다(단순 저장, 비밀번호 재해싱 없음). 기존 벌크 유저 생성 API(`POST /-_-api/v1/users`)는 임의 비밀번호로 계정을 잠가버리므로 **쓰면 안 됨** — 자세한 이유는 design.md 7절.
- 로그인 성공 시 `YonaAuthenticationProvider.onLoginSuccess()`가 자동으로 Argon2id로 재해싱하므로, 비밀번호 원문 없이도 기존 로그인이 그대로 유지된다.
- **취급 원칙**: 이 파일은 archive 내에서도 별도 취급 — 접근/로그 노출 최소화, 초기 관리자 계정과 `loginId`가 충돌하면 M2가 **자동 병합하지 않고** import를 보류하고 리포트에 명시(요구사항 그대로).
- 1.6 실제 필드명(알고리즘/컬럼)이 이 형식과 정확히 일치하는지는 `../yona`(`v1.6`) `app/models/User.java` 확인 후 M4에서 최종 검증(2.0의 `legacyHash()`가 1.6의 실제 저장 방식을 옮겨온 것이라 형식은 같을 가능성이 높지만, 1.6 코드로 재확인 필요).

### 3-4. `labels.ndjson`
```jsonc
{ "labelName": "tip", "labelColor": "#f1d55c", "category": "MariaDB", "isExclusive": false }
```

### 3-5. `milestones.ndjson`
```jsonc
{ "legacyId": 93, "title": "v1.3 Next Year!!", "state": "open", "description": "...", "dueDate": null }
```
- `legacyId`는 `issues.ndjson`의 `milestoneId`가 참조하는 키. import 후 2.0 쪽 신규 id로 remap되고 나면 더 이상 쓰이지 않음(참조 전용, 화면에 노출 안 함).

### 3-6. `issues.ndjson` (한 줄 = 이슈 1건, 댓글 인라인)

> **`number`는 단순 메타데이터가 아니라 import 시 그대로 보존해야 하는 필드다.** 본문/댓글 안의 `#N` 참조가 이 번호를 그대로 가리키므로, import 때 새 번호를 발급하면 기존 참조가 전부 엉뚱한 이슈를 가리키게 된다. 자세한 이유와 전제조건(타깃 프로젝트가 비어 있어야 함)은 [design.md 4절](design.md#4-본문-내-상호참조이슈-멘션-커밋-id-처리) 참고.

```jsonc
{
  "number": 1,
  "legacyId": 16,
  "title": "커밋 두 개를 하나로 합치기",
  "author": { "loginId": "doortts", "name": "doortts", "email": "doortts@gomail.com" },
  "createdAt": "2016-02-23T18:38:41+09:00",
  "updatedAt": "2017-07-06T00:40:58+09:00",
  "body": "...",
  "state": "OPEN",
  "assigneeLoginId": "doortts",          // ⚠️ 단수 — 1.6 `Issue.assignee`도 2.0 `Issue.assignee: Assignee?`도 이슈당 담당자 1명만 지원(design.md 13절, 배열 아님). 없으면 생략
  "labels": [{ "labelName": "tip", "category": "MariaDB" }],  // 없으면 생략
  "milestoneId": 93,                     // 없으면 생략, milestones.ndjson legacyId 참조
  "dueDate": null,                       // 없으면 생략
  "parentLegacyId": null,                // 서브태스크의 부모 이슈 legacyId, 없으면 생략(design.md 9절)
  "history": null,                       // 편집 이력, 없으면 생략 — Issue만 생성 후 2차 보정 필요(design.md 9절, Posting은 불필요)
  "voters": ["doortts"],                 // 투표한 유저 loginId 목록, 없으면 생략. weight는 담지 않음(import 시 voters.size로 계산)
  "sharers": ["doortts"],                // 비멤버 외부 공유 대상 loginId 목록, 없으면 생략
  "attachments": [26],                   // attachments/manifest.ndjson legacyId 참조, 없으면 생략
  "comments": [                          // 없으면 생략
    {
      "legacyId": 166,
      "author": { "loginId": "clear", "name": "Genie", "email": "dasflk@mail.com" },
      "createdAt": "2017-03-27T04:05:27+09:00",
      "body": "궁금해서 들어와봤는데... 멋져요~~",
      "parentLegacyId": null,            // 중첩 답글이면 부모 댓글의 legacyId, 아니면 생략
      "attachments": [1174],
      "voters": ["doortts"]              // 이슈 댓글만 해당(design.md 10절) — 게시글 댓글(PostingComment)엔 투표 기능 없음, 없으면 생략
    }
  ]
}
```
- 댓글은 별도 파일로 안 빼고 **이슈/포스트 안에 인라인**으로 둔다. 이슈당 댓글 수는 실무상 수백 건을 넘기 어려워, NDJSON 한 줄 단위 스트리밍 처리에 문제가 되지 않는다. (별도 파일로 빼면 부모-자식 재조합 로직이 추가로 필요해져 오히려 복잡도만 올라간다.)
- **예외 가드**: 한 줄(이슈+댓글 전체 직렬화)이 5MB를 넘기면 extractor가 경고 로그를 남긴다 — M5에서 실제로 발생하는지 확인 대상.
- **순서 불변식(포맷 요구사항)**: `comments` 배열은 반드시 **`legacyId` 오름차순**(= 생성 순서)으로 정렬돼 있어야 한다 — 부모 댓글이 항상 그 자식(대댓글)보다 배열에서 먼저 나와야 한다. M2 importer가 댓글을 순서대로 생성하면서 `legacyCommentId → newCommentId` 매핑을 쌓아가는데, 자식이 부모보다 먼저 나오면 아직 없는 매핑을 찾게 되어 실제로는 존재하는 부모를 "고아"로 오판한다. M4 extractor는 DB 조회 시 `ORDER BY id ASC`로 이 순서를 보장해야 한다.
- **고아 답글(부모가 배열에 없는 중첩 답글) 처리**: legacy에는 이 경우 `exports()` 전체가 NPE로 죽는 버그가 있었고, 2.0 포팅판(P2-46)은 조용히 스킵하는데, 이번 요구사항("모든 데이터가 빠짐없이 이관")과 맞지 않는다. **extractor는 고아 답글도 그대로 내보내고**(`parentLegacyId`가 가리키는 대상이 없으면), M2 importer가 그런 댓글을 최상위 댓글로 승격시켜 저장 + import 리포트에 "원래 parentLegacyId" 기록. (위 순서 불변식이 지켜졌다는 전제하에 "진짜 고아"만 여기 해당한다.)

### 3-7. `posts.ndjson`
- `issues.ndjson`과 동일 구조에서 `state`/`assignees`/`milestoneId`/`dueDate`/`parentLegacyId`/`voters`/`sharers` 7개 필드는 없음(앞 4개는 P2-46에서 확인된 이슈 전용 필드, 뒤 3개는 Issue 엔티티에만 있는 필드 — design.md 9절).
- `history`는 이슈와 공유하는 필드로 posts.ndjson에도 포함하되, **Posting은 `createPosting()`이 `history`를 건드리지 않아 생성 전 엔티티에 세팅해두면 그대로 저장됨**(Issue처럼 2차 보정 불필요 — design.md 9절).
- **추가 필드(design.md 7절, upstream 2.0 엔티티 + 1.6 레거시 소스 양쪽 확인)**:
  ```jsonc
  {
    // ...공통 필드(number/legacyId/title/author/createdAt/updatedAt/body/history/attachments/comments)...
    "notice": false,     // 공지 고정 여부
    "readme": false,     // 프로젝트 README로 지정된 게시글 여부(생성 시점엔 git 커밋 등 부작용 없음 — design.md 7절 확인)
    "labels": [{ "labelName": "tip", "category": "MariaDB" }]  // 없으면 생략
  }
  ```
- **⭐ `labels`는 이전에 "게시글엔 라벨 없음"으로 알려져 있었으나 정정**: 옛 `docs/export-file-spec.md`/legacy `exports()` API가 게시글 라벨을 애초에 JSON에 담은 적이 없어서 "게시글엔 라벨이 없다"고 여겨져 왔지만, 실제로는 2.0 `Posting` 엔티티와 **1.6 레거시(`app/models/Posting.java`) 양쪽 모두에 `posting_issue_label` 조인 테이블이 존재**한다. M4는 옛 export API를 거치지 않고 1.6 DB를 직접 읽으므로, 지금까지 어떤 이관 도구도 옮긴 적 없는 이 데이터를 처음으로 제대로 캡처할 수 있다.
- `parent`(Posting 자기참조 필드)는 2.0 코드 전체에서 실제로 값이 설정되는 곳이 없어 — 사실상 미사용으로 확인, 아카이브에 담지 않는다.

### 3-8. `attachments/manifest.ndjson`
```jsonc
{
  "legacyId": 26,
  "containerType": "ISSUE_POST",          // ISSUE_POST | ISSUE_COMMENT | BOARD_POST | NONISSUE_COMMENT | USER_AVATAR
  "containerLegacyId": 16,                // USER_AVATAR면 legacyId 대신 loginId 문자열(아카이브 내 참조 키일 뿐 — M2가 AttachmentService.store()를 호출할 땐 이 loginId로 조회한 신규 유저의 숫자 id로 변환해서 넘겨야 함, design.md 7절 참고)
  "name": "squash-two-commit.mov",
  "size": 53283448,
  "mimeType": "video/quicktime",
  "sha256": "...",                        // extractor가 파일을 읽으며 새로 계산 (아래 4절)
  "legacyHash": "5d0d012eedac57fa4f852a21ef8149c7297d9113",  // 1.6 DB에 저장된 원래 해시, 감사용 참고값
  "ownerLoginId": "doortts",
  "createdDate": "2016-02-23T18:37:27+09:00",
  "path": "attachments/26/squash-two-commit.mov"
}
```

## 4. 체크섬 규칙

- **신규 무결성 체크섬은 전부 SHA-256**로 통일(파일 단위 `manifest.json.checksums`, 첨부파일 단위 `attachments/manifest.ndjson[].sha256`) — extraction 시점에 파일 바이트를 읽으며 새로 계산한다.
- 1.6 DB에 이미 저장돼 있던 `hash` 컬럼(예시로 확인된 값은 40자리 hex, 즉 **SHA-1**)은 `legacyHash`로만 보존한다. 신뢰 기준(무결성 검증, 중복 파일 판단)은 항상 새로 계산한 sha256 쪽을 쓴다 — DB에 저장된 옛 해시가 실제 파일 바이트와 어긋나 있을 가능성(과거 데이터 드리프트)을 배제할 수 없기 때문.

## 5. 리포지터리(git/svn) 관련

- 이 아카이브는 코드 저장소 본체·LFS 객체를 **포함하지 않는다**(요구사항에 따라 범위 제외, 사람이 수동 이관).
- `manifest.json.repositoryMigration = "manual"`로 명시해, M2 importer가 "저장소 이관 여부는 이 도구 책임이 아님"을 완료 리포트에 안내 메시지로 남기게 한다(예: "코드 저장소는 별도로 옮겨야 합니다" 안내).

## 6. 다음 단계

- 이 스펙으로 소규모 더미 프로젝트 fixture(`.tar.gz` 1개) 생성해 M1 Acceptance Criteria 마지막 항목 충족 — 구현 착수 시 진행.
- M2/M4 구현 시 이 문서의 필드명을 그대로 코드의 DTO/엔티티 매핑 기준으로 삼는다.
