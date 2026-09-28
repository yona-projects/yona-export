---
id: M1
title: 아카이브 포맷 확정
status: 스펙 확정 (fixture 미작성)
repo: yona-export
depends_on: []
---

# M1. 아카이브 포맷 확정

세부 스펙: [archive-format-spec.md](../archive-format-spec.md)

## 목표
1.6 Extractor와 2.0 Native Exporter가 공통으로 생성하고, 2.0 Native Importer가 유일하게 소비하는 표준 아카이브 포맷을 확정한다.

## 범위
- `manifest.json` 스키마 (`formatVersion`, `sourceType`, `owner`/`projectName`, `exportedAt`, `counts`, `checksums`, `repositoryMigration` 플래그)
- 엔티티별 NDJSON 스키마 (users/project/labels/milestones/issues/posts/attachments manifest) — 기존 `docs/export-file-spec.md` 필드를 최대한 재사용
- tar.gz 압축 규약 (스트리밍 압축, 파일 내 경로 규칙)
- 버전 호환 규칙: importer가 낮은 `formatVersion`을 읽을 때의 매핑 책임 범위

## 의존성
없음 (다른 모든 티켓의 선행 작업)

## Acceptance Criteria
- [x] manifest.json JSON Schema 문서화 — [archive-format-spec.md](../archive-format-spec.md) 2절
- [x] 엔티티별 NDJSON 필드 문서화 (legacy 필드와의 매핑표 포함) — 같은 문서 3절, `docs/export-file-spec.md` 필드 재사용
- [ ] 샘플 아카이브(소규모 더미 프로젝트) 1개 생성해 저장소에 fixture로 커밋 — 구현 착수 시 진행

## 결정된 사항 (구 미결 질문)
- **댓글 트리**: `issues.ndjson`/`posts.ndjson`에 **인라인**으로 포함(별도 파일 분리 안 함). 이슈당 댓글 수가 스트리밍에 문제될 만큼 크지 않고, 분리하면 재조합 로직만 늘어남. 단 한 줄이 5MB를 넘기면 extractor가 경고를 남기도록 가드.
- **첨부파일 해시**: 무결성 검증은 새로 계산한 **SHA-256**로 통일. 1.6 DB의 기존 해시(SHA-1로 확인됨)는 `legacyHash`로만 보존, 신뢰 기준으로 쓰지 않음(과거 데이터 드리프트 가능성 배제 불가).

## 추가로 확정된 사항 (스펙 작성 중 결정)
- `users.ndjson`(공개 프로필)과 `credentials.ndjson`(비밀번호 해시/salt/계정상태)을 **분리** — 이슈 #828에서 Clickin 님이 요구한 "계정 재생성 없이 이전" + "민감정보 별도 취급" 요건 반영
- 고아 답글(부모 없는 중첩 댓글)은 extractor가 조용히 스킵하지 않고 그대로 내보내며, importer가 최상위로 승격 + 리포트 기록 — "모든 데이터 빠짐없이 이관" 요구사항 반영
- `repositoryMigration: "manual"` 필드로 git/svn/LFS가 이 아카이브 범위 밖임을 명시
