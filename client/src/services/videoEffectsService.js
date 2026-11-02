/**
 * Professional Virtual Background Service
 * Uses MediaPipe Selfie Segmentation for person detection
 * Optimized for FULL BODY visibility and real-time performance
 * Updated: Full person preservation mode
 */

let SelfieSegmentation;

class VideoEffectsService {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.videoElement = null;
    this.originalStream = null;
    this.outputStream = null;
    this.animationId = null;
    this.isProcessing = false;
    
    // MediaPipe segmentation
    this.segmentation = null;
    this.segmentationReady = false;
    
    // Hidden video element for original stream
    this.sourceVideo = null;
    
    // Background settings
    this.backgroundImage = null;
    this.backgroundType = 'none'; // none, image, blur
    this.blurAmount = 0;
    
    // Caches for performance
    this.segmentationMask = null;
    this.tempCanvas = null;
    this.tempCtx = null;
    this.maskCanvas = null;
    this.maskCtx = null;
    
    // Pre-computed lookup table for smoothstep (performance optimization)
    this.smoothstepLUT = null;
    
    // Temporal smoothing for stable segmentation
    this.previousMask = null;
    this.maskBlendFactor = 0.85; // Blend 85% current + 15% previous (more responsive)
    
    // Performance monitoring
    this.frameCount = 0;
    this.lastFpsTime = Date.now();
  }

  /**
   * Load MediaPipe module dynamically
   */
  async loadMediaPipe() {
    if (SelfieSegmentation) return;
    
    try {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js';
      
      await new Promise((resolve, reject) => {
        script.onload = () => {
          if (window.SelfieSegmentation) {
            SelfieSegmentation = window.SelfieSegmentation;
            resolve();
          } else {
            reject(new Error('SelfieSegmentation not found on window'));
          }
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
      
      console.log('✅ MediaPipe loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load MediaPipe:', error);
      throw error;
    }
  }

  /**
   * Initialize the video effects service
   */
  async initialize(videoElement, stream) {
    console.log('🎥 Initializing video effects service...');
    
    this.videoElement = videoElement;
    this.originalStream = stream;
    
    // Pre-compute smoothstep lookup table (0-255)
    // OPTIMIZED FOR FULL PERSON VISIBILITY
    this.smoothstepLUT = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const t = i / 255.0;
      
      // AGGRESSIVE PERSON-PRESERVATION THRESHOLDS
      // Keep person pixels even with moderate confidence
      if (t > 0.5) {
        // 50%+ confidence = definitely person (keep 100%)
        // This ensures face, hair, shoulders, arms, body all stay visible
        this.smoothstepLUT[i] = 1.0;
      } else if (t < 0.02) {
        // Only 0-2% confidence = definitely background
        this.smoothstepLUT[i] = 0.0;
      } else {
        // 2-50% = narrow edge zone for smooth feathering
        const normalized = (t - 0.02) / 0.48; // Normalize to 0-1
        // Cubic smoothstep for ultra-smooth edges
        this.smoothstepLUT[i] = normalized * normalized * normalized * (normalized * (normalized * 6.0 - 15.0) + 10.0);
      }
    }
    
    // Create processing canvases with optimized settings
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { 
      willReadFrequently: true,
      alpha: false,
      desynchronized: true // Allow GPU to work ahead
    });
    
    this.tempCanvas = document.createElement('canvas');
    this.tempCtx = this.tempCanvas.getContext('2d', { 
      willReadFrequently: true,
      alpha: false,
      desynchronized: true
    });
    
    this.maskCanvas = document.createElement('canvas');
    this.maskCtx = this.maskCanvas.getContext('2d', { 
      willReadFrequently: true,
      alpha: false, // Mask is grayscale, no alpha needed
      desynchronized: true
    });
    
    // Disable image smoothing for mask (faster, crisp edges)
    this.maskCtx.imageSmoothingEnabled = false;
    
    // Create hidden video for original stream
    this.sourceVideo = document.createElement('video');
    this.sourceVideo.autoplay = true;
    this.sourceVideo.playsInline = true;
    this.sourceVideo.muted = true;
    this.sourceVideo.srcObject = stream;
    
    try {
      await this.sourceVideo.play();
    } catch (error) {
      console.error('❌ Failed to play source video:', error);
    }
    
    // Initialize MediaPipe
    await this.loadMediaPipe();
    await this.initializeSegmentation();
    
    console.log('✅ Video effects service initialized');
    return true;
  }

  /**
   * Initialize MediaPipe Selfie Segmentation
   */
  async initializeSegmentation() {
    try {
      if (!SelfieSegmentation) {
        throw new Error('SelfieSegmentation class not loaded');
      }
      
      this.segmentation = new SelfieSegmentation({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
        }
      });

      // Model 1 = General segmentation (more accurate, better for full body)
      // Model 0 = Landscape segmentation (faster but less accurate)
      // SelfieMode FALSE = Better for full body shots, not just close-up selfies
      this.segmentation.setOptions({
        modelSelection: 1,
        selfieMode: false, // CHANGED: False for full body, better person detection
      });

      this.segmentation.onResults((results) => {
        // Store the segmentation mask
        this.segmentationMask = results.segmentationMask;
      });

      this.segmentationReady = true;
      console.log('✅ MediaPipe segmentation ready (Model 1 - Full Body Mode)');
    } catch (error) {
      console.error('❌ Failed to initialize segmentation:', error);
      this.segmentationReady = false;
    }
  }

  /**
   * Apply virtual background image
   */
  async applyVirtualBackground(imageUrl) {
    if (!this.segmentationReady) {
      throw new Error('Segmentation not ready');
    }

    console.log('🖼️  Loading background:', imageUrl);
    
    this.backgroundType = 'image';
    
    // Load background image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    await new Promise((resolve, reject) => {
      img.onload = () => {
        this.backgroundImage = img;
        console.log('✅ Background loaded:', img.width, 'x', img.height);
        resolve();
      };
      img.onerror = () => reject(new Error('Failed to load background image'));
      img.src = imageUrl;
      
      setTimeout(() => reject(new Error('Background load timeout')), 10000);
    });
    
    return await this.startProcessing();
  }

  /**
   * Apply background blur
   */
  async applyBackgroundBlur(amount = 10) {
    if (!this.segmentationReady) {
      throw new Error('Segmentation not ready');
    }

    console.log('🌫️  Applying blur:', amount, 'px');
    
    this.backgroundType = 'blur';
    this.blurAmount = amount;
    this.backgroundImage = null;
    
    return await this.startProcessing();
  }

  /**
   * Remove all effects and restore original camera
   */
  async removeEffects() {
    console.log('🔄 Removing effects, restoring original');
    
    this.backgroundType = 'none';
    this.backgroundImage = null;
    this.blurAmount = 0;
    
    this.stopProcessing();
    
    // Restore original stream
    if (this.videoElement && this.originalStream) {
      this.videoElement.srcObject = this.originalStream;
    }
    
    return this.originalStream;
  }

  /**
   * Start real-time processing
   */
  async startProcessing() {
    if (this.isProcessing) {
      this.stopProcessing();
    }

    if (!this.sourceVideo || !this.segmentationReady) {
      throw new Error('Video or segmentation not ready');
    }

    // Wait for video metadata
    if (this.sourceVideo.readyState < 2) {
      await new Promise(resolve => {
        this.sourceVideo.onloadedmetadata = resolve;
      });
    }

    const width = this.sourceVideo.videoWidth || 1280;
    const height = this.sourceVideo.videoHeight || 720;
    
    // Set all canvases to same size
    this.canvas.width = width;
    this.canvas.height = height;
    this.tempCanvas.width = width;
    this.tempCanvas.height = height;
    this.maskCanvas.width = width;
    this.maskCanvas.height = height;

    console.log(`🎬 Starting processing at ${width}x${height}`);

    this.isProcessing = true;
    this.frameCount = 0;
    this.lastFpsTime = Date.now();
    
    // Create output stream
    this.outputStream = this.canvas.captureStream(30);
    
    // Copy audio tracks
    const audioTracks = this.originalStream.getAudioTracks();
    audioTracks.forEach(track => {
      this.outputStream.addTrack(track);
    });
    
    // Switch to processed stream
    this.videoElement.srcObject = this.outputStream;
    
    // Start processing loop
    this.processFrame();
    
    return this.outputStream;
  }

  /**
   * Process each video frame
   */
  async processFrame() {
    if (!this.isProcessing) return;

    try {
      const width = this.canvas.width;
      const height = this.canvas.height;

      // Send frame to MediaPipe (non-blocking)
      if (this.segmentation && this.sourceVideo.readyState >= 2) {
        this.segmentation.send({ image: this.sourceVideo });
      }

      // Only composite if we have a mask
      if (this.backgroundType === 'none') {
        // No effect - draw original
        this.ctx.drawImage(this.sourceVideo, 0, 0, width, height);
      } else if (this.segmentationMask) {
        // Apply segmentation
        this.compositeFrame(width, height);
      } else {
        // Waiting for first mask
        this.ctx.drawImage(this.sourceVideo, 0, 0, width, height);
      }

      // FPS monitoring
      this.frameCount++;
      const now = Date.now();
      if (now - this.lastFpsTime >= 1000) {
        const fps = this.frameCount;
        console.log(`📊 FPS: ${fps}`);
        this.frameCount = 0;
        this.lastFpsTime = now;
      }

      // Continue loop at 30 FPS (throttled)
      this.animationId = requestAnimationFrame(() => this.processFrame());
    } catch (error) {
      console.error('❌ Frame processing error:', error);
      // Continue even on error
      this.animationId = requestAnimationFrame(() => this.processFrame());
    }
  }

  /**
   * Dilate (expand) the person mask to prevent cutting off body parts
   * Fast single-pass maximum filter
   */
  dilateMaskFast(mask, width, height) {
    const dilated = new Uint8ClampedArray(mask.length);
    const radius = 3; // 3-pixel expansion
    
    // Single pass with optimized neighbor checking
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        let maxValue = mask[idx];
        
        // Check 8 neighbors (simplified for speed)
        const checks = [
          {dx: -radius, dy: 0},   // left
          {dx: radius, dy: 0},    // right
          {dx: 0, dy: -radius},   // top
          {dx: 0, dy: radius},    // bottom
          {dx: -radius, dy: -radius}, // top-left
          {dx: radius, dy: -radius},  // top-right
          {dx: -radius, dy: radius},  // bottom-left
          {dx: radius, dy: radius}    // bottom-right
        ];
        
        for (const {dx, dy} of checks) {
          const nx = x + dx;
          const ny = y + dy;
          
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nIdx = (ny * width + nx) * 4;
            if (mask[nIdx] > maxValue) {
              maxValue = mask[nIdx];
            }
          }
        }
        
        dilated[idx] = maxValue;
        dilated[idx + 1] = maxValue;
        dilated[idx + 2] = maxValue;
        dilated[idx + 3] = 255;
      }
    }
    
    return dilated;
  }

  /**
   * Composite person and background
   * FULL PERSON PRESERVATION - Ensures complete body visibility
   */
  compositeFrame(width, height) {
    // STEP 1: Draw background layer
    if (this.backgroundType === 'blur') {
      this.ctx.filter = `blur(${this.blurAmount}px)`;
      this.ctx.drawImage(this.sourceVideo, 0, 0, width, height);
      this.ctx.filter = 'none';
    } else if (this.backgroundType === 'image' && this.backgroundImage) {
      this.ctx.drawImage(this.backgroundImage, 0, 0, width, height);
    }

    // STEP 2: Draw mask with high-quality smoothing enabled
    this.maskCtx.clearRect(0, 0, width, height);
    this.maskCtx.imageSmoothingEnabled = true;
    this.maskCtx.imageSmoothingQuality = 'high';
    this.maskCtx.drawImage(this.segmentationMask, 0, 0, width, height);
    this.maskCtx.imageSmoothingEnabled = false; // Reset for next frame

    // STEP 3: Draw person on temp canvas
    this.tempCtx.clearRect(0, 0, width, height);
    this.tempCtx.drawImage(this.sourceVideo, 0, 0, width, height);

    // STEP 4: Get image data
    const personData = this.tempCtx.getImageData(0, 0, width, height);
    const bgData = this.ctx.getImageData(0, 0, width, height);
    let maskData = this.maskCtx.getImageData(0, 0, width, height);

    const person = personData.data;
    const background = bgData.data;
    
    // STEP 5: Dilate mask every 2 frames to expand person boundaries
    let mask = maskData.data;
    if (this.frameCount % 2 === 0) {
      mask = this.dilateMaskFast(mask, width, height);
    }
    
    const output = personData;
    const result = output.data;

    // STEP 6: Apply temporal smoothing for stability
    if (!this.previousMask) {
      this.previousMask = new Uint8ClampedArray(mask.length);
      this.previousMask.set(mask);
    }
    
    const prevMask = this.previousMask;
    const blendCurrent = this.maskBlendFactor;
    const blendPrevious = 1.0 - this.maskBlendFactor;
    
    // STEP 7: Composite with smoothed and dilated mask
    for (let i = 0; i < mask.length; i += 4) {
      // Temporal smoothing
      const smoothedMask = mask[i] * blendCurrent + prevMask[i] * blendPrevious;
      prevMask[i] = smoothedMask;
      
      // Lookup alpha with person-preserving thresholds
      const alpha = this.smoothstepLUT[Math.round(smoothedMask)];
      const invAlpha = 1.0 - alpha;

      // Composite RGB channels
      result[i]     = person[i]     * alpha + background[i]     * invAlpha;
      result[i + 1] = person[i + 1] * alpha + background[i + 1] * invAlpha;
      result[i + 2] = person[i + 2] * alpha + background[i + 2] * invAlpha;
      result[i + 3] = 255;
    }

    // STEP 8: Draw final composite
    this.ctx.putImageData(output, 0, 0);
  }

  /**
   * Stop processing and reset state
   */
  stopProcessing() {
    this.isProcessing = false;
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    // Clear temporal smoothing cache
    this.previousMask = null;
  }

  /**
   * Get current background type
   */
  getBackgroundType() {
    return this.backgroundType;
  }

  /**
   * Check if segmentation is ready
   */
  isSegmentationReady() {
    return this.segmentationReady;
  }

  /**
   * Cleanup all resources
   */
  cleanup() {
    console.log('🧹 Cleaning up video effects service');
    
    this.stopProcessing();
    
    if (this.segmentation) {
      this.segmentation.close();
      this.segmentation = null;
    }
    
    if (this.sourceVideo) {
      this.sourceVideo.srcObject = null;
      this.sourceVideo = null;
    }
    
    if (this.outputStream) {
      this.outputStream.getTracks().forEach(track => {
        if (track.kind === 'video') {
          track.stop();
        }
      });
      this.outputStream = null;
    }
    
    this.canvas = null;
    this.ctx = null;
    this.tempCanvas = null;
    this.tempCtx = null;
    this.maskCanvas = null;
    this.maskCtx = null;
    this.backgroundImage = null;
    this.segmentationMask = null;
    this.videoElement = null;
    this.originalStream = null;
    this.segmentationReady = false;
  }
}

export default new VideoEffectsService();
