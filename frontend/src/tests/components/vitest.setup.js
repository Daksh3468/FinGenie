import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Silence console.error for React prop warnings in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning:')) return;
    originalError(...args);
  };
});
afterAll(() => { console.error = originalError; });

// DOM APIs missing in jsdom
Element.prototype.scrollIntoView = vi.fn();
window.scrollTo = vi.fn();

// Stable URL mocks for download tests
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();
