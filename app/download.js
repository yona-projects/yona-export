import unirest from 'unirest';
import fse from 'fs-extra';
import path from 'path';
import config from '../config';

export const download = (attachment, cb) => {
  let yonaFileUrl = config.YONA.SERVER + '/files/' + attachment.id;

  fse.ensureDirSync(path.join(config.EXPORT_BASE_DIR, config.ATTACHMENTS_DIR, attachment.id +'', '/'));
  unirest.get(yonaFileUrl)
      .headers({
        'Accept': '*/*',
        'Yona-Token': config.YONA.USER_TOKEN
      })
      .end(response => {
        if (response.status !== 200) console.log(response.status);
        if(cb && typeof cb === 'function') {
          cb();
        }
      }).pipe(fse.createWriteStream('./exported/files/' + attachment.id + '/' + attachment.name));
};

