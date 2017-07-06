/* eslint no-undef: "off" */
import YonaExport from '../app/YonaExport';
import path from 'path';
import sample from './resource/yona-projects/yona-help.js';


describe('pushPost', () => {
  it('new issue', done => {
    // Given
    const yonaExport = new YonaExport();
    yonaExport.pushFiles(sample.issues[1], null, done);
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

describe('getUrlToPost', () => {
  it('issue post url', () => {
    // Given
    const yonaExport = new YonaExport();

    // When
    const url = yonaExport.getUrlToPost(sample.issues[2]);

    // Then
    expect(url).toBe('http://127.0.0.1:9000/-_-api/v1/owners/abc/projects/d/issues');
  });

  it('issue comment post url', () => {
    // Given
    const yonaExport = new YonaExport();
    const comment = sample.issues[2].comments[0];
    const parent = sample.issues[2];

    // When
    const url = yonaExport.getUrlToPost(comment, parent);

    // Then
    expect(url).toBe('http://127.0.0.1:9000/-_-api/v1/owners/abc/projects/d/issues/6/comments');
  });

  it('posting post url', () => {
    // Given
    const yonaExport = new YonaExport();

    // When
    const url = yonaExport.getUrlToPost(sample.posts[0]);

    // Then
    expect(url).toBe('http://127.0.0.1:9000/-_-api/v1/owners/abc/projects/d/posts');
  });

  it('posting comment post url', () => {
    // Given
    const yonaExport = new YonaExport();
    const comment = sample.posts[0].comments[0];
    const parent = sample.posts[0];

    // When
    const url = yonaExport.getUrlToPost(comment, parent);

    // Then
    expect(url).toBe('http://127.0.0.1:9000/-_-api/v1/owners/abc/projects/d/posts/1/comments');
  });
});

