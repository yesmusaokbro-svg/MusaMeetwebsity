import { useState } from 'react';
import VideoPreview from './VideoPreview';
import './HeroSection.css';

function HeroSection({ onNewMeeting, onJoinMeeting }) {
  const [meetingCode, setMeetingCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  const generateMeetingCode = () => {
    // Generate a random 10-character meeting code
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    let code = '';
    
    // Format: abc-defg-hij (3-4-3 pattern)
    for (let i = 0; i < 3; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    code += '-';
    for (let i = 0; i < 4; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    code += '-';
    for (let i = 0; i < 3; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return code;
  };

  const handleNewMeeting = () => {
    const newCode = generateMeetingCode();
    setGeneratedCode(newCode);
    console.log('New meeting created with code:', newCode);
    
    // Navigate to meeting room if callback is provided
    if (onNewMeeting) {
      onNewMeeting(newCode);
    }
  };

  const handleJoinMeeting = () => {
    if (meetingCode.trim()) {
      console.log('Joining meeting with code:', meetingCode);
      
      // Navigate to meeting room if callback is provided
      if (onJoinMeeting) {
        onJoinMeeting(meetingCode.trim());
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && meetingCode.trim()) {
      handleJoinMeeting();
    }
  };

  return (
    <section className="hero-section">
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title">Video meetings made simple</h1>
          <p className="hero-description">
            Connect with anyone, anywhere. Start or join secure video meetings with just a click.
          </p>
          
          <div className="hero-actions">
            <button className="btn-new-meeting" onClick={handleNewMeeting}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path 
                  d="M3 8C3 6.11438 3 5.17157 3.58579 4.58579C4.17157 4 5.11438 4 7 4H10C11.8856 4 12.8284 4 13.4142 4.58579C14 5.17157 14 6.11438 14 8V12C14 13.8856 14 14.8284 13.4142 15.4142C12.8284 16 11.8856 16 10 16H7C5.11438 16 4.17157 16 3.58579 15.4142C3 14.8284 3 13.8856 3 12V8Z" 
                  fill="currentColor" 
                />
                <path 
                  d="M14.5 7.5L16.7929 5.20711C17.474 4.526 18 4.65843 18 5.58579V14.4142C18 15.3416 17.474 15.474 16.7929 14.7929L14.5 12.5" 
                  fill="currentColor" 
                />
              </svg>
              New meeting
            </button>
            
            <div className="meeting-join">
              <input
                type="text"
                placeholder="Enter meeting code"
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
                onKeyPress={handleKeyPress}
                className="meeting-code-input"
              />
              <button 
                className="btn-join" 
                onClick={handleJoinMeeting}
                disabled={!meetingCode.trim()}
              >
                Join
              </button>
            </div>
            
            {generatedCode && (
              <div style={{ 
                marginTop: '16px', 
                padding: '12px 16px', 
                background: 'var(--accent-bg)', 
                borderRadius: '8px',
                fontSize: '14px',
                color: 'var(--text)'
              }}>
                <strong>Your meeting code:</strong> <code style={{ 
                  background: 'var(--code-bg)', 
                  padding: '2px 6px', 
                  borderRadius: '4px',
                  fontFamily: 'var(--mono)',
                  color: 'var(--accent)'
                }}>{generatedCode}</code>
              </div>
            )}
          </div>
        </div>

        <VideoPreview />
      </div>
    </section>
  );
}

export default HeroSection;
