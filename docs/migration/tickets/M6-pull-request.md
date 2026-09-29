---
id: M6
title: Pull Request 이관
status: 미착수 (스코프 확정 + 아카이브 포맷 스펙 완료, 구현 설계는 아직)
repo: yona-projects/yona (next, Kotlin) + yona-export — 2.0 로컬 작업 위치: `~/yona-convert/yona`
depends_on: [M1, M2]
---

# M6. Pull Request 이관

## 배경
1.6 `app/models/PullRequest.java` 전수 감사 중 발견(design.md 8절). title/body/state/브랜치/커밋id 등 git 저장소 본체와 별개인 진짜 앱 DB 데이터라, "1.6의 모든 데이터가 빠짐없이 이관" 요구사항상 이슈/포스트와 동급으로 다뤄야 한다는 판단하에 스코프에 포함하기로 확정(2026-09-28, 사용자 확인).

## 목표
PR(제목/본문/상태/리뷰 코멘트 등)을 M2와 같은 목표(번호 보존, 알림 없음, 날짜 보존, 조용한 스킵 금지)로 이관하되, **M2와 반대로 서비스 계층을 쓰지 않고 raw entity + repository 저장**으로 구현한다(이유는 아래) — 그래서 M2에 통합하지 않고 별도로 설계·구현한다.

## 이슈/포스트와의 핵심 차이 (design.md 8절, 실제 코드 확인)

- **`explicitNumber` 파라미터가 없음**: `PullRequestService.createPullRequest()`는 항상 `findFirstByToProjectOrderByNumberDesc(toProject).number + 1`로 자동 채번. **정정(2026-09-29)**: M6은 이 메서드 자체를 호출하지 않고 raw entity로 `number`를 직접 설정하기로 했으므로(아래 참고), 이 파라미터 추가는 실제로 불필요 — yona 코어에 대한 선행 PR 없음.
- **번호 시퀀스가 이슈와 완전히 별개**: `(to_project_id, number)` UNIQUE. 이슈 `#N`과 PR `#N`이 같은 프로젝트에 동시에 존재할 수 있다 — **확인 완료(design.md 14절)**: `AutoLinkRenderer.toValidIssueLink()`는 `issueRepository`만 조회하고 PR은 아예 지원하지 않는다. `#N`은 본문에서 항상 이슈만 가리키므로, 이슈/PR 번호가 같아도 텍스트 해석 충돌은 발생하지 않는다.
- **⚠️ `createPullRequest()`가 `processMergeCheck()`를 호출해 실제 JGit 병합/diff 계산을 수행함**: PR 생성 시점에 실제 git 저장소가 올바르게 존재해야 한다. **M1/M2는 저장소 없이도 완결되도록 설계했는데, PR은 그 전제가 깨진다.** → PR 이관은 DB 이관(M2)과 같은 타이밍에 자동 실행할 수 없고, **사람이 저장소 수동 이관을 끝낸 뒤 별도 단계로 실행**해야 한다. design.md 12절 결정(M2가 project를 생성하지 않고 운영자가 미리 만든 프로젝트를 대상으로 함)과 정확히 맞물려, 운영 절차가 **프로젝트 껍데기 생성(수동) → 저장소 push(수동) → M2 DB import(자동) → M6 PR import(자동)** 하나로 통일된다.
- **확인 완료(design.md 14절)**: `processMergeCheck()`를 스킵하는 내장 메커니즘은 없다. **권장**: `createPullRequest()`를 호출하지 말고 `PullRequest` 엔티티를 직접 구성해 `pullRequestRepository.save()`로 저장(다른 곳과 동일한 "비즈니스 메서드 우회, raw 저장" 패턴) — 대량의 이미 종결된 과거 PR마다 실제 JGit 병합 재계산을 돌릴 필요가 없다.
- **⭐ raw 저장 방식 덕분에 M2가 겪었던 문제 두 가지가 애초에 발생하지 않음(2026-09-29 확인)**: `createdDate`/`updatedDate`/`created`/`updated` 강제 초기화와 알림 발행은 전부 **서비스 메서드 내부에서** 일어나는 일이다(`createIssue()`/`createPosting()`가 대표적). M6은 `createPullRequest()`/`CodeReviewService.createReviewComment()`/`createCommitComment()` 같은 서비스 메서드를 아예 안 쓰고 엔티티를 직접 구성해 repository로 저장하기로 했으므로(아래), **날짜 2차 보정도 알림 억제 파라미터 추가도 필요 없다** — `PullRequest(created=..., updated=...)`를 만든 시점에 이미 원하는 값이 들어가고, raw 저장은 애초에 알림 코드를 거치지 않는다.
  - **단, 이 이점을 누리려면 PullRequest 하위 전부(PullRequestCommit/CommentThread/ReviewComment)를 일관되게 raw로 저장해야 한다** — `CodeReviewService.createReviewComment()`/`createCommitComment()`는 확인 결과 무조건 알림을 발행하므로(`publishNewReviewCommentNotification()` 등) 이것도 쓰면 안 됨.
  - **labels/reviewers/assignee도 서비스 메서드(`addLabel()`/`addReviewer()`/`setAssignee()`) 대신 `PullRequest` 생성자에 직접 채워 넣는다** — Issue/Posting과 동일한 패턴, 불필요한 추가 호출 없이 일관성 유지.

