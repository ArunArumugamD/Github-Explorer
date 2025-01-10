import React, { useState } from 'react';
import SearchBox from './components/SearchBox';
import RepositoryList from './components/RepositoryList';
import RepositoryDetails from './components/RepositoryDetails';
import FollowersList from './components/FollowersList';
import { githubApi } from './services/api';
import { User, Repository, DetailedRepository } from './types';
import './App.css';

function App() {
  const [userData, setUserData] = useState<User | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [followers, setFollowers] = useState<User[]>([]);
  const [view, setView] = useState<'search' | 'repos' | 'repo-details' | 'followers'>('search');
  const [selectedRepo, setSelectedRepo] = useState<DetailedRepository | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSearch = async (username: string) => {
    setLoading(true);
    setError('');
    try {
      const [user, repos] = await Promise.all([
        githubApi.getUser(username),
        githubApi.getRepositories(username)
      ]);
      setUserData(user);
      setRepositories(repos);
      setView('repos');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleViewFollowers = async () => {
    if (!userData) return;
    setLoading(true);
    try {
      const followersList = await githubApi.getFollowers(userData.login);
      setFollowers(followersList);
      setView('followers');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch followers');
    } finally {
      setLoading(false);
    }
  };

  const handleRepositoryClick = (repo: Repository) => {
    const detailedRepo: DetailedRepository = {
      ...repo,
      avatar_url: userData?.avatar_url || '',
      categories: ['Code review', 'IDEs', 'Free']
    };
    setSelectedRepo(detailedRepo);
    setView('repo-details');
  };

  const handleBack = () => {
    switch (view) {
      case 'followers':
      case 'repo-details':
        setView('repos');
        setSelectedRepo(null);
        break;
      case 'repos':
        setView('search');
        setUserData(null);
        setRepositories([]);
        break;
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'search':
        return <SearchBox onSearch={handleSearch} />;
      
      case 'repos':
        return userData && (
          <RepositoryList
            repositories={repositories}
            user={userData}
            onRepositoryClick={handleRepositoryClick}
            onFollowersClick={handleViewFollowers}
            onBackToSearch={handleBack}
          />
        );

      case 'repo-details':
        return selectedRepo && (
          <RepositoryDetails
            repository={selectedRepo}
            onBack={handleBack}
          />
        );

      case 'followers':
        return (
          <FollowersList
            followers={followers}
            onFollowerClick={handleSearch}
            onBack={handleBack}
          />
        );
    }
  };

  return (
    <div className="app">
      {renderContent()}
      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
}

export default App;