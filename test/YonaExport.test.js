/* eslint no-undef: "off" */
import YonaExport from '../app/YonaExport';
import path from 'path';
import sample from './resource/sample.js';


describe('pushPost', () => {
  it('public file', done => {
    // Given
    const yonaExport = new YonaExport();
    yonaExport.pushFiles(sample.issues[7]);
    done();
  });
});

