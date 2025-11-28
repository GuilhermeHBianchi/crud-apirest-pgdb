import express from 'express';
import produtoController from '../controllers/produto.controller.ts';
import { authenticateToken } from '../middleware/auth.middleware.ts';

const router = express.Router();

// Todas as rotas requerem autenticação
router.post('/', authenticateToken, produtoController.createProduto.bind(produtoController));
router.get('/', authenticateToken, produtoController.getAllProdutos.bind(produtoController));
router.get('/:id', authenticateToken, produtoController.getProdutoById.bind(produtoController));
router.put('/:id', authenticateToken, produtoController.updateProduto.bind(produtoController));
router.delete('/:id', authenticateToken, produtoController.deleteProduto.bind(produtoController));
router.patch('/:id/quantidade', authenticateToken, produtoController.updateQuantidade.bind(produtoController));

export default router;