## 범위

- **아카이브 포맷 확정(2026-09-29)**: `pull_requests.ndjson` 필드 스펙 완료 — [archive-format-spec.md 3-9절](../archive-format-spec.md) 참고. title/body/state/브랜치/커밋id/assignee/reviewers/labels/attachments/`commits`(PullRequestCommit 대응)/`commentThreads`(threadType: SIMPLE/NON_RANGED_CODE/CODE, CODE는 `codeRange` 포함) 전부 포함.
- `processMergeCheck()`를 우회 — `PullRequest`/`PullRequestCommit`/`CommentThread`/`ReviewComment` **전부** 엔티티 직접 구성 + repository로 raw 저장(위 참고, 날짜·알림 문제 자동 해소)
- **⭐ 포크 PR 전제조건(신규 발견, archive-format-spec.md 3-9절)**: `fromProjectOwner`/`fromProjectName`이 이 아카이브의 project와 다르면(포크 기반 PR), 그 `fromProject`도 2.0에 이미 존재해야 `PullRequest.fromProject` 참조가 유효하다 — 조회 실패 시 다른 참조와 동일하게 실패 처리(조용한 대체 금지)
- **라벨은 재사용, 재생성 안 함**: PR의 `labels`는 이슈와 같은 `IssueLabel` 엔티티를 공유한다. M6은 M2가 이미 이 프로젝트에 만들어둔 라벨을 이름+category로 조회해서 재사용할 뿐, `newLabelByCategoryName()`을 다시 호출하지 않는다(M2가 M6보다 먼저 끝나 있어야 하는 이유 중 하나 — 아래 의존성 참고).
- author/contributor/receiver/reviewers/assignee 조회 실패 시 실패 처리(조용한 대체 금지) 원칙 적용 — M2와 동일
- 실행 시점을 "저장소 수동 이관 완료 후"로 강제하는 운영 절차(사전 체크) 마련 — **저장소 이관은 커밋 해시 보존 방식(`git clone --mirror` 등)이어야 함을 운영 절차 문서에 명시**(PR 리뷰 코멘트의 `commitId` 참조가 유효하려면 필수)
- PR 리뷰 코멘트(`ReviewComment`/`CommentThread`) 포함 — 완료

## 처리 순서 (M2의 3-2-a 표와 같은 원칙)

M6은 **M2가 같은 프로젝트에 대해 이미 완료된 뒤에만** 실행할 수 있다 — PR이 참조하는 users/labels/project가 전부 M2 단계 산출물이기 때문이다.

