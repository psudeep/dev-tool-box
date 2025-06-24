import '@testing-library/jest-dom';

// Mock electron APIs
window.electronAPI = {
  getAppVersion: jest.fn(() => Promise.resolve('1.0.0')),
  showSaveDialog: jest.fn(() => Promise.resolve({ canceled: false, filePath: 'test.json' })),
  onNavigateTo: jest.fn(),
  onMenuNew: jest.fn(),
  onMenuOpen: jest.fn(),
  removeAllListeners: jest.fn(),
};

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
    readText: jest.fn(() => Promise.resolve('test')),
  },
});

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-url');
global.URL.revokeObjectURL = jest.fn();

// Suppress console errors in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
}); 