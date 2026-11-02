import { useState } from 'react';
import { backgroundCategories } from '../../data/backgroundLibrary';
import './BackgroundSelector.css';

function BackgroundSelector({ onSelect, currentBackground, onClose }) {
  const [activeCategory, setActiveCategory] = useState('office');
  const [uploadedImage, setUploadedImage] = useState(null);

  const handleBackgroundSelect = (background) => {
    onSelect({
      type: 'virtual',
      url: background.url,
      id: background.id,
      name: background.name
    });
  };

  const handleBlurSelect = (amount) => {
    onSelect({
      type: 'blur',
      amount,
      id: `blur-${amount}`,
      name: `Blur (${amount}px)`
    });
  };

  const handleOriginalSelect = () => {
    onSelect({
      type: 'none',
      id: 'original',
      name: 'Original'
    });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        setUploadedImage(imageUrl);
        onSelect({
          type: 'virtual',
          url: imageUrl,
          id: 'custom-upload',
          name: 'Custom Background'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="background-selector-overlay" onClick={onClose}>
      <div className="background-selector-panel" onClick={(e) => e.stopPropagation()}>
        <div className="background-selector-header">
          <h3>Virtual Backgrounds</h3>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Quick options */}
        <div className="quick-options">
          <button 
            className={`quick-option ${currentBackground === 'original' ? 'active' : ''}`}
            onClick={handleOriginalSelect}
          >
            <div className="quick-preview original">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V9L15 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 3V9H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Original</span>
          </button>

          <button 
            className={`quick-option ${currentBackground === 'blur-10' ? 'active' : ''}`}
            onClick={() => handleBlurSelect(10)}
          >
            <div className="quick-preview blur">
              <div className="blur-demo light"></div>
            </div>
            <span>Light Blur</span>
          </button>

          <button 
            className={`quick-option ${currentBackground === 'blur-20' ? 'active' : ''}`}
            onClick={() => handleBlurSelect(20)}
          >
            <div className="quick-preview blur">
              <div className="blur-demo strong"></div>
            </div>
            <span>Strong Blur</span>
          </button>

          <label className="quick-option upload-option">
            <div className="quick-preview upload">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {uploadedImage && <img src={uploadedImage} alt="Uploaded" />}
            </div>
            <span>Upload</span>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {/* Category tabs */}
        <div className="category-tabs">
          {Object.entries(backgroundCategories).map(([key, category]) => (
            <button
              key={key}
              className={`category-tab ${activeCategory === key ? 'active' : ''}`}
              onClick={() => setActiveCategory(key)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
            </button>
          ))}
        </div>

        {/* Background grid */}
        <div className="backgrounds-grid">
          {backgroundCategories[activeCategory]?.backgrounds.map((bg) => (
            <button
              key={bg.id}
              className={`background-item ${currentBackground === bg.id ? 'active' : ''}`}
              onClick={() => handleBackgroundSelect(bg)}
              title={bg.description}
            >
              <div className="background-thumbnail">
                <img 
                  src={bg.thumbnail} 
                  alt={bg.name}
                  onError={(e) => {
                    // Use fallback gradient if image fails to load
                    if (bg.fallback && e.target.src !== bg.fallback) {
                      e.target.src = bg.fallback;
                    }
                  }}
                  loading="lazy"
                />
                {currentBackground === bg.id && (
                  <div className="selected-indicator">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="background-name">{bg.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BackgroundSelector;
