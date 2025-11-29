import Router from 'koa-router';
import { AuthController } from '../controllers/auth.controller';
import { UserController } from '../controllers/user.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = new Router();

router.post('/api/auth/register', AuthController.register);
router.post('/api/auth/login', AuthController.login);

router.get('/api/users/:id', authMiddleware, UserController.getUserById);
router.get('/api/users', authMiddleware, adminMiddleware, UserController.getAllUsers);
router.patch('/api/users/:id/block', authMiddleware, UserController.blockUser);

export default router;
