---
id: M4
title: 1.6 Extractor (yona-export 개편)
status: 미착수
repo: yona-export
depends_on: [M1]
---

# M4. 1.6 Extractor (yona-export 개편)

## 목표
현재 REST API 호출 기반인 yona-export를, 1.6 DB(read-only, replica/스냅샷)와 `yona_data` 파일을 직접 읽어 M1 포맷 아카이브를 생성하는 추출 전용 CLI로 개편한다. import 로직은 전량 제거(책임은 M2로 이동).

## 범위
- 1.6 MariaDB 스키마 매핑 (`../yona`(`v1.6` 브랜치) `conf/evolutions/default/*.sql`, `app/models/*.java` 74개 엔티티 기준)
- DB 클라이언트 도입(`mariadb`/`mysql2`), 키셋 페이징 쿼리
- **댓글 조회는 반드시 `ORDER BY id ASC`** — `issues.ndjson`/`posts.ndjson`의 `comments` 배열이 부모→자식 순서를 지켜야 한다는 M1 포맷 불변식을 만족시키기 위함(archive-format-spec.md 3-6절)
- 첨부파일 파일시스템 스트림 복사 (HTTP 다운로드 제거)
- **게시글 라벨(`posting_issue_label`) 조회 포함** — 옛 export API가 캡처한 적 없는 데이터(archive-format-spec.md 3-7절), 1.6 `app/models/Posting.java`에 실존 확인됨
- **유저 아바타(`USER_AVATAR` 컨테이너 첨부) 조회 포함** — 1.6 쪽 아바타 저장 방식 확인 필요(2.0과 동일하게 첨부파일 컨테이너 방식인지 M4 착수 시 `app/models/User.java`/아바타 관련 컨트롤러로 확인)
- M1 포맷 tar.gz 스트리밍 생성
- 기존 `YonaExport.js`/`download.js`/`app.js`의 import 관련 코드 제거

## 의존성
M1 (아카이브 포맷)

## Acceptance Criteria
- [ ] 실제(또는 대표성 있는 합성) 1.6 DB 스냅샷에서 프로젝트 1개 추출 성공
- [ ] 1.6 운영 DB(primary)가 아닌 replica/스냅샷에서만 동작함을 문서화 및 접속 설정으로 강제
- [ ] 생성된 아카이브가 M1 manifest 검증을 통과

## 미결 질문
- 1.6 DB의 read-only replica/스냅샷 접근 경로를 어떻게 확보할지(운영팀 협의 필요)
