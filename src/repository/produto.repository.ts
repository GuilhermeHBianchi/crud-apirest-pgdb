import pool from '../config/db.ts';
import { Produto, ProdutoCreate, ProdutoUpdate } from '../models/produto.model.ts';

export class ProdutoRepository {
    async create(produtoData: ProdutoCreate): Promise<Produto> {
        const result = await pool.query(
            'INSERT INTO produtos (nome, descricao, preco, quantidade, categoria, fornecedor_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [produtoData.nome, produtoData.descricao, produtoData.preco, produtoData.quantidade, produtoData.categoria, produtoData.fornecedor_id]
        );
        return result.rows[0];
    }

    async findById(id: number): Promise<Produto | null> {
        const result = await pool.query(
            `SELECT p.*, 
                    f.id as fornecedor_id_fk, 
                    f.nome as fornecedor_nome, 
                    f.email as fornecedor_email,
                    f.telefone as fornecedor_telefone,
                    f.endereco as fornecedor_endereco,
                    f.cnpj as fornecedor_cnpj
             FROM produtos p
             LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
             WHERE p.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];
        return this.mapRowToProduto(row);
    }

    async findAll(): Promise<Produto[]> {
        const result = await pool.query(
            `SELECT p.*, 
                    f.id as fornecedor_id_fk, 
                    f.nome as fornecedor_nome, 
                    f.email as fornecedor_email,
                    f.telefone as fornecedor_telefone,
                    f.endereco as fornecedor_endereco,
                    f.cnpj as fornecedor_cnpj
             FROM produtos p
             LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
             ORDER BY p.id`
        );

        return result.rows.map(row => this.mapRowToProduto(row));
    }

    async findByCategoria(categoria: string): Promise<Produto[]> {
        const result = await pool.query(
            `SELECT p.*, 
                    f.id as fornecedor_id_fk, 
                    f.nome as fornecedor_nome, 
                    f.email as fornecedor_email,
                    f.telefone as fornecedor_telefone,
                    f.endereco as fornecedor_endereco,
                    f.cnpj as fornecedor_cnpj
             FROM produtos p
             LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
             WHERE p.categoria = $1
             ORDER BY p.id`,
            [categoria]
        );

        return result.rows.map(row => this.mapRowToProduto(row));
    }

    async update(id: number, produtoData: ProdutoUpdate): Promise<Produto | null> {
        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (produtoData.nome) {
            updates.push(`nome = $${paramCount++}`);
            values.push(produtoData.nome);
        }
        if (produtoData.descricao !== undefined) {
            updates.push(`descricao = $${paramCount++}`);
            values.push(produtoData.descricao);
        }
        if (produtoData.preco !== undefined) {
            updates.push(`preco = $${paramCount++}`);
            values.push(produtoData.preco);
        }
        if (produtoData.quantidade !== undefined) {
            updates.push(`quantidade = $${paramCount++}`);
            values.push(produtoData.quantidade);
        }
        if (produtoData.categoria !== undefined) {
            updates.push(`categoria = $${paramCount++}`);
            values.push(produtoData.categoria);
        }
        if (produtoData.fornecedor_id !== undefined) {
            updates.push(`fornecedor_id = $${paramCount++}`);
            values.push(produtoData.fornecedor_id);
        }

        if (updates.length === 0) {
            return this.findById(id);
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        await pool.query(
            `UPDATE produtos SET ${updates.join(', ')} WHERE id = $${paramCount}`,
            values
        );

        return this.findById(id);
    }

    async delete(id: number): Promise<boolean> {
        const result = await pool.query(
            'DELETE FROM produtos WHERE id = $1',
            [id]
        );
        return (result.rowCount ?? 0) > 0;
    }

    async updateQuantidade(id: number, quantidade: number): Promise<Produto | null> {
        const result = await pool.query(
            'UPDATE produtos SET quantidade = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [quantidade, id]
        );
        return result.rows[0] || null;
    }

    private mapRowToProduto(row: any): Produto {
        const produto: Produto = {
            id: row.id,
            nome: row.nome,
            descricao: row.descricao,
            preco: parseFloat(row.preco),
            quantidade: row.quantidade,
            categoria: row.categoria,
            fornecedor_id: row.fornecedor_id,
            created_at: row.created_at,
            updated_at: row.updated_at
        };

        if (row.fornecedor_id_fk) {
            produto.fornecedor = {
                id: row.fornecedor_id_fk,
                nome: row.fornecedor_nome,
                email: row.fornecedor_email,
                telefone: row.fornecedor_telefone,
                endereco: row.fornecedor_endereco,
                cnpj: row.fornecedor_cnpj
            };
        }

        return produto;
    }
}

export default new ProdutoRepository();

