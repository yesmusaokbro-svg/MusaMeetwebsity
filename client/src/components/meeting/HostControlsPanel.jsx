import { useState } from 'react';
import './HostControlsPanel.css';

function HostControlsPanel({ isOpen, onClose, participants = [], isHost = true, currentUser = 'You' }) {
  const [permissions, setPermissions] = useState({
    allowUnmute: true,
    allowCamera: true,
    allowScreenShare: true,
    allowChat: true,
    allowPrivateChat: true,
    allowRaiseHand: true,
    allowReactions: true,
    allowRecording: false,
    allowJoinBeforeHost: false,
    waitingRoomEnabled: true,
    meetingLocked: false
  });

  const [waitingParticipants, setWaitingParticipants] = useState([
    {
      id: 'waiting-1',
      name: 'John Doe',
      requestedAt: new Date(Date.now() - 30000)
    },
    {
      id: 'waiting-2',
      name: 'Jane Smith',
      requestedAt: new Date(Date.now() - 15000)
    }
  ]);

  const handlePermissionChange = (permission) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: !prev[permission]
    }));
    console.log(`Permission ${permission} changed to: ${!permissions[permission]}`);
    // In real implementation, this would send to backend/WebRTC provider
  };

  const handleAdmitParticipant = (participantId) => {
    console.log(`Admitting participant: ${participantId}`);
    setWaitingParticipants(prev => prev.filter(p => p.id !== participantId));
    // In real implementation, send admission signal
    alert(`Participant ${waitingParticipants.find(p => p.id === participantId)?.name} admitted to meeting`);
  };

  const handleRejectParticipant = (participantId) => {
    console.log(`Rejecting participant: ${participantId}`);
    setWaitingParticipants(prev => prev.filter(p => p.id !== participantId));
    alert(`Participant ${waitingParticipants.find(p => p.id === participantId)?.name} rejected`);
  };

  const handleRemoveParticipant = (participantId) => {
    if (confirm('Are you sure you want to remove this participant from the meeting?')) {
      console.log(`Removing participant: ${participantId}`);
      // In real implementation, remove via WebRTC/backend
      alert('Participant removed (requires backend implementation)');
    }
  };

  const handleMuteParticipant = (participantId) => {
    console.log(`Muting participant: ${participantId}`);
    // In real implementation, send mute command
    alert('Participant muted (requires backend implementation)');
  };

  const handlePromoteToCoHost = (participantId) => {
    if (confirm('Promote this participant to co-host?')) {
      console.log(`Promoting participant to co-host: ${participantId}`);
      alert('Participant promoted to co-host (requires backend implementation)');
    }
  };

  const handleLockMeeting = () => {
    const newState = !permissions.meetingLocked;
    setPermissions(prev => ({ ...prev, meetingLocked: newState }));
    alert(newState ? 'Meeting locked. No new participants can join.' : 'Meeting unlocked.');
  };

  const handleEndMeeting = () => {
    if (confirm('End meeting for everyone? This cannot be undone.')) {
      console.log('Ending meeting for all participants');
      alert('Ending meeting for everyone (requires backend implementation)');
      // In real implementation: disconnect all participants, close meeting
    }
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  if (!isOpen) return null;

  if (!isHost) {
    return (
      <div className="host-controls-panel">
        <div className="host-controls-header">
          <h3>Host Controls</h3>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="no-access-message">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p>Only the meeting host can access these controls.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="host-controls-panel">
      <div className="host-controls-header">
        <div className="header-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M19.4 15C19.1277 15.6171 19.2583 16.3378 19.73 16.82L19.79 16.88C20.1656 17.2551 20.3766 17.7642 20.3766 18.295C20.3766 18.8258 20.1656 19.3349 19.79 19.71C19.4149 20.0856 18.9058 20.2966 18.375 20.2966C17.8442 20.2966 17.3351 20.0856 16.96 19.71L16.9 19.65C16.4178 19.1783 15.6971 19.0477 15.08 19.32C14.4755 19.5791 14.0826 20.1724 14.08 20.83V21C14.08 22.1046 13.1846 23 12.08 23C10.9754 23 10.08 22.1046 10.08 21V20.91C10.0642 20.2327 9.63587 19.6339 9 19.4C8.38291 19.1277 7.66219 19.2583 7.18 19.73L7.12 19.79C6.74486 20.1656 6.23582 20.3766 5.705 20.3766C5.17418 20.3766 4.66514 20.1656 4.29 19.79C3.91445 19.4149 3.70343 18.9058 3.70343 18.375C3.70343 17.8442 3.91445 17.3351 4.29 16.96L4.35 16.9C4.82167 16.4178 4.95235 15.6971 4.68 15.08C4.42093 14.4755 3.82764 14.0826 3.17 14.08H3C1.89543 14.08 1 13.1846 1 12.08C1 10.9754 1.89543 10.08 3 10.08H3.09C3.76733 10.0642 4.36613 9.63587 4.6 9C4.87235 8.38291 4.74167 7.66219 4.27 7.18L4.21 7.12C3.83445 6.74486 3.62343 6.23582 3.62343 5.705C3.62343 5.17418 3.83445 4.66514 4.21 4.29C4.58514 3.91445 5.09418 3.70343 5.625 3.70343C6.15582 3.70343 6.66486 3.91445 7.04 4.29L7.1 4.35C7.58219 4.82167 8.30291 4.95235 8.92 4.68H9C9.60447 4.42093 9.99738 3.82764 10 3.17V3C10 1.89543 10.8954 1 12 1C13.1046 1 14 1.89543 14 3V3.09C14.0026 3.74764 14.3955 4.34093 15 4.6C15.6171 4.87235 16.3378 4.74167 16.82 4.27L16.88 4.21C17.2551 3.83445 17.7642 3.62343 18.295 3.62343C18.8258 3.62343 19.3349 3.83445 19.71 4.21C20.0856 4.58514 20.2966 5.09418 20.2966 5.625C20.2966 6.15582 20.0856 6.66486 19.71 7.04L19.65 7.1C19.1783 7.58219 19.0477 8.30291 19.32 8.92V9C19.5791 9.60447 20.1724 9.99738 20.83 10H21C22.1046 10 23 10.8954 23 12C23 13.1046 22.1046 14 21 14H20.91C20.2524 14.0026 19.6591 14.3955 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>Host Controls</h3>
          <span className="host-badge-pill">Host</span>
        </div>
        <button className="close-btn" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="host-controls-content">
        {/* Waiting Room */}
        {permissions.waitingRoomEnabled && waitingParticipants.length > 0 && (
          <div className="control-section waiting-room">
            <div className="section-header">
              <h4>Waiting Room</h4>
              <span className="count-badge">{waitingParticipants.length}</span>
            </div>
            <div className="waiting-list">
              {waitingParticipants.map(participant => (
                <div key={participant.id} className="waiting-participant">
                  <div className="waiting-participant-info">
                    <div className="waiting-avatar">
                      {participant.name.charAt(0)}
                    </div>
                    <div>
                      <div className="waiting-name">{participant.name}</div>
                      <div className="waiting-time">{formatTimeAgo(participant.requestedAt)}</div>
                    </div>
                  </div>
                  <div className="waiting-actions">
                    <button 
                      className="admit-btn"
                      onClick={() => handleAdmitParticipant(participant.id)}
                    >
                      Admit
                    </button>
                    <button 
                      className="reject-btn"
                      onClick={() => handleRejectParticipant(participant.id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meeting Permissions */}
        <div className="control-section">
          <div className="section-header">
            <h4>Meeting Permissions</h4>
          </div>
          <div className="permissions-list">
            <div className="permission-item">
              <div className="permission-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="9" y="2" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="2"/>
                  <path d="M5 10V12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Allow participants to unmute
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={permissions.allowUnmute}
                  onChange={() => handlePermissionChange('allowUnmute')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="permission-item">
              <div className="permission-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="5" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M15 8.5L19.5 6V14L15 11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Allow participants to turn on camera
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={permissions.allowCamera}
                  onChange={() => handlePermissionChange('allowCamera')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="permission-item">
              <div className="permission-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 21H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Allow screen sharing
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={permissions.allowScreenShare}
                  onChange={() => handlePermissionChange('allowScreenShare')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="permission-item">
              <div className="permission-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Allow chat messages
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={permissions.allowChat}
                  onChange={() => handlePermissionChange('allowChat')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="permission-item">
              <div className="permission-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Allow private messages
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={permissions.allowPrivateChat}
                  onChange={() => handlePermissionChange('allowPrivateChat')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="permission-item">
              <div className="permission-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M8 14V6C8 5.44772 8.44772 5 9 5C9.55228 5 10 5.44772 10 6V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M10 11V4C10 3.44772 10.4477 3 11 3C11.5523 3 12 3.44772 12 4V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Allow raise hand
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={permissions.allowRaiseHand}
                  onChange={() => handlePermissionChange('allowRaiseHand')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="permission-item">
              <div className="permission-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="9" y1="9" x2="9.01" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="15" y1="9" x2="15.01" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Allow emoji reactions
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={permissions.allowReactions}
                  onChange={() => handlePermissionChange('allowReactions')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="permission-item">
              <div className="permission-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="3" fill="currentColor"/>
                </svg>
                Allow recording
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={permissions.allowRecording}
                  onChange={() => handlePermissionChange('allowRecording')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Meeting Settings */}
        <div className="control-section">
          <div className="section-header">
            <h4>Meeting Settings</h4>
          </div>
          <div className="permissions-list">
            <div className="permission-item">
              <div className="permission-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M17 10H19C20.1046 10 21 10.8954 21 12V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V12C3 10.8954 3.89543 10 5 10H7" stroke="currentColor" strokeWidth="2"/>
                  <path d="M7 10V6C7 3.79086 8.79086 2 11 2H13C15.2091 2 17 3.79086 17 6V10" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Enable waiting room
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={permissions.waitingRoomEnabled}
                  onChange={() => handlePermissionChange('waitingRoomEnabled')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="permission-item">
              <div className="permission-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Allow join before host
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={permissions.allowJoinBeforeHost}
                  onChange={() => handlePermissionChange('allowJoinBeforeHost')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Participant Management */}
        <div className="control-section">
          <div className="section-header">
            <h4>Manage Participants</h4>
            <span className="count-badge">{participants.length}</span>
          </div>
          <div className="participants-manage-list">
            {participants.map(participant => (
              <div key={participant.id} className="manage-participant-item">
                <div className="manage-participant-info">
                  <div className="manage-avatar" style={{ background: participant.color }}>
                    {participant.name.charAt(0)}
                  </div>
                  <div className="manage-details">
                    <div className="manage-name">
                      {participant.name}
                      {participant.isHost && <span className="host-badge-small">Host</span>}
                    </div>
                    <div className="manage-status">
                      <span className={participant.audioEnabled ? 'status-on' : 'status-off'}>
                        {participant.audioEnabled ? '🎤' : '🔇'}
                      </span>
                      <span className={participant.videoEnabled ? 'status-on' : 'status-off'}>
                        {participant.videoEnabled ? '📹' : '📷'}
                      </span>
                    </div>
                  </div>
                </div>
                {!participant.isHost && (
                  <div className="manage-actions">
                    <button 
                      className="action-icon-btn"
                      onClick={() => handleMuteParticipant(participant.id)}
                      title="Mute participant"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M3 3L21 21M17 17C15.8075 18.1925 14.0925 19 12 19C9.9075 19 8.1925 18.1925 7 17M15 9V5C15 3.34315 13.6569 2 12 2C10.3431 2 9 3.34315 9 5V9M12 15V19M9 12V9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                    <button 
                      className="action-icon-btn"
                      onClick={() => handlePromoteToCoHost(participant.id)}
                      title="Promote to co-host"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button 
                      className="action-icon-btn danger"
                      onClick={() => handleRemoveParticipant(participant.id)}
                      title="Remove from meeting"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Meeting Actions */}
        <div className="control-section danger-zone">
          <div className="section-header">
            <h4>Meeting Actions</h4>
          </div>
          <div className="action-buttons">
            <button 
              className={`action-button ${permissions.meetingLocked ? 'active-locked' : ''}`}
              onClick={handleLockMeeting}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {permissions.meetingLocked ? 'Unlock Meeting' : 'Lock Meeting'}
            </button>
            <button 
              className="action-button danger"
              onClick={handleEndMeeting}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 5C3 3.89543 3.89543 3 5 3H8C9.10457 3 10 3.89543 10 5V9L7 10C7 13 9 16 12 16C15 16 17 13 17 10L14 9V5C14 3.89543 14.8954 3 16 3H19C20.1046 3 21 3.89543 21 5V9C21 15.0751 16.0751 20 10 20H9C6.23858 20 4 17.7614 4 15V5H3Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
              End Meeting for Everyone
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HostControlsPanel;
