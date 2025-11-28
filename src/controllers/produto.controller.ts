import { Request, Response } from 'express';
import produtoRepository from '../repository/produto.repository.ts';
import { ProdutoCreate, ProdutoUpdate } from '../models/produto.model.ts';

export class ProdutoController {
    async createProduto(req: Request, res: Response) {
        try {
            const produtoData: ProdutoCreate = req.body;

            // Validação com mensagens específicas para cada campo
            const camposFaltando: string[] = [];
            
            if (!produtoData.nome) {
                camposFaltando.push('nome');
            }
            if (produtoData.preco === undefined || produtoData.preco === null) {
                camposFaltando.push('preco');
            }
            if (produtoData.quantidade === undefined || produtoData.quantidade === null) {
                camposFaltando.push('quantidade');
            }
            if (!produtoData.categoria) {
                camposFaltando.push('categoria');
            }
            if (!produtoData.fornecedor_id) {
                camposFaltando.push('fornecedor_id');
            }

            if (camposFaltando.length > 0) {
                return res.status(400).json({ 
                    error: 'Campos obrigatórios faltando',
                    campos: camposFaltando,
                    mensagem: `Os seguintes campos são obrigatórios: ${camposFaltando.join(', ')}`
                });
            }

            if (produtoData.preco < 0) {
                return res.status(400).json({ error: 'Preço não pode ser negativo' });
            }

            if (produtoData.quantidade < 0) {
                return res.status(400).json({ error: 'Quantidade não pode ser negativa' });
            }

            // Verifica se o fornecedor existe
            const fornecedorRepository = (await import('../repository/fornecedor.repository.ts')).default;
            const fornecedor = await fornecedorRepository.findById(produtoData.fornecedor_id);
            if (!fornecedor) {
                return res.status(400).json({ error: 'Fornecedor não encontrado' });
            }

            const produto = await produtoRepository.create(produtoData);
            res.status(201).json({
                message: 'Produto criado com sucesso',
                produto
            });
        } catch (error: any) {
            console.error('Erro ao criar produto:', error);
            res.status(500).json({ error: 'Erro ao criar produto', details: error.message });
        }
    }

    async getAllProdutos(req: Request, res: Response) {
        try {
            const categoria = req.query.categoria as string;
            let produtos;

            if (categoria) {
                produtos = await produtoRepository.findByCategoria(categoria);
            } else {
                produtos = await produtoRepository.findAll();
            }

            res.json(produtos);
        } catch (error: any) {
            console.error('Erro ao buscar produtos:', error);
            res.status(500).json({ error: 'Erro ao buscar produtos', details: error.message });
        }
    }

    async getProdutoById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id || '0');
            if (isNaN(id)) {
                return res.status(400).json({ error: 'ID inválido' });
            }
            const produto = await produtoRepository.findById(id);

            if (!produto) {
                return res.status(404).json({ error: 'Produto não encontrado' });
            }

            res.json(produto);
        } catch (error: any) {
            console.error('Erro ao buscar produto:', error);
            res.status(500).json({ error: 'Erro ao buscar produto', details: error.message });
        }
    }

    async updateProduto(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id || '0');
            if (isNaN(id)) {
                return res.status(400).json({ error: 'ID inválido' });
            }
            const produtoData: ProdutoUpdate = req.body;

            if (produtoData.preco !== undefined && produtoData.preco < 0) {
                return res.status(400).json({ error: 'Preço não pode ser negativo' });
            }

            if (produtoData.quantidade !== undefined && produtoData.quantidade < 0) {
                return res.status(400).json({ error: 'Quantidade não pode ser negativa' });
            }

            // Verifica se o fornecedor existe (se fornecido)
            if (produtoData.fornecedor_id) {
                const fornecedorRepository = (await import('../repository/fornecedor.repository.ts')).default;
                const fornecedor = await fornecedorRepository.findById(produtoData.fornecedor_id);
                if (!fornecedor) {
                    return res.status(400).json({ error: 'Fornecedor não encontrado' });
                }
            }

            const produto = await produtoRepository.update(id, produtoData);

            if (!produto) {
                return res.status(404).json({ error: 'Produto não encontrado' });
            }

            res.json({
                message: 'Produto atualizado com sucesso',
                produto
            });
        } catch (error: any) {
            console.error('Erro ao atualizar produto:', error);
            res.status(500).json({ error: 'Erro ao atualizar produto', details: error.message });
        }
    }

    async deleteProduto(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id || '0');
            if (isNaN(id)) {
                return res.status(400).json({ error: 'ID inválido' });
            }
            const deleted = await produtoRepository.delete(id);

            if (!deleted) {
                return res.status(404).json({ error: 'Produto não encontrado' });
            }

            res.json({ message: 'Produto deletado com sucesso' });
        } catch (error: any) {
            console.error('Erro ao deletar produto:', error);
            res.status(500).json({ error: 'Erro ao deletar produto', details: error.message });
        }
    }

    async updateQuantidade(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id || '0');
            if (isNaN(id)) {
                return res.status(400).json({ error: 'ID inválido' });
            }
            const { quantidade, operacao } = req.body;

            if (quantidade === undefined) {
                return res.status(400).json({ error: 'Quantidade é obrigatória' });
            }

            const produtoAtual = await produtoRepository.findById(id);
            if (!produtoAtual) {
                return res.status(404).json({ error: 'Produto não encontrado' });
            }

            let novaQuantidade: number;
            if (operacao === 'adicionar') {
                novaQuantidade = produtoAtual.quantidade + quantidade;
            } else if (operacao === 'remover') {
                novaQuantidade = produtoAtual.quantidade - quantidade;
                if (novaQuantidade < 0) {
                    return res.status(400).json({ error: 'Quantidade insuficiente em estoque' });
                }
            } else {
                novaQuantidade = quantidade;
            }

            if (novaQuantidade < 0) {
                return res.status(400).json({ error: 'Quantidade não pode ser negativa' });
            }

            const produto = await produtoRepository.updateQuantidade(id, novaQuantidade);
            res.json({
                message: 'Quantidade atualizada com sucesso',
                produto
            });
        } catch (error: any) {
            console.error('Erro ao atualizar quantidade:', error);
            res.status(500).json({ error: 'Erro ao atualizar quantidade', details: error.message });
        }
    }
}

export default new ProdutoController();

