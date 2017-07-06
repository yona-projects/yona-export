export default {
  "owner": "yona-projects",
  "projectName": "yona-help",
  "projectDescription": "요나 설명을 위한 프로젝트",
  "projectCreatedDate": "2016-02-23 PM 06:33:34 +0900",
  "projectVcs": "GIT",
  "projectScope": "PUBLIC",
  "assignees": [],
  "authors": [
    {
      "loginId": "doortts",
      "name": "doortts",
      "email": "doortts@gmail.com"
    }
  ],
  "memberCount": 1,
  "members": [
    {
      "loginId": "doortts",
      "name": "doortts",
      "role": "manager",
      "email": "doortts@gmail.com"
    }
  ],
  "issueCount": 4,
  "postCount": 4,
  "milestoneCount": 0,
  "labels": {},
  "issues": [
    {
      "number": 1,
      "id": 16,
      "title": "커밋 두 개를 하나로 합치기",
      "type": "ISSUE_POST",
      "author": {
        "loginId": "doortts",
        "name": "doortts",
        "email": "doortts@gmail.com"
      },
      "createdAt": "2016-02-23 PM 06:38:41 +0900",
      "updatedAt": "2017-04-03 AM 01:27:12 +0900",
      "body": "\r\n[squash-two-commit.mov](/files/26)",
      "state": "CLOSED",
      "attachments": [
        {
          "id": 26,
          "name": "squash-two-commit.mov",
          "hash": "5d0d012eedac57fa4f852a21ef8149c7297d9113",
          "mimeType": "video/quicktime",
          "size": 53283448,
          "createdDate": 1456220247000,
          "ownerLoginId": "doortts"
        }
      ]
    },
    {
      "number": 2,
      "id": 212,
      "title": "v1.3 기능 추가/변경 스크린샷",
      "type": "ISSUE_POST",
      "author": {
        "loginId": "doortts",
        "name": "doortts",
        "email": "doortts@gmail.com"
      },
      "createdAt": "2017-02-04 PM 10:12:24 +0900",
      "updatedAt": "2017-02-05 PM 07:38:50 +0900",
      "body": "안녕하세요? 2017년 Yona 첫 릴리즈인 v1.3.0 입니다.\r\n\r\n- 일로 하는 것이 아니다보니 즐겁게 작업할 수 있는 것 같습니다. : )\r\n- 더 많은 사람들이 불필요한 시간을 줄이고 더 즐겁게 일하는데 도움이 되었으면 하는 마음입니다..만...\r\n- RC 버전등을 낼 형편이 안되서 그냥 그대로 릴리즈를 합니다. 문제 발생시 이슈로 남겨주세요. \r\n-  README.md 등을 비롯하여 도움말 문서를 v1.3.0 기준으로 업데이트 했습니다. README.md를 확인해주세요.\r\n\r\n그리고 이번엔 항목이 많아서 커밋id와 항목을 같이 나열하는건 생략합니다.\r\n\r\n**v1.3.0 의 변경사항은 [repo.yona.io](https://repo.yona.io) 에도 적용되어 운영되고 있습니다.**\r\n\r\n기능 추가\r\n===\r\n- 한글 그룹/프로젝트 이름 지원\r\n  - 이젠 프로젝트나 그룹 이름을 꼭 영어로 만들지 않아도 됩니다.\r\n![903815119890.png](/files/1243)\r\n- 이슈나 게시글에 대한 알람을 받고 있는 사람의 목록을 보는 기능\r\n![564211050576.png](/files/1241)\r\n- 내가 댓글을 남긴 이슈을 보는 기능\r\n![139178009420.png](/files/1242)\r\n- 자신이 업로드한 파일들을 모아서 한 번에 볼 수 있는 기능\r\n![394776276234.png](/files/1244)\r\n- 사용자 메뉴를 대체하는 새로운 사이드 바\r\n  - 프로젝트/그룹 즐겨찾기, 검색 등을 더 쉽고 편하게 할 수 있도록 새로 작성한 기능\r\n![1403877902834.png](/files/1247)\r\n- 소셜 로그인을 통한 쉬운 사용 지원\r\n  - 지원: Github, Github Enterprise, Google \r\n  - 가입과정 자체가 필요없고 기존 계정이 있을 경우 자동 병합되며 향상된 보안을 제공할 수 있도록 만들어졌습니다.\r\n  - 자체 가입 자체를 없애고 오직 소셜로그인을 통한 로그인만 가능하도록 제한할 수 있습니다.\r\n![277805944087.png](/files/1248)\r\n- 이슈 템플릿 기능\r\n  - 프로젝트에서 이슈 등록시에 관리자가 미리 정해놓은 이슈 템플릿이 표시된 상태로 작성할 수 있는 기능\r\n  - 코드 저장소로 ISSUE_TEMPLETE.md 파일을 넣는 [Github 방식](https://help.github.com/articles/creating-an-issue-template-for-your-repository/)과 프로젝트 설정에서 직접 수정하는 두 가지 방식을 동시에 제공합니다.\r\n![152484476839.png](/files/1250)\r\n![615164117321.png](/files/1251)\r\n- 코드리뷰 내용들을 일괄로 좀 더 편리하게 살펴볼 수 있도록 엑셀 다운로드 기능 제공\r\n![357216066579.png](/files/1246)\r\n\r\n\r\n\r\n개선/변경사항\r\n===\r\n- 첫 화면의 알림리스트 스타일 개선\r\n![419347042392.png](/files/1240)\r\n- 데이터와 실행부분을 분리해서 쉽게 업그레이드 할 수 있도록 변경. [Yona 실행방법](https://github.com/yona-projects/yona/blob/master/docs/ko/yona-run-and-restart.md) 참고\r\n- 프로젝트 홈, 각종 목록 및 다양 페이지들의 로딩 속도 개선\r\n- MariaDB Connector 업그레이드(v1.3.6 -> v1.5.5)\r\n- 로그인시 로그인 유지를 기본 옵션으로 변경\r\n- 코드 저장소에 들어 있는 마크다운 본문에 링크를 상대 경로로 지정해도 잘 동작하도록 변경\r\n   - 구조화된 문서를 만들어서 코드 저장소로 넣을 때 매우 유용합니다. \r\n   - 예) [상대링크로 작성된 Yona README.md 파일](https://repo.yona.io/yona-projects/yona/code/next/README.md#yb-header-yona-실행-및-업그레이드-백업-및-복구-문제-해결)\r\n- 웹훅 동작 실패시 원인을 좀 더 잘 알 수 있도록 로그 추가\r\n- 프로젝트 라벨 기능 제거\r\n- 마크다운에서 폭이 좁은 테이블 컬럼이 좀 더 잘 표시될 수 있도록 변경\r\n- Git push 시에 발생할 수 있는 캐릭터셋 오류에 대한 좀 더 자세한 안내 메시지 추가\r\n- 이슈 본문에서 바로 새로운 이슈를 생성 할 수 있는 버튼 제공\r\n![408273274940.png](/files/1245)\r\n- 게시글 본문 표시 방식 변경(폭이 조금 줄어들고 새 글 버튼 추가)\r\n- 다양한 OS에서 좀 더 깔끔하게 보일 수 있도록 기본 폰트 적용 순서 변경 (+나눔바른고딕 폰트지원)\r\n- XSS 공격등을 비롯한 다양한 공격에 대응가능하도록 본문 글 sanitize 방식 변경 \r\n- 최근 프로젝트 목록 갱신시에 낙관잠금(optimistic lock)이 덜 일어나도록 수정\r\n- 모바일 기기에서 더 잘 보이도록 디자인 요소들 개선\r\n- 그룹 멤버가 자기가 속한 그룹 프로젝트의 글들을 조금 더 제한적으로 수정가능하도록 변경 (이제 마음대로 삭제는 할 수 없음)\r\n- 좀 더 많은 링크에 대해 상단 진행바 인터렉션 제공\r\n- 읽기 권한이 있는 글에 대해서는 원문 텍스트를 볼 수 있는 기능 제공. (본문 복사시에 유용)\r\n![978789723877.png](/files/1249)\r\n- 존재하지 않는 사용자 프로필 페이지 접근시 좀 더 정확한 메시지 화면 제공\r\n- 본문등에 링크가 있을 때 내부 링크는 같은 창으로 열리고 외부 링크는 새창/새탭으로 구분해 열리도록 능동적 링크 검사 적용\r\n\r\n\r\n\r\n버그수정\r\n===\r\n- 다양한 사이즈의 디바이스를 지원(iPad mini retina 포함)\r\n- 알림 설정화면의 모호한 이름 수정\r\n- 공개 프로젝트인 경우에도 코드에는 멤버만 접근가능하도록 하는 기능 관련 버그 수정\r\n- 코드브라우저에서 URL 인코딩이 필요한 특정 파일이름 버그 \r\n- 마일스톤 본문 작성시 의도치 않았던 파일이 첨부되던 버그\r\n- 코드브라우저 네비게이션에서 파이어폭스 브라우저 관련 버그. (추가적으로 IE도 같이 개선됨)\r\n\r\n그 외 다양한 디자인적 요소들 수정과 가독성 개선 작업들이 이루어졌습니다.\r\n",
      "state": "OPEN",
      "attachments": [
        {
          "id": 1240,
          "name": "419347042392.png",
          "hash": "9fad6ff50721f2e80c37cc82dcebc6abb280ba80",
          "mimeType": "image/png",
          "size": 206526,
          "createdDate": 1486210317000,
          "ownerLoginId": "doortts"
        },
        {
          "id": 1241,
          "name": "564211050576.png",
          "hash": "18f92abe6ca30e24a1c1207b3f6d8fdec41c5076",
          "mimeType": "image/png",
          "size": 479438,
          "createdDate": 1486210436000,
          "ownerLoginId": "doortts"
        },
        {
          "id": 1242,
          "name": "139178009420.png",
          "hash": "3c104b79eea1646e74d4c4e2f0219e3156e99aa8",
          "mimeType": "image/png",
          "size": 17729,
          "createdDate": 1486211407000,
          "ownerLoginId": "doortts"
        },
        {
          "id": 1243,
          "name": "903815119890.png",
          "hash": "ed0ee8aae441714f766987423f392beae405656d",
          "mimeType": "image/png",
          "size": 34254,
          "createdDate": 1486211733000,
          "ownerLoginId": "doortts"
        },
        {
          "id": 1244,
          "name": "394776276234.png",
          "hash": "39000c846bbb87a3b272149f59e2723ea1a9b21c",
          "mimeType": "image/png",
          "size": 64347,
          "createdDate": 1486212380000,
          "ownerLoginId": "doortts"
        },
        {
          "id": 1245,
          "name": "408273274940.png",
          "hash": "b0e1f1571a20cc4bf951cc2d6ca3a04b19c31727",
          "mimeType": "image/png",
          "size": 129227,
          "createdDate": 1486212901000,
          "ownerLoginId": "doortts"
        },
        {
          "id": 1246,
          "name": "357216066579.png",
          "hash": "25db08bfc5075da3d8a76ab125946db4a1cd7679",
          "mimeType": "image/png",
          "size": 60962,
          "createdDate": 1486213470000,
          "ownerLoginId": "doortts"
        },
        {
          "id": 1247,
          "name": "1403877902834.png",
          "hash": "13603631a3b60c885f66c7aec5a2ebfe1f1c3399",
          "mimeType": "image/png",
          "size": 66174,
          "createdDate": 1486213613000,
          "ownerLoginId": "doortts"
        },
        {
          "id": 1248,
          "name": "277805944087.png",
          "hash": "3db4438aa9354a5c84ac08503178203e42f481c5",
          "mimeType": "image/png",
          "size": 242725,
          "createdDate": 1486213934000,
          "ownerLoginId": "doortts"
        },
        {
          "id": 1249,
          "name": "978789723877.png",
          "hash": "ba3227327a50c94212018bc14820fb0639c30f7e",
          "mimeType": "image/png",
          "size": 24273,
          "createdDate": 1486214062000,
          "ownerLoginId": "doortts"
        },
        {
          "id": 1250,
          "name": "152484476839.png",
          "hash": "0f7f3505102807403ca3a8a3efa18036f897d490",
          "mimeType": "image/png",
          "size": 26758,
          "createdDate": 1486214426000,
          "ownerLoginId": "doortts"
        },
        {
          "id": 1251,
          "name": "615164117321.png",
          "hash": "87647ba5089491f1983cdd731132435e664a989b",
          "mimeType": "image/png",
          "size": 57982,
          "createdDate": 1486214672000,
          "ownerLoginId": "doortts"
        }
      ]
    },
    {
      "number": 3,
      "id": 278,
      "title": "v1.4 기능추가/변경 상세 내용",
      "type": "ISSUE_POST",
      "author": {
        "loginId": "doortts",
        "name": "doortts",
        "email": "doortts@gmail.com"
      },
      "createdAt": "2017-03-22 PM 11:35:54 +0900",
      "updatedAt": "2017-04-03 AM 01:26:28 +0900",
      "body": "Yona v1.4.0 입니다.\r\n문득, 다음부터는 뭔가 코드명 같은거라도 붙여볼까하는 생각이 들었습니다... 여튼!\r\nv1.4에는 내용자체는 단순하지만 사용성에 있어서 크게 변화를 줄 수 있는 기능들이 몇가지 포함되었습니다.\r\n\r\n# 릴리즈 노트\r\n\r\n## 기능추가\r\n- 서브태스크 기능\r\n   - 이제 부모이슈와 자식이슈등을 지정하는 것이 가능합니다.\r\n![127382934504.png](/files/1374)\r\n![725332981059.png](/files/1380)\r\n\r\n- 이슈 이동\r\n   - 이슈를 다른 프로젝트로 이동가능합니다.\r\n   - 다양한 응용이 가능한데요 \r\n       - 예를들면 개인 프로젝트에서 글을 써놓고 어느정도 완성되면 특정 프로젝트로 보내거나 \r\n       - 특정 프로젝트를 두 개 이상의 프로젝트로 분할시키거나 \r\n       - 반대로 두 개 이상의 프로젝트를 하나로 합치거나 하는 것 등등이 가능해졌습니다.\r\n       - 극단적으로는 위의 서브태스크 기능과 합쳐서 마스터 프로젝트에서 하위 태스크로 만들어서 다른 프로젝트로 나눠주는것도 가능합니다.\r\n- 온라인 커밋\r\n   - 코드 브라우저 상태에서 텍스트 파일을 만들거나 기존 파일을 수정하는 것이 가능해졌습니다.\r\n   - 다만, 이번 버전에서는 텍스트 파일만 지원합니다.\r\n![752124825079.png](/files/1375)\r\n![424300711973.png](/files/1376)\r\n- 프로젝트 지켜보는 사람 목록보기 지원 by @sjstyle 님!\r\n![361941480268.png](/files/1379)\r\n\r\n- LDAP 로그인 지원\r\n```\r\n# LDAP Login Support\r\n# ~~~~~~~~~~~~~~~~~\r\n#\r\napplication.use.ldap.login.supoort = false\r\nldap {\r\n    host = \"ldap.forumsys.com\"\r\n    # default: ldap.port=389, ldaps.port=636\r\n    port = 389\r\n    # protocol: ldap or ldaps. If you want to use SSL/TLS, use 'ldaps'\r\n    protocol = \"ldap\"\r\n    baseDN = \"ou=scientists,dc=example,dc=com\"\r\n    # If your ldap service's distinguishedName is 'CN=username,OU=user,DC=abc,DC=com', postfix is 'OU=xxx,DC=abc,DC=com'\r\n    distinguishedNamePostfix = \"OU=user,DC=abc,DC=com\"\r\n}\r\n```\r\n- 프로젝트 목록을 숨기는 기능\r\n   - 프로젝트 목록을 감춰서 사이트내에 어떤 프로젝트가 존재하는지 참여자가 알 수 없게 만들 수 있습니다.\r\n```\r\napplication.hide.project.listing = false\r\n```\r\n- Github Enterprise 연동 지원 추가\r\n  - 회사내에서 Github Enterprise를 사용할 경우 연동해서 쓸 수 있는 옵션 중 이름 동기화 옵션과 소셜 로그인시 Github 대신 Enterprise 이름이 표시되도록 하는 옵션이 추가되었습니다.\r\n```\r\napplication.social.login.github.name = \"Github Enterprise\"\r\n# If true, update local user name with social login account name\r\napplication.use.social.login.name.sync = false\r\n```\r\n\r\n## 개선/변경 내용\r\n- 프로젝트 생성 시 기본 선택되어 있는 공개 범위가 '비공개'에서 다시 '공개' 변경되었습니다. 대신에 application.conf 옵션으로 기본 스코프를 정할 수 있도록 만들었습니다.\r\n```\r\nproject.default.scope.when.create = \"private\"\r\n```\r\n- 성능개선\r\n  - 코드 메뉴와 사용자 메뉴등에 대한 튜닝으로 페이지 반응속도를 더욱 증가시켰습니다.\r\n- 자신에게 할당된 열린 이슈의 개수가 메뉴에 표시됩니다.\r\n![1384768976033.png](/files/1377)\r\n- 최근 프로젝트 목록을 리셋하거나 지우는 것이 가능해졌습니다.\r\n![905062093945.png](/files/1378)\r\n   - 개별로 지우고 싶은 경우에는 즐겨찾기로 버튼을 이용해 추가했다 지우면 최근 목록에서 사라집니다.\r\n- 첨부파일 구별에 사용하는 해시알고리즘을 SHA1에서 SHA256으로 변경 #158 by @npcode 님!!\r\n   - 참고1: [Announcing the first SHA1 collision](https://security.googleblog.com/2017/02/announcing-first-sha1-collision.html?m=1)\r\n   - 참고2: [SHA-1 collision detection on GitHub.com](https://github.com/blog/2338-sha-1-collision-detection-on-github-com)\r\n\r\n## 버그 수정\r\n- 메일 발송시에 본문의 헤더 글자에 깨진 링크의 Anchor 링크가 같이 포함되는 문제\r\n- 이슈 글을 쓸 때 단일 라벨 복구가 안되는 문제 #112 #181 by @helols 님! \r\n\r\n**v1.4.0 의 변경사항은 [repo.yona.io](https://repo.yona.io) 에도 적용되어 운영되고 있습니다.**\r\n\r\n## 배포파일\r\n- [yona-v1.4.0-bin.zip](https://github.com/yona-projects/yona/releases/download/v1.4.0/yona-v1.4.0-bin.zip)\r\n  - 바이너리 실행파일로 제공되는 기본 배포파일\r\n- [yona-h2-v1.4.0-bin.zip](https://github.com/yona-projects/yona/releases/download/v1.4.0/yona-h2-v1.4.0-bin.zip)\r\n  - 바이너리 실행파일로 제공되는 H2 Embedded DB 포함 배포파일\r\n  - 사용 예를 들면 출장이나 강의, 혹은 지원 프로젝트 나가서 200명 이하의 조직등에서 간단히 쓰다가 통째로 묶어서 이동할때 정도로 사용하시길 권합니다.\r\n- Docker: @pokev25 님이 https://github.com/pokev25/docker-yona 를 통해 Docker 지원을 도와주고 계십니다. 늘 고맙습니다.\r\n- 매뉴얼 작성: @minishanell 님이  도와주고 계십니다!\r\n  https://github.com/yona-projects/yona/wiki\r\n\r\n\r\n이하 v1.3.3 이후 v1.4.0까지의 커밋목록\r\n---\r\n\r\n* bb83dc2 - issue: Fix single label recovery bug\r\n* 78d6591 - issue: Fix wrong message key\r\n* 39a9d76 - code: Change style of meta info area at code view\r\n* 3513786 - version: Yona v1.4.0\r\n* 6ea4c14 - issue: Increase number of issue minimum width\r\n* d632f3e - issue: Change css style of number of issue\r\n* 8ebdb28 - navbar: Show the number of user open issues\r\n* 79f4d74 - project: Fix default project scope by conf file\r\n* bb0c6a6 - issue: Clear the revision history when moving from a personal project\r\n* 02531cd - code: Prevent lazy loading model bug for some cases\r\n* 2c134d9 - issue: Issues moved from personal projects will not display history\r\n* a16d674 - mail: Remove header-anchor link from mail body\r\n* a1a5c7c - issue: Remove new issue button link attr 'target=_blank'\r\n* 0a857b9 - issue: Change checked issue list style\r\n* 5019a2e - code: Add logic to check for online commit permissions\r\n* b3878a3 - code-browser: Cache code browser page with ehcache\r\n* 835dbe3 - project: Provide option for default project scope when create\r\n* 776d2e2 - login: Support simplified LDAP login\r\n* de97868 - login: Simplify login input form\r\n* ec49ccf - markdown: Set code block to wrap words\r\n* 1d1e844 - initial-data: Set admin user state 'ACTVIE' at first\r\n* 456ae2d - user-profile: Polishing view pages\r\n* 410ac6a - code: Support simplified online commit\r\n* b26c727 - project-list: Fix wrong total page indicator\r\n* 1db3250 - issue: Add issue body, comments when download as xls file\r\n* a4d86a5 - usermenu: Load usermenu asynchronously\r\n* 6ee61d2 - cache-store: Refactor method parameter name\r\n* 3ba1b56 - usermenu: Support deletion of visited project list\r\n* 0775c81 - issue: Add permission check\r\n* 06ef728 - issue: Show event message when issue is moved\r\n* 17bf2b7 - subtask: Show Sub-Task option on status\r\n* e3795d8 - issue: Support issue move to projects\r\n* 7c54845 - subtask: Fix designs, alignments and typos\r\n* 4f2fe2d - issue: Minimum issue moving from and to projects\r\n* fe3fddf - subtask: Disable parent issue selection case by case\r\n* 116de24 - subtask: Show option menus case by case\r\n* f865dcb - subtask: Add i18n option button\r\n* 7cf72ef - subtask: Refine subtask feature\r\n* c4750b6 - subtask: Show options for subtask editing\r\n* b681c39 - subtask: Make Subtak button & design\r\n* ff51bcf - subtask: Support basic subtask feature\r\n* f7f2a857 - css: Fix voted user avatar vertical alignment\r\n",
      "state": "OPEN",
      "attachments": [
        {
          "id": 1374,
          "name": "127382934504.png",
          "hash": "188c1ea8536cf934eec49cf25761419e663f1650",
          "mimeType": "image/png",
          "size": 148860,
          "createdDate": 1490191223000,
          "ownerLoginId": "doortts"
        },
        {
          "id": 1375,
          "name": "752124825079.png",
          "hash": "fbdb9bc7a934977c88517d4a0b8e58bd37d503fc",
          "mimeType": "image/png",
          "size": 112506,
          "createdDate": 1490191276000,
          "ownerLoginId": "doortts"
        },
        {
          "id": 1376,
          "name": "424300711973.png",
          "hash": "d2003a18cbe4212e05007bb0b3d1f6085c70843f",
          "mimeType": "image/png",
          "size": 86973,
          "createdDate": 1490191302000,
          "ownerLoginId": "doortts"
        },
        {
          "id": 1377,
          "name": "1384768976033.png",
          "hash": "c451af1549f39ab5b1acdb3d608ba39e97d276c8",
          "mimeType": "image/png",
          "size": 62751,
          "createdDate": 1490191812000,
          "ownerLoginId": "doortts"
        },
        {
          "id": 1378,
          "name": "905062093945.png",
          "hash": "bc9a40f47d32aa10dc98fe2648d382c6eef60b8e",
          "mimeType": "image/png",
          "size": 195627,
          "createdDate": 1490192074000,
          "ownerLoginId": "doortts"
        },
        {
          "id": 1379,
          "name": "361941480268.png",
          "hash": "7878004dd1df57aefd313768c4b34b1afc980016",
          "mimeType": "image/png",
          "size": 535224,
          "createdDate": 1490193472000,
          "ownerLoginId": "doortts"
        },
        {
          "id": 1380,
          "name": "725332981059.png",
          "hash": "2ebbeb814f0441f6ad5fa9435d19044e2806d0cb0297e750cabebff326091a81",
          "mimeType": "image/png",
          "size": 31905,
          "createdDate": 1490344143000,
          "ownerLoginId": "doortts"
        }
      ],
      "comments": [
        {
          "id": 166,
          "author": {
            "loginId": "clear",
            "name": "Genie",
            "email": "386@mail.com"
          },
          "createdAt": "2017-03-27 AM 04:05:27 +0900",
          "body": "궁금해서 들어와봤는데... 멋져요~~ "
        }
      ]
    },
    {
      "number": 4,
      "id": 354,
      "title": "v1.5 기능추가/변경 상세 내용",
      "type": "ISSUE_POST",
      "author": {
        "loginId": "doortts",
        "name": "doortts",
        "email": "doortts@gmail.com"
      },
      "createdAt": "2017-04-25 AM 12:50:50 +0900",
      "updatedAt": "2017-04-26 PM 02:02:37 +0900",
      "body": "Yona v1.5.0 릴리즈 \r\n===\r\n\r\nv1.5.0은 좀 더 안정적인 운영과 권한 제어를 위한 기능들이 추가되었습니다.\r\n\r\n# 소식\r\n\r\n인터넷 초창기의 디자인이라고 일컬어지던(...) yona.io 공식사이트 http://yona.io 가 커뮤니티 멤버들의 코드 기여로 새롭게 만들어졌습니다. 그리고 앞으로도 더 개선 될 것 같습니다.\r\n\r\n[Basix](https://github.com/BasixKOR)님, [Jiho Persy Lee](https://github.com/search5)님, [chiyodad](https://github.com/chiyodad)님 고맙습니다.\r\n\r\n공식사이트: http://yona.io\r\n소스코드: https://github.com/yona-projects/home\r\n\r\n# 릴리즈 노트\r\n\r\n**주의! 마크다운 렌더링이 이전과 달라졌다면 사용중인 java8 버전을 최신 버전(1.8.0_112 이상)으로 업데이트 해주세요**\r\n\r\n## 주요 추가 기능\r\n- 투 컬럼 모드 (Two Column Mode) - **실험적인 기능**\r\n  - 큰 모니터등을 사용할 때 이슈나 게시글을 분할 해서 보는 방법을 지원합니다.\r\n![321422552149.png](/files/1428)\r\n![485763418175.png](/files/1427)\r\n  - (보시면 아시겠지만) 시간 적게 들이고 유사 목록-본문(list-detail) 구조를 만드는 방법을 찾다보니 이렇게 되었습니다. ;;;\r\n- 로그인 후 인덱스 페이지 정하기\r\n  - 로그인 후 보여지거나 인덱스 페이지로 보여질 곳을 `알림들이 표시되는 곳`과 `내 이슈` 중에서 선택할 수 있습니다.\r\n![91988127553.png](/files/1422)\r\n![1104884501166.png](/files/1423)\r\n- 가입시 가입 정보 내용 및 유효 메일여부 확인 메일 전송 기능\r\n![480754833108.png](/files/1425)\r\n\r\n```\r\napplication.use.email.verification = true\r\n```\r\n이때 easy 메일 설정을 같이 해주셔야 합니다. email 주소와 이름을 원하는대로 수정해주세요.\r\n```\r\nplay-easymail {\r\n  from {\r\n    # Mailing from address\r\n    email=\"projects.yona@gmail.com\"\r\n\r\n    # Mailing name\r\n    name=\"yona-no-reply\"\r\n\r\n    # Seconds between sending mail through Akka (defaults to 1)\r\n    # delay=1\r\n  }\r\n}\r\n```\r\n  - 이 옵션을 사용하게 되면 가입 후 확인 메일의 링크를 클릭하기전까진 해당 계정은 잠금 상태가 됩니다.\r\n\r\n- 특정 이메일 도메인만 메일 수신이 가능하도록 하는 옵션\r\n  - 위의 `유효 메일여부 확인 메일 전송 기능`옵션과 같이 사용하면 특정 메일 도메인의 유효 유저만 가입 및 사용이 가능하도록 만들 수 있습니다.\r\n```\r\napplication.allowed.sending.mail.domains = \"gmail.com, your-company.com\"\r\n```\r\n\r\n## 개선 및 변경 사항\r\n- IE및 엣지(Edge) 브라우저 호환성 개선\r\n- (Bold 글자 문제로) 나눔바른고딕 폰트를 기본 본문 폰트에서 제거 \r\n- 코드 문법 강조(Syntax highlighting) 방법을 서버 렌더링에서 프론트엔드(front-end) 렌더링으로 방식을 변경합니다.\r\n   - 서버 부하를 줄이고 JS파일을 서버 렌더링으로 처리할 때 발생될 수 있는 버그도 해결합니다.\r\n- Java의 Javascript Engine을 라이노(Rhino)에서 Java8의 내쉬혼(Nashorn)으로 변경합니다.\r\n   - 사용하는 Java 버전을 이번에 최신으로 업데이트 하세요. 보안 및 성능 개선을 위해서라도요.\r\n- 코드 브라우저에서 파일 줄바꿈(Line Ending)타입의 표시합니다. (DOS=Windows/UNIX)\r\n![1369462490622.png](/files/1426)\r\n- `내 이슈` 페이지에서 불필요한 아바타나 중복 정보들을 줄여 좀 더 이슈자체에 집중하고 시각적 피로도를 낮출 수 있는 형태로 변경했습니다.\r\n- 그라바타(Gravatar)를 좀 더 넓게 지원\r\n\r\n## 버그 수정\r\n- 이슈 `목록`버튼으로 이전 목록으로 돌아갈 때 이슈 열림/닫힘을 구분하지 않고 돌아가던 문제\r\n- 특정 언어의 코드가 정확하게 문법 강조(syntax highlighting)가 되지 않던 문제\r\n- 코드 브라우저에서 코드 탭을 눌렀을때 코드 브라우저 파일 리스트 페이지로 정확하게 돌아가지 않던 문제\r\n\r\n**v1.5.0 의 변경사항은 [repo.yona.io](https://repo.yona.io) 에도 적용되어 운영되고 있습니다.**\r\n\r\n## 배포파일\r\n- [yona-v1.5.0-bin.zip](https://github.com/yona-projects/yona/releases/download/v1.5.0/yona-v1.5.0-bin.zip)\r\n  - 바이너리 실행파일로 제공되는 기본 배포파일\r\n- [yona-h2-v1.5.0-bin.zip](https://github.com/yona-projects/yona/releases/download/v1.5.0/yona-h2-v1.5.0-bin.zip)\r\n  - 바이너리 실행파일로 제공되는 H2 Embedded DB 포함 배포파일\r\n  - 이 버전은 대규모 환경에서 사용하시기엔 적절하지 않습니다. 예를 들면 출장이나 강의 혹은 프로젝트 지원이나 200명 이하의 작은 조직등에서 간단히 쓰다가 통째로 묶어서 이동할때 정도로 사용하시길 권합니다.\r\n- Docker: @pokev25 님이 https://github.com/pokev25/docker-yona 를 통해 Docker 지원을 도와주고 계십니다. 늘 고맙습니다.\r\n- 매뉴얼 작성: @minishanell 님이  도와주고 계십니다!\r\n  https://github.com/yona-projects/yona/wiki\r\n\r\n이하 v1.4.1 이후 v1.5.0까지의 커밋목록\r\n---\r\n```\r\n* 0545784 - signup: Fix validation code expiring check bug\r\n* 5697cef - subtask: Change method of subtask list size limit\r\n* 92b3c2c - signup: Log rejected signup trial\r\n* 8c3db37 - signup: Introduce signup email verification\r\n* ac01cee - index: Make user choose after login page\r\n* cb66cd6 - issue: Refine my issues list style\r\n* c954740 - site-admin: Change ordering of lists\r\n* 2e8562b - footer: Fix broken D2 link\r\n* af80f86 - code: Show text file line ending type in code browser\r\n* 5cd75c4 - js: Fix Yona's jQuery template related bug\r\n* 0dd9362 - code: Fix error that may occur when 'master branch' does not exist\r\n* 7f1d6e4 - issue: Change 'show watcher of this issue' button position and icon\r\n* 1e07cac - projects: Show no projects message\r\n* b1f7061 - markdown: Change some case of li styles\r\n* dbf9700 - markdown: Change code highlighting method\r\n* 02ca7ec - markdown: Update highlight.js to 9.10.0\r\n* d1ce09a - markdown: Change to use Nashorn for rendering markdown\r\n* 724c31e - history: Make more small and readable change history\r\n* 97169d5 - history: Update posting history escaping method\r\n* 645f6f1 - sanitize: Apply sanitization and fix vulnerability\r\n* 90dc623 - social-login: Add fallback with ignore cases email search\r\n* d071e97 - README: Update feature list\r\n* 5fe1253 - view: Make more natural loading effect in two column mode\r\n* a5d9000 - view: Mark selected list item in two column mode\r\n* 261d795 - board: Remove 'target=_blank' from new button link in a page\r\n* 49264b7 - css: Subtle adjustments in my issues page\r\n* dfd5d69 - view: Show loading image in two column mode\r\n* d8190be - view: Add loading image\r\n* 13eba31 - mention: Monkey patching for two column mode\r\n* 9615366 - mention: Update mention and at.js to v1.5.1\r\n* 4faccb3 - view: Remove animation of side pane view\r\n* 854a5e4 - view: Toggle action for same list click behavior\r\n* c794532 - view: Introduce two column view mode\r\n* 6e5ec65 - mail: Make generous setting of allowed sending mail domains\r\n* a59fd0b - docs: Update applicatoin-conf-desc.md for v1.4\r\n* 1c7b236 - history: Hide editing history from anonymous user\r\n* 8a3d498 - lost-password: Polish html code\r\n* 2c53439 - lost-passowrd: Remove anonymous check option\r\n* 6d6507f - css: Clean up fonts\r\n* 769678f - css: Increase compatibility of IE/Edge for Material Icons\r\n* a35f0ca - html: Fix some redundant html codes\r\n* d40f944 - usermenu: Change js method for IE/Edge browser\r\n* daf24d6 - code: Make issue number autolink in commit message body\r\n* c420c99 - issue: Make short issue link preview text length\r\n* 8086464 - issue: Fix 'to list' button's wrong link at some case\r\n* 1b873ae - code: Fix file tab link bug\r\n* 3379a7f - avatar: Show Gravatar for fallback\r\n```",
      "state": "OPEN",
      "attachments": [
        {
          "id": 1422,
          "name": "91988127553.png",
          "hash": "0427cf33dd4ac95f4784c73ab563d0c9c57204b7e3516d8c1dd2a6e7be9007f4",
          "mimeType": "image/png",
          "size": 45560,
          "createdDate": 1493048667000,
          "ownerLoginId": "doortts"
        },
        {
          "id": 1423,
          "name": "1104884501166.png",
          "hash": "560e57296c140ba67ece209a1fedb2a1facd45eff3e66e727205d650d24f19f8",
          "mimeType": "image/png",
          "size": 17382,
          "createdDate": 1493048669000,
          "ownerLoginId": "doortts"
        },
        {
          "id": 1424,
          "name": "716819897445.png",
          "hash": "01e7e05b866ae134576cb500f2f317f5f02de3c8c73a28b88726dd5385fe5447",
          "mimeType": "image/png",
          "size": 72228,
          "createdDate": 1493048920000,
          "ownerLoginId": "doortts"
        },
        {
          "id": 1425,
          "name": "480754833108.png",
          "hash": "bbcde3cd190fc3a8a084813d23314519daa8c26d539d2856157eab7c10da56a0",
          "mimeType": "image/png",
          "size": 98018,
          "createdDate": 1493048973000,
          "ownerLoginId": "doortts"
        },
        {
          "id": 1426,
          "name": "1369462490622.png",
          "hash": "ca3e3f96453fc5905e51cd7c0a5a3abc029bdb317c921bd35641648fb2d4b8e3",
          "mimeType": "image/png",
          "size": 417778,
          "createdDate": 1493049646000,
          "ownerLoginId": "doortts"
        },
        {
          "id": 1427,
          "name": "485763418175.png",
          "hash": "b79ceb3538ca88a8df39ff9171f56627776bdc4e1bb277a8d8ee61068ffdad30",
          "mimeType": "image/png",
          "size": 379172,
          "createdDate": 1493056956000,
          "ownerLoginId": "doortts"
        },
        {
          "id": 1428,
          "name": "321422552149.png",
          "hash": "d6866bed271eea13ec84b9febaaa67dd9845759c0509f520d94a34f49f9216da",
          "mimeType": "image/png",
          "size": 147297,
          "createdDate": 1493057020000,
          "ownerLoginId": "doortts"
        }
      ]
    }
  ],
  "posts": [
    {
      "number": 2,
      "id": 616,
      "title": "[기본소개] 요나는 뭐하는 SW인가요? / 기본 워크플로우",
      "type": "BOARD_POST",
      "author": {
        "loginId": "doortts",
        "name": "doortts",
        "email": "doortts@gmail.com"
      },
      "createdAt": "2016-12-05 PM 04:03:09 +0900",
      "updatedAt": "2016-12-05 PM 04:21:22 +0900",
      "body": "Yona\r\n===\r\n\r\n요나(Yona)?\r\n---\r\nYona는 사람들이 효율적으로 함께 일을 할 수 있도록 도와주는 설치형 SW로 `프로젝트 호스팅 SW`라고 불립니다.\r\n\r\n여기에서의 '프로젝트'란 초창기에는 'SW개발 프로젝트'를 의미했었습니다. 하지만 시간이 지나고 기능이 추가되고 사람들이 좀 더 보편적으로 사용하게되면서 꼭 SW개발이 아니라 일상적인 업무나 TF(Task Force) 또는 개인적인 노트등으로 활용범위가 늘어나게 되었고 현재는 `주제나 목적을 가지고 일을 하는 단위`로써의 좀 더 일반적인 의미의 '프로젝트'를 의미하게 되었습니다.\r\n\r\n전형적인 요나 기반 워크플로우(workflow)\r\n---\r\n\r\n## Case 1. 주제기반(Job/Task)으로 프로젝트를 만들어서 진행\r\n\r\n- 업무 주제로 프로젝트를 만듭니다. 이때 개인프로젝트로 만들거나 아니면 그룹(organization)을 만들어서 그 하위로 프로젝트를 만들수도 있습니다.\r\n  - 예) `2016년 신입채용`을 주제로 프로젝트를 만듭니다.\r\n![1231517962394.png](/files/1176)\r\n\r\n![840565839278.png](/files/1177)\r\n![1038905586468.png](/files/1178)\r\n[그룹을 먼저 만들고]\r\n\r\n![885595177158.png](/files/1179)\r\n[그룹 하위로 프로젝트를 만듭니다. 공개범위는 그룹멤버들에게만 보이도록 `그룹공개`(그룹멤버들에게만 보이고 접근가능)로 설정합니다. 개발프로젝트가 아닌경우 이슈와 게시판만 남기고 다른 메뉴는 감춥니다]\r\n\r\n- 해야하는 일들은 이슈에 기록하고 담당자를 정합니다.\r\n- 논의가 필요한 경우 댓글로 이야기를 나눕니다.\r\n   - 이때 필요하다면 @ 기호를 이용해서 특정 멤버를 언급합니다. (자동으로 해당 멤버에게 노티나 메일이 가게됩니다)\r\n- 혹시 다른 사람이 이어서 작업을 처리해야 하면 담당자를 변경하는 것도 가능합니다.\r\n   - 일종의 바톤터치개념. 이력으로 남기때문에 중간에 담당자(책임자)가 바뀌는 건 아주 자연스러운 개념입니다.\r\n- 처리가 완료되면 이슈를 닫습니다.\r\n\r\n## Case 2. 나에게 주어진 일에만 집중해서 처리\r\n\r\n![1062903130392.png](/files/1174)\r\n\r\n- 하루 일의 시작은 `내이슈`메뉴에 들어가서 우선 나에게 새롭게 담당자로 할당된 일이 있는지, 새롭게 `나를 언급한 이슈`가 있는지 확인해 봅니다.\r\n- 나에게 할당된 일에 대해 필요하다면 코멘트로 의견을 남기고 일을 처리합니다.\r\n- 다 처리한 일은 닫음 처리합니다.\r\n- 나에게 할당된 이슈가 모두 닫힘처리되었다면 그리고 나를 언급한 이슈에 의견을 더이상 달거나 추가 리액션을 할 필요가 없다면 일을 다 마쳤으니 여유를 가집니다.\r\n\r\n## Case 3. 새롭게 프로젝트에 참여하게 된 경우\r\n\r\n![340495589796.png](/files/1175)\r\n\r\n- 이미 있는 프로젝트로에 새롭게 합류하게되면 해당 프로젝트 멤버나 관리자로부터 초대를 받아 해당프로젝트에 멤버로 들어갑니다.\r\n- 기존에 작업했던 내용들을 이슈에서 살펴보고 혹은 다 같이 알고 있어야 하는 내용등이 있는지 게시판의 목록을 살펴봅니다.\r\n- 과거의 일처리 방식이나 자료들를 일일히 묻지 않아도 차례로 보거나 검색해서 봄으로써 빠르게 해당 프로젝트에 적응할 수 있게 됩니다.\r\n\r\n## Case 4. 다같이 볼 수 있는 공유 프로젝트/조직내 모임,행사 관리\r\n![771740990926.png](/files/1180)\r\n\r\n- 자유 게시판이나 정보 공유, 기술공유 같은 목적으로 특정 `그룹`하위에 share 등을 프로젝트를 운영하는 경우도 많습니다.\r\n- 댓글로 의견을 남기기도 하고 좋다는 뜻으로 `공감`버튼을 눌러셔 의사를 표현하기도 합니다.\r\n- 특정 모임 참여도 이렇게 이슈로 올리고 `공감`을 누른 사람들에게 안내 메일을 보내는 식으로 모임을 운영하기도 합니다.",
      "attachments": [
        {
          "id": 1174,
          "name": "1062903130392.png",
          "hash": "75ef05a82db5a43b6c506ae64a16ad6259c754e9",
          "mimeType": "image/png",
          "size": 86545,
          "createdDate": 1480921387000,
          "ownerLoginId": "doortts"
        },
        {
          "id": 1175,
          "name": "340495589796.png",
          "hash": "40457154313e8b4f16eeba1a0aead402e563394e",
          "mimeType": "image/png",
          "size": 363571,
          "createdDate": 1480921592000,
          "ownerLoginId": "doortts"
        },
        {
          "id": 1176,
          "name": "1231517962394.png",
          "hash": "48dc75abd414b80fa169733dddae6b8e02f11122",
          "mimeType": "image/png",
          "size": 11645,
          "createdDate": 1480921749000,
          "ownerLoginId": "doortts"
        },
        {
          "id": 1177,
          "name": "840565839278.png",
          "hash": "d2ea6cbf39c1d04d22348830d34d93d409e1d0b3",
          "mimeType": "image/png",
          "size": 21172,
          "createdDate": 1480921874000,
          "ownerLoginId": "doortts"
        },
        {
          "id": 1178,
          "name": "1038905586468.png",
          "hash": "94d78027ae1e98d16fd2aef3473f39a2ea5e162c",
          "mimeType": "image/png",
          "size": 181666,
          "createdDate": 1480921918000,
          "ownerLoginId": "doortts"
        },
        {
          "id": 1179,
          "name": "885595177158.png",
          "hash": "a2f9eaba048a3b5f747cbd1f7d34187e4228d62a",
          "mimeType": "image/png",
          "size": 65700,
          "createdDate": 1480922040000,
          "ownerLoginId": "doortts"
        },
        {
          "id": 1180,
          "name": "771740990926.png",
          "hash": "ca26f449a785418deee7e0e2e78909d06543683e",
          "mimeType": "image/png",
          "size": 213828,
          "createdDate": 1480922337000,
          "ownerLoginId": "doortts"
        }
      ]
    },
    {
      "number": 3,
      "id": 651,
      "title": "소셜 로그인 설정",
      "type": "BOARD_POST",
      "author": {
        "loginId": "doortts",
        "name": "doortts",
        "email": "doortts@gmail.com"
      },
      "createdAt": "2017-02-04 PM 08:24:02 +0900",
      "updatedAt": "2017-02-04 PM 08:24:41 +0900",
      "body": "Yona v1.3부터는 소셜로그인을 지원합니다. \r\n\r\n소셜로그인은 향상된 보안과 편리함을 제공합니다. 현재 Yona는 Github, Github Enterprise, Google을 지원하고 있습니다.\r\n\r\n\r\n\r\nGithub\r\n---\r\n\r\n### 1. Github 에 OAuth Application으로 본인의 운영중인 사이트를 등록\r\n\r\nGihub 설정에서 `OAuth applications` 항목에 본인 사이트에 맞게 어플리케이션을 등록합니다.\r\n\r\n![706907280287.png](/files/1233)\r\n\r\n![1061860945830.png](/files/1234)\r\n\r\n\r\n예)\r\n![566826910100.png](/files/1239)\r\n\r\n\r\n### 2. yona 의 conf 폴더에 있는 social-login.conf 파일 내용 수정\r\n\r\n- clientId 와 clientSecret을 conf 폴더의 social-login.conf 파일에 지정합니다.\r\n- https 로 운영중인 사이트라면 redirectUri 하위의 `secure=false` 항목을 `secure=true`로 변경해 주세요.\r\n\r\n\r\nGoogle\r\n---\r\n\r\n### 1. Google 에 OAuth Application으로 본인이 운영중인 사이트 등록\r\n\r\n- https://console.developers.google.com 로 접속합니다.\r\n- Credentials 메뉴를 선택합니다.\r\n![1418152236389.png](/files/1235)\r\n\r\n- Create Credentials 버튼을 눌러서 OAuth Client Id 항목을 선택합니다.\r\n![1031331654559.png](/files/1236)\r\n\r\n- Web application을 선택하고 적당한 이름을 적습니다.\r\n![894913455275.png](/files/1237)\r\n\r\n- Restrictions 부분에는 아래처럼 입력하되 본인의 사이트에 맞게 domain 이름을 수정합니다.\r\n![427005679498.png](/files/1238)\r\n\r\n- 이제 clientId와 clientSecret이 만들어집니다.\r\n\r\n### 2. yona 의 conf 폴더에 있는 social-login.conf 파일 내용 수정\r\n\r\n- clientId 와 clientSecret을 conf 폴더의 social-login.conf 파일에 지정합니다.\r\n- https 로 운영중인 사이트라면 redirectUri 하위의 `secure=false` 항목을 `secure=true`로 변경해 주세요.\r\n\r\n\r\n\r\n### 참고: 현재 repo.yona.io 의 social-login.conf 설정\r\n\r\nrepo.yona.io 는 http는 지원하지 않고 https만 지원하기때문에 secure 항목이 true로 설정되어 있습니다.\r\n\r\n```\r\nplay-authenticate {\r\n\r\n    # If set to true, account merging is enabled, if set to false its disabled and accounts will never prompted to be merged\r\n    # defaults to true\r\n    accountMergeEnabled=false\r\n\r\n    # if this is set to true, accounts are automatically linked\r\n    # (e.g. if a user is logged in and uses a different authentication provider\r\n    # which has NOT yet been registered to another user, this newly used authentication\r\n    # provider gets added to the current local user\r\n    # Handle setting this to true with care\r\n    # If set to false, your resolver must not return null for askLink()\r\n    # defaults to false\r\n    accountAutoLink=true\r\n\r\n    # Settings for the google-based authentication provider\r\n    # if you are not using it, you can remove this portion of the config file\r\n    # and remove the Google provider from conf/play.plugins\r\n    google {\r\n        redirectUri {\r\n            # Whether the redirect URI scheme should be HTTP or HTTPS (HTTP by default)\r\n            secure=true\r\n\r\n            # You can use this setting to override the automatic detection\r\n            # of the host used for the redirect URI (helpful if your service is running behind a CDN for example)\r\n            # host=yourdomain.com\r\n        }\r\n\r\n        # Google credentials\r\n        # These are mandatory for using OAuth and need to be provided by you,\r\n        # if you want to use Google as an authentication provider.\r\n        # Get them here: https://code.google.com/apis/console\r\n        # Remove leading '#' after entering\r\n\r\n        # Following key values are used for test. You must set it your own values.\r\n        clientId=3003412836-8gdflaksjfdla36qm2bbvn1.apps.googleusercontent.com\r\n        clientSecret=ocFoKsafdkjaslxfdslkjGRO\r\n    }\r\n\r\n    github {\r\n        redirectUri {\r\n            # Whether the redirect URI scheme should be HTTP or HTTPS (HTTP by default)\r\n            secure=true\r\n\r\n            # You can use this setting to override the automatic detection\r\n            # of the host used for the redirect URI (helpful if your service is running behind a CDN for example)\r\n            # host=yourdomain.com\r\n        }\r\n\r\n        # Following three keys are used for Yona to Github Enterprise login support only\r\n        # If you just need to use Github.com login, don't uncomment it.\r\n        #\r\n        # authorizationUrl=\"https://your-github-enterprise/login/oauth/authorize\"\r\n        # accessTokenUrl=\"https://your-github-enterprise/login/oauth/access_token\"\r\n        # userInfoUrl=\"https://your-github-enterprise/api/v3/user\"\r\n\r\n        # Following key values are used for test. You must set it your own values.\r\n        clientId=asldfkjasdlfjal\r\n        clientSecret=fdkljaslkfjdsaljf97f1b5fe2315af3\r\n    }\r\n}\r\n```\r\n",
      "attachments": [
        {
          "id": 1233,
          "name": "706907280287.png",
          "hash": "d417c58076e09d7e0aa3ad4f3939510abaf1fece",
          "mimeType": "image/png",
          "size": 43572,
          "createdDate": 1486207098000,
          "ownerLoginId": "doortts"
        },
        {
          "id": 1234,
          "name": "1061860945830.png",
          "hash": "c9b54c450cd6e8f5cc7aa30b02187280718ea30d",
          "mimeType": "image/png",
          "size": 53093,
          "createdDate": 1486207120000,
          "ownerLoginId": "doortts"
        },
        {
          "id": 1235,
          "name": "1418152236389.png",
          "hash": "b5a5d0bbb929b503e9392c8c9f088cfe64c1c826",
          "mimeType": "image/png",
          "size": 50017,
          "createdDate": 1486207148000,
          "ownerLoginId": "doortts"
        },
        {
          "id": 1236,
          "name": "1031331654559.png",
          "hash": "0a56138914366ddcbd8d6dbe5bf2bbcbc74d8dca",
          "mimeType": "image/png",
          "size": 91989,
          "createdDate": 1486207168000,
          "ownerLoginId": "doortts"
        },
        {
          "id": 1237,
          "name": "894913455275.png",
          "hash": "22763075a9877422d8c53d43550f38bff4818d5c",
          "mimeType": "image/png",
          "size": 49517,
          "createdDate": 1486207188000,
          "ownerLoginId": "doortts"
        },
        {
          "id": 1238,
          "name": "427005679498.png",
          "hash": "36e1d6af5652253e73de0fcf44bd2ce46c64cb33",
          "mimeType": "image/png",
          "size": 112916,
          "createdDate": 1486207205000,
          "ownerLoginId": "doortts"
        },
        {
          "id": 1239,
          "name": "566826910100.png",
          "hash": "bf88ba96f190703dcf9defbe3e2b70b97c0122f8",
          "mimeType": "image/png",
          "size": 252627,
          "createdDate": 1486207478000,
          "ownerLoginId": "doortts"
        }
      ]
    },
    {
      "number": 4,
      "id": 653,
      "title": "Yona에서 Github으로 이사가는 방법",
      "type": "BOARD_POST",
      "author": {
        "loginId": "doortts",
        "name": "doortts",
        "email": "doortts@gmail.com"
      },
      "createdAt": "2017-02-07 AM 09:20:15 +0900",
      "updatedAt": "2017-02-08 AM 12:45:13 +0900",
      "body": "Yona 에서 Github으로 이사가는 방법\r\n===\r\n\r\n어떤 제품을 사용하는데에 있어, 특히 온라인 서비스이면서 동시에 자신의 중요한 데이터들이 들어 있는 경우에라면 '백업'과 '이동'이 보장되어야 하는 것이 당연합니다. 만약 Yona를 운영/사용하다가 기능이나 운영등의 이슈로 이동을 원할때 아직은 제한적이지만 2가지 방법으로 이동이 가능합니다.\r\n\r\n우선은 사용자의 소중한 데이터들의 편하 보관과 필요시의 이동/이전을 위해 Yona v1.1 버전부터 로컬PC로 프로젝트 데이터를 내려받는 방법([Yona Export](https://github.com/yona-projects/yona-export/))과 Yona 유사 기능을 상위세트로 제공하고 있는 Github으로 이사하는 방법(Migration)을 제공하고 있습니다.\r\n\r\n이어지는 내용은 Yona에서 Github으로 이사가능 방법에 대한 설명입니다.\r\n\r\nHow to Yona to Github\r\n===\r\n\r\nYona에서 Github으로 특정 프로젝트를 옮기려면 아래와 같은 준비가 우선 필요합니다.\r\n\r\n준비사항\r\n---\r\n- Yona v1.1 이상\r\n- Github 계정 \r\n\r\n준비가 끝났으면 Yona와 Github 계정에 대해 각각 아래와 같은 작업을 진행합니다.\r\n\r\n환경세팅 전체적인 진행순서\r\n---\r\n- Github: OAuth application 등록하고 client id와 secret 키 받기\r\n- Yona: application.conf 에서 허용여부와 github 키들을 등록하고 재시작하기\r\n- 설치된 Yona 서버에서 이제 /migration URL에서 github migration을 제공합니다.\r\n\r\n이제 하나씩 자세히 살펴보도록 하겠습니다.\r\n\r\nGithub\r\n---\r\n계정 Settings 에 자신만의 OAuth application 등록\r\n\r\n![1249365838131.png](/files/1156)\r\n\r\n![1107459599319.png](/files/1157)\r\n\r\nDeveloper settings 의 OAuth Applications를 선택한 다음\r\n\r\n![349457845360.png](/files/1158)\r\nRegister new application 버튼을 누릅니다. 위 스크린샷에는 제가 이미 만들어 놓은 application이 보이고 있습니다.\r\n\r\n![1440702016370.png](/files/1161)\r\n\r\nHomepage URL: 설치하신 yona 서버 url이나 안내문을 볼수 있는 url을 적으시면 됩니다.\r\n중요한 부분은 `Authorization callback URL` 인데요 여기에 설치한 yona 서버의 migration url을 정확히 적으셔야 합니다.\r\n예를 들어 설치하신 yona의 서버 url이 `http://my-yona.com:9000` 이었다면 \r\nAuthorization callback URL은 `http://my-yona.com:9000/migration` 으로 적어주셔야 합니다.\r\n\r\nrepo.yona.io 같은 경우에는 아래처럼 만들었습니다.\r\n\r\n![1333336021180.png](/files/1160)\r\n\r\n\r\n생성하면 이제 client id와 secret를 볼 수 있게 됩니다.\r\n\r\n![232200672739.png](/files/1162)\r\n\r\n이제 설치한 Yona 서버쪽에 설정을 할 차례입니다.\r\n\r\nYona 설정\r\n---\r\n\r\nconf 파일 하단의 application.conf 파일에 아래 내용을 추가하거나 수정합니다.\r\n\r\n예)\r\n```\r\ngithub.allow.migration = true\r\ngithub.client.id = \"e7f9ad76a3a4ba19b2c5\" \r\ngithub.client.secret = \"cb2aac9a67fb33ee5c42501f6c485bf285cf5\"\r\n\r\n```\r\n**위 키값들은 예시용입니다. 그대로 사용하시면 동작안합니다~**\r\n\r\n- github.allow.migration 의 기본값은 false 이고 true로 변경후 재시작하지 않으면 /migration 으로 접근하면 허용하지 않는 요청이라고 표시됩니다.\r\n- `github.client.id`와 `github.client.secret`에 각각 앞에서 github에서 설정한 client id 와 secret 값을 복사해서 붙여 넣습니다.\r\n- Yona 서버를 재시작하고 /migration URL로 접속하면 최초접속시에는 자동으로 github 으로 이동해서 로그인을 요청하게 됩니다.\r\n- Gihtub 로그인을 하면 앞에서 만든 OAuth 애플리케이션에서 권한을 요청하는 화면이 등장합니다. 이때 Yes를 선택하셔야 정상적으로 권할을 부여받아서 Github 으로 프로젝트를 이동하는 것이 가능해집니다.\r\n- 권한을 부여받으면 다시 설치한 Yona 서버로 자동으로 되돌아옵니다. (앞서 등록한 callback url 덕분입니다)\r\n\r\n![64796853386.png](/files/1159)\r\n\r\n\r\n- source와 destination를 선택해서 이동하면 Yona의 이슈와 게시글은 github 이슈로, milestone을 마찬가지로 github milestone으로 이동됩니다. \r\n- 단, github은 게시판이 없기때문에 Yona의 게시글은 '게시글' 라벨이 붙어서 github 이슈로 이동되는점을 유의해 주세요\r\n\r\n이제 환경적인 준비는 다 되었고 실제로 프로젝트들을 이동하는 작업애 대해 설명합니다.\r\n\r\n프로젝트 옮기기\r\n===\r\n\r\n준비사항\r\n---\r\n- git client \r\n\r\n전체적인 진행순서\r\n--\r\n- github 에 프로젝트 만들어 놓기\r\n- 설치된 Yona 서버 migration url 에서 source와 destination(=github project) 선택\r\n- 순서대로 이동\r\n- wiki 페이지 생성\r\n- Yona Export 를 이용햐서 첨부파일 이동\r\n\r\n상세설명\r\n---\r\n\r\n- Github에 Yona 프로젝트에서 이동할 프로젝트를 만듭니다.\r\n\r\n- 설치된 Yona v1.1 이상의 서버에서 /migration URL로 접근합니다.\r\n```\r\n예) http://127.0.0.1:9000/migration\r\n```\r\n- Source 에는 자신이 admin인 Yona 프로젝트 목록이, Destination 에는 이동 가능한 github 프로젝트 목록이 보입니다.\r\n- 이동시에는 대상 프로젝트의 이슈를 지우거나 수정하지 않습니다. 따라서 여러번 이동을 누르면 중복해서 이슈가 게시글이 등록된다는 점을 유의해 주세요.\r\n- 이미 이슈가 있는 프로젝트는 경고가 뜨니까 확인해 주쎄요\r\n- 이슈를 먼저 이동하면 게시글 이동할때는 마찬가지로 이미 이슈가 등록되어있다고 경고가 뜨지만 그럴수 밖에 없습니다. Yona의 이슈와 게시글을 github에서는 다 이슈로 이동하기때문입니다.\r\n- 기다리면 상단에 메시지와 이동 진행막대가 보일겁니다.\r\n- 만약 이동중에 문제가 생기면 github 프로젝트를 지우고 다시 생성해서 진행하시면 됩니다.\r\n\r\n첨부파일 이동\r\n---\r\n- 이슈나 게시판을 옮기고 보면 첨부파일들이 모두 빠져있는것으로 보입니다.\r\n- 첨부파일 이동은 github의 wiki 기능을 이용해서 한번에 옮기도록 만들었습니다.\r\n- 대상 github 프로젝트가서 wiki 메뉴에서 페이지를 만듭니다. (만든적이 있으면 생략가능)\r\n![591968731021.png](/files/1151)\r\n![1421371255546.png](/files/1152)\r\n특별히 내용입력할 필요 없습니다. `Save Page` 누르세요.\r\n- 만들고 나면 wiki 페이지를 clone 할 수 있는 url 이 보입니다.\r\n![1072515748554.png](/files/1153)\r\n- [Yona Export](https://github.com/yona-projects/yona-export) 를 이용해서 이동대상 프로젝트의 첨부파일을 내려받습니다.\r\n- Yona Exoprt 를 사용하면 로컬 exported 폴더에 대상 프로젝트의 글들과 files 폴더가 생겨있는걸 볼 수 있습니다.\r\n![47350399837.png](/files/1154)\r\n\r\n이제 위에서 만들어진 wiki URL을 이용해서 files를 wiki 저장소로 집어 넣으면 됩니다. \r\n아래는 wiki URL이 https://github.com/doortts/test.wiki.git 일 경우에 대한 예시입니다.\r\n```\r\ngit init\r\ngit remote add origin https://github.com/doortts/test.wiki.git\r\ngit add files\r\ngit commit -m \"Upload files\"\r\ngit push origin master -u\r\n``` \r\n- github id와 password를 물어보면 잘 입력합니다.\r\n- 참고로 50M 이하의 파일만 정상적으로 업로드가 되니 유의하세요!\r\n\r\n- 첨부파일 업로드가 다 끝나면 이제 이슈와 게시글의 첨부파일들이 잘 보이는지 확인해 봅니다.\r\n\r\n끝!\r\n\r\n주의사항!!\r\n---\r\n- Github은 api call limit 이 있습니다. 분당 150을 넘어가면 abuse detection 이 뜨면서 한 시간동안 api call을 할 수 없게 됩니다.\r\n- 그래서 일부러 조금 느리게 보내도록 되어 있습니다만 같은 서버내에서 동시에 어려명이 이사를 시도하면 이 limit에 쉽게 걸릴테니 담당자를 정하거나 적절히 잘 분배해서 진행하시길 권합니다.\r\n- 첨부파일은 참고로 50M 이하의 파일만 정상적으로 업로드가 되니 유의하세요!\r\n"
    },
    {
      "number": 5,
      "id": 656,
      "title": "repo.yona.io 서버 구성",
      "type": "BOARD_POST",
      "author": {
        "loginId": "doortts",
        "name": "doortts",
        "email": "doortts@gmail.com"
      },
      "createdAt": "2017-02-10 PM 01:21:46 +0900",
      "updatedAt": "2017-02-10 PM 05:31:13 +0900",
      "body": "repo.yona.io 서버 구성\r\n===\r\n\r\n현재 데모 서버로 운영중인 repo.yona.io 는 2개의 서버로 운영중입니다.\r\n\r\n각각을 Yona1 Yona2로 부르고 있고 Yona2는 Yona1의 Fail Over(접속 실패시 서비스 이전) 기능을 수행하고 있습니다. \r\n이 부분은 [Apache의 Proxy Load Balancer](https://httpd.apache.org/docs/2.4/mod/mod_proxy_balancer.html)를 이용해서 헬스체크 후 서비스가 넘어가게 구성했습니다. 하단의 ssl.conf 설정 부분에서 확인할 수 있습니다.\r\n\r\nYona1\r\n---\r\n- OS: CentOS release 6.7 (Final)\r\n- [yona.io](http://yona.io) 및 [repo.yona.io](https://repo.yona.io) 메인서비스 서버\r\n- 설치 및 운영 SW\r\n  - Yona (최신 개발중인 상태)\r\n  - Maria DB \r\n  - Apache 2.2\r\n\r\nYona2\r\n----\r\n- OS: CentOS Linux release 7.3 (Core)\r\n- repo.yona.io fail over 서버\r\n- 설치 및 운영 SW\r\n  - Yona (최신 개발중인 상태)\r\n  - Apache 2.2\r\n\r\n\r\nApache HTTP Server 주요 구성\r\n---\r\n\r\n### http.conf\r\n```\r\n<VirtualHost *:80>\r\n  ProxyPreserveHost On\r\n  ServerName yona.io\r\n  DocumentRoot \"/data/html\"\r\n</VirtualHost>\r\n<VirtualHost *:80>\r\n  ServerName repo.yona.io\r\n  Redirect permanent / https://repo.yona.io/\r\n  ErrorDocument 503 503.html\r\n</VirtualHost>\r\n```\r\n\r\nrepo.yona.io의 경우 http로 들어오는 요청은 모두 https로 redirect 하도록 구성해 놓았습니다.\r\n그 외는 특별한 건 없습니다.\r\n\r\n### ssl.conf (https 서비스용)\r\n```\r\n<Proxy balancer://myset>\r\n    BalancerMember http://127.0.0.1:9000\r\n    BalancerMember http://yona2:9000 status=+H\r\n    ProxySet lbmethod=byrequests\r\n</Proxy>\r\n\r\n<VirtualHost _default_:443>\r\nProxyPreserveHost On\r\nServerName repo.yona.io:443\r\nProxyPass  /excluded !\r\nProxyPass  /robots.txt !\r\nProxyPass / \"balancer://myset/\"\r\nProxyPassReverse / \"balancer://myset/\"\r\nDocumentRoot \"/data/html\"\r\nErrorDocument 503 http://yona.io/503.html\r\n\r\nHeader always set Strict-Transport-Security \"max-age=63072000; includeSubdomains; preload\"\r\n\r\n<Proxy \"https://repo.yona.io\">\r\n  ProxySet connectiontimeout=3 timeout=5\r\n</Proxy>\r\n\r\nSSLEngine on\r\n\r\nSSLProtocol all -SSLv2 -SSLv3\r\nSSLHonorCipherOrder on\r\n\r\nSSLCipherSuite \"EECDH+ECDSA+AESGCM EECDH+aRSA+AESGCM EECDH+ECDSA+SHA384 EECDH+ECDSA+SHA256 EECDH+aRSA+SHA384 EECDH+aRSA+SHA256 EECDH+aRSA+RC4 EECDH EDH+aRSA RC4 !aNULL !eNULL !LOW !3DES !MD5 !EXP !PSK !SRP !DSS !RC4\"\r\n```\r\n\r\n- yona2는 외부에서 직접 접근이 안되는 내부망에 있고 yona1의 apache server가 reverse proxy로 중계를 해주고 있습니다.\r\n- SSL의 경우 오래된 protocol들은 disable 시켜 놓았습니다. (sslv2 sslv3, sslv3같은 경우엔 tls 1.0이랑 동일해서 tls를 1.1이상으로 제한하지 않는 이상 큰 의미는 없습니다만 어쨌든.)\r\n- SSLCipherSuite 도 약한 것들은 제외시켜 놓았고요.\r\n\r\n이렇게 구성하면 대략 테스트 점수가 이렇게 나옵니다.\r\n\r\n![62092177716.png](/files/1273)\r\n출처: https://www.ssllabs.com/ssltest\r\n\r\n\r\nYona 구성\r\n---\r\n- 소스 버전으로 운영중이며 개발시 새로운 패치나 기능이 추가되면 거의 바로 일치시켜 놓습니다.\r\n   - 개발 브랜치는 [next](https://github.com/yona-projects/yona/commits/next) 입니다. (릴리즈는 master 브랜치입니다.)\r\n- 시작/재시작을 위한 스크립트로 yona-run.sh 을 따로 만들어 놓았습니다.\r\n\r\n### yona-run.sh\r\n```\r\nPORT=9000\r\nYONA_DATA=/data/yona;export YONA_DATA\r\nPLAY2_HOME=/home/doortts/apps/play2\r\n\r\npid=`ps -ef | grep java | grep Dhttp.port=$PORT | awk '{print $2}'`\r\nkill $pid\r\n_JAVA_OPTIONS=\"-Xmx4096m -Xms4096m -Dyona.data=$YONA_DATA\" $PLAY2_HOME/activator \"start -DapplyEvolutions.default=true -Dhttp.port=$PORT\"\r\n```\r\n참고: https://github.com/yona-projects/yona/blob/master/restart.sh\r\n\r\n\r\n### sync-to-yona1.sh\r\n\r\nyona2 서버랑 yona1 서버는 rsync를 이용해 서로 상호 파일 sync 하도록 만들어 놓았습니다.\r\n\r\n```\r\ndate >> /home/doortts/sync.log\r\nrsync -aP doortts@yona1:/data/yona/uploads/ /home/doortts/yona/uploads >> /home/doortts/sync.log\r\nrsync -aP --delete doortts@yona1:/data/yona/repo/ /home/doortts/yona/repo >> /home/doortts/sync.log\r\n```\r\n\r\n### is-alive-bot.sh\r\n\r\n서버 상태에 대한 알람은 Telegram Bot을 통해서 알람을 받게 만들어 놓았습니다.\r\n\r\n참고: \r\n- https://github.com/doortts/is-alive-bot.sh\r\n- https://github.com/yona-projects/yona/blob/master/is-alive-bot.sh\r\n\r\n예를 들어 업데이트시에 메인서버인 Yona1을 잠시 죽이면 아래처럼 메시지가 옵니다.\r\n![1290636349781.png](/files/1275)\r\n\r\n그 외는 보통 일반적인 서버 설정들을 해 놓았습니다.\r\n이를테면 Dos 공격막기 위한 iptable 처리나 Ban처리(fail2ban), ssh 설정, id/pw를 통한 로그인 금지 등등 같은 것들요.\r\n\r\n적고보니 별건 없네요 ㅎ\r\n",
      "attachments": [
        {
          "id": 1273,
          "name": "62092177716.png",
          "hash": "16d89cf95df73d724a5133976924044d18d6e8cf",
          "mimeType": "image/png",
          "size": 179458,
          "createdDate": 1486699276000,
          "ownerLoginId": "doortts"
        },
        {
          "id": 1274,
          "name": "1344702792288.png",
          "hash": "90d801f7a555c3c5851b69125d3f1e652b0328a5",
          "mimeType": "image/png",
          "size": 17219,
          "createdDate": 1486699427000,
          "ownerLoginId": "doortts"
        },
        {
          "id": 1275,
          "name": "1290636349781.png",
          "hash": "43ee3b56e28fbe25c420311499b329469f076318",
          "mimeType": "image/png",
          "size": 97916,
          "createdDate": 1486700322000,
          "ownerLoginId": "doortts"
        }
      ],
      "comments": [
        {
          "id": 59,
          "author": {
            "loginId": "postimg",
            "name": "더미",
            "email": "postimg@yopmail.com"
          },
          "createdAt": "2017-02-10 PM 01:43:22 +0900",
          "body": "SSL 설정은 웹서버와 버전에따라서 약간씩 다를 수 있습니다.\r\n\r\n[ssl-config-generator](https://mozilla.github.io/server-side-tls/ssl-config-generator/)를 참고 하시어 작성 하시면 좋습니다.\r\n\r\n[HSTS](https://lesstif.gitbooks.io/web-service-hardening/content/ssl-tls-https.html#hstshttp-strict-transport-security)설정은 필요 여부에 따라 설정하세요.\r\n\r\n설정한 시간동안은 http로 접속을 해도 https로 접속됩니다."
        },
        {
          "id": 60,
          "author": {
            "loginId": "doortts",
            "name": "doortts",
            "email": "doortts@gmail.com"
          },
          "createdAt": "2017-02-10 PM 01:45:29 +0900",
          "body": "@postimg +1 \r\n저런 좋은 사이트가 있었는지 몰랐네요. 고맙습니다!!"
        }
      ]
    }
  ],
  "milestones": []
}

