import unirest from 'unirest';
import path from 'path';
import fse from 'fs-extra';
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

  pushPost(post, parent, cb) {
    let files = this.collectAttachmentFileIds(post);
    post.body = replaceAttchementFileId(post.body, post.attachments);
    let data = {
      'temporaryUploadFiles': files,
      ...post
    };


    const yonApiUrl = this.getUrlToPost(post, parent);
    unirest.post(yonApiUrl)
        .headers({
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Yona-Token': config.YONA.TO.USER_TOKEN
        })
        .send(JSON.stringify(data))
        .end(response => {
          if (this.isBadResponse(response.status)) {
            console.log('오류 발생!! HTTP 응답코드를 확인하세요! ', yonApiUrl, response.status, response.statusMessage, data);
          }
          console.log('response: ', response.data);
          this.okCount++;
          if (cb) {
            return cb(response);
          }
        });

  }

  importData(payload, apiUrl, cb) {
    unirest.post(apiUrl)
        .headers({
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Yona-Token': config.YONA.TO.USER_TOKEN
        })
        .send(JSON.stringify(payload))
        .end(response => {
          if (this.isBadResponse(response.status)) {
            console.log('오류 발생!! HTTP 응답코드를 확인하세요! ', apiUrl, response.status, response.statusMessage);
          }
          console.error('response: ', response.body);
          if (cb) {
            return cb(response);
          }
        });
  }

  collectAttachmentFileIds(target) {
    let files = [];
    if (target.attachments) {
      target.attachments.forEach(file => {
        files.push(file.uploadedFile);
      });
    }

    return files;
  }

  getUrlToPost(item, parent) {
    switch (item.type) {
      case 'ISSUE_POST':
        return config.YONA.TO.SERVER
            + path.join(
                config.YONA.TO.ROOT_CONTEXT,
                '/-_-api/v1/owners/',
                config.YONA.TO.OWNER_NAME,
                '/projects/',
                config.YONA.TO.PROJECT_NAME,
                '/issues');
      case 'ISSUE_COMMENT':
        return config.YONA.TO.SERVER
            + path.join(
                config.YONA.TO.ROOT_CONTEXT,
                '/-_-api/v1/owners/',
                config.YONA.TO.OWNER_NAME,
                '/projects/',
                config.YONA.TO.PROJECT_NAME,
                '/issues',
                parent.number.toString(),
                '/comments');
        break;
      case 'BOARD_POST':
        return config.YONA.TO.SERVER
            + path.join(
                config.YONA.TO.ROOT_CONTEXT,
                '/-_-api/v1/owners/',
                config.YONA.TO.OWNER_NAME,
                '/projects/',
                config.YONA.TO.PROJECT_NAME,
                '/posts');
      case 'NONISSUE_COMMENT':
        return config.YONA.TO.SERVER
            + path.join(
                config.YONA.TO.ROOT_CONTEXT,
                '/-_-api/v1/owners/',
                config.YONA.TO.OWNER_NAME,
                '/projects/',
                config.YONA.TO.PROJECT_NAME,
                '/posts',
                parent.number.toString(),
                '/comments');
      default:
        throw Error("Unknown item: ", item);
        return undefined;
        break;
    }
  }

  getOkCount() {
    return this.okCount;
  }

  pushFiles(post, parent, cb) {
    let uploaded = 0;
    if (!post.attachments || post.attachments.length === 0) {
      this.pushPost(post, parent, cb);
      return;
    }

    const attachmentBaseDir = path.join(config.EXPORT_BASE_DIR,
        config.YONA.FROM.OWNER_NAME,
        config.YONA.FROM.PROJECT_NAME,
        config.ATTACHMENTS_DIR);

    post.attachments.forEach(attachment => {
      // TODO Check this path is correct
      const filePath = path.join(__dirname, '..', attachmentBaseDir, attachment.id.toString(), attachment.name);
      if(!fse.existsSync(filePath)){
        console.error("File not found! - ", __dirname, filePath);
      }
      unirest.post(config.YONA.TO.SERVER + '/files')
          .headers({
            'Content-Type': 'multipart/form-data',
            'Yona-Token': config.YONA.TO.USER_TOKEN
          })
          .field('aUthorLoginId', post.author.loginId)
          .field('authorEmail', post.author.email)
          .attach('filePath', filePath) // Attachment
          .end(response => {
            if (this.isBadResponse(response.status)) {
              console.log('오류 발생!! HTTP 응답코드를 확인하세요! ', response.status, response.statusMessage);
              return;
            }

            attachment.uploadedFile = response.headers.location.split('/')[2];   // eg. location: /files/71
            uploaded++;
            if (uploaded === post.attachments.length) {
              this.pushPost(post, parent, cb);
            }
          });
    });
  }

  isBadResponse(statusCode) {
    return [200, 201].indexOf(statusCode) === -1;
  }
}
