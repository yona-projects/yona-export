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
      throw Error('Unknown item: ', item);
  }
}

export function getItemType(item, parent) {
  const itemType = item.type || parent.type;
  switch (itemType) {
    case 'ISSUE_POST':
      return 'issues';
    case 'BOARD_POST':
      return 'posts';
    default:
      throw Error('Unknown item: ', item);
  }
}
