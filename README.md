# VADScore 🎤

A high-accuracy Voice Activity Detection (VAD) library for React with real-time scoring and speech detection.

[![npm version](https://badge.fury.io/js/vadscore.svg)](https://badge.fury.io/js/vadscore)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)

## Features

✨ **High Accuracy**: Advanced algorithm combining multiple audio features (energy, zero-crossing rate, spectral centroid)  
🎯 **Real-time**: Low-latency processing for live audio streams  
⚛️ **React Integration**: Easy-to-use React hook with TypeScript support  
🔧 **Configurable**: Customizable thresholds and parameters for different use cases  
📊 **Audio Metrics**: Detailed audio analysis data for visualization  
🎛️ **Hysteresis**: Prevents rapid state changes for stable detection  
🔇 **Noise Handling**: Built-in noise suppression and echo cancellation support  

## Installation

```bash
npm install vadscore
```

## Quick Start

### Basic React Hook Usage

```tsx
import React from 'react';
import { useVAD } from 'vadscore';

function VoiceDetector() {
  const {
    vadScore,
    isSpeaking,
    isListening,
    startListening,
    stopListening,
    error
  } = useVAD({
    onVADScore: (result) => {
      console.log('VAD Score:', result.score);
    },
    onSpeakingChange: (speaking) => {
      console.log('Speaking:', speaking);
    }
  });

  return (
    <div>
      <h2>Voice Activity Detection</h2>
      
      <div>
        <button onClick={startListening} disabled={isListening}>
          Start Listening
        </button>
        <button onClick={stopListening} disabled={!isListening}>
          Stop Listening
        </button>
      </div>

      <div>
        <p>VAD Score: {vadScore.toFixed(3)}</p>
        <p>Speaking: {isSpeaking ? 'Yes' : 'No'}</p>
        <p>Status: {isListening ? 'Listening' : 'Stopped'}</p>
        {error && <p style={{color: 'red'}}>Error: {error}</p>}
      </div>
    </div>
  );
}

export default VoiceDetector;
```

### Advanced Configuration

```tsx
import { useVAD } from 'vadscore';

function AdvancedVAD() {
  const { vadScore, isSpeaking, audioLevels } = useVAD({
    // VAD algorithm configuration
    energyThreshold: 0.02,
    zcrThreshold: 0.25,
    spectralCentroidThreshold: 1200,
    smoothingFactor: 0.85,
    minSpeechFrames: 5,
    minSilenceFrames: 8,
    
    // Audio settings
    sampleRate: 16000,
    frameSize: 512,
    
    // Browser audio constraints
    audioConstraints: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: false,
      sampleRate: 16000
    },
    
    // Auto-start detection
    autoStart: true,
    
    // Callbacks
    onVADScore: (result) => {
      // Handle real-time VAD results
      console.log('Detailed VAD result:', result);
    },
    onSpeakingChange: (speaking) => {
      // Handle speaking state changes
      if (speaking) {
        console.log('Speech started');
      } else {
        console.log('Speech stopped');
      }
    }
  });

  return (
    <div>
      <h3>Advanced VAD with Audio Visualization</h3>
      
      {/* VAD Score Meter */}
      <div style={{ width: '100%', background: '#eee', height: '20px' }}>
        <div 
          style={{ 
            width: `${vadScore * 100}%`, 
            background: isSpeaking ? '#4CAF50' : '#2196F3',
            height: '100%',
            transition: 'all 0.1s'
          }} 
        />
      </div>
      
      {/* Audio Levels */}
      <div>
        <p>Energy: {audioLevels.energy.toFixed(4)}</p>
        <p>Zero Crossing Rate: {audioLevels.zcr.toFixed(4)}</p>
        <p>Spectral Centroid: {audioLevels.spectralCentroid.toFixed(2)} Hz</p>
      </div>
    </div>
  );
}
```

### Standalone VAD Processing

```tsx
import { calculateVADScore, processAudioBuffer, VADCore } from 'vadscore';

// Simple one-time VAD score calculation
function processAudioFrame(audioData: Float32Array) {
  const score = calculateVADScore(audioData, {
    energyThreshold: 0.015,
    zcrThreshold: 0.3
  });
  console.log('VAD Score:', score);
}

// Batch processing of audio buffer
function processEntireAudio(audioBuffer: Float32Array) {
  const scores = processAudioBuffer(audioBuffer, 512, {
    sampleRate: 16000,
    energyThreshold: 0.01
  });
  console.log('VAD Scores:', scores);
}

// Advanced usage with VADCore class
function advancedProcessing() {
  const vadCore = new VADCore({
    sampleRate: 16000,
    frameSize: 512,
    energyThreshold: 0.02
  });

  // Process multiple frames maintaining state
  const audioFrames: Float32Array[] = []; // Your audio frames
  
  audioFrames.forEach(frame => {
    const result = vadCore.processFrame(frame);
    console.log('VAD Result:', {
      score: result.score,
      isSpeaking: result.isSpeaking,
      energy: result.energy,
      zcr: result.zcr,
      spectralCentroid: result.spectralCentroid
    });
  });
}
```

## API Reference

### `useVAD(options?)` Hook

The main React hook for voice activity detection.

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `autoStart` | `boolean` | `false` | Start VAD automatically when component mounts |
| `onVADScore` | `(result: VADResult) => void` | - | Callback fired on each VAD score update |
| `onSpeakingChange` | `(isSpeaking: boolean) => void` | - | Callback fired when speaking state changes |
| `energyThreshold` | `number` | `0.01` | Energy threshold for voice detection |
| `zcrThreshold` | `number` | `0.3` | Zero crossing rate threshold |
| `spectralCentroidThreshold` | `number` | `1000` | Spectral centroid threshold (Hz) |
| `smoothingFactor` | `number` | `0.8` | Temporal smoothing factor (0-1) |
| `minSpeechFrames` | `number` | `3` | Minimum frames for speech detection |
| `minSilenceFrames` | `number` | `5` | Minimum frames for silence detection |
| `sampleRate` | `number` | `16000` | Audio sample rate |
| `frameSize` | `number` | `512` | Audio frame size in samples |
| `audioConstraints` | `MediaTrackConstraints` | `{echoCancellation: true, noiseSuppression: true}` | Browser audio constraints |

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `vadScore` | `number` | Current VAD score (0-1) |
| `isSpeaking` | `boolean` | Whether speech is currently detected |
| `isListening` | `boolean` | Whether VAD is currently active |
| `startListening` | `() => Promise<void>` | Start voice activity detection |
| `stopListening` | `() => void` | Stop voice activity detection |
| `stream` | `MediaStream \| null` | Current audio stream |
| `error` | `string \| null` | Error message if any |
| `audioLevels` | `{energy: number, zcr: number, spectralCentroid: number}` | Current audio analysis metrics |

### `VADCore` Class

Low-level VAD processing class for advanced usage.

```tsx
const vadCore = new VADCore({
  sampleRate: 16000,
  frameSize: 512,
  energyThreshold: 0.01
});

const result = vadCore.processFrame(audioData);
```

### Utility Functions

- `calculateVADScore(audioData, config?)`: Calculate VAD score for a single frame
- `processAudioBuffer(audioBuffer, frameSize?, config?)`: Process entire audio buffer
- `resampleAudio(audioData, originalRate, targetRate)`: Resample audio data
- `preEmphasis(audioData, alpha?)`: Apply pre-emphasis filter
- `highPassFilter(audioData, cutoff?)`: Apply high-pass filter

## Algorithm Details

VADScore uses a sophisticated multi-feature approach:

1. **Energy Analysis**: RMS energy calculation with adaptive thresholding
2. **Zero Crossing Rate**: Speech vs. noise discrimination
3. **Spectral Centroid**: Frequency domain analysis for voice characteristics
4. **Temporal Smoothing**: Reduces false positives from transient noise
5. **Hysteresis**: Prevents rapid state changes for stable detection

The algorithm combines these features using weighted scoring and applies temporal consistency checks to achieve high accuracy across various acoustic conditions.

## Browser Compatibility

- Chrome 66+
- Firefox 60+
- Safari 11.1+
- Edge 79+

Requires `MediaDevices.getUserMedia()` and `Web Audio API` support.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Your Name]

## Changelog

### v1.0.0
- Initial release
- React hook implementation
- Multi-feature VAD algorithm
- TypeScript support
- Comprehensive documentation
