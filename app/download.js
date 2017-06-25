import unirest from 'unirest';
import fse from 'fs-extra';
import path from 'path';
import config from '../config';

export const download = (attachment, cb) => {
  let yonaFileUrl = config.YONA.SERVER + '/files/' + attachment.id;

  const attachmentBaseDir = path.join(config.EXPORT_BASE_DIR,
      config.YONA.OWNER_NAME,
      config.YONA.PROJECT_NAME,
      config.ATTACHMENTS_DIR);

  fse.ensureDirSync(path.join(attachmentBaseDir, attachment.id.toString()));
  unirest.get(yonaFileUrl)
      .headers({
        'Accept': '*/*',
        'Yona-Token': config.YONA.USER_TOKEN
      })
      .end(response => {
        if (response.status !== 200) {
          console.log(`${yonaFileUrl} : ${response.status} Error`);
        }
        if(cb && typeof cb === 'function') {
          cb(response);
        }
      }).pipe(fse.createWriteStream(path.join(attachmentBaseDir, attachment.id.toString(), attachment.name)));
};

