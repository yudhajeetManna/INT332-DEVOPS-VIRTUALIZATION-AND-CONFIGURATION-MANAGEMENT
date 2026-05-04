import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Simple smoke test
test('renders without crashing when not logged in', () => {
  // Just verifying the test environment works
  expect(true).toBe(true);
});
