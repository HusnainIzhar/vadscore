import { VADCore, VADResult } from '../vadCore';

describe('VADCore', () => {
  let vadCore: VADCore;

  beforeEach(() => {
    vadCore = new VADCore();
  });

  test('should initialize with default config', () => {
    expect(vadCore).toBeInstanceOf(VADCore);
  });

  test('should process silent audio frame', () => {
    const silentFrame = new Float32Array(512).fill(0);
    const result = vadCore.processFrame(silentFrame);
    
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1);
    expect(result.isSpeaking).toBe(false);
    expect(result.energy).toBe(0);
  });

  test('should process noisy audio frame', () => {
    const noisyFrame = new Float32Array(512);
    for (let i = 0; i < noisyFrame.length; i++) {
      noisyFrame[i] = (Math.random() - 0.5) * 0.1;
    }
    
    const result = vadCore.processFrame(noisyFrame);
    
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1);
    expect(result.energy).toBeGreaterThan(0);
  });

  test('should detect speech-like signal', () => {
    const speechFrame = new Float32Array(512);
    for (let i = 0; i < speechFrame.length; i++) {
      speechFrame[i] = Math.sin(2 * Math.PI * 1000 * i / 16000) * 0.3 * (Math.random() * 0.5 + 0.5);
    }
    
    const result = vadCore.processFrame(speechFrame);
    
    expect(result.score).toBeGreaterThan(0.1);
    expect(result.energy).toBeGreaterThan(0);
    expect(result.zcr).toBeGreaterThan(0);
  });

  test('should maintain temporal consistency', () => {
    const speechFrame = new Float32Array(512);
    for (let i = 0; i < speechFrame.length; i++) {
      speechFrame[i] = Math.sin(2 * Math.PI * 1000 * i / 16000) * 0.5;
    }

    const results: VADResult[] = [];
    for (let frame = 0; frame < 10; frame++) {
      results.push(vadCore.processFrame(speechFrame));
    }

    const laterResults = results.slice(5);
    const speakingStates = laterResults.map(r => r.isSpeaking);
    
    expect(speakingStates.some(state => state)).toBe(true);
  });

  test('should reset state correctly', () => {
    const speechFrame = new Float32Array(512).fill(0.1);
    
    vadCore.processFrame(speechFrame);
    vadCore.processFrame(speechFrame);
    
    vadCore.reset();
    
    const silentFrame = new Float32Array(512).fill(0);
    const result = vadCore.processFrame(silentFrame);
    
    expect(result.score).toBeLessThan(0.1);
    expect(result.isSpeaking).toBe(false);
  });

  test('should update config correctly', () => {
    const newConfig = {
      energyThreshold: 0.05,
      zcrThreshold: 0.5
    };
    
    vadCore.updateConfig(newConfig);
    
    const testFrame = new Float32Array(512);
    for (let i = 0; i < testFrame.length; i++) {
      testFrame[i] = Math.sin(2 * Math.PI * 800 * i / 16000) * 0.02;
    }
    
    const result = vadCore.processFrame(testFrame);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });
});
