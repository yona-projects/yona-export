import unirest from 'unirest';
import path from 'path';
import config from '../config';
import { replaceAttchementFileId } from './utils';

/**
 * config에 지정된 Yona 서버로 글을 보내는 기능을 담당하는 클래스
 *
 * pushFiles 로 먼저 파일들을 업로드 하고
 * pushPost 로 해당 파일을 첨부파일로 지정해서 글을 옮긴다.
 */
export default class YonaExport {
  constructor() {
    this.okCount = 0;
  }

  pushPost(post) {
    let files = collectAttachmentFileIds(post);
    post.body = replaceAttchementFileId(post.body, post.attachments);
    let data = {
      'temporaryUploadFiles': files,
      ...post
    };


    const yonApiUrl = config.YONA.TO.SERVER +
        `${config.YONA.TO.ROOT_CONTEXT}/-_-api/v1/owners/${config.YONA.TO.OWNER_NAME}/projects/${config.YONA.TO.PROJECT_NAME}/issues`;

    unirest.post(yonApiUrl)
        .headers({
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Yona-Token': config.YONA.TO.USER_TOKEN
        })
        .send(JSON.stringify(data))
        .end(response => {
          if (this.isBadResponse(response.status)) {
            console.log('오류 발생!! HTTP 응답코드를 확인하세요! ', response.status, response.statusMessage);
            process.exit(1);
          }
          console.log('response: ', response.data);
          this.okCount++;
        });

    ////////////////////////////////////////////////
    function collectAttachmentFileIds(target) {
      let files = [];
      if (target.attachments) {
        target.attachments.forEach(file => {
          files.push(file.uploadedFile);
        });
      }

      return files;
    }
  }

  getOkCount() {
    return this.okCount;
  }

  pushFiles(post) {
    let uploaded = 0;
    if (post.attachments.length === 0) {
      console.log('enter!');
      this.pushPost(post);
    }

    const attachmentBaseDir = path.join(config.EXPORT_BASE_DIR,
        config.YONA.FROM.OWNER_NAME,
        config.YONA.FROM.PROJECT_NAME,
        config.ATTACHMENTS_DIR);

    post.attachments.forEach(attachment => {
      unirest.post(config.YONA.TO.SERVER + '/files')
          .headers({
            'Content-Type': 'multipart/form-data',
            'Yona-Token': config.YONA.TO.USER_TOKEN
          })
          .field('aUthorLoginId', post.author.loginId)
          .field('authorEmail', post.author.email)
          .attach('filePath', path.join(attachmentBaseDir, attachment.id.toString(), attachment.name)) // Attachment
          .end(response => {
            if (this.isBadResponse(response.status)) {
              console.log('오류 발생!! HTTP 응답코드를 확인하세요! ', response.status, response.statusMessage);
              process.exit(1);
            }

            attachment.uploadedFile = response.headers.location.split('/')[2];   // eg. location: /files/71
            uploaded++;
            if (uploaded === post.attachments.length) {
              this.pushPost(post);
            }
          });
    });
  }

  isBadResponse(statusCode) {
    return [200, 201].indexOf(statusCode) === -1;
  }
}
