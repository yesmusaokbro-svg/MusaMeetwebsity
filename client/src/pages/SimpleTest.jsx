function SimpleTest() {
  return (
    <div style={{
      padding: '50px',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#333', fontSize: '48px' }}>
        ✅ React is Working!
      </h1>
      <p style={{ color: '#666', fontSize: '24px', marginTop: '20px' }}>
        If you see this, your app is running correctly.
      </p>
      <div style={{
        marginTop: '40px',
        padding: '30px',
        background: '#f0f0f0',
        borderRadius: '10px',
        maxWidth: '600px',
        margin: '40px auto'
      }}>
        <h2 style={{ color: '#5B7FFF' }}>Next Steps:</h2>
        <p style={{ fontSize: '18px', color: '#555' }}>
          Go to: <a href="/test" style={{ color: '#AA3BFF', fontWeight: 'bold' }}>/test</a>
        </p>
        <p style={{ fontSize: '18px', color: '#555', marginTop: '10px' }}>
          Or go directly to: <a href="/meeting/test123" style={{ color: '#AA3BFF', fontWeight: 'bold' }}>/meeting/test123</a>
        </p>
        <p style={{ fontSize: '18px', color: '#555', marginTop: '10px' }}>
          🚪 <strong>NEW!</strong> Try Waiting Room: <a href="/waiting-demo" style={{ color: '#10b981', fontWeight: 'bold' }}>/waiting-demo</a>
        </p>
      </div>
    </div>
  );
}

export default SimpleTest;
