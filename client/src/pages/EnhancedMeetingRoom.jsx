import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BackgroundSelector from '../components/meeting/BackgroundSelector';
import ChatPanel from '../components/meeting/ChatPanel';
import ParticipantsPanel from '../components/meeting/ParticipantsPanel';
import HostControlsPanel from '../components/meeting/HostControlsPanel';
import WelcomeModal from '../components/meeting/WelcomeModal';
import videoEffectsService from '../services/videoEffectsService';
import { determineHostStatus, getUserName, getMeetingLink, hasPermission } from '../utils/meetingUtils';
import './MeetingRoom.css';

function EnhancedMeetingRoom() {
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
  
  // Virtual backgrounds
  const [currentBackground, setCurrentBackground] = useState('original');
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
  const [isEffectsInitialized, setIsEffectsInitialized] = useState(false);
  
  // Chat
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  
  // Participants
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  
  // User info and permissions
  const [isHost, setIsHost] = useState(false);
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  
  const [participants, setParticipants] = useState([]);
  
  // Host controls
  const [isHostControlsOpen, setIsHostControlsOpen] = useState(false);
  
  // Recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingSupported, setRecordingSupported] = useState(true);
  
  // Welcome modal
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Determine if user is host (first to join)
    const { isHost: userIsHost, userId: userIdValue } = determineHostStatus(meetingId);
    const userNameValue = getUserName();
    
    setIsHost(userIsHost);
    setUserId(userIdValue);
    setUserName(userNameValue);
    
    // Initialize participants list
    setParticipants([
      {
        id: userIdValue,
        name: userIsHost ? `${userNameValue} (Host)` : userNameValue,
        isHost: userIsHost,
        audioEnabled: true,
        videoEnabled: true,
        isHandRaised: false,
        status: 'Active',
        color: '#1a73e8'
      }
    ]);
    
    // Check MediaRecorder support
    if (!window.MediaRecorder) {
      setRecordingSupported(false);
      console.warn('MediaRecorder API not supported in this browser');
    }
    
    requestMediaAccess();
    enumerateDevices();
    
    // Show welcome modal after a short delay
    setTimeout(() => {
      setShowWelcome(true);
    }, 1000);
    
    // Background selector will NOT auto-open
    // User must manually click the background button to change it
    // Default: Original camera view (no virtual background)

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
        
        // Initialize video effects service for virtual backgrounds
        try {
          await videoEffectsService.initialize(videoRef.current, stream);
          setIsEffectsInitialized(true);
          console.log('Video effects service initialized successfully');
        } catch (err) {
          console.error('Failed to initialize video effects:', err);
          // Continue without effects if initialization fails
        }
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

  const handleToggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setUnreadMessages(0); // Clear unread count when opening chat
      setIsParticipantsOpen(false); // Close participants if open
    }
  };

  const handleToggleParticipants = () => {
    setIsParticipantsOpen(!isParticipantsOpen);
    if (!isParticipantsOpen) {
      setIsChatOpen(false); // Close chat if open
      setIsHostControlsOpen(false); // Close host controls if open
    }
  };

  const handleToggleHostControls = () => {
    setIsHostControlsOpen(!isHostControlsOpen);
    if (!isHostControlsOpen) {
      setIsChatOpen(false);
      setIsParticipantsOpen(false);
    }
  };

  const handleBackgroundSelect = async (background) => {
    console.log('Background selected:', background);
    setCurrentBackground(background.id);
    setShowBackgroundSelector(false);

    if (!isEffectsInitialized) {
      console.warn('Video effects not initialized yet');
      return;
    }

    try {
      if (background.type === 'none') {
        // Remove all effects
        videoEffectsService.removeEffects();
        console.log('Removed all effects');
      } else if (background.type === 'blur') {
        // Apply background blur
        await videoEffectsService.applyBackgroundBlur(background.amount);
        console.log(`Applied blur: ${background.amount}px`);
      } else if (background.type === 'virtual') {
        // Apply virtual background
        await videoEffectsService.applyVirtualBackground(background.url);
        console.log(`Applied virtual background: ${background.name}`);
      }
    } catch (err) {
      console.error('Failed to apply background effect:', err);
      alert('Failed to apply background effect. Please try again.');
    }
  };

  const startRecording = () => {
    // Check permission
    if (!hasPermission(isHost, 'canRecord')) {
      alert('Only the host can record the meeting.');
      return;
    }
    
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
    // Check permission
    if (!hasPermission(isHost, 'canScreenShare')) {
      alert('Only the host can share their screen.\n\nParticipants can use: microphone, camera, chat, and virtual backgrounds.');
      return;
    }
    
    if (isScreenSharing) {
      // Stop screen sharing
      try {
        // Stop screen share tracks
        if (localStream) {
          const screenTracks = localStream.getVideoTracks().filter(track => 
            track.label.includes('screen') || track.contentHint === 'detail'
          );
          
          screenTracks.forEach(track => track.stop());
          
          // Restore camera
          await requestMediaAccess(selectedCamera, selectedMicrophone);
        }
        
        setIsScreenSharing(false);
        console.log('✅ Screen sharing stopped');
      } catch (err) {
        console.error('Error stopping screen share:', err);
        setIsScreenSharing(false);
      }
    } else {
      // Start screen sharing
      try {
        console.log('🖥️ Starting screen share...');
        
        // Check browser support
        if (!navigator.mediaDevices.getDisplayMedia) {
          alert('Screen sharing is not supported in this browser.\n\nPlease use Chrome, Edge, or Firefox.');
          return;
        }
        
        // Request screen share
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: 'always',
            displaySurface: 'monitor', // or 'window', 'application', 'browser'
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100
          }
        });
        
        // Handle when user stops sharing via browser UI
        screenStream.getVideoTracks()[0].onended = () => {
          console.log('Screen share ended by user');
          setIsScreenSharing(false);
          // Restore camera
          requestMediaAccess(selectedCamera, selectedMicrophone);
        };
        
        // Replace video track with screen share track
        if (localStream) {
          const videoTrack = localStream.getVideoTracks()[0];
          if (videoTrack) {
            videoTrack.stop();
            localStream.removeTrack(videoTrack);
          }
          
          // Add screen track to stream
          const screenVideoTrack = screenStream.getVideoTracks()[0];
          localStream.addTrack(screenVideoTrack);
          
          // Add screen audio if available
          const screenAudioTracks = screenStream.getAudioTracks();
          if (screenAudioTracks.length > 0) {
            localStream.addTrack(screenAudioTracks[0]);
            console.log('✅ Screen audio included');
          }
          
          // Update video element
          if (videoRef.current) {
            videoRef.current.srcObject = localStream;
          }
        } else {
          // No local stream, create new one
          setLocalStream(screenStream);
          if (videoRef.current) {
            videoRef.current.srcObject = screenStream;
          }
        }
        
        setIsScreenSharing(true);
        console.log('✅ Screen sharing started');
        
        // Optional: Notify user
        const notification = document.createElement('div');
        notification.style.cssText = `
          position: fixed;
          top: 80px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(34, 197, 94, 0.95);
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          z-index: 10000;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        notification.textContent = '🖥️ You are now sharing your screen';
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.style.transition = 'opacity 0.3s';
          notification.style.opacity = '0';
          setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
        
      } catch (err) {
        console.error('Error starting screen share:', err);
        
        if (err.name === 'NotAllowedError') {
          alert('Screen sharing permission denied.\n\nPlease allow screen sharing when prompted.');
        } else if (err.name === 'NotFoundError') {
          alert('No screen available to share.');
        } else if (err.name === 'NotSupportedError') {
          alert('Screen sharing is not supported in this browser.\n\nPlease use Chrome, Edge, or Firefox.');
        } else {
          alert('Failed to start screen sharing.\n\nPlease try again.');
        }
        
        setIsScreenSharing(false);
      }
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
                className={`local-video ${isCameraOff ? 'camera-off' : ''}`}
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
                {isScreenSharing && (
                  <span className="screen-share-indicator" title="Screen sharing active">
                    🖥️ Sharing screen
                  </span>
                )}
              </div>
              
              {/* Video controls overlay */}
              <div className="video-overlay-controls">
                <button 
                  className={`btn-icon-small ${currentBackground !== 'original' ? 'active' : ''}`}
                  onClick={() => setShowBackgroundSelector(!showBackgroundSelector)}
                  title="Virtual backgrounds"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M8 15L11 12L14 15L19 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                  </svg>
                </button>
                
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
            title={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 21H2M22 21H12M12 21V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              {isScreenSharing ? (
                // Stop icon when sharing
                <>
                  <rect x="8" y="7" width="8" height="6" fill="currentColor" rx="1"/>
                </>
              ) : (
                // Upload/share icon when not sharing
                <>
                  <path d="M8 10L12 7L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="7" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </>
              )}
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

          <button 
            className={`control-btn ${isChatOpen ? 'active' : ''}`}
            onClick={handleToggleChat}
            title="Chat with participants"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {unreadMessages > 0 && (
              <span className="notification-badge">{unreadMessages}</span>
            )}
          </button>

          <button 
            className={`control-btn ${isParticipantsOpen ? 'active' : ''}`}
            onClick={handleToggleParticipants}
            title="View participants"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

          {isHost && (
            <button 
              className={`control-btn ${isHostControlsOpen ? 'active' : ''}`}
              onClick={handleToggleHostControls}
              title="Host Controls"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M19.4 15C19.1277 15.6171 19.2583 16.3378 19.73 16.82L19.79 16.88C20.1656 17.2551 20.3766 17.7642 20.3766 18.295C20.3766 18.8258 20.1656 19.3349 19.79 19.71C19.4149 20.0856 18.9058 20.2966 18.375 20.2966C17.8442 20.2966 17.3351 20.0856 16.96 19.71L16.9 19.65C16.4178 19.1783 15.6971 19.0477 15.08 19.32C14.4755 19.5791 14.0826 20.1724 14.08 20.83V21C14.08 22.1046 13.1846 23 12.08 23C10.9754 23 10.08 22.1046 10.08 21V20.91C10.0642 20.2327 9.63587 19.6339 9 19.4C8.38291 19.1277 7.66219 19.2583 7.18 19.73L7.12 19.79C6.74486 20.1656 6.23582 20.3766 5.705 20.3766C5.17418 20.3766 4.66514 20.1656 4.29 19.79C3.91445 19.4149 3.70343 18.9058 3.70343 18.375C3.70343 17.8442 3.91445 17.3351 4.29 16.96L4.35 16.9C4.82167 16.4178 4.95235 15.6971 4.68 15.08C4.42093 14.4755 3.82764 14.0826 3.17 14.08H3C1.89543 14.08 1 13.1846 1 12.08C1 10.9754 1.89543 10.08 3 10.08H3.09C3.76733 10.0642 4.36613 9.63587 4.6 9C4.87235 8.38291 4.74167 7.66219 4.27 7.18L4.21 7.12C3.83445 6.74486 3.62343 6.23582 3.62343 5.705C3.62343 5.17418 3.83445 4.66514 4.21 4.29C4.58514 3.91445 5.09418 3.70343 5.625 3.70343C6.15582 3.70343 6.66486 3.91445 7.04 4.29L7.1 4.35C7.58219 4.82167 8.30291 4.95235 8.92 4.68H9C9.60447 4.42093 9.99738 3.82764 10 3.17V3C10 1.89543 10.8954 1 12 1C13.1046 1 14 1.89543 14 3V3.09C14.0026 3.74764 14.3955 4.34093 15 4.6C15.6171 4.87235 16.3378 4.74167 16.82 4.27L16.88 4.21C17.2551 3.83445 17.7642 3.62343 18.295 3.62343C18.8258 3.62343 19.3349 3.83445 19.71 4.21C20.0856 4.58514 20.2966 5.09418 20.2966 5.625C20.2966 6.15582 20.0856 6.66486 19.71 7.04L19.65 7.1C19.1783 7.58219 19.0477 8.30291 19.32 8.92V9C19.5791 9.60447 20.1724 9.99738 20.83 10H21C22.1046 10 23 10.8954 23 12C23 13.1046 22.1046 14 21 14H20.91C20.2524 14.0026 19.6591 14.3955 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
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

      {/* Background Selector Modal */}
      {showBackgroundSelector && (
        <BackgroundSelector 
          currentBackground={currentBackground}
          onSelect={handleBackgroundSelect}
          onClose={() => setShowBackgroundSelector(false)}
        />
      )}

      {/* Chat Panel */}
      <ChatPanel 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentUser="You"
        participants={participants.filter(p => p.id !== 'host')}
      />

      {/* Participants Panel */}
      <ParticipantsPanel 
        isOpen={isParticipantsOpen}
        onClose={() => setIsParticipantsOpen(false)}
        participants={participants}
        currentUser="Host (You)"
      />

      {/* Host Controls Panel */}
      <HostControlsPanel 
        isOpen={isHostControlsOpen}
        onClose={() => setIsHostControlsOpen(false)}
        participants={participants}
        isHost={isHost}
        currentUser={userName}
      />

      {/* Welcome Modal - Shows role and permissions */}
      {showWelcome && (
        <WelcomeModal
          isHost={isHost}
          userName={userName}
          meetingId={meetingId}
          onClose={() => setShowWelcome(false)}
        />
      )}
    </div>
  );
}

export default EnhancedMeetingRoom;
