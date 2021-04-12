import unirest from 'unirest';
import fse from 'fs-extra';
import path from 'path';
import config from '../config.js';

export const download = (attachment, cb) => {
  let yonaFileUrl = config.YONA.FROM.SERVER + '/files/' + attachment.id;

  const attachmentBaseDir = path.join(config.EXPORT_BASE_DIR,
      config.YONA.FROM.OWNER_NAME,
      config.YONA.FROM.PROJECT_NAME,
      config.ATTACHMENTS_DIR);

  fse.ensureDirSync(path.join(attachmentBaseDir, attachment.id.toString()));
  try {
    unirest.get(yonaFileUrl)
        .headers({
          'Accept': '*/*',
          'Yona-Token': config.YONA.FROM.USER_TOKEN
        })
        .end(response => {
          if (response.status !== 200) {
            console.log(`${yonaFileUrl} : ${response.status} ${response.body} Error`);
            if(response.status === undefined) {
              console.log('try again! - ', yonaFileUrl);
              return download(attachment, cb);
            }
          }
          if(cb && typeof cb === 'function') {
            cb(response);
          }
        }).pipe(fse.createWriteStream(path.join(attachmentBaseDir, attachment.id.toString(), attachment.name)));
  } catch (e) {
    console.error(e);
  }
};

