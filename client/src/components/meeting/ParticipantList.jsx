import { useState, useEffect } from 'react';
import meetingService from '../../services/meetingService';
import './ParticipantList.css';

export default function ParticipantList({ isOpen, onClose, isHost = false }) {
  const [participants, setParticipants] = useState([]);
  const [waitingRoom, setWaitingRoom] = useState([]);
  const [meetingInfo, setMeetingInfo] = useState(null);

  useEffect(() => {
    // Subscribe to meeting events
    const unsubscribe = meetingService.subscribe((event, data) => {
      if (event === 'participant-added' || event === 'participant-updated' || event === 'participant-removed') {
        setParticipants(meetingService.getParticipants());
      } else if (event === 'waiting-room-update') {
        setWaitingRoom(data);
      }
    });

    // Load initial data
    setParticipants(meetingService.getParticipants());
    setMeetingInfo(meetingService.getMeetingInfo());

    return unsubscribe;
  }, []);

  const handleMuteParticipant = (participantId) => {
    if (window.confirm('Mute this participant?')) {
      meetingService.muteParticipant(participantId);
    }
  };

  const handleRemoveParticipant = (participantId) => {
    if (window.confirm('Remove this participant from the meeting?')) {
      meetingService.removeParticipant(participantId);
    }
  };

  const handleMakeCoHost = (participantId) => {
    if (window.confirm('Make this participant a co-host?')) {
      meetingService.assignCoHost(participantId);
    }
  };

  const handleAdmit = (id, name) => {
    meetingService.admitParticipant(id, name);
  };

  const handleReject = (id) => {
    if (window.confirm('Reject this participant?')) {
      meetingService.rejectParticipant(id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="participant-list">
      <div className="participant-header">
        <h3>Participants ({participants.length})</h3>
        <button className="btn-close-panel" onClick={onClose} title="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {waitingRoom.length > 0 && isHost && (
        <div className="waiting-room-section">
          <div className="section-header">
            <h4>Waiting Room ({waitingRoom.length})</h4>
          </div>
          <div className="waiting-room-list">
            {waitingRoom.map((person) => (
              <div key={person.id} className="waiting-person">
                <div className="person-info">
                  <div className="person-avatar">
                    {person.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="person-name">{person.name}</span>
                </div>
                <div className="waiting-actions">
                  <button 
                    className="btn-admit"
                    onClick={() => handleAdmit(person.id, person.name)}
                    title="Admit"
                  >
                    ✓
                  </button>
                  <button 
                    className="btn-reject"
                    onClick={() => handleReject(person.id)}
                    title="Reject"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="participants-container">
        {participants.map((participant) => (
          <div key={participant.id} className="participant-item">
            <div className="participant-avatar">
              {participant.name.charAt(0).toUpperCase()}
              {participant.isSpeaking && (
                <div className="speaking-ring"></div>
              )}
            </div>
            
            <div className="participant-info">
              <div className="participant-name-row">
                <span className="participant-name">{participant.name}</span>
                {participant.isHost && (
                  <span className="badge badge-host">Host</span>
                )}
                {participant.isCoHost && (
                  <span className="badge badge-cohost">Co-host</span>
                )}
                {participant.id === 'local' && (
                  <span className="badge badge-you">You</span>
                )}
              </div>
              
              <div className="participant-status">
                {participant.isMuted && (
                  <span className="status-icon muted" title="Muted">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M3 3L21 21M15 9V5C15 3.34315 13.6569 2 12 2C10.3431 2 9 3.34315 9 5V9" stroke="currentColor" strokeWidth="2"/>
                      <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </span>
                )}
                {participant.isCameraOff && (
                  <span className="status-icon camera-off" title="Camera off">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M3 7C3 5.89543 3.89543 5 5 5H13C14.1046 5 15 5.89543 15 7V13" stroke="currentColor" strokeWidth="2"/>
                      <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </span>
                )}
                {participant.isHandRaised && (
                  <span className="status-icon hand-raised" title="Hand raised">
                    ✋
                  </span>
                )}
                {participant.isScreenSharing && (
                  <span className="status-icon screen-sharing" title="Screen sharing">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </span>
                )}
              </div>
            </div>

            {isHost && participant.id !== 'local' && (
              <div className="participant-actions">
                <button 
                  className="btn-action"
                  onClick={() => handleMuteParticipant(participant.id)}
                  title="Mute participant"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M3 3L21 21M15 9V5C15 3.34315 13.6569 2 12 2C10.3431 2 9 3.34315 9 5V9" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
                
                {!participant.isCoHost && (
                  <button 
                    className="btn-action"
                    onClick={() => handleMakeCoHost(participant.id)}
                    title="Make co-host"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                )}
                
                <button 
                  className="btn-action btn-remove"
                  onClick={() => handleRemoveParticipant(participant.id)}
                  title="Remove participant"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {meetingInfo && (
        <div className="meeting-stats">
          <div className="stat">
            <span className="stat-label">Duration:</span>
            <span className="stat-value">{formatDuration(meetingInfo.duration)}</span>
          </div>
          {meetingInfo.settings.isLocked && (
            <div className="stat">
              <span className="lock-badge">🔒 Meeting Locked</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
