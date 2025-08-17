import React, { useState, useEffect } from 'react';

// --- Styles for the Panel and its components ---
const panelStyles = {
  position: 'fixed', top: 0, right: 0, zIndex: 1001,
  height: '100%',
  backgroundColor: 'rgba(28, 28, 32, 0.95)',
  color: '#f0f0f0',
  boxShadow: '-5px 0px 20px rgba(0,0,0,0.5)',
  backdropFilter: 'blur(8px)',
  transform: 'translateX(100%)', transition: 'transform 0.3s ease-in-out',
  fontFamily: 'sans-serif',
  boxSizing: 'border-box',
  display: 'flex',
};
const panelVisibleStyles = { transform: 'translateX(0)' };

const resizerHandleStyles = {
  width: '10px',
  height: '100%',
  cursor: 'col-resize',
  backgroundColor: 'rgba(100, 100, 100, 0.2)',
  flexShrink: 0,
};
const resizerHandleHoverStyles = {
  backgroundColor: 'rgba(0, 150, 255, 0.5)',
};

const contentContainerStyles = {
  flexGrow: 1,
  height: '100%',
  overflowY: 'auto',
  padding: '20px',
  boxSizing: 'border-box',
};

const headerStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid #444',
  paddingBottom: '10px',
  marginBottom: '15px',
};

const closeButtonStyles = {
  background: 'none',
  border: 'none',
  color: '#aaa',
  fontSize: '28px',
  cursor: 'pointer',
  lineHeight: '1',
  padding: '0 5px',
};

// Image container
const imageContainerStyles = {
  width: '100%',
  maxWidth: '280px',
  margin: '0 auto 15px auto',
  backgroundColor: '#333',
  borderRadius: '5px',
  overflow: 'hidden',
  aspectRatio: '16 / 9',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const imageStyles = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const placeholderStyles = {
  color: '#888',
  fontSize: '24px',
};

const infoListStyles = { listStyle: 'none', padding: 0, margin: 0 };
const listItemStyles = { marginBottom: '10px', fontSize: '15px' };

export default function SatelliteInfoPanel({ satellite, onClose }) {
  const isVisible = satellite !== null;
  const [panelWidth, setPanelWidth] = useState(350);
  const [isResizing, setIsResizing] = useState(false);
  const [isHandleHovered, setIsHandleHovered] = useState(false);

  // Resizing logic
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      const minWidth = 300;
      const maxWidth = window.innerWidth / 2;
      if (newWidth > minWidth && newWidth < maxWidth) {
        setPanelWidth(newWidth);
      }
    };
    const handleMouseUp = () => setIsResizing(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const combinedStyles = { ...panelStyles, width: `${panelWidth}px`, ...(isVisible && panelVisibleStyles) };
  const handleStyles = { ...resizerHandleStyles, ...(isHandleHovered && resizerHandleHoverStyles) };

  return (
    <div style={combinedStyles}>
      {/* Resizer handle */}
      <div
        style={handleStyles}
        onMouseDown={(e) => { e.preventDefault(); setIsResizing(true); }}
        onMouseEnter={() => setIsHandleHovered(true)}
        onMouseLeave={() => setIsHandleHovered(false)}
      />

      {/* Content */}
      <div style={contentContainerStyles}>
        {satellite && (
          <>
            <div style={headerStyles}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>{satellite.name}</h2>
              <button style={closeButtonStyles} onClick={onClose}>&times;</button>
            </div>

            <div style={imageContainerStyles}>
              {satellite.imageUrl
                ? <img src={satellite.imageUrl} alt={satellite.name} style={imageStyles} />
                : <span style={placeholderStyles}>No Image</span>
              }
            </div>

            <ul style={infoListStyles}>
              <li style={listItemStyles}><strong>NORAD ID:</strong> {satellite.noradId}</li>
              <li style={listItemStyles}><strong>Latitude:</strong> {satellite.lat.toFixed(4)}</li>
              <li style={listItemStyles}><strong>Longitude:</strong> {satellite.lon.toFixed(4)}</li>
              {typeof satellite.speed === 'number' && <li style={listItemStyles}><strong>Speed:</strong> {satellite.speed.toFixed(2)} km/s</li>}
            </ul>

            {/* Mission and About + AI Link */}
            <h3 style={{ marginTop: '20px', borderBottom: '1px solid #444', paddingBottom: '5px' }}>Mission and About</h3>
            <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
              {satellite.description || 'No description available.'}{' '}
              {satellite.name && (
                <a
                  href={`https://chat.openai.com/?prompt=${encodeURIComponent(`Give me information about the satellite ${satellite.name}, it's Norad ID is ${satellite.noradId}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#1e90ff', textDecoration: 'underline' }}
                >
                  via AI
                </a>

              )}
            </p>
          </>
        )}
      </div>
    </div>
  );
}