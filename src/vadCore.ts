/**
 * Voice Activity Detection (VAD) Core Algorithm
 */

export interface VADConfig {
  /** Sample rate for audio processing (default: 16000) */
  sampleRate?: number;
  /** Frame size in samples (default: 512) */
  frameSize?: number;
  /** Energy threshold for voice detection (default: 0.01) */
  energyThreshold?: number;
  /** Zero crossing rate threshold (default: 0.3) */
  zcrThreshold?: number;
  /** Spectral centroid threshold (default: 1000) */
  spectralCentroidThreshold?: number;
  /** Smoothing factor for temporal consistency (default: 0.8) */
  smoothingFactor?: number;
  /** Minimum speech duration in frames (default: 3) */
  minSpeechFrames?: number;
  /** Minimum silence duration in frames (default: 5) */
  minSilenceFrames?: number;
}

export interface VADResult {
  /** VAD score between 0 and 1 */
  score: number;
  /** Whether speech is detected */
  isSpeaking: boolean;
  /** Raw energy level */
  energy: number;
  /** Zero crossing rate */
  zcr: number;
  /** Spectral centroid */
  spectralCentroid: number;
}

export class VADCore {
  private config: Required<VADConfig>;
  private previousScore: number = 0;
  private speechFrameCount: number = 0;
  private silenceFrameCount: number = 0;
  private currentState: boolean = false;

  constructor(config: VADConfig = {}) {
    this.config = {
      sampleRate: config.sampleRate || 16000,
      frameSize: config.frameSize || 512,
      energyThreshold: config.energyThreshold || 0.01,
      zcrThreshold: config.zcrThreshold || 0.3,
      spectralCentroidThreshold: config.spectralCentroidThreshold || 1000,
      smoothingFactor: config.smoothingFactor || 0.8,
      minSpeechFrames: config.minSpeechFrames || 3,
      minSilenceFrames: config.minSilenceFrames || 5,
    };
  }

  /**
   * Process audio frame and return VAD result
   */
  processFrame(audioData: Float32Array): VADResult {
    const energy = this.calculateEnergy(audioData);
    const zcr = this.calculateZCR(audioData);
    const spectralCentroid = this.calculateSpectralCentroid(audioData);

    // Normalize features
    const energyScore = Math.min(energy / this.config.energyThreshold, 1);
    const zcrScore = Math.min(zcr / this.config.zcrThreshold, 1);
    const spectralScore = Math.min(spectralCentroid / this.config.spectralCentroidThreshold, 1);

    // Weighted combination of features
    const rawScore = (energyScore * 0.5) + (zcrScore * 0.2) + (spectralScore * 0.3);

    // Apply temporal smoothing
    const smoothedScore = (this.config.smoothingFactor * this.previousScore) + 
                         ((1 - this.config.smoothingFactor) * rawScore);
    this.previousScore = smoothedScore;

    // Apply hysteresis for stability
    const isSpeaking = this.applyHysteresis(smoothedScore);

    return {
      score: Math.max(0, Math.min(1, smoothedScore)),
      isSpeaking,
      energy,
      zcr,
      spectralCentroid,
    };
  }

  /**
   * Calculate energy (RMS) of audio frame
   */
  private calculateEnergy(audioData: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += audioData[i] * audioData[i];
    }
    return Math.sqrt(sum / audioData.length);
  }

  /**
   * Calculate Zero Crossing Rate
   */
  private calculateZCR(audioData: Float32Array): number {
    let crossings = 0;
    for (let i = 1; i < audioData.length; i++) {
      if ((audioData[i] >= 0) !== (audioData[i - 1] >= 0)) {
        crossings++;
      }
    }
    return crossings / (audioData.length - 1);
  }

  /**
   * Calculate Spectral Centroid using frequency domain analysis
   */
  private calculateSpectralCentroid(audioData: Float32Array): number {
    let weightedSum = 0;
    let magnitudeSum = 0;
    
    for (let i = 0; i < audioData.length; i++) {
      const magnitude = Math.abs(audioData[i]);
      const frequency = (i * this.config.sampleRate) / (2 * audioData.length);
      weightedSum += magnitude * frequency;
      magnitudeSum += magnitude;
    }
    
    return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
  }

  /**
   * Apply hysteresis to prevent rapid state changes
   */
  private applyHysteresis(score: number): boolean {
    const threshold = 0.5;
    
    if (score > threshold) {
      this.speechFrameCount++;
      this.silenceFrameCount = 0;
      
      if (!this.currentState && this.speechFrameCount >= this.config.minSpeechFrames) {
        this.currentState = true;
      }
    } else {
      this.silenceFrameCount++;
      this.speechFrameCount = 0;
      
      if (this.currentState && this.silenceFrameCount >= this.config.minSilenceFrames) {
        this.currentState = false;
      }
    }
    
    return this.currentState;
  }

  /**
   * Reset the VAD state
   */
  reset(): void {
    this.previousScore = 0;
    this.speechFrameCount = 0;
    this.silenceFrameCount = 0;
    this.currentState = false;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<VADConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
