/* eslint no-undef: "off" */
import { getItemType, getUrlToPost } from '../app/exportHelper';
import config from '../config';
import sample from './resource/yona-projects/yona-help.js';


let yonaSample;

describe('getUrlToPost', () => {
  it('issue post url', () => {
    // Given
    // When
    const url = getUrlToPost(sample.issues[2], null, config);

    // Then
    expect(url).toBe('http://127.0.0.1:9000/-_-api/v1/owners/doortts/projects/a/issues');
  });

  it('issue comment post url', () => {
    // Given
    const comment = sample.issues[2].comments[0];
    const parent = sample.issues[2];

    // When
    const url = getUrlToPost(comment, parent, config);

    // Then
    expect(url).toBe('http://127.0.0.1:9000/-_-api/v1/owners/doortts/projects/a/issues/3/comments');
  });

  it('posting post url', () => {
    // Given
    // When
    const url = getUrlToPost(sample.posts[0], null, config);

    // Then
    expect(url).toBe('http://127.0.0.1:9000/-_-api/v1/owners/doortts/projects/a/posts');
  });

  it('posting comment post url', () => {
    // Given
    const comment = sample.posts[3].comments[0];
    const parent = sample.posts[3];

    // When
    const url = getUrlToPost(comment, parent, config);

    // Then
    expect(url).toBe('http://127.0.0.1:9000/-_-api/v1/owners/doortts/projects/a/posts/5/comments');
  });
});

