import { createHeader } from '../app/header.js';
import json from './resource/exports.js';

describe('header', () => {
  it('createHeader', () => {
    // Given // When
    const header = createHeader(json.issues[0]);

    // Then
    expect(header).toMatchSnapshot(); // ITEM_POST
  });
});
