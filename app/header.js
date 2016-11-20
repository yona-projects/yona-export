import matter from 'gray-matter';
import { download } from './download';

const downloadAttachments = function (attachments = []) {
  attachments.forEach(attachment => download(attachment));
};

export const createHeader = (post) => {
  let header = {
    id: post.id,
    title: post.title,
    created_at: new Date(post.created_at),
    authorId: post.author,
    authorName: post.authorName,
  };
  if (post.comments) {
    header.comments = stripKeys(post.comments, ['type']);
  }
  if (post.attachments) {
    header.attachments = stripKeysFromAttachment(post.attachments);
    downloadAttachments(header.attachments);
  }

  return matter.stringify(post.body, header, { delims: '```' }).trim();
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
