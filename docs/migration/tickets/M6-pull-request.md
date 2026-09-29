---
id: M6
title: Pull Request 이관
status: 미착수 (스코프 포함 확정, 세부 설계 전)
repo: yona-projects/yona (next, Kotlin) + yona-export — 2.0 로컬 작업 위치: `~/yona-convert/yona`
depends_on: [M1, M2]
---

# M6. Pull Request 이관

## 배경
1.6 `app/models/PullRequest.java` 전수 감사 중 발견(design.md 8절). title/body/state/브랜치/커밋id 등 git 저장소 본체와 별개인 진짜 앱 DB 데이터라, "1.6의 모든 데이터가 빠짐없이 이관" 요구사항상 이슈/포스트와 동급으로 다뤄야 한다는 판단하에 스코프에 포함하기로 확정(2026-09-28, 사용자 확인).

## 목표
PR(제목/본문/상태/리뷰 코멘트 등)을 M2와 같은 원칙(서비스 계층 직접 호출, 번호 보존, 알림 억제, 날짜 보존)으로 이관하되, 이슈/포스트와 다른 메커니즘(아래) 때문에 M2에 통합하지 않고 별도로 설계·구현한다.

## 이슈/포스트와의 핵심 차이 (design.md 8절, 실제 코드 확인)

- **`explicitNumber` 파라미터가 없음**: `PullRequestService.createPullRequest()`는 항상 `findFirstByToProjectOrderByNumberDesc(toProject).number + 1`로 자동 채번. Issue/Posting과 동일한 패턴의 선행 PR(파라미터 추가)이 별도로 필요.
- **번호 시퀀스가 이슈와 완전히 별개**: `(to_project_id, number)` UNIQUE. 이슈 `#N`과 PR `#N`이 같은 프로젝트에 동시에 존재할 수 있다 — **확인 완료(design.md 14절)**: `AutoLinkRenderer.toValidIssueLink()`는 `issueRepository`만 조회하고 PR은 아예 지원하지 않는다. `#N`은 본문에서 항상 이슈만 가리키므로, 이슈/PR 번호가 같아도 텍스트 해석 충돌은 발생하지 않는다.
- **⚠️ `createPullRequest()`가 `processMergeCheck()`를 호출해 실제 JGit 병합/diff 계산을 수행함**: PR 생성 시점에 실제 git 저장소가 올바르게 존재해야 한다. **M1/M2는 저장소 없이도 완결되도록 설계했는데, PR은 그 전제가 깨진다.** → PR 이관은 DB 이관(M2)과 같은 타이밍에 자동 실행할 수 없고, **사람이 저장소 수동 이관을 끝낸 뒤 별도 단계로 실행**해야 한다. design.md 12절 결정(M2가 project를 생성하지 않고 운영자가 미리 만든 프로젝트를 대상으로 함)과 정확히 맞물려, 운영 절차가 **프로젝트 껍데기 생성(수동) → 저장소 push(수동) → M2 DB import(자동) → M6 PR import(자동)** 하나로 통일된다.
- `created`/`updated`도 `Instant.now()` 하드코딩 — M2와 동일한 2차 보정 필요.
- **확인 완료(design.md 14절)**: `processMergeCheck()`를 스킵하는 내장 메커니즘은 없다. **권장**: `createPullRequest()`를 호출하지 말고 `PullRequest` 엔티티를 직접 구성해 `pullRequestRepository.save()`로 저장(다른 곳과 동일한 "비즈니스 메서드 우회, raw 저장" 패턴) — 대량의 이미 종결된 과거 PR마다 실제 JGit 병합 재계산을 돌릴 필요가 없다.

## 범위 (초안 — 세부 스펙은 착수 시 확정)
- M1 아카이브 포맷에 `pull_requests.ndjson` 추가 (title/body/state/fromBranch/toBranch/커밋id/리뷰 코멘트 등)
- `PullRequestService.createPullRequest()`에 `explicitNumber`/`sendNotification` 파라미터 추가(선행 PR)
- `processMergeCheck()`를 우회 — `PullRequest` 엔티티 직접 구성 + `pullRequestRepository.save()`로 저장(결정됨, 위 참고)
- M2와 동일한 날짜 2차 보정, author 조회 실패 시 실패 처리(조용한 대체 금지) 원칙 적용
- 실행 시점을 "저장소 수동 이관 완료 후"로 강제하는 운영 절차(사전 체크) 마련 — **저장소 이관은 커밋 해시 보존 방식(`git clone --mirror` 등)이어야 함을 운영 절차 문서에 명시**(PR 리뷰 코멘트의 `commitId` 참조가 유효하려면 필수)
- PR 리뷰 코멘트(`ReviewComment`/`CommentThread`) 포함 — `pull_requests.ndjson`에 스레드별 `commitId`/`prevCommitId`/코멘트 목록 포함

## 의존성
M1(아카이브 포맷 공통 부분), M2(같은 원칙 재사용) — 실행 순서상 저장소 수동 이관 이후

## 미결 질문
(없음 — 아래 참고)

## 해결된 질문 (design.md 14절, 실제 코드 확인 완료)
- ~~`AutoLinkRenderer`가 `#N`을 이슈/PR 중 어떻게 구분해 해석하는지~~ → PR을 아예 지원 안 함, `#N`은 항상 이슈만 가리킴
- ~~종결된 PR의 `processMergeCheck()` 스킵 가능 여부~~ → 스킵 메커니즘 없음, `PullRequest` 엔티티 직접 구성+repository 저장으로 우회 권장
- ~~PR 리뷰 코멘트(`ReviewComment`/`CommentThread` 계열)를 포함할지~~ → **포함하기로 결정(2026-09-29).** `CommentThread`가 `commitId`/`prevCommitId`로 특정 커밋에 구조적으로 고정되므로, 저장소 수동 이관(이미 결정된 방식) 시 **커밋 해시를 보존하는 방법(`git clone --mirror` 등)을 쓰라는 요건**을 운영 절차 문서에 명시한다 — 별도 판단이 필요한 열린 질문이 아니라 운영자에게 요구할 조건이었을 뿐.
