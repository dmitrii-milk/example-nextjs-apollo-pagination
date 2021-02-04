import React from 'react';
import { render, screen } from '@testing-library/react';
import ImageRow from './ImageRow';

test('renders title', async () => {
  render(
    <table>
      <tbody>
        <ImageRow
          photo={{
            id: 1,
            title: 'test title',
            url: '',
            thumbnailUrl: '',
          }}
          onSelect={() => {}}
        />
      </tbody>
    </table>
  );

  const items = await screen.findAllByText(/^test title/);
  expect(items).toHaveLength(1);
});
