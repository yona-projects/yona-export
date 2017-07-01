/* eslint no-undef: "off" */
import YonaExport from '../app/YonaExport';
import path from 'path';
import sample from './resource/sample.js';


describe('pushPost', () => {
  it('new issue', done => {
    // Given
    const yonaExport = new YonaExport();
    // yonaExport.pushFiles(sample.issues[7]);
    done();
  });

  it('new comment', done => {
    // Given
    const yonaExport = new YonaExport();
    // yonaExport.pushFiles(sample.issues[5].comments[0]);
    done();
  });

});

describe('getUrlToPost', () => {
  it('issue post url', () => {
    // Given
    const yonaExport = new YonaExport();

    // When
    const url = yonaExport.getUrlToPost(sample.issues[5]);

    // Then
    expect(url).toBe('http:/127.0.0.1:9000/-_-api/v1/owners/abc/projects/d/issues');
  });

  it('issue comment post url', () => {
    // Given
    const yonaExport = new YonaExport();

    // When
    const url = yonaExport.getUrlToPost(sample.issues[5].comments[0], sample.issues[5].number);

    // Then
    expect(url).toBe('http:/127.0.0.1:9000/-_-api/v1/owners/abc/projects/d/issues/6/comments');
  });

  it('posting post url', () => {
    // Given
    const yonaExport = new YonaExport();

    // When
    const url = yonaExport.getUrlToPost(sample.posts[0]);

    // Then
    expect(url).toBe('http:/127.0.0.1:9000/-_-api/v1/owners/abc/projects/d/posts');
  });

  it('posting comment post url', () => {
    // Given
    const yonaExport = new YonaExport();

    // When
    const url = yonaExport.getUrlToPost(sample.posts[0].comments[0], sample.posts[0].number);

    // Then
    expect(url).toBe('http:/127.0.0.1:9000/-_-api/v1/owners/abc/projects/d/posts/1/comments');
  });
});

