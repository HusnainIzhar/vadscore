// Test setup for Jest
global.AudioContext = class MockAudioContext {
  createAnalyser() {
    return {
      fftSize: 1024,
      smoothingTimeConstant: 0.1,
      connect: jest.fn(),
      disconnect: jest.fn(),
    };
  }
  
  createScriptProcessor() {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
      onaudioprocess: null,
    };
  }
  
  createMediaStreamSource() {
    return {
      connect: jest.fn(),
    };
  }
  
  close() {
    return Promise.resolve();
  }
};

global.navigator = {
  ...global.navigator,
  mediaDevices: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }],
    }),
  },
};
