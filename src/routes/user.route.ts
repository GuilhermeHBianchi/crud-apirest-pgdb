import express from 'express';
import userController from '../controllers/user.controller.ts';
import { authenticateToken } from '../middleware/auth.middleware.ts';

const router = express.Router();

// Rotas públicas
router.post('/cadastro', userController.createUser.bind(userController));
router.post('/login', userController.login.bind(userController));

// Rotas protegidas (requerem autenticação)
router.get('/', authenticateToken, userController.getAllUsers.bind(userController));
router.get('/:id', authenticateToken, userController.getUserById.bind(userController));
router.put('/:id', authenticateToken, userController.updateUser.bind(userController));
router.delete('/:id', authenticateToken, userController.deleteUser.bind(userController));

export default router;

