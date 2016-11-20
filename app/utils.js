import moment from 'moment';

export const getTitle = title => {
  let specialCharsRemoved = title.replace(/[|&;\\\/:.'?*$%@"<>+,()]/g, '').trim();  // cleaning and trimming
  return specialCharsRemoved.split(' ').join('-');
};

export const getDefaultFileName = post => {
  const title = getTitle(post.title);
  const id = lpadZero(post.id, 5);
  const date = getDateString(post.created_at);
  const extName = '.md';

  return (`${id}-${date}-${title}${extName}`);
};

export const lpadZero = (no, n) =>
    (no + '').length < n ? lpadZero('0' + no, n) : no;

export const getDateString = (timestamp) => {
  moment.locale('ko-KR');
  let date = moment(new Date(timestamp));
  return date.format('YYYYMMDD');
};
