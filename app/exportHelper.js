/* eslint-disable indent */
import path from 'path';

export function getUrlToPost(item, parent, config) {
  if (parent && parent.type) {
    switch (parent.type) {
      case 'ISSUE_POST':
        return config.YONA.TO.SERVER
            + path.join(
                config.YONA.TO.ROOT_CONTEXT,
                '/-_-api/v1/owners/',
                config.YONA.TO.OWNER_NAME,
                '/projects/',
                config.YONA.TO.PROJECT_NAME,
                '/issues',
                parent.number.toString(),
                '/comments');
      case 'BOARD_POST':
        return config.YONA.TO.SERVER
            + path.join(
                config.YONA.TO.ROOT_CONTEXT,
                '/-_-api/v1/owners/',
                config.YONA.TO.OWNER_NAME,
                '/projects/',
                config.YONA.TO.PROJECT_NAME,
                '/posts',
                parent.number.toString(),
                '/comments');
      default:
        console.log('Unknown item error: ', item);
        throw Error('Unknown item: ', item);
    }
  }

  switch (item.type) {
    case 'ISSUE_POST':
      return config.YONA.TO.SERVER
          + path.join(
              config.YONA.TO.ROOT_CONTEXT,
              '/-_-api/v1/owners/',
              config.YONA.TO.OWNER_NAME,
              '/projects/',
              config.YONA.TO.PROJECT_NAME,
              '/issues');
    case 'BOARD_POST':
      return config.YONA.TO.SERVER
          + path.join(
              config.YONA.TO.ROOT_CONTEXT,
              '/-_-api/v1/owners/',
              config.YONA.TO.OWNER_NAME,
              '/projects/',
              config.YONA.TO.PROJECT_NAME,
              '/posts');
    default:
      console.log('Unknown item error: ', item);
      throw Error('Unknown item: ', item);
  }
}

export function getItemType(item, parent) {
  const itemType = item.type || parent.type;
  switch (itemType) {
    case 'ISSUE_POST':
    case 'ISSUE_COMMENT':
      return 'issues';
    case 'NONISSUE_COMMENT':
    case 'BOARD_POST':
      return 'posts';
    default:
      console.log('Unknown item error: ', item);
      throw Error('Unknown item: ', item);
  }
}
