import React from 'react';
import { useVAD } from '../src/index';

function BasicVADExample() {
  const {
    vadScore,
    isSpeaking,
    isListening,
    startListening,
    stopListening,
    error,
    audioLevels
  } = useVAD({
    // Configuration options
    energyThreshold: 0.01,
    zcrThreshold: 0.3,
    smoothingFactor: 0.8,
    minSpeechFrames: 3,
    minSilenceFrames: 5,
    
    // Callbacks
    onVADScore: (result) => {
      console.log('VAD Result:', result);
    },
    onSpeakingChange: (speaking) => {
      console.log(speaking ? 'Speech started' : 'Speech stopped');
    }
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>VADScore Example</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={startListening} 
          disabled={isListening}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isListening ? 'not-allowed' : 'pointer'
          }}
        >
          Start VAD
        </button>
        <button 
          onClick={stopListening} 
          disabled={!isListening}
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: !isListening ? 'not-allowed' : 'pointer'
          }}
        >
          Stop VAD
        </button>
      </div>

      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          borderRadius: '4px',
          marginBottom: '20px' 
        }}>
          Error: {error}
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '20px',
        marginBottom: '20px' 
      }}>
        <div>
          <h3>VAD Status</h3>
          <p><strong>Status:</strong> {isListening ? '🎤 Listening' : '⏹️ Stopped'}</p>
          <p><strong>Speaking:</strong> {isSpeaking ? '🗣️ Yes' : '🔇 No'}</p>
          <p><strong>VAD Score:</strong> {vadScore.toFixed(3)}</p>
        </div>
        
        <div>
          <h3>Audio Metrics</h3>
          <p><strong>Energy:</strong> {audioLevels.energy.toFixed(4)}</p>
          <p><strong>Zero Crossing Rate:</strong> {audioLevels.zcr.toFixed(4)}</p>
          <p><strong>Spectral Centroid:</strong> {audioLevels.spectralCentroid.toFixed(2)} Hz</p>
        </div>
      </div>

      {/* VAD Score Visualization */}
      <div>
        <h3>VAD Score Meter</h3>
        <div style={{ 
          width: '100%', 
          height: '30px', 
          backgroundColor: '#e0e0e0', 
          borderRadius: '15px',
          overflow: 'hidden'
        }}>
          <div 
            style={{ 
              width: `${vadScore * 100}%`, 
              height: '100%',
              backgroundColor: isSpeaking ? '#4CAF50' : '#2196F3',
              transition: 'all 0.1s ease',
              borderRadius: '15px'
            }} 
          />
        </div>
        <div style={{ 
          marginTop: '5px', 
          fontSize: '12px', 
          color: '#666',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>0</span>
          <span>Score: {(vadScore * 100).toFixed(1)}%</span>
          <span>1</span>
        </div>
      </div>

      {/* Instructions */}
      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '4px' 
      }}>
        <h4>Instructions:</h4>
        <ol>
          <li>Click "Start VAD" to begin voice activity detection</li>
          <li>Allow microphone access when prompted</li>
          <li>Speak into your microphone to see the VAD score change</li>
          <li>The meter will show green when speech is detected</li>
          <li>Check the console for detailed VAD results</li>
        </ol>
      </div>
    </div>
  );
}

export default BasicVADExample;
