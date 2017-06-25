import moment from 'moment';

export const getTitle = title => {
  let specialCharsRemoved = title.replace(/[|&;\\\/:.'?*$%@"<>+,()]/g, '').trim();  // cleaning and trimming
  return specialCharsRemoved.split(' ').join('-');
};

export const getDefaultFileName = post => {
  const title = getTitle(post.title);
  const number = lpadZero(post.number, 5) || lpadZero(post.id, 5) || '?????';
  const date = getDateString(post.createdAt || post.due_on || '????');
  const extName = '.md';

  return (`${number}-${date}-${title}${extName}`);
};

export const lpadZero = (no, n) =>
    (no + '').length < n ? lpadZero('0' + no, n) : no;

export const getDateString = (timestamp) => {
  moment.locale('ko-KR');
  let date = moment(new Date(timestamp));
  return date.format('YYYYMMDD');
};
