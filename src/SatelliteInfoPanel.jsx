import React, { useState, useEffect } from 'react';

// --- Styles for the Panel and its components ---

const panelStyles = {
  position: 'fixed', top: 0, right: 0, zIndex: 1001,
  height: '100%',
  backgroundColor: 'rgba(28, 28, 32, 0.95)', color: '#f0f0f0',
  boxShadow: '-5px 0px 20px rgba(0,0,0,0.5)',
  backdropFilter: 'blur(8px)',
  transform: 'translateX(100%)', transition: 'transform 0.3s ease-in-out',
  fontFamily: 'sans-serif',
  boxSizing: 'border-box',
  display: 'flex', // Use flexbox to manage the handle and content
};
const panelVisibleStyles = { transform: 'translateX(0)' };

const resizerHandleStyles = {
  width: '10px',
  height: '100%',
  cursor: 'col-resize',
  backgroundColor: 'rgba(100, 100, 100, 0.2)',
  flexShrink: 0, // Ensure the handle itself doesn't shrink
};
const resizerHandleHoverStyles = {
  backgroundColor: 'rgba(0, 150, 255, 0.5)',
};

const contentContainerStyles = {
  flexGrow: 1, // The content area will fill all available space
  height: '100%',
  overflowY: 'auto', // Add a scrollbar if content overflows
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

// This container ensures the image is centered and has a max width
const imageContainerStyles = {
  width: '100%',
  maxWidth: '280px',
  margin: '0 auto 15px auto', // Center the container
  backgroundColor: '#333',
  borderRadius: '5px',
  overflow: 'hidden',
  aspectRatio: '16 / 9',
};

// This ensures the image fills its container without stretching
const imageStyles = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const infoListStyles = { listStyle: 'none', padding: 0, margin: 0 };
const listItemStyles = { marginBottom: '10px', fontSize: '15px' };


export default function SatelliteInfoPanel({ satellite, onClose }) {
  const isVisible = satellite !== null;
  const [panelWidth, setPanelWidth] = useState(350);
  const [isResizing, setIsResizing] = useState(false);

  // The resizing logic is unchanged and correct
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

  const [isHandleHovered, setIsHandleHovered] = useState(false);

  const combinedStyles = { ...panelStyles, width: `${panelWidth}px`, ...(isVisible && panelVisibleStyles) };
  const handleStyles = { ...resizerHandleStyles, ...(isHandleHovered && resizerHandleHoverStyles) };

  return (
    <div style={combinedStyles}>
      {/* The resizer handle */}
      <div 
        style={handleStyles}
        onMouseDown={(e) => { e.preventDefault(); setIsResizing(true); }}
        onMouseEnter={() => setIsHandleHovered(true)}
        onMouseLeave={() => setIsHandleHovered(false)}
      />
      
      {/* The main content area that holds everything else */}
      <div style={contentContainerStyles}>
        {/* Only render the content if a satellite is selected */}
        {satellite && (
          <>
            <div style={headerStyles}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>{satellite.name}</h2>
              <button style={closeButtonStyles} onClick={onClose}>&times;</button>
            </div>

            {satellite.imageUrl && (
              <div style={imageContainerStyles}>
                <img src={satellite.imageUrl} alt={satellite.name} style={imageStyles} />
              </div>
            )}

            <ul style={infoListStyles}>
              <li style={listItemStyles}><strong>NORAD ID:</strong> {satellite.noradId}</li>
              <li style={listItemStyles}><strong>Latitude:</strong> {satellite.lat.toFixed(4)}</li>
              <li style={listItemStyles}><strong>Longitude:</strong> {satellite.lon.toFixed(4)}</li>
              {typeof satellite.speed === 'number' && <li style={listItemStyles}><strong>Speed:</strong> {satellite.speed.toFixed(2)} km/s</li>}
            </ul>

            {satellite.description && (
              <>
                <h3 style={{ marginTop: '20px', borderBottom: '1px solid #444', paddingBottom: '5px' }}>Mission and About</h3>
                <p style={{ fontSize: '14px', lineHeight: '1.6' }}>{satellite.description}</p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}