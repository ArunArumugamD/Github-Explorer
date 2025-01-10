import { Request, Response } from 'express';
import pool from '../config/database';
import githubService from '../services/githubService';

export const getUserByUsername = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;

    if (!username) {
      res.status(400).json({ error: 'Username is required' });
      return;
    }

    // First check if user exists in database (including soft-deleted users)
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      // If user exists but is soft-deleted, update their information
      if (existingUser.rows[0].deleted_at) {
        try {
          const githubUser = await githubService.getUserData(username);
          const updatedUser = await pool.query(
            `UPDATE users SET 
              avatar_url = $1,
              name = $2,
              company = $3,
              blog = $4,
              location = $5,
              email = $6,
              bio = $7,
              twitter_username = $8,
              public_repos = $9,
              public_gists = $10,
              followers = $11,
              following = $12,
              updated_at = $13,
              deleted_at = NULL
            WHERE username = $14
            RETURNING *`,
            [
              githubUser.avatar_url,
              githubUser.name,
              githubUser.company,
              githubUser.blog,
              githubUser.location,
              githubUser.email,
              githubUser.bio,
              githubUser.twitter_username,
              githubUser.public_repos,
              githubUser.public_gists,
              githubUser.followers,
              githubUser.following,
              new Date(githubUser.updated_at),
              username
            ]
          );
          res.json(updatedUser.rows[0]);
          return;
        } catch (githubError: any) {
          if (githubError.message === 'GitHub user not found') {
            res.status(404).json({ error: 'GitHub user not found' });
          } else {
            throw githubError;
          }
          return;
        }
      }
      // If user exists and is not soft-deleted, return the existing user
      res.json(existingUser.rows[0]);
      return;
    }

    // If not in database, fetch from GitHub API and create new user
    try {
      const githubUser = await githubService.getUserData(username);

      const newUser = await pool.query(
        `INSERT INTO users (
          username, avatar_url, name, company, blog, location, email, bio,
          twitter_username, public_repos, public_gists, followers, following,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
        RETURNING *`,
        [
          githubUser.login,
          githubUser.avatar_url,
          githubUser.name,
          githubUser.company,
          githubUser.blog,
          githubUser.location,
          githubUser.email,
          githubUser.bio,
          githubUser.twitter_username,
          githubUser.public_repos,
          githubUser.public_gists,
          githubUser.followers,
          githubUser.following,
          new Date(githubUser.created_at),
          new Date(githubUser.updated_at)
        ]
      );

      res.json(newUser.rows[0]);
    } catch (githubError: any) {
      if (githubError.message === 'GitHub user not found') {
        res.status(404).json({ error: 'GitHub user not found' });
      } else {
        throw githubError;
      }
    }
  } catch (error: any) {
    console.error('Error in getUserByUsername:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user data',
      details: error.message 
    });
  }
};

export const getUserFriends = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;

    if (!username) {
      res.status(400).json({ error: 'Username is required' });
      return;
    }

    // First check if user exists
    const userExists = await pool.query(
      'SELECT id FROM users WHERE username = $1 AND deleted_at IS NULL',
      [username]
    );

    if (userExists.rows.length === 0) {
      // Try to fetch user from GitHub
      try {
        await githubService.getUserData(username);
      } catch (error) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
    }

    // Get user's followers and following lists from GitHub
    try {
      const followers = await githubService.getFollowers(username);
      const following = await githubService.getFollowing(username);

      // Find mutual followers (friends)
      const friends = followers.filter(follower => following.includes(follower));

      // Get user ID from database
      const userResult = await pool.query(
        'SELECT id FROM users WHERE username = $1',
        [username]
      );

      if (userResult.rows.length === 0) {
        res.status(404).json({ error: 'User not found in database' });
        return;
      }

      const userId = userResult.rows[0].id;

      // Store friends in database
      for (const friendUsername of friends) {
        try {
          // First ensure friend exists in users table
          const friendGithubData = await githubService.getUserData(friendUsername);
          
          // Insert or update friend in users table
          const friendResult = await pool.query(
            `INSERT INTO users (
              username, avatar_url, name, company, blog, location, email, bio,
              twitter_username, public_repos, public_gists, followers, following,
              created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            ON CONFLICT (username) 
            DO UPDATE SET 
              avatar_url = EXCLUDED.avatar_url,
              name = EXCLUDED.name,
              updated_at = EXCLUDED.updated_at
            RETURNING id`,
            [
              friendGithubData.login,
              friendGithubData.avatar_url,
              friendGithubData.name,
              friendGithubData.company,
              friendGithubData.blog,
              friendGithubData.location,
              friendGithubData.email,
              friendGithubData.bio,
              friendGithubData.twitter_username,
              friendGithubData.public_repos,
              friendGithubData.public_gists,
              friendGithubData.followers,
              friendGithubData.following,
              new Date(friendGithubData.created_at),
              new Date(friendGithubData.updated_at)
            ]
          );

          const friendId = friendResult.rows[0].id;

          // Insert into friends table if not exists
          await pool.query(
            `INSERT INTO friends (user_id, friend_id)
             VALUES ($1, $2)
             ON CONFLICT (user_id, friend_id) DO NOTHING`,
            [userId, friendId]
          );
        } catch (friendError) {
          console.error(`Error processing friend ${friendUsername}:`, friendError);
          // Continue with next friend even if one fails
          continue;
        }
      }

      // Get all friends with their details
      const friendsWithDetails = await pool.query(
        `SELECT u.* FROM users u
         INNER JOIN friends f ON f.friend_id = u.id
         WHERE f.user_id = $1 AND u.deleted_at IS NULL`,
        [userId]
      );

      res.json(friendsWithDetails.rows);
    } catch (error) {
      throw new Error(`Failed to fetch GitHub data: ${error}`);
    }
  } catch (error: any) {
    console.error('Error in getUserFriends:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user friends',
      details: error.message 
    });
  }
};

