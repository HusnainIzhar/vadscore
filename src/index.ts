/**
 * VADScore - Voice Activity Detection library for React
 * 
 * @packageDocumentation
 */

export { VADCore, type VADConfig, type VADResult } from './vadCore';
export { useVAD, type UseVADOptions, type UseVADReturn } from './useVAD';
export { calculateVADScore } from './utils';

export const VERSION = '1.0.0';
