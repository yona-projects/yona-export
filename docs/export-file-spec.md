Yona Export/Import File Spec
===

개요
---
- Yona는 프로젝트 별로 export / import 기능을 제공합니다

필요권한
---
  - Export: Export 대상 프로젝트 혹은 그룹의 관리자 이상의 권한(토큰)이 필요합니다
  - Import: Import 할 대상의 소유자이거나 혹은 그룹의 관리자이어야 하며 사이트 관리자 권한(토큰)이 필요합니다.

Export 설명
---

- 아래 포맷과 일치시킬 수 있다면 어떠한 소스로부터도 Yona 로 Import 하는 것이 가능합니다

```
{
  "owner": "yona-projects",
  "projectName": "yona-help",
  "projectDescription": "요나 설명을 위한 프로젝트",
  "projectCreatedDate": "2016-02-23 PM 06:33:34 +0900",
  "projectVcs": "GIT",
  "projectScope": "PUBLIC",
  "assignees": [  // 프로젝트 이슈에 현재 담당자로 지정되어 있는 유저들. , 로 이어서 적습니다. [선택적]
      {
        "loginId": "doortts",
        "name": "doortts",
        "email": "doortts@gmail.com"
      }
  ],
  "authors": [  // 프로젝트 멤버는 아니지만 글을 쓴 적이 있는 사용자들. , 로 이어서 적습니다. [선택적]
    {
      "loginId": "doortts",
      "name": "doortts",
      "email": "doortts@gmail.com"
    }
  ],
  "memberCount": 1, // import 때는 사용안함
  "members": [  // 프로젝트 멤버들
    {
      "loginId": "doortts",
      "name": "doortts",
      "role": "manager",  // 프로젝트 멤버의 권한. manager, member 두 가지 중 선택
      "email": "doortts@gmail.com"
    }
  ],
  "issueCount": 4,   // import 때는 사용안함
  "postCount": 4,    // import 때는 사용안함
  "milestoneCount": 0,  // import 때는 사용안함
  "labels": [   // 이슈 라벨들. , 로 이어서 적습니다.
      {
        "labelName": "yobi-to-yona",
        "labelColor": "#40a0eb",
        "category": "마이그레이션",
        "isExclusive": true   // 해당 카테고리 내에서 하나만 선택가능하게 할건지 여부. true면 하나만 선택가능.
      },
      {
        "labelName": "tip",
        "labelColor": "#f1d55c",
        "category": "MariaDB",
        "isExclusive": false
      },
      ...
      ...
  ],
  "issues": [  // 이슈들. 없으면 [] 로 처리
    {
      "number": 1,  //화면에 보이는 이슈 번호
      "id": 16,  // 이전 Yona에서 내부적으로 사용하던 id. import 때는 사용안함
      "title": "커밋 두 개를 하나로 합치기",
      "type": "ISSUE_POST",  // 종류: 이슈글 ISSUE_POST, 이슈 코멘트 ISSUE_COMMENT, 게시판글 BOARD_POST, 게시글 코멘트 NONISSUE_COMMENT
      "author": {
        "loginId": "doortts",
        "name": "doortts",
        "email": "doortts@gmail.com"
      },
      "createdAt": "2016-02-23 PM 06:38:41 +0900",
      "updatedAt": "2017-07-06 AM 12:40:58 +0900",
      "body": "\r\n[squash-two-commit.mov](/files/26)",
      "state": "OPEN",  // 이슈 상태. OPEN, CLOSED
      "attachments": [ // 첨부파일들. 첨부파일이 없는 이슈일 경우 key 항목 자체가 없어도 무방
        {
          "id": 26, // files 폴더 하위에 26번 폴더에 파일이 저장되어 있음
          "name": "squash-two-commit.mov",
          "hash": "5d0d012eedac57fa4f852a21ef8149c7297d9113", // import 때는 사용안함
          "containerType": "ISSUE_POST", // import 때는 사용안함
          "mimeType": "video/quicktime", // import 때는 사용안함
          "size": 53283448,
          "containerId": "16", // import 때는 사용안함
          "createdDate": 1456220247000, // import 때는 사용안함
          "ownerLoginId": "doortts"  // 최초에 파일을 올렸던 사람의 login id
        },
        ...
        ...
      ],
      "comments": [  // 이슈 코멘트. 코멘트가 없는 이슈일 경우에는 key 항목 자체도 없어도 무방.
        {
          "id": 166,
          "type": "ISSUE_COMMENT",
          "author": {
            "loginId": "clear",
            "name": "Genie",
            "email": "dasflk@mail.com"
          },
          "createdAt": "2017-03-27 AM 04:05:27 +0900",
          "body": "궁금해서 들어와봤는데... 멋져요~~ "
        },
        {
          "id": 166,
          "type": "ISSUE_COMMENT",
          "author": {
            "loginId": "doortts",
            "name": "doortts",
            "email": "doortts@mail.com"
          },
          "createdAt": "2017-03-27 PM 01:05:27 +0900",
          "body": "고맙습니다.",
          "attachments": [
              {
                "id": 1174, // import 때는 사용안함
                "name": "1062903130392.png",
                "hash": "75ef05a82db5a43b6c506ae64a16ad6259c754e9", // import 때는 사용안함
                "mimeType": "image/png", // import 때는 사용안함
                "size": 86545,
                "containerId": "616", // import 때는 사용안함
                "createdDate": 1480921387000, // import 때는 사용안함
                "ownerLoginId": "doortts"
              }
          ]
        },
        ...
      ]
    },
  ],
  "posts": [  // 게시판 글들. 이슈와 기본 형식은 동일함
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
      "body": "....",
      "attachments": [
        {
          "id": 1174, // import 때는 사용안함
          "name": "1062903130392.png",
          "hash": "75ef05a82db5a43b6c506ae64a16ad6259c754e9", // import 때는 사용안함
          "containerType": "BOARD_POST", // import 때는 사용안함
          "mimeType": "image/png", // import 때는 사용안함
          "size": 86545,
          "containerId": "616", // import 때는 사용안함
          "createdDate": 1480921387000, // import 때는 사용안함
          "ownerLoginId": "doortts"
        },
        ...
      ]
    },
  ],
  "milestones": [
      {
        "id": 1,  // import 때는 사용안함
        "title": "v1.0",
        "state": "closed",  // open, closed, 대소문자 무관
        "description": "Yona v1.0.0",
        "dueDate": "2016-02-15 PM 11:59:59 +0900"  // 마감일이 있는 경우
      },
      ...
      {
        "id": 93,
        "title": "v1.3 Next Year!!",
        "state": "open",
        "description": "v1.3 Next Year!!"
      }
  ]
}
```
