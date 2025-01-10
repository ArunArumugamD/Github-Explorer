import { Request, Response } from 'express';
import githubService from '../services/githubService';

export const getRepositories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;

    if (!username) {
      res.status(400).json({ error: 'Username is required' });
      return;
    }

    const repositories = await githubService.getRepositories(username);
    res.json(repositories);
  } catch (error: any) {
    console.error('Error in getRepositories:', error);
    res.status(500).json({ 
      error: 'Failed to fetch repositories',
      details: error.message 
    });
  }
};