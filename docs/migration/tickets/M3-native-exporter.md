---
id: M3
title: 2.0 Native Exporter
status: 미착수
repo: yona-projects/yona (next, Kotlin — 로컬 `~/yona`는 분기된 별도 브랜치이므로 upstream을 직접 받아 작업)
depends_on: [M1]
---

# M3. 2.0 Native Exporter

## 목표
현재 `ProjectApiController.exports()`(단일 동기 JSON 응답)를 대체하는 비동기 버전. 목표2(2.0→2.0) 완성 + M2 importer의 리허설 도구.

## 범위
- `ExportJob` 엔티티/테이블 (상태, 진행률, 결과 위치)
- 페이징/스트리밍으로 M1 포맷 아카이브 생성
- S3 호환 스토리지 업로드 + 다운로드 링크 제공
- admin 트리거 API + 상태 조회 API

## 의존성
M1 (아카이브 포맷)

## Acceptance Criteria
- [ ] 대용량 합성 프로젝트(수만 이슈) export가 타임아웃 없이 완료
- [ ] 생성된 아카이브를 M2 importer로 재수입해 원본과 데이터 일치 확인(왕복 테스트)

## 미결 질문
- S3 호환 스토리지 자격증명/버킷이 배포 환경에 이미 있는지
- 다운로드 링크 만료 정책
