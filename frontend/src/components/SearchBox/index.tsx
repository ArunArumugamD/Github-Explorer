import React, { useState } from 'react';
import './styles.css';

interface SearchBoxProps {
  onSearch: (username: string) => void;
}

const SearchBox = ({ onSearch }: SearchBoxProps) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onSearch(username.trim());
    }
  };

  return (
    <div className="search-page">
      <h1 className="app-title">GitHub Explorer</h1>
      <div className="search-container">
        <form onSubmit={handleSubmit} className="search-form">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter GitHub username"
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>
      </div>
    </div>
  );
};

export default SearchBox;