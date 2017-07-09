import unirest from 'unirest';
import path from 'path';
import fse from 'fs-extra';
import config from '../config';
import { replaceAttchementFileId } from './utils';
import { getItemType, getUrlToPost } from './exportHelper';

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


    const yonApiUrl = getUrlToPost(post, parent, config);
    const itemType = getItemType(post, parent);
    unirest.post(yonApiUrl)
        .headers({
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Yona-Token': config.YONA.TO.USER_TOKEN
        })
        .send(JSON.stringify({ [itemType]: [data] }))
        .end(response => {
          if (isBadResponse(response.status)) {
            console.log('오류 발생!! HTTP 응답코드를 확인하세요! ', yonApiUrl, response.status, response.statusMessage, JSON.stringify(data));
          }
          console.log(response.body);
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
          if (isBadResponse(response.status)) {
            console.log('오류 발생!! HTTP 응답코드를 확인하세요! ', apiUrl, response.status, response.statusMessage);
          }
          console.log(response.body);
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

    console.log('temporary upload files ', files);
    return files;
  }

  pushFiles(post, parent, cb) {
    let uploaded = 0;
    if (!post.attachments || post.attachments.length === 0) {
      this.pushPost(post, parent, cb);
      return;
    }

    let attachments = [...post.attachments];
    let updatedAttachments = [];

    console.log(post.id, ' to upload file count ', attachments.length);
    uploadFiles(attachments, cb);

    function uploadFiles(attachments, cb) {
      if(attachments && attachments.length > 0){
        const file = attachments.pop();
        return upload(file, post.author.loginId, post.author.email, attachment => {
          console.log(++uploaded, 'is done');
          updatedAttachments.push(attachment);
          uploadFiles(attachments, cb);
        })
      }
      post.attachments = updatedAttachments;
      const yonaExport = new YonaExport();
      yonaExport.pushPost(post, parent, cb);
    }

    function upload(attachment, authorLoginId, authorEmail, cb){
      const attachmentBaseDir = path.join(config.EXPORT_BASE_DIR,
          config.YONA.FROM.OWNER_NAME,
          config.YONA.FROM.PROJECT_NAME,
          config.ATTACHMENTS_DIR);

      console.log('to upload file: ', attachment);
      // TODO Check this path is correct
      const filePath = path.join(attachmentBaseDir, attachment.id.toString(), attachment.name);
      if (!fse.existsSync(filePath)) {
        console.error("File not found! - ", __dirname, filePath);
      }

      unirest.post(config.YONA.TO.SERVER + '/files')
          .headers({
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
            'Yona-Token': config.YONA.TO.USER_TOKEN
          })
          .field('authorLoginId', authorLoginId)
          .field('authorEmail', authorEmail)
          .attach('filePath', filePath) // Attachment
          .end(response => {
            if (isBadResponse(response.status)) {
              console.log('Attachment 오류 발생!! HTTP 응답코드를 확인하세요! ',
                  response.status, response.statusMessage, filePath);
            } else {
              attachment.uploadedFile = response.headers.location.split('/')[2];   // eg. location: /files/71
            }
            console.log(response.body);
            cb(attachment);
          });
    }
  }
}

function isBadResponse(statusCode) {
  return [200, 201].indexOf(statusCode) === -1;
}
