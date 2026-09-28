---
id: M6
title: Pull Request 이관
status: 미착수 (스코프 포함 확정, 세부 설계 전)
repo: yona-projects/yona (next, Kotlin) + yona-export
depends_on: [M1, M2]
---

# M6. Pull Request 이관

## 배경
1.6 `app/models/PullRequest.java` 전수 감사 중 발견(design.md 8절). title/body/state/브랜치/커밋id 등 git 저장소 본체와 별개인 진짜 앱 DB 데이터라, "1.6의 모든 데이터가 빠짐없이 이관" 요구사항상 이슈/포스트와 동급으로 다뤄야 한다는 판단하에 스코프에 포함하기로 확정(2026-09-28, 사용자 확인).

## 목표
PR(제목/본문/상태/리뷰 코멘트 등)을 M2와 같은 원칙(서비스 계층 직접 호출, 번호 보존, 알림 억제, 날짜 보존)으로 이관하되, 이슈/포스트와 다른 메커니즘(아래) 때문에 M2에 통합하지 않고 별도로 설계·구현한다.

## 이슈/포스트와의 핵심 차이 (design.md 8절, 실제 코드 확인)

- **`explicitNumber` 파라미터가 없음**: `PullRequestService.createPullRequest()`는 항상 `findFirstByToProjectOrderByNumberDesc(toProject).number + 1`로 자동 채번. Issue/Posting과 동일한 패턴의 선행 PR(파라미터 추가)이 별도로 필요.
- **번호 시퀀스가 이슈와 완전히 별개**: `(to_project_id, number)` UNIQUE. 이슈 `#N`과 PR `#N`이 같은 프로젝트에 동시에 존재할 수 있다 — `AutoLinkRenderer`가 본문의 `#N`을 이슈/PR 중 무엇으로 해석하는지 먼저 확인해야, design.md 4절의 "#N 보존" 전략을 PR까지 안전하게 확장할 수 있다.
- **⚠️ `createPullRequest()`가 `processMergeCheck()`를 호출해 실제 JGit 병합/diff 계산을 수행함**: PR 생성 시점에 실제 git 저장소가 올바르게 존재해야 한다. **M1/M2는 저장소 없이도 완결되도록 설계했는데, PR은 그 전제가 깨진다.** → PR 이관은 DB 이관(M2)과 같은 타이밍에 자동 실행할 수 없고, **사람이 저장소 수동 이관을 끝낸 뒤 별도 단계로 실행**해야 한다.
- `created`/`updated`도 `Instant.now()` 하드코딩 — M2와 동일한 2차 보정 필요.
- 대량의 이미 종결(MERGED/CLOSED)된 과거 PR에 대해 `processMergeCheck()`의 실제 JGit 병합 재계산을 매번 돌리는 게 맞는지 비용/정확성 재검토 필요 — 저수준 생성 경로(병합 검사 스킵)가 별도로 필요할 수 있음.

## 범위 (초안 — 세부 스펙은 착수 시 확정)
- M1 아카이브 포맷에 `pull_requests.ndjson` 추가 (title/body/state/fromBranch/toBranch/커밋id/리뷰 코멘트 등)
- `PullRequestService.createPullRequest()`에 `explicitNumber`/`sendNotification` 파라미터 추가(선행 PR)
- `processMergeCheck()`를 우회하거나 "이미 종결된 PR" 전용 저수준 생성 경로 검토
- M2와 동일한 날짜 2차 보정, author 조회 실패 시 실패 처리(조용한 대체 금지) 원칙 적용
- 실행 시점을 "저장소 수동 이관 완료 후"로 강제하는 운영 절차(사전 체크) 마련

## 의존성
M1(아카이브 포맷 공통 부분), M2(같은 원칙 재사용) — 실행 순서상 저장소 수동 이관 이후

## 미결 질문
- `AutoLinkRenderer`가 `#N`을 이슈/PR 중 어떻게 구분해 해석하는지(확인 필요)
- PR 리뷰 코멘트(`ReviewComment`/`CommentThread` 계열)를 어디까지 포함할지 — 코드 라인 단위 코멘트는 실제 diff/커밋 존재에 의존하므로 저장소 상태에 더 민감
- 종결된 PR의 `processMergeCheck()` 스킵 가능 여부(2.0 코드 추가 확인 필요)
