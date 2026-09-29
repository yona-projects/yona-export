# Yona 1.6 → 2.0 / 2.0 → 2.0 Import-Export 마이그레이션 계획

관련 이슈: [yona-projects/yona#828](https://github.com/yona-projects/yona/issues/828)

## 문서
- [design.md](design.md) — 전체 설계 (아카이브 포맷, 컴포넌트, 아키텍처)
- [archive-format-spec.md](archive-format-spec.md) — M1 세부 스펙 (manifest.json, 엔티티별 NDJSON 스키마)
- [m2-admin-api-spec.md](m2-admin-api-spec.md) — M2 세부 스펙 (Admin Import API: 업로드/상태조회 엔드포인트, 인증, M4 연동)

## 작업 단위 (프로젝트 단위 진행)

| ID | 제목 | 상태 | 위치(repo) | 의존성 |
|---|---|---|---|---|
| [M1](tickets/M1-archive-format.md) | 아카이브 포맷 확정 | 스펙 확정 (fixture 미작성) | yona-export | - |
| [M2](tickets/M2-native-importer.md) | 2.0 Native Importer | 미착수 (핵심 가정 검증 완료) | yona-projects/yona (next) | M1 |
| [M3](tickets/M3-native-exporter.md) | 2.0 Native Exporter | 미착수 | yona (next) | M1 |
| [M4](tickets/M4-legacy-extractor.md) | 1.6 Extractor (yona-export 개편, export+import 서브커맨드) | 미착수 (기술 스택 결정 완료: Kotlin/JVM) | yona-export | M1(export), M2(import) |
| [M5](tickets/M5-validation.md) | 대용량 검증/벤치마크 | 미착수 | yona-export + yona | M2, M3, M4 |
| [M6](tickets/M6-pull-request.md) | Pull Request 이관 | 스코프+아카이브 포맷+처리 순서 확정, 구현 전 | yona-projects/yona (next) + yona-export | M1, **M2(같은 프로젝트에 대해 실행 완료 필요)** |

## 참고
- 1.6 전체 기능 감사(74개 모델 전수 대조, 누락 요소 점검) 결과: [design.md 8절](design.md#8-16-전체-기능-감사-누락-요소-점검)
- 기존 legacy export 포맷 필드 명세: [export-file-spec.md](../export-file-spec.md) (신규 아카이브 포맷 설계 시 최대한 재사용)
- ✅ 로컬 `~/yona` 저장소의 `next` 브랜치(234 ahead / 294 behind)는 1.16에 대한 별도 리팩터링 작업이라 2.0과 무관합니다. **실제 2.0(Kotlin/Spring) 작업은 `~/yona-convert/yona`**(`next` 브랜치, `origin`=`yona-projects/yona`)에서 진행합니다 — M2/M3/M6 구현 시 이 저장소를 기준으로 합니다.
