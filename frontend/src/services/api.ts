import { User, Repository } from '../types';

const API_BASE_URL = 'https://api.github.com';

export const githubApi = {
  getUser: async (username: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/${username}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    if (!response.ok) {
      throw new Error('User not found');
    }
    return response.json();
  },

  getRepositories: async (username: string): Promise<Repository[]> => {
    const response = await fetch(`${API_BASE_URL}/users/${username}/repos`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch repositories');
    }
    const repos = await response.json();
    return repos.map((repo: any) => ({
      name: repo.name,
      description: repo.description || 'No description available',  // Provide default value
      language: repo.language || 'Not specified',                  // Provide default value
      verified: false, // Mock value
      stars: repo.stargazers_count || 0
    }));
  },

  getFollowers: async (username: string): Promise<User[]> => {
    const response = await fetch(`${API_BASE_URL}/users/${username}/followers`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch followers');
    }
    return response.json();
  }
};