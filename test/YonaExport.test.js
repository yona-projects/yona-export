/* eslint no-undef: "off" */
import YonaExport from '../app/YonaExport.js';
import path from 'path';
import fse from 'fs-extra';
import sample from './resource/yona-projects/yona-help.js';


let yonaSample;

describe('pushPost', () => {

  it('new issue', done => {
    // Given
    const yonaExport = new YonaExport();
    yonaExport.pushFiles(sample.issues[2], null, done);
  });

  it('new comment', done => {
    // Given
    const yonaExport = new YonaExport();
    const comment = sample.issues[2].comments[0];
    const parent = sample.issues[2];

    // When
    yonaExport.pushFiles(comment, parent, done);
  });

  it('new comment - with attachments', done => {
    // Given
    const yonaExport = new YonaExport();
    const comment = sample.issues[2].comments[0];
    const parent = sample.issues[2];

    // When
    yonaExport.pushFiles(comment, parent, done);
  });

});

