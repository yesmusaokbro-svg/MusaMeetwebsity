import './ParticipantsPanel.css';

function ParticipantsPanel({ isOpen, onClose, participants = [], currentUser = 'You' }) {
  if (!isOpen) return null;

  return (
    <div className="participants-panel">
      <div className="participants-header">
        <div className="participants-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>Participants</h3>
          <span className="participant-count">{participants.length}</span>
        </div>
        <button className="participants-close-btn" onClick={onClose} title="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="participants-list">
        {participants.map(participant => (
          <div key={participant.id} className="participant-item">
            <div className="participant-avatar-large" style={{ background: participant.color }}>
              {participant.name.charAt(0)}
            </div>
            <div className="participant-details">
              <div className="participant-name-row">
                <span className="participant-name-text">
                  {participant.name}
                  {participant.name === currentUser && ' (You)'}
                </span>
                {participant.isHost && (
                  <span className="host-badge-large">Host</span>
                )}
              </div>
              <div className="participant-status-row">
                <span className={`status-indicator ${participant.audioEnabled ? 'active' : 'muted'}`}>
                  {participant.audioEnabled ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <rect x="9" y="2" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="2"/>
                      <path d="M5 10V12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M3 3L21 21M17 17C15.8075 18.1925 14.0925 19 12 19C9.9075 19 8.1925 18.1925 7 17M15 9V5C15 3.34315 13.6569 2 12 2C10.3431 2 9 3.34315 9 5V9M12 15V19M9 12V9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  )}
                </span>
                <span className={`status-indicator ${participant.videoEnabled ? 'active' : 'muted'}`}>
                  {participant.videoEnabled ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="5" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M15 8.5L19.5 6V14L15 11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M3 7C3 5.89543 3.89543 5 5 5H13C14.1046 5 15 5.89543 15 7V13C15 14.1046 14.1046 15 13 15H5C3.89543 15 3 14.1046 3 13V7Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M15 8.5L19.5 6V14L15 11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  )}
                </span>
                {participant.isHandRaised && (
                  <span className="hand-raised-indicator" title="Hand raised">
                    ✋
                  </span>
                )}
                <span className="participant-status-text">{participant.status}</span>
              </div>
            </div>
            <div className="participant-actions">
              <button className="action-btn" title="More options">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                  <circle cx="12" cy="6" r="1.5" fill="currentColor"/>
                  <circle cx="12" cy="18" r="1.5" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ParticipantsPanel;
