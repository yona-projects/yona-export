import matter from 'gray-matter';
import Humanize from 'humanize-plus';
import { download } from './download';

let totalWillDownload = 0, totalDidDownload = 0;
let queuedFiles = {};
let showInQueuedFiles = function (queuedFiles) {
  let keys = Object.keys(queuedFiles);
  if (keys && keys.length > 0) {
    console.log(`in queued files: `);
    console.dir(queuedFiles);
  }
};

const downloadAttachments = function (attachments = [], cb) {
  if (attachments.length > 0) {
    const file = attachments.pop();
    totalWillDownload++;
    console.log(`${totalDidDownload} / ${totalWillDownload} is done. ${file.name} ${Humanize.filesize(file.size)} will be downloaded at ${file.id}.`);
    queuedFiles[file.id] = { name: file.name, size: Humanize.filesize(file.size) };

    return download(file, response => {
      totalDidDownload++;
      console.log(`............ ${file.name}: ${Humanize.filesize(file.size)} downloaded.`);
      delete queuedFiles[file.id];
      showInQueuedFiles(queuedFiles);
      downloadAttachments(attachments, cb);
    })
  }
  if(cb) return cb();
};

export const createHeader = (post, cb) => {
  let header = { ...post };
  if (post.createdAt) {
    header.createdAt = post.createdAt;
  }

  console.log(`\n${post.number}. ${post.title}\n`);

  if (post.comments && post.comments.length > 0) {
    console.log('comments: ' + post.comments.length);

    header.comments = stripKeys(post.comments, ['type']);
    downloadCommentsAttachments([...header.comments], () => {
      downladPostAttachments(post, () => {
        header.attachments = post.attachments || [];
        delete header.body;
        const matterContent = matter.stringify(post.body || '', header, { delims: '```' }).trim();
        if(cb) return cb(matterContent);
      });
    });
  } else {
    downladPostAttachments(post, () => {
      header.attachments = post.attachments || [];
      delete header.body;
      const matterContent = matter.stringify(post.body || '', header, { delims: '```' }).trim();
      if(cb) return cb(matterContent);
    });
  }

  function downloadCommentsAttachments(comments, cb){
    if(comments && comments.length > 0){
      let comment = comments.pop();
      if (comment.attachments && comment.attachments.length > 0) {
        console.log(`${comment.attachments.length} files will be download.`);
        return downloadAttachments(comment.attachments, () => {
          downloadCommentsAttachments(comments, cb);
        });
      } else {
        return downloadCommentsAttachments(comments, cb);
      }
    }

    if(cb) return cb();
  }

  function downladPostAttachments(post, cb) {
    if (post.attachments && post.attachments.length > 0) {
      console.log(`${post.attachments.length} files will be download.`);
      let attachments = [...post.attachments];
      return downloadAttachments(attachments, cb);
    }
    if(cb) return cb();
  }
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
