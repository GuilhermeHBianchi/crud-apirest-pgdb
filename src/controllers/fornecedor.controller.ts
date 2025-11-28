import { Request, Response } from 'express';
import fornecedorRepository from '../repository/fornecedor.repository.ts';
import { FornecedorCreate, FornecedorUpdate } from '../models/fornecedor.model.ts';

export class FornecedorController {
    async createFornecedor(req: Request, res: Response) {
        try {
            const fornecedorData: FornecedorCreate = req.body;

            if (!fornecedorData.nome || !fornecedorData.cnpj) {
                return res.status(400).json({ error: 'Nome e CNPJ são obrigatórios' });
            }

            // Verifica se o CNPJ já existe
            const existingFornecedor = await fornecedorRepository.findByCnpj(fornecedorData.cnpj);
            if (existingFornecedor) {
                return res.status(400).json({ error: 'CNPJ já cadastrado' });
            }

            const fornecedor = await fornecedorRepository.create(fornecedorData);
            res.status(201).json({
                message: 'Fornecedor criado com sucesso',
                fornecedor
            });
        } catch (error: any) {
            console.error('Erro ao criar fornecedor:', error);
            res.status(500).json({ error: 'Erro ao criar fornecedor', details: error.message });
        }
    }

    async getAllFornecedores(_req: Request, res: Response) {
        try {
            const fornecedores = await fornecedorRepository.findAll();
            res.json(fornecedores);
        } catch (error: any) {
            console.error('Erro ao buscar fornecedores:', error);
            res.status(500).json({ error: 'Erro ao buscar fornecedores', details: error.message });
        }
    }

    async getFornecedorById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id || '0');
            if (isNaN(id)) {
                return res.status(400).json({ error: 'ID inválido' });
            }
            const fornecedor = await fornecedorRepository.findById(id);

            if (!fornecedor) {
                return res.status(404).json({ error: 'Fornecedor não encontrado' });
            }

            res.json(fornecedor);
        } catch (error: any) {
            console.error('Erro ao buscar fornecedor:', error);
            res.status(500).json({ error: 'Erro ao buscar fornecedor', details: error.message });
        }
    }

    async updateFornecedor(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id || '0');
            if (isNaN(id)) {
                return res.status(400).json({ error: 'ID inválido' });
            }
            const fornecedorData: FornecedorUpdate = req.body;

            // Se está atualizando o CNPJ, verifica se já existe
            if (fornecedorData.cnpj) {
                const existingFornecedor = await fornecedorRepository.findByCnpj(fornecedorData.cnpj);
                if (existingFornecedor && existingFornecedor.id !== id) {
                    return res.status(400).json({ error: 'CNPJ já cadastrado para outro fornecedor' });
                }
            }

            const fornecedor = await fornecedorRepository.update(id, fornecedorData);

            if (!fornecedor) {
                return res.status(404).json({ error: 'Fornecedor não encontrado' });
            }

            res.json({
                message: 'Fornecedor atualizado com sucesso',
                fornecedor
            });
        } catch (error: any) {
            console.error('Erro ao atualizar fornecedor:', error);
            res.status(500).json({ error: 'Erro ao atualizar fornecedor', details: error.message });
        }
    }

    async deleteFornecedor(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id || '0');
            if (isNaN(id)) {
                return res.status(400).json({ error: 'ID inválido' });
            }
            const deleted = await fornecedorRepository.delete(id);

            if (!deleted) {
                return res.status(404).json({ error: 'Fornecedor não encontrado' });
            }

            res.json({ message: 'Fornecedor deletado com sucesso' });
        } catch (error: any) {
            console.error('Erro ao deletar fornecedor:', error);
            res.status(500).json({ error: 'Erro ao deletar fornecedor', details: error.message });
        }
    }
}

export default new FornecedorController();

