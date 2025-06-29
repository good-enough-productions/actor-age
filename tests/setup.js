// Mock Chrome APIs for testing
global.chrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn()
    },
    sendMessage: jest.fn()
  },
  tabs: {
    onUpdated: {
      addListener: jest.fn()
    },
    sendMessage: jest.fn(),
    query: jest.fn()
  }
};

// Mock fetch for API tests
global.fetch = jest.fn();