| 순서 | 단계 | 참조하는 것 | 비고 |
|---|---|---|---|
| 0 | 사전검증 | 이 프로젝트의 M2 import가 이미 COMPLETED/PARTIAL 상태인지, 저장소가 커밋 해시 보존 방식으로 이미 이관됐는지 | 둘 다 아니면 즉시 거부 |
| 0 | 사전검증 | 포크 PR의 `fromProject` | 존재하지 않으면 해당 PR만 실패 처리(전체 중단 아님) |
| 1 | pull request | project(기존), contributor/receiver/reviewers/assignee(loginId, M2가 이미 만든 유저), labels(이름+category로 조회, 재사용) | `legacyPrId → newPrId` 매핑 생성 |
| 2 | PullRequestCommit | pullRequest(1의 매핑) | 매핑 불필요(PR에 종속) |
| 3 | CommentThread | pullRequest(1의 매핑), author | `legacyThreadId → newThreadId` 매핑 생성 |
| 4 | ReviewComment | thread(3의 매핑), author | 매핑 불필요(스레드에 종속) |
| 5 | attachments | containerType `PULL_REQUEST`/`REVIEW_COMMENT`별로 1/4의 매핑에서 새 id 조회 | M2의 9단계와 동일한 방식 |

## 의존성
M1(아카이브 포맷), **M2(같은 프로젝트에 대해 이미 실행 완료된 상태)** — 순서상 저장소 수동 이관 이후 + M2 완료 이후

## Acceptance Criteria
- [ ] M1 샘플 아카이브에 `pull_requests.ndjson`을 추가한 fixture로 PR 1건 import 성공
- [ ] import 후 PR 번호가 원본과 동일함을 검증(다른 프로젝트에 재현해도 동일 번호)
- [ ] import 중 어떤 알림도 발송되지 않음을 검증(`createPullRequest()`/`CodeReviewService.*` 미호출을 코드 리뷰로도 확인)
- [ ] import된 PR/댓글/리뷰코멘트의 `created`/`updated` 날짜가 원본 아카이브 값과 정확히 일치함을 검증(2차 보정 없이 최초 저장값 그대로)
- [ ] 같은 카테고리 라벨을 M2가 이미 만들어둔 상태에서 M6이 이를 재사용하고 중복 생성하지 않음을 검증
- [ ] `commentThreads`가 있는 fixture로 `threadType`별(SIMPLE/NON_RANGED_CODE/CODE)로 정확히 저장되고, CODE 타입은 `codeRange`까지 보존됨을 검증
- [ ] 포크 PR(`fromProject` ≠ toProject) fixture에서 fromProject가 없으면 그 PR만 실패 처리되고 나머지는 정상 진행됨을 검증
- [ ] contributor/receiver/reviewers/assignee loginId가 존재하지 않는 fixture로 해당 PR이 (조용한 대체 없이) 실패 처리되고 리포트에 남는지 검증
- [ ] M2가 아직 완료되지 않은 프로젝트를 대상으로 M6을 실행하면 즉시 거부됨을 검증
- [ ] 저장소가 준비되지 않은(또는 해시 보존 이관이 확인 안 된) 상태에서 실행 시 명확한 에러로 거부됨을 검증

## 미결 질문
(없음 — 아래 참고)

## 해결된 질문 (design.md 14절, 실제 코드 확인 완료)
- ~~`AutoLinkRenderer`가 `#N`을 이슈/PR 중 어떻게 구분해 해석하는지~~ → PR을 아예 지원 안 함, `#N`은 항상 이슈만 가리킴
- ~~종결된 PR의 `processMergeCheck()` 스킵 가능 여부~~ → 스킵 메커니즘 없음, `PullRequest` 엔티티 직접 구성+repository 저장으로 우회 권장
- ~~PR 리뷰 코멘트(`ReviewComment`/`CommentThread` 계열)를 포함할지~~ → **포함하기로 결정(2026-09-29).** `CommentThread`가 `commitId`/`prevCommitId`로 특정 커밋에 구조적으로 고정되므로, 저장소 수동 이관(이미 결정된 방식) 시 **커밋 해시를 보존하는 방법(`git clone --mirror` 등)을 쓰라는 요건**을 운영 절차 문서에 명시한다 — 별도 판단이 필요한 열린 질문이 아니라 운영자에게 요구할 조건이었을 뿐.