export const searchUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Valid search query is required' });
      return;
    }

    const searchResult = await pool.query(
      `SELECT * FROM users 
       WHERE deleted_at IS NULL 
       AND (
         username ILIKE $1 
         OR location ILIKE $1 
         OR name ILIKE $1 
         OR company ILIKE $1
       )`,
      [`%${query}%`]
    );

    res.json(searchResult.rows);
  } catch (error: any) {
    console.error('Error in searchUsers:', error);
    res.status(500).json({ 
      error: 'Failed to search users',
      details: error.message 
    });
  }
};

export const softDeleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;

    if (!username) {
      res.status(400).json({ error: 'Username is required' });
      return;
    }

    const result = await pool.query(
      `UPDATE users 
       SET deleted_at = CURRENT_TIMESTAMP 
       WHERE username = $1 AND deleted_at IS NULL 
       RETURNING *`,
      [username]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found or already deleted' });
      return;
    }

    res.json({ 
      message: 'User successfully deleted', 
      user: result.rows[0] 
    });
  } catch (error: any) {
    console.error('Error in softDeleteUser:', error);
    res.status(500).json({ 
      error: 'Failed to delete user',
      details: error.message 
    });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;
    const { location, blog, bio } = req.body;

    if (!username) {
      res.status(400).json({ error: 'Username is required' });
      return;
    }

    // Validate that at least one field is provided
    if (location === undefined && blog === undefined && bio === undefined) {
      res.status(400).json({ error: 'At least one field to update is required' });
      return;
    }

    const updateFields: string[] = [];
    const values: any[] = [];
    let valueCounter = 1;

    if (location !== undefined) {
      updateFields.push(`location = $${valueCounter}`);
      values.push(location);
      valueCounter++;
    }

    if (blog !== undefined) {
      updateFields.push(`blog = $${valueCounter}`);
      values.push(blog);
      valueCounter++;
    }

    if (bio !== undefined) {
      updateFields.push(`bio = $${valueCounter}`);
      values.push(bio);
      valueCounter++;
    }

    values.push(username);
    const result = await pool.query(
      `UPDATE users 
       SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE username = $${valueCounter} AND deleted_at IS NULL 
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error in updateUser:', error);
    res.status(500).json({ 
      error: 'Failed to update user',
      details: error.message 
    });
  }
};

export const getSortedUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sort_by = 'username', order = 'ASC' } = req.query;
    
    // Validate sort field
    const allowedSortFields = [
      'public_repos',
      'public_gists',
      'followers',
      'following',
      'created_at',
      'username'
    ];

    const sortField = sort_by.toString().toLowerCase();
    const sortOrder = order.toString().toUpperCase();

    if (!allowedSortFields.includes(sortField)) {
      res.status(400).json({ 
        error: 'Invalid sort field',
        allowed_fields: allowedSortFields 
      });
      return;
    }

    if (!['ASC', 'DESC'].includes(sortOrder)) {
      res.status(400).json({ 
        error: 'Invalid sort order',
        allowed_values: ['ASC', 'DESC'] 
      });
      return;
    }

    const result = await pool.query(
      `SELECT * FROM users 
       WHERE deleted_at IS NULL 
       ORDER BY ${sortField} ${sortOrder}`,
    );

    res.json(result.rows);
  } catch (error: any) {
    console.error('Error in getSortedUsers:', error);
    res.status(500).json({ 
      error: 'Failed to fetch sorted users',
      details: error.message 
    });
  }
};