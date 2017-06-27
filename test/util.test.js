/* eslint no-undef: "off" */
import { getTitle, getDefaultFileName, lpadZero, replaceAttchementFileId } from '../app/utils';
import json from './resource/exports';
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
    expect(filename).toBe('00001-20161119-새로운-이슈.md');
  });

  it('replaceAttchementFileId', () => {
    // Given
    const content = '만들었습니다. ![1333336021180.png](/files/1160) 생성하면 이제';

    // When
    let replaced = replaceAttchementFileId(content, sample.issues[7].attachments);

    // Then
    expect(replaced).toBe('만들었습니다. ![1333336021180.png](/files/203657) 생성하면 이제');

  });
});

