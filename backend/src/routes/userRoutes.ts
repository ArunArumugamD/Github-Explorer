import { Router, Request, Response } from 'express';
import { 
  getUserByUsername, 
  getUserFriends,
  searchUsers,
  softDeleteUser,
  updateUser,
  getSortedUsers
} from '../controllers/userController';
import { getRepositories } from '../controllers/repositoryController';

const router = Router();

// Get sorted list of users
router.get('/', (req: Request, res: Response) => getSortedUsers(req, res));

// Search users
router.get('/search', (req: Request, res: Response) => searchUsers(req, res));

// Get user friends
router.get('/:username/friends', (req: Request, res: Response) => getUserFriends(req, res));

// Get user details
router.get('/:username', (req: Request, res: Response) => getUserByUsername(req, res));

// Update user
router.patch('/:username', (req: Request, res: Response) => updateUser(req, res));

// Soft delete user
router.delete('/:username', (req: Request, res: Response) => softDeleteUser(req, res));

// Get repositories
router.get('/:username/repos', (req: Request, res: Response) => getRepositories(req, res));

export default router;