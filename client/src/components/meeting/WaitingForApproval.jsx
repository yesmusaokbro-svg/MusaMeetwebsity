import { useEffect, useState } from 'react';
import './WaitingForApproval.css';

function WaitingForApproval({ hostName, onCancel }) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="waiting-overlay">
      <div className="waiting-container">
        <div className="waiting-icon">
          <div className="waiting-spinner"></div>
          <span className="waiting-emoji">🚪</span>
        </div>
        
        <h2 className="waiting-title">Waiting for Host Approval</h2>
        
        <p className="waiting-message">
          <strong>{hostName}</strong> will let you in soon{dots}
        </p>
        
        <div className="waiting-tips">
          <p className="tip-title">While you wait:</p>
          <ul>
            <li>✓ Check your camera and microphone</li>
            <li>✓ Ensure good lighting</li>
            <li>✓ Test your internet connection</li>
          </ul>
        </div>

        <button 
          className="cancel-waiting-btn" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onCancel();
          }}
          style={{ pointerEvents: 'auto', userSelect: 'none' }}
        >
          Leave Meeting
        </button>
      </div>
    </div>
  );
}

export default WaitingForApproval;
