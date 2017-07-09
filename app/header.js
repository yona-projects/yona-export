import matter from 'gray-matter';
import Humanize from 'humanize-plus';
import { download } from './download';

let totalWillDownload = 0, totalDidDownload = 0;
let queuedFiles = {};
const downloadAttachments = function (attachments = []) {
  if (attachments.length > 0) {
    const file = attachments.pop();
    totalWillDownload++;
    console.log(`${totalDidDownload} / ${totalWillDownload} is done. ${file.name} ${Humanize.filesize(file.size)} will be download at ${file.id}.`);
    queuedFiles[file.id] = { name: file.name, size: Humanize.filesize(file.size) };
    download(file, () => {
      totalDidDownload++;
      console.log(`............ ${file.name}: ${Humanize.filesize(file.size)} downloaded.`);
      delete queuedFiles[file.id];
      console.log(`in queued files: `);
      console.dir(queuedFiles);
      downloadAttachments(attachments);
    })
  }
};

export const createHeader = (post) => {
  let header = { ...post };
  if (post.createdAt) {
    header.createdAt = post.createdAt;
  }
  if (post.comments) {
    header.comments = stripKeys(post.comments, ['type']);
    post.comments.forEach(comment => {
      if (comment.attachments) {
        console.log(`${comment.attachments.length} files will be download.`);
        downloadAttachments(comment.attachments);
      }
    });
  }
  if (post.attachments) {
    header.attachments = stripKeysFromAttachment(post.attachments);
    console.log(`${post.attachments.length} files will be download.`);
    downloadAttachments(header.attachments);
  }

  delete header.body;
  return matter.stringify(post.body || '', header, { delims: '```' }).trim();
};

export default {
  createHeader
};

function stripKeysFromAttachment(attachments) {
  return stripKeys(attachments, ['containerId', 'containerType']);
}

function stripKeys(arr = [], keys = []) {
  arr.forEach(item => {
    if (item.attachments) stripKeysFromAttachment(item.attachments);
    keys.forEach(key => {
      delete item[key];
    })
  });
  return arr;
}
