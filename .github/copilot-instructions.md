# VAD Score Library - Development Instructions

This is a React npm package for Voice Activity Detection (VAD) with high accuracy. The library provides:
- `vadscore` callback for real-time VAD scoring
- `isSpeaking` boolean for speech detection state
- TypeScript support
- React hooks integration

## Development Guidelines:
- Use TypeScript for type safety
- Implement Web Audio API for audio processing
- Provide React hooks for easy integration
- Focus on accuracy and performance
- Include comprehensive documentation

## Project Structure:
- Core VAD algorithm in `src/vadCore.ts`
- React hook in `src/useVAD.ts` 
- Utility functions in `src/utils.ts`
- Example usage in `examples/BasicExample.tsx`
- Comprehensive tests in `src/__tests__/`

## Key Features Implemented:
- Multi-feature VAD algorithm (energy, ZCR, spectral centroid)
- Temporal smoothing and hysteresis for stability
- Real-time audio processing with Web Audio API
- TypeScript definitions for type safety
- Comprehensive documentation and examples
