// src/SearchBar.jsx
import React, { useState } from 'react';

const searchBarStyles = {
  position: 'fixed',
  top: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 1001,
  backgroundColor: 'rgba(28, 28, 32, 0.9)',
  padding: '8px 15px',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  backdropFilter: 'blur(5px)',
  gap: '10px',
};

const inputStyles = {
  background: 'none',
  border: 'none',
  color: '#f0f0f0',
  fontSize: '16px',
  outline: 'none',
  width: '250px',
};

const buttonStyles = {
  background: '#007bff',
  border: 'none',
  color: 'white',
  padding: '8px 12px',
  borderRadius: '5px',
  cursor: 'pointer',
};

const clearButtonStyles = {
  ...buttonStyles,
  background: '#6c757d',
};

export default function SearchBar({ onSearch, onClear, highlightedId }) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleSearch = () => {
    const noradId = parseInt(inputValue.trim(), 10);
    if (!isNaN(noradId)) {
      const success = onSearch(noradId); // now returns true/false
      if (!success) {
        setError('❌ Invalid NORAD ID');
      } else {
        setError('');
      }
    } else {
      setError('❌ Please enter an ID number');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleClear = () => {
    setInputValue('');
    setError('');
    onClear();
  };

  return (
    <div style={searchBarStyles}>
      <input
        type="text"
        name="norad-id-search"
        style={inputStyles}
        placeholder="Search by NORAD ID"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <button style={buttonStyles} onClick={handleSearch}>Search</button>

      {highlightedId && (
        <button style={clearButtonStyles} onClick={handleClear}>Clear</button>
      )}

      {error && <span style={{ color: 'red', marginLeft: '10px' }}>{error}</span>}
    </div>
  );
}