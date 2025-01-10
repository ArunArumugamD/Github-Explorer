import React from 'react';
import { DetailedRepository } from '../../types';
import './styles.css';

interface RepositoryDetailsProps {
  repository: DetailedRepository;
  onBack: () => void;
}

const RepositoryDetails = ({ repository, onBack }: RepositoryDetailsProps) => {
  return (
    <div className="repository-details-page">
      <h1 className="app-title">GitHub Explorer</h1>

      <button className="back-link" onClick={onBack}>
        ← Back to Repository List
      </button>

      <div className="repository-details">
        <span className="label">Application</span>
        <h2 className="repository-name">{repository.name}</h2>

        {repository.verified && (
          <div className="verified-info">
            <span className="verified-badge">✓</span>
            <span>Verified by GitHub</span>
            <button 
              className="verification-link" 
              onClick={() => {}} // You can add verification requirements logic here
            >
              requirements for verification
            </button>
          </div>
        )}

        <button className="setup-button">Set up a plan</button>

        {repository.description && (
          <p className="repository-description">{repository.description}</p>
        )}

        <div className="categories">
          <span className="categories-label">Categories</span>
          <div className="category-tags">
            {repository.categories.map((category, index) => (
              <span key={index} className="category-tag">{category}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepositoryDetails;