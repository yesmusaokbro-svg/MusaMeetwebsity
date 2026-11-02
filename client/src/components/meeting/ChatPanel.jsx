import { useState, useRef, useEffect } from 'react';
import './ChatPanel.css';

function ChatPanel({ isOpen, onClose, currentUser = 'You', participants = [] }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'System',
      text: 'Welcome to the meeting! You can chat with other participants here.',
      timestamp: new Date(),
      type: 'system'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState('everyone'); // everyone or private
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showParticipantMenu, setShowParticipantMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (newMessage.trim() === '') return;
    
    if (messageType === 'private' && !selectedParticipant) {
      alert('Please select a participant to send a private message');
      return;
    }

    const message = {
      id: Date.now(),
      sender: currentUser,
      text: newMessage.trim(),
      timestamp: new Date(),
      type: messageType,
      recipient: messageType === 'private' ? selectedParticipant : null,
      isOwn: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // In real implementation, this would send via WebRTC data channel or WebSocket
    console.log('Message sent:', message);
  };

  const handleSelectParticipant = (participant) => {
    setSelectedParticipant(participant);
    setMessageType('private');
    setShowParticipantMenu(false);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div className="chat-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>Meeting Chat</h3>
          <span className="message-count">{messages.length - 1}</span>
        </div>
        <button className="chat-close-btn" onClick={onClose} title="Close chat">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="chat-messages">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`message ${message.type} ${message.isOwn ? 'own' : ''}`}
          >
            {message.type === 'system' ? (
              <div className="system-message">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>{message.text}</span>
              </div>
            ) : (
              <>
                <div className="message-header">
                  <span className="message-sender">{message.sender}</span>
                  <span className="message-time">{formatTime(message.timestamp)}</span>
                </div>
                <div className="message-content">
                  {message.type === 'private' && (
                    <span className="private-badge">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
                        <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Private to {message.recipient?.name || 'Host'}
                    </span>
                  )}
                  {message.text}
                </div>
              </>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-container" onSubmit={handleSendMessage}>
        <div className="message-type-selector">
          <button
            type="button"
            className={`type-btn ${messageType === 'everyone' ? 'active' : ''}`}
            onClick={() => {
              setMessageType('everyone');
              setSelectedParticipant(null);
            }}
            title="Send to everyone"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Everyone
          </button>
          <div className="private-selector">
            <button
              type="button"
              className={`type-btn ${messageType === 'private' ? 'active' : ''}`}
              onClick={() => setShowParticipantMenu(!showParticipantMenu)}
              title="Send privately"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {selectedParticipant ? selectedParticipant.name : 'Private'}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ marginLeft: '4px' }}>
                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            {showParticipantMenu && participants.length > 0 && (
              <div className="participant-menu">
                <div className="participant-menu-header">Select Participant</div>
                {participants.map(participant => (
                  <button
                    key={participant.id}
                    className={`participant-option ${selectedParticipant?.id === participant.id ? 'active' : ''}`}
                    onClick={() => handleSelectParticipant(participant)}
                  >
                    <div className="participant-avatar" style={{ background: participant.color }}>
                      {participant.name.charAt(0)}
                    </div>
                    <div className="participant-info">
                      <span className="participant-name">
                        {participant.name}
                        {participant.isHost && <span className="host-badge">Host</span>}
                      </span>
                      <span className="participant-status">{participant.status}</span>
                    </div>
                    {selectedParticipant?.id === participant.id && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="chat-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={
              messageType === 'everyone' 
                ? 'Message everyone...' 
                : selectedParticipant 
                  ? `Private message to ${selectedParticipant.name}...`
                  : 'Select a participant for private message...'
            }
            className="chat-input"
          />
          <button 
            type="submit" 
            className="send-btn"
            disabled={newMessage.trim() === ''}
            title="Send message"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatPanel;
