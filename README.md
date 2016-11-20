Yona Export
===

- 운영중인 Yona 서버의 특정 프로젝트를 로컬PC로 백업받을 수 있도록 도와줍니다.
- yona v1.1 이상부터 지원합니다.

설치
---
```
git clone https://github.com/yona-projects/yona-export.git
cd yona-export
npm install
```

프로젝트 설정
---
- Yona 개인 계정 설정 페이지에서 사용자 토큰 탭을 눌러 토큰을 복사합니다.
- 위에서 설치한 yona-export 폴더에 있는 config.json 파일을 열어서 SERVER, OWNER_NAME, PROJECT_NAME, 앞서 복사해온 사용자 토큰(USER_TOKEN) 항목을 수정합니다.

예시)
```
export default {
  EXPORT_BASE_DIR: 'exported',  // local pc 디렉터리
  ATTACHMENTS_DIR: 'files',  // EXPORT_BASE_DIR 아래 첨부파일이 생기는 곳 
  YONA: {
    SERVER: 'http://repo.yona.io', // 대상서버
    USER_TOKEN: 'FUMwruLNFz0EAldNbXuMawqDl01gLp1XI0M7qPu1pX0=', 
    OWNER_NAME: 'doortts',  // owner 아이디나 그룹 이름
    PROJECT_NAME: 'Test',  // 대상 프로젝트 이름
    ROOT_CONTEXT: ''  // 따로 application root를 설정한 경우
  }
};

```

Project Export 실행
---

```
npm start
```

exported 폴더아래에 항목별로 폴더들이 생기고 md 파일로 내려 받아집니다. 텍스트 에디터로 열어보면 해당 내용들을 살펴볼 수 있습니다.


