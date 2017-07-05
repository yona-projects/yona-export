import unirest from 'unirest';
import fse from 'fs-extra';
import path from 'path';
import config from '../config';
import { getDefaultFileName } from './utils';
import { createHeader } from './header';
import YonaExport from './YonaExport';

const yonaProjectExportUrl = config.YONA.FROM.SERVER + '/-_-api/v1'
    + '/owners/' + config.YONA.FROM.OWNER_NAME
    + '/projects/' + config.YONA.FROM.PROJECT_NAME
    + '/exports';

const main = () => {
  exportFrom();
};

main();

function exportTo() {
  const from = config.YONA.FROM;
  const to = config.YONA.TO;
  const exportedFile = path.join('exported/',
      from.OWNER_NAME,
      from.PROJECT_NAME + '.json');
  console.log(exportedFile);
  const exportedData = JSON.parse(fse.readFileSync(exportedFile, 'utf8'));

  const project = parseProject(exportedData, to);
  const users = parseRequiredUsers(project);

  const yonaExport = new YonaExport();
  yonaExport.pushToCreateUsers(users, () =>
      yonaExport.pushProject(project, () =>
          yonaExport.pushMilestones({milestones: exportedData.milestones})
      ));

}

function parseRequiredUsers(project) {
  return {users: [...project.members, ...project.authors, ...project.assignees] }

}

function parseProject(source, to) {
  return {
    owner: to.OWNER_NAME,
    projectName: to.PROJECT_NAME,
    projectDescription: source.projectDescription,
    projectCreatedDate: source.projectCreatedDate,
    projectVcs: source.projectVcs,
    projectScope: source.projectScope,
    assignees: source.assignees,
    authors: source.authors,
    members: source.members,
    labels: source.labels
  }
}

function exportFrom() {
  unirest.get(yonaProjectExportUrl)
      .headers({
        'Accept': 'application/json',
        'Yona-Token': config.YONA.FROM.USER_TOKEN
      })
      .end(response => {
        if (isBadResponse(response.status)) {
          console.log('오류 발생!! HTTP 응답코드를 확인하세요! ', yonaProjectExportUrl, response.status, response.statusMessage);
          process.exit(1);
        }
        const exportDir = path.join(
            config.EXPORT_BASE_DIR,
            config.YONA.FROM.OWNER_NAME,
            config.YONA.FROM.PROJECT_NAME,
        );
        writeOriginalJson(response.body, exportDir);
        writeItems(response.body.issues, path.join(exportDir, '/issues/'));
        writeItems(response.body.posts, path.join(exportDir, '/posts/'));
        writeItems(response.body.milestones, path.join(exportDir, '/milestones/'));

        if (!config.EXPORT_ONLY) {
          exportTo();
        }
      });
}



function isBadResponse(statusCode) {
  return [200, 201].indexOf(statusCode) === -1;
}

function writeOriginalJson(item, exportDir){
  fse.outputFile(`${exportDir}.json`, JSON.stringify(item), err => {
    if (err) console.error(err);
  })
}

function writeItems(items, exportDir) {
  items.forEach(item => {
    fse.outputFile(`${exportDir}${getDefaultFileName(item)}`, createHeader(item), err => {
      if (err) console.error(err);
    })
  });
}
