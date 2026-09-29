---
id: M3
title: 2.0 Native Exporter
status: 미착수
repo: yona-projects/yona (next, Kotlin) — 로컬 작업 위치: `~/yona-convert/yona`(`next` 브랜치, origin=yona-projects/yona, 확인 시점 0 ahead/12 behind — `git pull`로 최신화 후 작업). 로컬 `~/yona`는 1.16 별도 리팩터링 브랜치라 2.0 작업과 무관.
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
- S3 호환 스토리지 자격증명/버킷이 배포 환경에 이미 있는지 — M2 단계에선 "지금 당장 이슈 아님"으로 미뤄뒀는데(design.md 14절), M3는 이 기능(다운로드 제공) 자체가 S3에 의존하므로 M3 착수 시점엔 반드시 확인해야 함
- 다운로드 링크 만료 정책
- import 완료/실패 알림 채널은 없음으로 결정됨(design.md 14절, M2와 동일) — export 완료도 별도 알림 없이 admin이 상태 조회 API로 폴링/확인하는 것으로 통일할지 확인
