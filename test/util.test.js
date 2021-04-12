/* eslint no-undef: "off" */
import { getTitle, getDefaultFileName, lpadZero, replaceAttchementFileId } from '../app/utils.js';
import json from './resource/yona-projects/yona-help.js';
import sample from './resource/sample.js';

const attachments = [
  {
    "id": 1240,
    "name": "419347042392.png",
    "hash": "b0eb7a8e72cd353a59fcf2baaacf37ae2b402912",
    "containerType": "BOARD_POST",
    "mimeType": "image/png",
    "size": 43111,
    "containerId": "12419",
    uploadedFile: "1234"
  },
  {
    "id": 21935,
    "name": "rescuetime.png",
    "hash": "6d39e8a3bc153b510b3356b2ba4972a2eaff0d76",
    "containerType": "BOARD_POST",
    "mimeType": "image/png",
    "size": 98866,
    "containerId": "12419"
  },
  {
    "id": 21936,
    "name": "rescuetime_report.png",
    "hash": "2fb19d2c78ac768b88310bb6bcae5294d0be1a2e",
    "containerType": "BOARD_POST",
    "mimeType": "image/png",
    "size": 103793,
    "containerId": "12419"
  }
];

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

  it('replaceAttchementFileId - image', () => {
    // Given
    const content = '스트 스타일 개선\r\n![419347042392.png](/files/1240)\r\n- 데이터와 실행';

    // When
    let replaced = replaceAttchementFileId(content, attachments);
    console.log('when', replaced);

    // Then
    expect(replaced).toBe('스트 스타일 개선\r\n![419347042392.png](/files/1234)\r\n- 데이터와 실행');

  });

  it('replaceAttchementFileId - non image', () => {
    // Given
    const content = '스트 스타일 개선\r\n[419347042392.png](/files/1240)\r\n- 데이터와 실행';

    // When
    let replaced = replaceAttchementFileId(content, attachments);

    // Then
    expect(replaced).toBe('스트 스타일 개선\r\n[419347042392.png](/files/1234)\r\n- 데이터와 실행');

  });

  it('replaceAttchementFileId - non image', () => {
    // Given
    const content = ' [419347042392.png](/files/1240)\r\n- 데이터와 실행';

    // When
    let replaced = replaceAttchementFileId(content, attachments);

    // Then
    expect(replaced).toBe(' [419347042392.png](/files/1234)\r\n- 데이터와 실행');

  });
});

