import React from 'react';
import { User } from '../../types';
import './styles.css';

interface FollowersListProps {
  followers: User[];
  onFollowerClick: (username: string) => void;
  onBack: () => void;
}

const FollowersList: React.FC<FollowersListProps> = ({
  followers,
  onFollowerClick,
  onBack
}) => {
  return (
    <div className="followers-list">
      <button className="back-button" onClick={onBack}>
        ← Back to Repository List
      </button>
      <h2>Followers</h2>
      <div className="followers-grid">
        {followers.map((follower) => (
          <div 
            key={follower.login}
            className="follower-card"
            onClick={() => onFollowerClick(follower.login)}
          >
            <img 
              src={follower.avatar_url} 
              alt={follower.name || follower.login} 
              className="follower-avatar"
            />
            <div className="follower-info">
              <h3>{follower.login}</h3>
              {follower.name && <p>{follower.name}</p>}
              {follower.bio && <p>{follower.bio}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowersList;