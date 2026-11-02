import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './MeetingRoom.css';

function MeetingRoom() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  
  const [localStream, setLocalStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('requesting'); // requesting, granted, denied
  
  // Device selection
  const [availableDevices, setAvailableDevices] = useState({ cameras: [], microphones: [] });
  const [selectedCamera, setSelectedCamera] = useState('');
  const [selectedMicrophone, setSelectedMicrophone] = useState('');
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);
  
  // Raise hand
  const [isHandRaised, setIsHandRaised] = useState(false);
  
  // Video filters
  const [currentFilter, setCurrentFilter] = useState('original');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  
  // Recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingSupported, setRecordingSupported] = useState(true);

  useEffect(() => {
    // Check MediaRecorder support
    if (!window.MediaRecorder) {
      setRecordingSupported(false);
      console.warn('MediaRecorder API not supported in this browser');
    }
    
    requestMediaAccess();
    enumerateDevices();

    return () => {
      // Cleanup: stop all tracks when component unmounts
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (isRecording) {
        stopRecording();
      }
    };
  }, []);

  // Recording timer
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const enumerateDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      const microphones = devices.filter(device => device.kind === 'audioinput');
      
      setAvailableDevices({ cameras, microphones });
      
      if (cameras.length > 0 && !selectedCamera) {
        setSelectedCamera(cameras[0].deviceId);
      }
      if (microphones.length > 0 && !selectedMicrophone) {
        setSelectedMicrophone(microphones[0].deviceId);
      }
    } catch (err) {
      console.error('Error enumerating devices:', err);
    }
  };

  const requestMediaAccess = async (cameraId = null, microphoneId = null) => {
    try {
      const constraints = {
        video: cameraId ? { deviceId: { exact: cameraId } } : true,
        audio: microphoneId ? { deviceId: { exact: microphoneId } } : true
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Stop previous stream if exists
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }

      setLocalStream(stream);
      setPermissionStatus('granted');
      setError(null);

      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Update selected devices
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];
      
      if (videoTrack) {
        setSelectedCamera(videoTrack.getSettings().deviceId);
      }
      if (audioTrack) {
        setSelectedMicrophone(audioTrack.getSettings().deviceId);
      }
      
      // Re-enumerate devices to get labels
      await enumerateDevices();
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setPermissionStatus('denied');
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera and microphone access denied. Please allow access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera or microphone found. Please connect a device and refresh.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('Device is already in use by another application. Please close other apps and try again.');
      } else {
        setError('Unable to access camera or microphone. Please check your device settings.');
      }
    }
  };

  const handleChangeCamera = async (deviceId) => {
    setSelectedCamera(deviceId);
    setShowDeviceMenu(false);
    await requestMediaAccess(deviceId, selectedMicrophone);
  };

  const handleChangeMicrophone = async (deviceId) => {
    setSelectedMicrophone(deviceId);
    setShowDeviceMenu(false);
    await requestMediaAccess(selectedCamera, deviceId);
  };

  const handleToggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        console.log(`Microphone ${audioTrack.enabled ? 'unmuted' : 'muted'}`);
      }
    }
  };

  const handleToggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOff(!videoTrack.enabled);
        console.log(`Camera ${videoTrack.enabled ? 'on' : 'off'}`);
      }
    }
  };

  const handleRaiseHand = () => {
    setIsHandRaised(!isHandRaised);
    console.log(`Hand ${!isHandRaised ? 'raised' : 'lowered'}`);
    // In a real implementation, this would broadcast to all participants
  };

  const handleFilterChange = (filter) => {
    setCurrentFilter(filter);
    setShowFilterMenu(false);
    console.log(`Video filter changed to: ${filter}`);
  };

  const startRecording = () => {
    if (!recordingSupported) {
      alert('Recording is not supported in this browser. Please use Chrome, Firefox, or Edge.');
      return;
    }

    if (!localStream) {
      alert('Please allow camera and microphone access first.');
      return;
    }

    try {
      recordedChunksRef.current = [];
      
      const options = { mimeType: 'video/webm;codecs=vp8,opus' };
      
      // Fallback for Safari
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm';
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options.mimeType = 'video/mp4';
        }
      }

      mediaRecorderRef.current = new MediaRecorder(localStream, options);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meeting-${meetingId}-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log('Recording saved');
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      console.log('Recording started (local only)');
    } catch (err) {
      console.error('Error starting recording:', err);
      alert('Failed to start recording. Please try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log('Recording stopped');
    }
  };

  const handleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      console.log('Stop screen sharing');
      setIsScreenSharing(false);
      alert('Screen sharing stopped.\n\n(Full screen sharing functionality will be implemented with WebRTC)');
    } else {
      // Start screen sharing
      console.log('Start screen sharing');
      alert('Screen sharing is not yet fully implemented.\n\nThis feature will be available when WebRTC connection is added.');
      // We'll implement actual screen sharing with WebRTC later
    }
  };

  const handleLeaveMeeting = () => {
    const confirmed = window.confirm('Are you sure you want to leave this meeting?');
    if (confirmed) {
      // Stop recording if active
      if (isRecording) {
        stopRecording();
      }
      
      // Stop all media tracks
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      console.log('Left meeting:', meetingId);
      navigate('/');
    }
  };

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFilterClass = () => {
    switch (currentFilter) {
      case 'grayscale':
        return 'filter-grayscale';
      case 'sepia':
        return 'filter-sepia';
      case 'blur':
        return 'filter-blur';
      default:
        return '';
    }
  };

  const handleCopyMeetingLink = () => {
    const meetingLink = window.location.href;
    navigator.clipboard.writeText(meetingLink).then(() => {
      alert(`Meeting link copied!\n\n${meetingLink}\n\nShare this link with others to invite them to the meeting.`);
    }).catch(() => {
      alert(`Meeting link:\n\n${meetingLink}\n\nCopy this link to share with others.`);
    });
  };

  return (
    <div className="meeting-room">
      <div className="meeting-header">
        <div className="meeting-info">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="6" fill="url(#gradient)" />
            <path d="M12 6L16.5 9V15L12 18L7.5 15V9L12 6Z" fill="white" />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="24" y2="24">
                <stop offset="0%" stopColor="#5B7FFF" />
                <stop offset="100%" stopColor="#AA3BFF" />
              </linearGradient>
            </defs>
          </svg>
          <span className="meeting-code">Meeting: <strong>{meetingId}</strong></span>
          {isRecording && (
            <div className="recording-indicator">
              <span className="recording-dot"></span>
              Recording {formatRecordingTime(recordingTime)}
            </div>
          )}
        </div>
        <button className="btn-copy" onClick={handleCopyMeetingLink}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="7" y="7" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M5 13H3C1.89543 13 1 12.1046 1 11V3C1 1.89543 1.89543 1 3 1H11C12.1046 1 13 1.89543 13 3V5" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Copy meeting link
        </button>
      </div>

      <div className="meeting-content">
        <div className="video-container">
          {permissionStatus === 'requesting' && (
            <div className="video-placeholder">
              <div className="loading-spinner"></div>
              <p>Requesting camera and microphone access...</p>
            </div>
          )}

          {permissionStatus === 'denied' && (
            <div className="video-placeholder error">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p className="error-message">{error}</p>
              <button className="btn-retry" onClick={requestMediaAccess}>
                Try Again
              </button>
            </div>
          )}

          {permissionStatus === 'granted' && (
            <div className="local-video-wrapper">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`local-video ${isCameraOff ? 'camera-off' : ''} ${getFilterClass()}`}
              />
              {isCameraOff && (
                <div className="camera-off-overlay">
                  <div className="avatar-large">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" fill="currentColor"/>
                      <path d="M6 21C6 17.134 8.68629 14 12 14C15.3137 14 18 17.134 18 21" fill="currentColor"/>
                    </svg>
                  </div>
                  <p>Camera is off</p>
                </div>
              )}
              <div className="video-label">
                You
                {isHandRaised && (
                  <span className="hand-indicator" title="Hand raised">
                    ✋
                  </span>
                )}
              </div>
              
              {/* Video controls overlay */}
              <div className="video-overlay-controls">
                <button 
                  className="btn-icon-small"
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  title="Video effects"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 2V4M12 20V22M20 12H22M2 12H4M17.657 6.343L19.071 4.929M4.929 19.071L6.343 17.657M17.657 17.657L19.071 19.071M4.929 4.929L6.343 6.343" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
                
                {showFilterMenu && (
                  <div className="filter-menu">
                    <div className="filter-menu-header">Video Effects</div>
                    {['original', 'grayscale', 'sepia', 'blur'].map(filter => (
                      <button
                        key={filter}
                        className={`filter-option ${currentFilter === filter ? 'active' : ''}`}
                        onClick={() => handleFilterChange(filter)}
                      >
                        <span className="filter-preview" data-filter={filter}></span>
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
                
                {availableDevices.cameras.length > 1 && (
                  <button 
                    className="btn-icon-small"
                    onClick={() => setShowDeviceMenu(!showDeviceMenu)}
                    title="Device settings"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 1V5M12 19V23M21 10H17M7 10H3M18.364 5.636L15.536 8.464M8.464 15.536L5.636 18.364M18.364 18.364L15.536 15.536M8.464 8.464L5.636 5.636" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}
                
                {showDeviceMenu && (
                  <div className="device-menu">
                    <div className="device-menu-header">Device Settings</div>
                    
                    {availableDevices.cameras.length > 0 && (
                      <div className="device-section">
                        <label>Camera</label>
                        {availableDevices.cameras.map(camera => (
                          <button
                            key={camera.deviceId}
                            className={`device-option ${selectedCamera === camera.deviceId ? 'active' : ''}`}
                            onClick={() => handleChangeCamera(camera.deviceId)}
                          >
                            {camera.label || `Camera ${camera.deviceId.substring(0, 8)}`}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {availableDevices.microphones.length > 0 && (
                      <div className="device-section">
                        <label>Microphone</label>
                        {availableDevices.microphones.map(mic => (
                          <button
                            key={mic.deviceId}
                            className={`device-option ${selectedMicrophone === mic.deviceId ? 'active' : ''}`}
                            onClick={() => handleChangeMicrophone(mic.deviceId)}
                          >
                            {mic.label || `Microphone ${mic.deviceId.substring(0, 8)}`}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="participants-info">
          <p>Waiting for other participants to join...</p>
        </div>
      </div>

      <div className="meeting-controls">
        <div className="controls-wrapper">
          <button 
            className={`control-btn ${isMuted ? 'active' : ''}`}
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
            disabled={!localStream}
          >
            {isMuted ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 3L21 21M17 17C15.8075 18.1925 14.0925 19 12 19C9.9075 19 8.1925 18.1925 7 17M15 9V5C15 3.34315 13.6569 2 12 2C10.3431 2 9 3.34315 9 5V9M12 15V19M9 12V9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="2"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="2" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M5 10V12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </button>

          <button 
            className={`control-btn ${isCameraOff ? 'active' : ''}`}
            onClick={handleToggleCamera}
            title={isCameraOff ? 'Turn on camera' : 'Turn off camera'}
            disabled={!localStream}
          >
            {isCameraOff ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 7C3 5.89543 3.89543 5 5 5H13C14.1046 5 15 5.89543 15 7V13C15 14.1046 14.1046 15 13 15H5C3.89543 15 3 14.1046 3 13V7Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M15 8.5L19.5 6V14L15 11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="2"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M15 8.5L19.5 6V14L15 11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>

          <button 
            className={`control-btn ${isScreenSharing ? 'active' : ''}`}
            onClick={handleScreenShare}
            title="Share screen"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 21H2M22 21H12M12 21V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M8 10L12 7L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="7" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          <button 
            className={`control-btn ${isHandRaised ? 'active-hand' : ''}`}
            onClick={handleRaiseHand}
            title={isHandRaised ? 'Lower hand' : 'Raise hand'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M8 14V6C8 5.44772 8.44772 5 9 5C9.55228 5 10 5.44772 10 6V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M10 11V4C10 3.44772 10.4477 3 11 3C11.5523 3 12 3.44772 12 4V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 11V5C12 4.44772 12.4477 4 13 4C13.5523 4 14 4.44772 14 5V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M14 11V7C14 6.44772 14.4477 6 15 6C15.5523 6 16 6.44772 16 7V13C16 16.3137 13.3137 19 10 19C6.68629 19 4 16.3137 4 13V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          {recordingSupported && (
            <button 
              className={`control-btn ${isRecording ? 'active-recording' : ''}`}
              onClick={isRecording ? stopRecording : startRecording}
              title={isRecording ? 'Stop recording' : 'Start recording'}
            >
              {isRecording ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="4" fill="currentColor"/>
                </svg>
              )}
            </button>
          )}
          
          <button 
            className="control-btn leave-btn"
            onClick={handleLeaveMeeting}
            title="Leave meeting"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 5C3 3.89543 3.89543 3 5 3H8C9.10457 3 10 3.89543 10 5V9L7 10C7 13 9 16 12 16C15 16 17 13 17 10L14 9V5C14 3.89543 14.8954 3 16 3H19C20.1046 3 21 3.89543 21 5V9C21 15.0751 16.0751 20 10 20H9C6.23858 20 4 17.7614 4 15V5H3Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default MeetingRoom;
