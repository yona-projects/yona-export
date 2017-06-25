import matter from 'gray-matter';
import { download } from './download';

const downloadAttachments = function (attachments = []) {
  attachments.forEach(attachment => download(attachment));
};

export const createHeader = (post) => {
  let header = { ...post };
  if (post.createdAt) {
    header.createdAt = new Date(post.createdAt);
  }
  if (post.comments) {
    header.comments = stripKeys(post.comments, ['type']);
    post.comments.forEach(comment => {
      if (comment.attachments) {
        downloadAttachments(comment.attachments);
      }
    });
  }
  if (post.attachments) {
    header.attachments = stripKeysFromAttachment(post.attachments);
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
