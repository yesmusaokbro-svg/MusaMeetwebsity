/**
 * Audio Analyzer Service
 * Detects active speaker using audio levels
 */

class AudioAnalyzer {
  constructor() {
    this.audioContext = null;
    this.analyzer = null;
    this.dataArray = null;
    this.source = null;
    this.animationId = null;
    this.isAnalyzing = false;
    this.threshold = 30; // Volume threshold for speaking detection
    this.onSpeakingChange = null;
    this.isSpeaking = false;
  }

  /**
   * Initialize audio analyzer with media stream
   */
  async initialize(stream) {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create analyzer node
      this.analyzer = this.audioContext.createAnalyser();
      this.analyzer.fftSize = 256;
      this.analyzer.smoothingTimeConstant = 0.8;
      
      const bufferLength = this.analyzer.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      
      // Connect stream to analyzer
      this.source = this.audioContext.createMediaStreamSource(stream);
      this.source.connect(this.analyzer);
      
      console.log('Audio analyzer initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize audio analyzer:', error);
      return false;
    }
  }

  /**
   * Start analyzing audio levels
   */
  startAnalyzing(callback) {
    if (!this.analyzer) {
      console.warn('Audio analyzer not initialized');
      return false;
    }

    this.isAnalyzing = true;
    this.onSpeakingChange = callback;
    
    this.analyze();
    return true;
  }

  /**
   * Analyze audio frame
   */
  analyze() {
    if (!this.isAnalyzing) return;

    // Get frequency data
    this.analyzer.getByteFrequencyData(this.dataArray);
    
    // Calculate average volume
    const average = this.dataArray.reduce((sum, value) => sum + value, 0) / this.dataArray.length;
    
    // Detect if speaking
    const speaking = average > this.threshold;
    
    // Notify if state changed
    if (speaking !== this.isSpeaking) {
      this.isSpeaking = speaking;
      if (this.onSpeakingChange) {
        this.onSpeakingChange(speaking, average);
      }
    }
    
    // Continue analyzing
    this.animationId = requestAnimationFrame(() => this.analyze());
  }

  /**
   * Stop analyzing
   */
  stopAnalyzing() {
    this.isAnalyzing = false;
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Get current audio level (0-100)
   */
  getLevel() {
    if (!this.analyzer || !this.dataArray) return 0;
    
    this.analyzer.getByteFrequencyData(this.dataArray);
    const average = this.dataArray.reduce((sum, value) => sum + value, 0) / this.dataArray.length;
    
    return Math.min(100, Math.round((average / 255) * 100));
  }

  /**
   * Set speaking detection threshold
   */
  setThreshold(value) {
    this.threshold = Math.max(0, Math.min(100, value));
  }

  /**
   * Check if currently speaking
   */
  isSpeakingNow() {
    return this.isSpeaking;
  }

  /**
   * Cleanup
   */
  cleanup() {
    this.stopAnalyzing();
    
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.analyzer = null;
    this.dataArray = null;
    this.onSpeakingChange = null;
  }
}

export default new AudioAnalyzer();
