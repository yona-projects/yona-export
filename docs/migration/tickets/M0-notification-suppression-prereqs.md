---
id: M0
title: yona(2.0) 코어 선행 PR — 알림 억제 파라미터 4곳 추가
status: 미착수
repo: yona-projects/yona (next, Kotlin) — 로컬 작업 위치: `~/yona-convert/yona`
depends_on: []
---

# M0. yona(2.0) 코어 선행 PR — 알림 억제 파라미터 4곳 추가

## 배경
M2/M6 설계 과정에서 "import 중 알림이 절대 가면 안 된다"는 요구사항을 서비스 계층 재사용 원칙과 함께 지키려다 보니, **`IssueService.createIssue()`에는 이미 있는 `sendNotification` 파라미터가 나머지 3개 관련 메서드엔 없다**는 걸 발견했다(design.md 7절). M2는 이 4개 메서드 전부를 실제로 호출해야 하므로(M6과 달리 raw 저장이 아니라 서비스 계층 재사용 방식), **이 파라미터들이 없으면 M2 자체가 성립하지 않는다.** M2 구현에 앞서 yona 저장소에 먼저 병합돼야 하는 선행 작업.

## 범위
기존 `IssueService.createIssue(..., explicitNumber: Long? = null, sendNotification: Boolean = true)` 패턴을 그대로 따라, 아래 4개 메서드에 `sendNotification: Boolean = true`를 추가한다. **기본값 `true`이므로 기존 호출부(운영 중인 일반 이슈/게시글/댓글 작성 플로우)는 전부 동작 변화 없음** — 새 파라미터를 명시적으로 넘기는 곳은 M2뿐이다.

| # | 메서드 | 현재 시그니처 | 내부에서 무조건 발행하는 알림 |
|---|---|---|---|
| 1 | `PostingService.createPosting()` | `(projectId: Long, posting: Posting, authorId: Long, explicitNumber: Long? = null)` | `publishNotification(saved, author, EventType.NEW_POSTING, title)` |
| 2 | `CommentService.createIssueComment()` | `(issueId: Long, contents: String, author: User, parentCommentId: Long? = null)` | `EventType.NEW_COMMENT` |
| 3 | `CommentService.createPostingComment()` | `(postingId: Long, contents: String, author: User, parentCommentId: Long? = null)` | `EventType.NEW_COMMENT` |
| 4 | `IssueService.changeState()` | `(issueId: Long, newState: State, updaterLoginId: String)` | `EventType.ISSUE_STATE_CHANGED` |

각 Impl에서 `IssueServiceImpl.createIssue()`와 동일하게 `if (sendNotification) { ...publish... }`로 감싸기만 하면 된다(새 분기 로직 없음, 기존 무조건 호출을 조건부로 바꾸는 것뿐).

## 의존성
없음(yona 코어 자체 변경, 다른 M 티켓에 의존하지 않음) — **M2가 이 티켓에 의존**(M2 착수 전 병합 필요)

## Acceptance Criteria
- [ ] 4개 메서드 모두 `sendNotification: Boolean = true` 추가, 기본 동작(알림 발행) 회귀 없음을 기존 테스트 스위트로 확인
- [ ] `sendNotification = false`로 호출 시 각 메서드가 알림을 발행하지 않음을 신규 테스트로 검증
- [ ] 전체 스위트(`./gradlew test`) GREEN

## 미결 질문
(없음)
