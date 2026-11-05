import './WelcomeModal.css';

function WelcomeModal({ isHost, userName, meetingId, onClose }) {
  const handleCopyLink = () => {
    const link = `${window.location.origin}/meeting/${meetingId}`;
    navigator.clipboard.writeText(link).then(() => {
      alert(`Meeting link copied!\n\n${link}\n\nShare this with others to invite them.`);
    });
  };

  return (
    <div className="welcome-modal-overlay" onClick={onClose}>
      <div className="welcome-modal" onClick={(e) => e.stopPropagation()}>
        <div className="welcome-header">
          <h2>Welcome to the Meeting!</h2>
        </div>

        <div className="welcome-content">
          <div className="user-role">
            {isHost ? (
              <>
                <div className="role-icon host-icon">👑</div>
                <h3>You are the Host</h3>
                <p className="role-description">
                  You joined first, so you're the meeting host!
                </p>
              </>
            ) : (
              <>
                <div className="role-icon participant-icon">👤</div>
                <h3>You are a Participant</h3>
                <p className="role-description">
                  Welcome! The host has full control of the meeting.
                </p>
              </>
            )}
          </div>

          <div className="user-info">
            <p><strong>Your name:</strong> {userName}</p>
            <p><strong>Meeting ID:</strong> {meetingId}</p>
          </div>

          <div className="permissions-section">
            <h4>{isHost ? 'Your Permissions (Host):' : 'Your Permissions (Participant):'}</h4>
            <div className="permissions-grid">
              <div className="permission-item">
                <span className="permission-icon">✅</span>
                <span>Microphone control</span>
              </div>
              <div className="permission-item">
                <span className="permission-icon">✅</span>
                <span>Camera control</span>
              </div>
              <div className="permission-item">
                <span className="permission-icon">✅</span>
                <span>Virtual backgrounds</span>
              </div>
              <div className="permission-item">
                <span className="permission-icon">✅</span>
                <span>Chat messages</span>
              </div>
              <div className="permission-item">
                <span className="permission-icon">✅</span>
                <span>Raise hand</span>
              </div>
              
              {isHost ? (
                <>
                  <div className="permission-item">
                    <span className="permission-icon">✅</span>
                    <span>Screen sharing</span>
                  </div>
                  <div className="permission-item">
                    <span className="permission-icon">✅</span>
                    <span>Recording</span>
                  </div>
                  <div className="permission-item">
                    <span className="permission-icon">✅</span>
                    <span>Manage participants</span>
                  </div>
                  <div className="permission-item">
                    <span className="permission-icon">✅</span>
                    <span>End meeting</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="permission-item disabled">
                    <span className="permission-icon">❌</span>
                    <span>Screen sharing (Host only)</span>
                  </div>
                  <div className="permission-item disabled">
                    <span className="permission-icon">❌</span>
                    <span>Recording (Host only)</span>
                  </div>
                  <div className="permission-item disabled">
                    <span className="permission-icon">❌</span>
                    <span>Manage participants (Host only)</span>
                  </div>
                  <div className="permission-item disabled">
                    <span className="permission-icon">❌</span>
                    <span>End meeting (Host only)</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {isHost && (
            <div className="host-actions">
              <h4>Invite Others:</h4>
              <button className="btn-copy-link" onClick={handleCopyLink}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M8 16H6C4.89543 16 4 15.1046 4 14V6C4 4.89543 4.89543 4 6 4H14C15.1046 4 16 4.89543 16 6V8M10 20H18C19.1046 20 20 19.1046 20 18V10C20 8.89543 19.1046 8 18 8H10C8.89543 8 8 8.89543 8 10V18C8 19.1046 8.89543 20 10 20Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Copy Meeting Link
              </button>
              <p className="invite-note">Share this link with anyone you want to invite</p>
            </div>
          )}
        </div>

        <div className="welcome-footer">
          <button className="btn-continue" onClick={onClose}>
            Continue to Meeting
          </button>
        </div>
      </div>
    </div>
  );
}

export default WelcomeModal;
