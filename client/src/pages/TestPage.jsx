import { useNavigate } from 'react-router-dom';

function TestPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      padding: '40px',
      maxWidth: '600px',
      margin: '0 auto',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        🎥 MusaMeetwebsity Test Page
      </h1>
      
      <p style={{ color: '#666', marginBottom: '30px', fontSize: '18px' }}>
        Choose an option to test the virtual backgrounds:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <button
          onClick={() => navigate('/meeting/test123')}
          style={{
            padding: '20px',
            fontSize: '18px',
            background: 'linear-gradient(135deg, #5B7FFF 0%, #AA3BFF 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          🚀 Go to Test Meeting Room
        </button>

        <button
          onClick={() => navigate('/')}
          style={{
            padding: '15px',
            fontSize: '16px',
            background: '#f0f0f0',
            color: '#333',
            border: '2px solid #ddd',
            borderRadius: '10px',
            cursor: 'pointer'
          }}
        >
          ← Back to Home
        </button>
      </div>

      <div style={{
        marginTop: '40px',
        padding: '20px',
        background: '#f8f9fa',
        borderRadius: '10px',
        borderLeft: '4px solid #AA3BFF'
      }}>
        <h3 style={{ color: '#333', marginTop: 0 }}>📝 Instructions:</h3>
        <ol style={{ color: '#666', lineHeight: '1.8' }}>
          <li>Click "Go to Test Meeting Room"</li>
          <li>Allow camera and microphone permissions</li>
          <li>Look for the <strong>background icon</strong> (landscape/image) in video overlay</li>
          <li>Click it to open virtual backgrounds</li>
          <li>Try blur or select any background!</li>
        </ol>
      </div>

      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: '#e3f2fd',
        borderRadius: '8px'
      }}>
        <strong style={{ color: '#1976d2' }}>💡 Tip:</strong>
        <span style={{ color: '#555', marginLeft: '10px' }}>
          Wave your hand to see the natural edge detection working!
        </span>
      </div>
    </div>
  );
}

export default TestPage;
