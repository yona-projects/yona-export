/* eslint no-undef: "off" */
import { assert, expect } from 'chai';
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
    download(attachment, () => {
      // Then
      setTimeout(() => {
        let localExpectedFileh = path.join(__dirname, '../exported/files/21957/bensound-cute.mp3');
        expect(getSha1(localExpectedFileh)).to.equal('0df209c0a171931c4612ac8edefc0d681498148e');
        done();
      }, 100)
    });
  });
});

function getSha1(filename){
  let hash = crypto.createHash('sha1');
  const contents = fse.readFileSync(filename);
  hash.update(contents);
  return hash.digest('hex');
}
