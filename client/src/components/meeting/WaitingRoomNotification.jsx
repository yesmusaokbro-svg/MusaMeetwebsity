import { useState, useEffect } from 'react';
import './WaitingRoomNotification.css';

function WaitingRoomNotification({ requests, onApprove, onReject }) {
  const [expandedRequest, setExpandedRequest] = useState(null);

  if (!requests || requests.length === 0) {
    return null;
  }

  const getTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 10) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes === 1) return '1 min ago';
    return `${minutes} mins ago`;
  };

  return (
    <div className="waiting-room-notifications">
      {requests.length > 3 && (
        <div className="notification-summary">
          {requests.length} people waiting
        </div>
      )}
      
      {requests.slice(0, 5).map((request) => (
        <div key={request.socketId} className="waiting-room-notification">
          <div className="notification-content">
            <div className="notification-icon">🚪</div>
            <div className="notification-text">
              <div className="notification-name">
                <strong>{request.userName}</strong>
              </div>
              <span className="notification-time">
                {getTimeAgo(request.requestedAt)}
              </span>
            </div>
          </div>
          
          <div className="notification-actions">
            <button 
              className="approve-btn"
              onClick={() => onApprove(request.socketId)}
              title="Allow to join"
            >
              ✓ Admit
            </button>
            <button 
              className="reject-btn"
              onClick={() => onReject(request.socketId)}
              title="Deny entry"
            >
              ✗ Deny
            </button>
          </div>
        </div>
      ))}
      
      {requests.length > 5 && (
        <div className="notification-more">
          +{requests.length - 5} more waiting...
        </div>
      )}
    </div>
  );
}

export default WaitingRoomNotification;
