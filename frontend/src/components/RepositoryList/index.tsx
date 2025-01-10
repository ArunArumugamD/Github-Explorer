// src/components/RepositoryList/index.tsx
import React from 'react';
import { Repository, User } from '../../types';
import './styles.css';

interface RepositoryListProps {
  repositories: Repository[];
  user: User;
  onRepositoryClick: (repo: Repository) => void;
  onFollowersClick: () => void;
  onBackToSearch: () => void;
}

const RepositoryList = ({ 
  repositories, 
  user, 
  onRepositoryClick, 
  onFollowersClick, 
  onBackToSearch 
}: RepositoryListProps) => {
  return (
    <div className="repository-page">
      <h1 className="app-title">GitHub Explorer</h1>

      <button className="back-link" onClick={onBackToSearch}>
        ← Back to Search
      </button>

      <div className="user-profile">
        <img 
          src={user.avatar_url} 
          alt={user.name || user.login} 
          className="user-avatar"
        />
        <div className="user-info">
          <h2 className="user-name">{user.name || user.login}</h2>
          {user.bio && <p className="user-bio">{user.bio}</p>}
          <div className="user-stats">
            <span>{user.public_repos} repositories</span>
            <button 
              className="followers-link" 
              onClick={onFollowersClick}
            >
              {user.followers} followers
            </button>
            <span>{user.following} following</span>
          </div>
        </div>
      </div>

      <div className="repository-list">
        {repositories.map(repo => (
          <div 
            key={repo.name} 
            className="repository-item"
            onClick={() => onRepositoryClick(repo)}
          >
            <div className="repo-header">
              <img 
                src={user.avatar_url} 
                alt="" 
                className="repo-avatar"
              />
              <h3 className="repo-name">{repo.name}</h3>
            </div>
            <p className="repo-description">
              {repo.description || 'No description available'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RepositoryList;