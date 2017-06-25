import { createHeader } from '../app/header';
import json from './resource/exports';

describe('header', () => {
  it('createHeader', () => {
    // Given // When
    const header = createHeader(json.issues[0]);

    // Then
    expect(header).toMatchSnapshot(); // ITEM_POST
  });
});
