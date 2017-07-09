import moment from 'moment';

export const getTitle = title => {
  let specialCharsRemoved = title.replace(/[|&;\\\/:.'?*$%@"<>+,()]/g, '').trim();  // cleaning and trimming
  return specialCharsRemoved.split(' ').join('-');
};

export const getDefaultFileName = post => {
  const title = getTitle(post.title);
  const number = lpadZero(post.number, 5) || lpadZero(post.id, 5) || '?????';
  const date = getDateString(post.createdAt || post.dueDate);
  const extName = '.md';

  return (`${number}-${date}-${title}${extName}`);
};

export const lpadZero = (no, n) =>
    (no + '').length < n ? lpadZero('0' + no, n) : no;

export const getDateString = (timestamp) => {
  if(!timestamp) {
    return 'NO__DATE';
  }
  moment.locale('ko-KR');
  let date = moment(timestamp, 'YYYY-MM-DD a hh:mm:ss z');
  return date.format('YYYYMMDD');
};

export const replaceAttchementFileId = (content, filelist) => {
  if(!filelist || filelist.length === 0) {
    return content;
  }
  return content.replace(/\[(.*?)]\(.*?\)/g, (a, filename) => {
    let found = '';
    if (filelist) {
      filelist.some(file => {
        if (file.name === filename) {
          found = file;
          return true;
        }
      });
    }
    return `[${found.name}](/files/${found.uploadedFile})`;
  });
};
