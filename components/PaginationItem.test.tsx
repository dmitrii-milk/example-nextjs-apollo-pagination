import React from 'react';
import { render, screen } from '@testing-library/react';
import PaginationItem from './PaginationItem';

test('renders page', async () => {
  render(<PaginationItem page={1} active onSelect={() => {}} />);

  const items = await screen.findAllByText(/^1$/);
  expect(items).toHaveLength(1);
});
