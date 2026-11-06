import { useEffect, useRef, useState } from 'react';
import './RemoteParticipantVideo.css';

function RemoteParticipantVideo({ participant }) {
  const videoRef = useRef(null);
  const [hasStream, setHasStream] = useState(false);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      console.log('Setting remote stream for:', participant.name, participant.stream);
      videoRef.current.srcObject = participant.stream;
      setHasStream(true);
      
      // Force play
      videoRef.current.play().catch(err => {
        console.log('Autoplay prevented, trying again:', err);
        setTimeout(() => {
          videoRef.current?.play().catch(() => {});
        }, 100);
      });
    } else {
      console.log('No stream yet for:', participant.name);
      setHasStream(false);
    }
  }, [participant.stream, participant.name]);

  return (
    <div className="remote-video-wrapper">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`remote-video ${!hasStream || !participant.videoEnabled ? 'camera-off' : ''}`}
        style={{ display: hasStream && participant.videoEnabled ? 'block' : 'none' }}
      />
      
      {(!hasStream || !participant.videoEnabled) && (
        <div className="camera-off-overlay">
          {!hasStream ? (
            <div className="connecting-placeholder">
              <div className="spinner"></div>
              <p>Connecting...</p>
            </div>
          ) : (
            <>
              <div className="avatar-large">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" fill="currentColor"/>
                  <path d="M6 21C6 17.134 8.68629 14 12 14C15.3137 14 18 17.134 18 21" fill="currentColor"/>
                </svg>
              </div>
              <p>Camera is off</p>
            </>
          )}
        </div>
      )}
      
      <div className="video-label">
        {participant.name}
        {!participant.audioEnabled && (
          <span className="muted-indicator" title="Muted">
            🔇
          </span>
        )}
        {participant.isHandRaised && (
          <span className="hand-indicator" title="Hand raised">
            ✋{participant.handRaiseNumber ? ` ${participant.handRaiseNumber}` : ''}
          </span>
        )}
      </div>
    </div>
  );
}

export default RemoteParticipantVideo;
