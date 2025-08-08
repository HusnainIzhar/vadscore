/**
 * Utility functions for VAD processing
 */

import { VADCore, VADConfig } from './vadCore';

/**
 * Calculate VAD score for a single audio frame
 */
export function calculateVADScore(
  audioData: Float32Array,
  config?: VADConfig
): number {
  const vadCore = new VADCore(config);
  const result = vadCore.processFrame(audioData);
  return result.score;
}

/**
 * Process audio buffer and return array of VAD scores
 */
export function processAudioBuffer(
  audioBuffer: Float32Array,
  frameSize: number = 512,
  config?: VADConfig
): number[] {
  const vadCore = new VADCore({ ...config, frameSize });
  const scores: number[] = [];
  
  for (let i = 0; i < audioBuffer.length; i += frameSize) {
    const frame = audioBuffer.slice(i, i + frameSize);
    if (frame.length === frameSize) {
      const result = vadCore.processFrame(frame);
      scores.push(result.score);
    }
  }
  
  return scores;
}

/**
 * Convert audio sample rate using linear interpolation
 */
export function resampleAudio(
  audioData: Float32Array,
  originalSampleRate: number,
  targetSampleRate: number
): Float32Array {
  if (originalSampleRate === targetSampleRate) {
    return audioData;
  }
  
  const ratio = originalSampleRate / targetSampleRate;
  const newLength = Math.round(audioData.length / ratio);
  const result = new Float32Array(newLength);
  
  for (let i = 0; i < newLength; i++) {
    const srcIndex = i * ratio;
    const srcIndexFloor = Math.floor(srcIndex);
    const srcIndexCeil = Math.min(srcIndexFloor + 1, audioData.length - 1);
    const fraction = srcIndex - srcIndexFloor;
    
    result[i] = audioData[srcIndexFloor] * (1 - fraction) + 
                audioData[srcIndexCeil] * fraction;
  }
  
  return result;
}

/**
 * Apply pre-emphasis filter to audio data
 */
export function preEmphasis(audioData: Float32Array, alpha: number = 0.97): Float32Array {
  const result = new Float32Array(audioData.length);
  result[0] = audioData[0];
  
  for (let i = 1; i < audioData.length; i++) {
    result[i] = audioData[i] - alpha * audioData[i - 1];
  }
  
  return result;
}

/**
 * High-pass filter to remove low-frequency noise
 */
export function highPassFilter(audioData: Float32Array, cutoff: number = 0.01): Float32Array {
  const result = new Float32Array(audioData.length);
  let y1 = 0;
  let x1 = 0;
  
  const alpha = cutoff / (cutoff + 1);
  
  for (let i = 0; i < audioData.length; i++) {
    const x = audioData[i];
    const y = alpha * (y1 + x - x1);
    result[i] = y;
    x1 = x;
    y1 = y;
  }
  
  return result;
}
