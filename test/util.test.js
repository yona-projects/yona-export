/* eslint no-undef: "off" */
import { getTitle, getDefaultFileName, lpadZero } from '../app/utils';
import json from './resource/exports';

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

});

