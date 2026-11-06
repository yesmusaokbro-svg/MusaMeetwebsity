import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import webrtcService from '../services/webrtcService';
import WaitingRoomNotification from '../components/meeting/WaitingRoomNotification';
import WaitingForApproval from '../components/meeting/WaitingForApproval';
import './WaitingRoomDemo.css';

function WaitingRoomDemo() {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'host' or 'participant'
  const [isInMeeting, setIsInMeeting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [joinRequests, setJoinRequests] = useState([]);
  const [userName, setUserName] = useState('');
  const [meetingId] = useState('demo123');

  useEffect(() => {
    webrtcService.connect();

    const handleConnected = () => {
      setIsConnected(true);
    };

    const handleJoinRequest = (data) => {
      console.log('Join request received:', data);
      setJoinRequests(prev => [...prev, data]);
      
      // Play notification sound (optional)
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDGN2vLTgjMGHm7A7+OZUA0PVqzn77BdGAg+luLyxmwjBSuEz/LZkjsIFmO48+mnVBELTKXh8bllHAY2kNXyzoU1Bhhr');
      audio.play().catch(() => {});
    };

    const handleWaitingForApproval = (data) => {
      console.log('Waiting for approval:', data);
      setIsWaiting(true);
    };

    const handleJoinApproved = (data) => {
      console.log('Join approved:', data);
      setIsWaiting(false);
      setIsInMeeting(true);
      if (data.isHost) {
        setUserRole('host');
      } else {
        setUserRole('participant');
      }
      
      // Actually join the meeting
      const userId = 'user-' + Date.now();
      webrtcService.joinMeeting(meetingId, userId, userName, data.isHost);
    };

    const handleJoinRejected = (data) => {
      alert(data.reason);
      setIsWaiting(false);
      setUserName('');
    };

    webrtcService.on('connected', handleConnected);
    webrtcService.on('join-request', handleJoinRequest);
    webrtcService.on('waiting-for-approval', handleWaitingForApproval);
    webrtcService.on('join-approved', handleJoinApproved);
    webrtcService.on('join-rejected', handleJoinRejected);

    return () => {
      webrtcService.off('connected', handleConnected);
      webrtcService.off('join-request', handleJoinRequest);
      webrtcService.off('waiting-for-approval', handleWaitingForApproval);
      webrtcService.off('join-approved', handleJoinApproved);
      webrtcService.off('join-rejected', handleJoinRejected);
    };
  }, [meetingId, userName]);

  const handleJoinClick = () => {
    if (!userName.trim()) {
      alert('Please enter your name');
      return;
    }

    const userId = 'user-' + Date.now();
    webrtcService.requestJoinMeeting(meetingId, userId, userName);
  };

  const handleApprove = (socketId) => {
    webrtcService.approveParticipant(meetingId, socketId);
    setJoinRequests(prev => prev.filter(req => req.socketId !== socketId));
  };

  const handleReject = (socketId) => {
    webrtcService.rejectParticipant(meetingId, socketId, 'Host denied your request');
    setJoinRequests(prev => prev.filter(req => req.socketId !== socketId));
  };

  const handleCancelWaiting = () => {
    setIsWaiting(false);
    setUserName('');
    webrtcService.disconnect();
    setTimeout(() => webrtcService.connect(), 100);
  };

  if (!isConnected) {
    return (
      <div className="waiting-demo-page">
        <div className="demo-container">
          <h1>Connecting to server...</h1>
        </div>
      </div>
    );
  }

  if (isWaiting) {
    return (
      <WaitingForApproval 
        hostName="Meeting Host" 
        onCancel={handleCancelWaiting}
      />
    );
  }

  if (isInMeeting) {
    return (
      <div className="waiting-demo-page">
        {userRole === 'host' && (
          <WaitingRoomNotification 
            requests={joinRequests}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
        
        <div className="demo-container meeting-active">
          <div className="meeting-badge">
            {userRole === 'host' ? '👑 You are the HOST' : '✅ You are in the meeting'}
          </div>
          
          <h1>Welcome, {userName}!</h1>
          
          {userRole === 'host' ? (
            <div className="host-info">
              <h2>🎯 You're the Host!</h2>
              <p>When new participants try to join, you'll see a notification at the top-right.</p>
              <p>You can <strong>Admit</strong> or <strong>Deny</strong> their entry.</p>
              
              <div className="test-instruction">
                <h3>To test this feature:</h3>
                <ol>
                  <li>Keep this window open</li>
                  <li>Open an <strong>incognito/private window</strong></li>
                  <li>Go to: <code>http://localhost:5174/waiting-demo</code></li>
                  <li>Enter a different name and try to join</li>
                  <li>Watch for the notification popup here! 🔔</li>
                </ol>
              </div>

              {joinRequests.length > 0 && (
                <div className="pending-requests">
                  <h3>⏳ Pending Requests: {joinRequests.length}</h3>
                </div>
              )}
            </div>
          ) : (
            <div className="participant-info">
              <h2>🎉 You're In!</h2>
              <p>The host approved your request to join the meeting.</p>
              <p>In a real meeting, you'd see video feeds here.</p>
            </div>
          )}

          <button 
            className="leave-btn"
            onClick={() => window.location.reload()}
          >
            Leave Meeting
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="waiting-demo-page">
      <div className="demo-container">
        <h1>🚪 Waiting Room Demo</h1>
        <p className="demo-subtitle">Try the host approval feature</p>

        <div className="join-form">
          <input
            type="text"
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleJoinClick()}
            className="name-input"
            autoFocus
          />
          
          <button 
            className="join-btn"
            onClick={handleJoinClick}
            disabled={!userName.trim()}
          >
            Join Meeting
          </button>
        </div>

        <div className="info-box">
          <h3>ℹ️ How it works:</h3>
          <ul>
            <li><strong>First person</strong> to join becomes the <strong>HOST</strong></li>
            <li><strong>Other participants</strong> must wait for host approval</li>
            <li>Host can <strong>admit</strong> or <strong>deny</strong> entry</li>
            <li>Open 2 windows to test (one normal, one incognito)</li>
          </ul>
        </div>

        <button 
          className="back-btn"
          onClick={() => navigate('/')}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

export default WaitingRoomDemo;
