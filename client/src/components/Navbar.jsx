import './Navbar.css';

function Navbar() {
  const handleSignIn = () => {
    console.log('Sign in clicked');
    alert('Sign in functionality coming soon!\n\n(This is a demo interface)');
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    console.log('Home clicked');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFeaturesClick = (e) => {
    e.preventDefault();
    console.log('Features clicked');
    alert('Features section coming soon!\n\nStay tuned for updates on our video meeting capabilities.');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="url(#gradient)" />
            <path d="M16 8L22 12V20L16 24L10 20V12L16 8Z" fill="white" />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32">
                <stop offset="0%" stopColor="#5B7FFF" />
                <stop offset="100%" stopColor="#AA3BFF" />
              </linearGradient>
            </defs>
          </svg>
          <span className="navbar-brand">MusaMeetwebsity</span>
        </div>
        <div className="navbar-links">
          <a href="#home" className="navbar-link" onClick={handleHomeClick}>Home</a>
          <a href="#features" className="navbar-link" onClick={handleFeaturesClick}>Features</a>
          <button className="navbar-signin" onClick={handleSignIn}>Sign in</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
