/* eslint no-undef: "off" */
import { getTitle, getDefaultFileName, lpadZero, replaceAttchementFileId } from '../app/utils';
import json from './resource/yona-projects/yona-help';
import sample from './resource/sample';

describe('utils', () => {
  it('getTitle', () => {
    // Given
    let givenTitle = "세렌게티 초원에는 물소들만 날뛰고... (응??)";
    let expected = "세렌게티-초원에는-물소들만-날뛰고-응";

    //When
    let title = getTitle(givenTitle);

    // Then
    expect(title).toBe(expected);
  });

  it('lpadZero', () => {
    // Given
    let numStr = 12;

    // When
    let parsed = lpadZero(numStr, 5);

    // Then
    expect(parsed).toBe('00012');
  });

  it('getDefaultFileName', () => {
    // Given

    // When
    let filename = getDefaultFileName(json.issues[0]);

    // Then
    expect(filename).toBe('00001-20160223-커밋-두-개를-하나로-합치기.md');
  });

  it('replaceAttchementFileId', () => {
    // Given
    const content = '스트 스타일 개선\r\n![419347042392.png](/files/1240)\r\n- 데이터와 실행';

    // When
    let replaced = replaceAttchementFileId(content, json.issues[1].attachments);

    // Then
    expect(replaced).toBe('스트 스타일 개선\r\n![419347042392.png](/files/1234)\r\n- 데이터와 실행');

  });
});

