Yona Export
===

- 운영중인 Yona 서버의 특정 프로젝트를 내려받거나 다른 Yona 인스턴스로 이동할 수 있도록 도와줍니다.
- 로컬PC로 특정 프로젝트를 백업받을 수 있는 기능도 함께 제공합니다
- Yona v1.6 이상부터 지원합니다.

필요권한
---
  - Export: Export 대상 프로젝트의 관리자 이상의 권한(토큰)이 필요합니다
  - Import: Import 할 대상의 소유자/관리자이어야 하며 타깃 인스턴스 Yona의 사이트 관리자 권한(토큰)이 필요합니다.ㅅ

설치
---
- https://nodejs.org/en/ 에서 nodejs 설치 
- 이후 아래 명령을 실행해서 기본 환경을 구성합니다.

```
git clone https://github.com/yona-projects/yona-export.git
cd yona-export
npm install
```

Export / Import 프로젝트 설정
---
- Yona '사용자 설정' 페이지에서 '사용자토큰' 탭을 눌러 자신의 개인 토큰을 확인합니다.
- clone 받은 yona-export 폴더에 있는 config.json 파일을 열어서 YONA: FROM { SERVER, OWNER_NAME, PROJECT_NAME, 앞서 복사해온 사용자 토큰
(USER_TOKEN) 항목 } 등을 수정합니다.

예시)
```
export default {
  EXPORT_BASE_DIR: 'exported',  // local pc 디렉터리
  ATTACHMENTS_DIR: 'files',  // EXPORT_BASE_DIR 아래 첨부파일이 생기는 곳
  YONA: {
    FROM: {  // Export 할 Yona 인스턴스
      SERVER: 'https://remote.yona.io',
      USER_TOKEN: 'vNcPnAHsafjoASDFHASEydi95u/ztz3z9cxQ=',
      OWNER_NAME: 'yona-projects',
      PROJECT_NAME: 'yona',
      ROOT_CONTEXT: ''  // 따로 application root를 설정한 경우
    },
    TO: {   // Import 시킬 Yona 인스턴스
      SERVER: 'https://main.yona.io',
      USER_TOKEN: 'AsdlfHp6LASFLAiljkEydi95u/ztz3z9SAflh',
      OWNER_NAME: 'yona-projects',
      PROJECT_NAME: 'yona',
      ROOT_CONTEXT: ''
    }
  }
};

```

Project Export 실행
---

- Case1. Export with full download
```
npm start -- export
```

- Case2. Export JSON meta file only
```
npm start -- export jsonOnly

```

- exported 폴더 아래에 항목별로 폴더들이 생기고 프로젝트별 하나의 json 파일과 각각의 md 파일들로 내려 받아집니다. 텍스트 에디터로 열어보면 해당 내용들을 살펴볼 수 있습니다.
- Import 작업시에는 프로젝트 전체 정보가 들어있는 json 파일과 files 폴더 아래의 내려받은 첨부 파일들만 있으면 동작합니다


Project Import 실행
---

```
npm start -- import
```

Project Import Bulk 실행
---

```
./bulk.sh
```

Test
---
```
npm test
```

Export/Import 스펙
---
- Export/Import 파일의 상세 포맷 및 설명은 [export-file-spec.md](/docs/export-file-spec.md)을 참고해 주세요.

Contributors
---
- [@hurcy](https://github.com/hurcy) 님께서 Bulk Import shell을 만들어 주셨습니다. 고맙습니다

