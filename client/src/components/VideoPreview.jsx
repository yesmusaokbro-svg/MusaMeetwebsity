import { useState } from 'react';
import './VideoPreview.css';

function VideoPreview() {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const participants = [
    { id: 1, name: 'You', color: '#5B7FFF' },
    { id: 2, name: 'Alex', color: '#AA3BFF' },
    { id: 3, name: 'Sarah', color: '#FF6B9D' },
    { id: 4, name: 'Mike', color: '#4CAF50' },
  ];

  const handleToggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    console.log('Microphone toggled:', newState ? 'muted' : 'unmuted');
    
    // Visual feedback
    const action = newState ? 'muted' : 'unmuted';
    console.log(`✓ Microphone ${action}`);
  };

  const handleToggleCamera = () => {
    const newState = !isCameraOff;
    setIsCameraOff(newState);
    console.log('Camera toggled:', newState ? 'off' : 'on');
    
    // Visual feedback
    const action = newState ? 'turned off' : 'turned on';
    console.log(`✓ Camera ${action}`);
  };

  const handleLeaveCall = () => {
    console.log('Leaving call...');
    const confirmed = window.confirm('Are you sure you want to leave this call?\n\n(This is a demo - no real call is active)');
    if (confirmed) {
      console.log('✓ Call ended');
      alert('You have left the call.\n\n(Demo interface)');
    }
  };

  return (
    <div className="video-preview">
      <div className="video-grid">
        {participants.map((participant) => (
          <div key={participant.id} className="video-tile" style={{ background: participant.color }}>
            <div className="video-tile-content">
              <div className="avatar">
                {participant.name.charAt(0)}
              </div>
              <span className="participant-name">{participant.name}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="video-controls">
        <button 
          className={`control-btn ${isMuted ? 'active' : ''}`}
          onClick={handleToggleMute}
          title={isMuted ? 'Unmute' : 'Mute'}
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
          className="control-btn leave-btn"
          onClick={handleLeaveCall}
          title="Leave call"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 5C3 3.89543 3.89543 3 5 3H8C9.10457 3 10 3.89543 10 5V9L7 10C7 13 9 16 12 16C15 16 17 13 17 10L14 9V5C14 3.89543 14.8954 3 16 3H19C20.1046 3 21 3.89543 21 5V9C21 15.0751 16.0751 20 10 20H9C6.23858 20 4 17.7614 4 15V5H3Z" stroke="currentColor" strokeWidth="2"/>
            <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default VideoPreview;
