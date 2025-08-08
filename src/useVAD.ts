import { useEffect, useRef, useState, useCallback } from 'react';
import { VADCore, VADConfig, VADResult } from './vadCore';

export interface UseVADOptions extends VADConfig {
  /** Whether to start VAD automatically (default: false) */
  autoStart?: boolean;
  /** Callback fired when VAD score changes */
  onVADScore?: (result: VADResult) => void;
  /** Callback fired when speaking state changes */
  onSpeakingChange?: (isSpeaking: boolean) => void;
  /** Audio constraints for getUserMedia (default: { echoCancellation: true, noiseSuppression: true }) */
  audioConstraints?: MediaTrackConstraints;
}

export interface UseVADReturn {
  /** Current VAD score (0-1) */
  vadScore: number;
  /** Whether speech is currently detected */
  isSpeaking: boolean;
  /** Whether VAD is currently running */
  isListening: boolean;
  /** Start voice activity detection */
  startListening: () => Promise<void>;
  /** Stop voice activity detection */
  stopListening: () => void;
  /** Current audio stream */
  stream: MediaStream | null;
  /** Error state */
  error: string | null;
  /** Audio levels for visualization */
  audioLevels: {
    energy: number;
    zcr: number;
    spectralCentroid: number;
  };
}

/**
 * React hook for Voice Activity Detection
 * Provides real-time VAD scoring and speech detection
 */
export function useVAD(options: UseVADOptions = {}): UseVADReturn {
  const {
    autoStart = false,
    onVADScore,
    onSpeakingChange,
    audioConstraints = {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: false,
    },
    ...vadConfig
  } = options;

  const [vadScore, setVADScore] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioLevels, setAudioLevels] = useState({
    energy: 0,
    zcr: 0,
    spectralCentroid: 0,
  });

  const vadCoreRef = useRef<VADCore | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize VAD core
  useEffect(() => {
    vadCoreRef.current = new VADCore(vadConfig);
    return () => {
      if (vadCoreRef.current) {
        vadCoreRef.current.reset();
      }
    };
  }, []);

  // Update VAD config when options change
  useEffect(() => {
    if (vadCoreRef.current) {
      vadCoreRef.current.updateConfig(vadConfig);
    }
  }, [vadConfig]);

  const processAudioFrame = useCallback((audioData: Float32Array) => {
    if (!vadCoreRef.current) return;

    const result = vadCoreRef.current.processFrame(audioData);
    
    setVADScore(result.score);
    setAudioLevels({
      energy: result.energy,
      zcr: result.zcr,
      spectralCentroid: result.spectralCentroid,
    });

    // Update speaking state and fire callbacks
    if (result.isSpeaking !== isSpeaking) {
      setIsSpeaking(result.isSpeaking);
      onSpeakingChange?.(result.isSpeaking);
    }

    onVADScore?.(result);
  }, [isSpeaking, onVADScore, onSpeakingChange]);

  const startListening = useCallback(async () => {
    try {
      setError(null);
      
      // Get user media
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints,
        video: false,
      });

      setStream(mediaStream);

      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      // Create analyser node
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.1;
      analyserRef.current = analyser;

      // Create script processor for audio processing
      const processor = audioContext.createScriptProcessor(512, 1, 1);
      processorRef.current = processor;

      // Connect audio graph
      const source = audioContext.createMediaStreamSource(mediaStream);
      source.connect(analyser);
      analyser.connect(processor);
      processor.connect(audioContext.destination);

      // Process audio data
      processor.onaudioprocess = (event) => {
        const inputData = event.inputBuffer.getChannelData(0);
        processAudioFrame(inputData);
      };

      setIsListening(true);

      // Reset VAD state
      if (vadCoreRef.current) {
        vadCoreRef.current.reset();
      }
    } catch (err) {
      console.error('Error starting VAD:', err);
      setError(err instanceof Error ? err.message : 'Failed to start audio capture');
    }
  }, [audioConstraints, processAudioFrame]);

  const stopListening = useCallback(() => {
    // Stop audio processing
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop media stream
    if (stream) {
      stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      setStream(null);
    }

    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setIsListening(false);
    setVADScore(0);
    setIsSpeaking(false);
    setAudioLevels({ energy: 0, zcr: 0, spectralCentroid: 0 });

    // Reset VAD state
    if (vadCoreRef.current) {
      vadCoreRef.current.reset();
    }
  }, [stream]);

  // Auto-start if requested
  useEffect(() => {
    if (autoStart && !isListening) {
      startListening();
    }
  }, [autoStart, isListening, startListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    vadScore,
    isSpeaking,
    isListening,
    startListening,
    stopListening,
    stream,
    error,
    audioLevels,
  };
}
