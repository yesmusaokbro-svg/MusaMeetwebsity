/**
 * Media Service
 * Handles camera, microphone, and speaker management
 */

class MediaService {
  constructor() {
    this.stream = null;
    this.devices = { cameras: [], microphones: [], speakers: [] };
    this.selectedDevices = {
      camera: null,
      microphone: null,
      speaker: null
    };
    this.videoQuality = '720p'; // Default quality
  }

  /**
   * Get available media devices
   */
  async enumerateDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      this.devices.cameras = devices.filter(d => d.kind === 'videoinput');
      this.devices.microphones = devices.filter(d => d.kind === 'audioinput');
      this.devices.speakers = devices.filter(d => d.kind === 'audiooutput');
      
      return this.devices;
    } catch (error) {
      console.error('Error enumerating devices:', error);
      throw new Error('Failed to enumerate devices');
    }
  }

  /**
   * Get video constraints for selected quality
   */
  getVideoConstraints(quality = this.videoQuality, deviceId = null) {
    const constraints = {
      360: { width: { ideal: 640 }, height: { ideal: 360 } },
      480: { width: { ideal: 854 }, height: { ideal: 480 } },
      720: { width: { ideal: 1280 }, height: { ideal: 720 } },
      1080: { width: { ideal: 1920 }, height: { ideal: 1080 } }
    };

    const videoConstraint = constraints[quality.replace('p', '')] || constraints[720];
    
    if (deviceId) {
      videoConstraint.deviceId = { exact: deviceId };
    }
    
    return videoConstraint;
  }

  /**
   * Request media access with specified constraints
   */
  async getUserMedia(cameraId = null, microphoneId = null, quality = this.videoQuality) {
    try {
      // Stop previous stream if exists
      this.stopStream();

      const constraints = {
        video: this.getVideoConstraints(quality, cameraId),
        audio: microphoneId ? { deviceId: { exact: microphoneId } } : true
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Update selected devices
      const videoTrack = this.stream.getVideoTracks()[0];
      const audioTrack = this.stream.getAudioTracks()[0];
      
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        this.selectedDevices.camera = settings.deviceId;
        
        // Log actual resolution obtained
        console.log(`Camera resolution: ${settings.width}x${settings.height}`);
      }
      
      if (audioTrack) {
        this.selectedDevices.microphone = audioTrack.getSettings().deviceId;
      }
      
      this.videoQuality = quality;
      
      return this.stream;
    } catch (error) {
      console.error('Error getting user media:', error);
      throw this.parseMediaError(error);
    }
  }

  /**
   * Change video quality
   */
  async changeVideoQuality(quality) {
    if (!this.stream) {
      throw new Error('No active stream');
    }

    const videoTrack = this.stream.getVideoTracks()[0];
    const constraints = this.getVideoConstraints(quality, this.selectedDevices.camera);
    
    try {
      await videoTrack.applyConstraints(constraints);
      this.videoQuality = quality;
      console.log(`Video quality changed to ${quality}`);
      return true;
    } catch (error) {
      console.warn('Failed to change quality, restarting stream:', error);
      // If constraint change fails, restart stream with new quality
      await this.getUserMedia(
        this.selectedDevices.camera,
        this.selectedDevices.microphone,
        quality
      );
      return true;
    }
  }

  /**
   * Switch camera device
   */
  async switchCamera(deviceId) {
    return this.getUserMedia(deviceId, this.selectedDevices.microphone, this.videoQuality);
  }

  /**
   * Switch microphone device
   */
  async switchMicrophone(deviceId) {
    return this.getUserMedia(this.selectedDevices.camera, deviceId, this.videoQuality);
  }

  /**
   * Toggle audio track
   */
  toggleAudio(enabled) {
    if (!this.stream) return false;
    
    const audioTrack = this.stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = enabled;
      return true;
    }
    return false;
  }

  /**
   * Toggle video track
   */
  toggleVideo(enabled) {
    if (!this.stream) return false;
    
    const videoTrack = this.stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = enabled;
      return true;
    }
    return false;
  }

  /**
   * Stop current stream
   */
  stopStream() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  /**
   * Get current stream
   */
  getStream() {
    return this.stream;
  }

  /**
   * Parse media errors into user-friendly messages
   */
  parseMediaError(error) {
    const errorMessages = {
      'NotAllowedError': 'Camera and microphone access denied. Please allow access in your browser settings.',
      'NotFoundError': 'No camera or microphone found. Please connect a device.',
      'NotReadableError': 'Device is already in use by another application.',
      'OverconstrainedError': 'The requested video quality is not supported by your camera.',
      'TypeError': 'Invalid device constraints.',
      'AbortError': 'Media access was aborted.'
    };

    return {
      name: error.name,
      message: errorMessages[error.name] || 'Unable to access camera or microphone.',
      original: error
    };
  }

  /**
   * Test if speaker selection is supported
   */
  isSpeakerSelectionSupported() {
    return 'sinkId' in HTMLMediaElement.prototype;
  }

  /**
   * Set audio output device (speaker)
   */
  async setSpeaker(deviceId, audioElement) {
    if (!this.isSpeakerSelectionSupported()) {
      console.warn('Speaker selection not supported in this browser');
      return false;
    }

    try {
      if (audioElement && typeof audioElement.setSinkId === 'function') {
        await audioElement.setSinkId(deviceId);
        this.selectedDevices.speaker = deviceId;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error setting speaker:', error);
      return false;
    }
  }

  /**
   * Get current device settings
   */
  getSettings() {
    if (!this.stream) return null;

    const videoTrack = this.stream.getVideoTracks()[0];
    const audioTrack = this.stream.getAudioTracks()[0];

    return {
      video: videoTrack ? videoTrack.getSettings() : null,
      audio: audioTrack ? audioTrack.getSettings() : null,
      quality: this.videoQuality,
      selectedDevices: { ...this.selectedDevices }
    };
  }
}

export default new MediaService();
