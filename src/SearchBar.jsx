// src/SearchBar.jsx

import React, { useState } from 'react';

// Basic styles for the search bar
const searchBarStyles = {
  position: 'fixed',
  top: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 1001, // On top of the map
  backgroundColor: 'rgba(28, 28, 32, 0.9)',
  padding: '8px 15px',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  backdropFilter: 'blur(5px)',
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
  marginLeft: '10px',
};

export default function SearchBar({ onSearch }) {
  const [inputValue, setInputValue] = useState('');

  const handleSearch = () => {
    // We pass the trimmed, numerical value up to the App component
    const noradId = parseInt(inputValue.trim(), 10);
    if (!isNaN(noradId)) {
      onSearch(noradId);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div style={searchBarStyles}>
      <input
        type="text"
        name="norad-id-search" // Add a descriptive name
        style={inputStyles}
        placeholder="Search by NORAD ID..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <button style={buttonStyles} onClick={handleSearch}>Search</button>
    </div>
  );
}