import unirest from 'unirest';
import fse from 'fs-extra';
import path from 'path';
import config from '../config';
import { getDefaultFileName } from './utils';
import { createHeader } from './header';

let yonaProjectExportUrl = config.YONA.SERVER + '/-_-api/v1'
    + '/owners/' + config.YONA.OWNER_NAME
    + '/projects/' + config.YONA.PROJECT_NAME
    + '/exports';

unirest.get(yonaProjectExportUrl)
    .headers({
      'Accept': 'application/json',
      'Yona-Token': config.YONA.USER_TOKEN
    })
    .end(response => {
      if (isBadResponse(response.status)) {
        console.log('오류 발생!! HTTP 응답코드를 확인하세요! ', response.status, response.statusMessage);
        process.exit(1);
      }
      const exportDir = path.join(
          config.EXPORT_BASE_DIR,
          config.YONA.OWNER_NAME,
          config.YONA.PROJECT_NAME,
      );
      writeItems(response.body.issues, path.join(exportDir, '/issues/'));
      writeItems(response.body.posts, path.join(exportDir, '/posts/'));
    });

function isBadResponse(statusCode) {
  return [200, 201].indexOf(statusCode) === -1;
}

function writeItems(items, exportDir) {
  items.forEach(item => {
    fse.outputFile(`${exportDir}${getDefaultFileName(item)}`, createHeader(item), err => {
      if (err) console.error(err);
    })
  });
}
