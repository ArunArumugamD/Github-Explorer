import axios from 'axios';
import { GitHubUser } from '../types/user';

class GitHubService {
  private baseUrl = 'https://api.github.com';
  private headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Github-Explorer-App'
  };

  async getUserData(username: string): Promise<GitHubUser> {
    try {
      const response = await axios.get(`${this.baseUrl}/users/${username}`, {
        headers: this.headers
      });
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error('GitHub user not found');
      }
      throw new Error(`Failed to fetch GitHub user data: ${error.message}`);
    }
  }

  async getRepositories(username: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/users/${username}/repos`, {
        headers: this.headers
      });
      return response.data.map((repo: any) => ({
        name: repo.name,
        description: repo.description,
        verified: Math.random() < 0.5, // Mock verified status
        stars: repo.stargazers_count,
        language: repo.language
      }));
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error('Repositories not found');
      }
      throw new Error(`Failed to fetch repositories: ${error.message}`);
    }
  }

  async getFollowers(username: string): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/users/${username}/followers`, {
        headers: this.headers
      });
      return response.data.map((follower: any) => follower.login);
    } catch (error: any) {
      throw new Error(`Failed to fetch followers: ${error.message}`);
    }
  }

  async getFollowing(username: string): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/users/${username}/following`, {
        headers: this.headers
      });
      return response.data.map((following: any) => following.login);
    } catch (error: any) {
      throw new Error(`Failed to fetch following users: ${error.message}`);
    }
  }
}

export default new GitHubService();