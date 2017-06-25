/* eslint no-undef: "off" */
import crypto from 'crypto';
import fse from 'fs-extra';
import { download } from '../app/download';
import json from './resource/exports';
import path from 'path';

describe('download', () => {
  it('public file', done => {
    // Given
    let attachment = json.issues[0].attachments[0];

    //When
    // download(attachment, response => {
    //   // Then
    //   console.log('res:', response);
    //   let localExpectedFileh = path.join(__dirname, '../exported/files/21957/bensound-cute.mp3');
    //   expect(getSha1(localExpectedFileh)).toBe('0df209c0a171931c4612ac8edefc0d681498148e');
    //   done();
    // });
    done();
  });
});

function getSha1(filename){
  let hash = crypto.createHash('sha256');
  if(!fse.existsSync(filename)){
    return '0';
  }
  const contents = fse.readFileSync(filename);
  hash.update(contents);
  return hash.digest('hex');
}
