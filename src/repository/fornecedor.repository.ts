import pool from '../config/db.ts';
import { Fornecedor, FornecedorCreate, FornecedorUpdate } from '../models/fornecedor.model.ts';

export class FornecedorRepository {
    async create(fornecedorData: FornecedorCreate): Promise<Fornecedor> {
        const result = await pool.query(
            'INSERT INTO fornecedores (nome, email, telefone, endereco, cnpj) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [fornecedorData.nome, fornecedorData.email, fornecedorData.telefone, fornecedorData.endereco, fornecedorData.cnpj]
        );
        return result.rows[0];
    }

    async findById(id: number): Promise<Fornecedor | null> {
        const result = await pool.query(
            'SELECT * FROM fornecedores WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    async findAll(): Promise<Fornecedor[]> {
        const result = await pool.query(
            'SELECT * FROM fornecedores ORDER BY id'
        );
        return result.rows;
    }

    async findByCnpj(cnpj: string): Promise<Fornecedor | null> {
        const result = await pool.query(
            'SELECT * FROM fornecedores WHERE cnpj = $1',
            [cnpj]
        );
        return result.rows[0] || null;
    }

    async update(id: number, fornecedorData: FornecedorUpdate): Promise<Fornecedor | null> {
        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (fornecedorData.nome) {
            updates.push(`nome = $${paramCount++}`);
            values.push(fornecedorData.nome);
        }
        if (fornecedorData.email !== undefined) {
            updates.push(`email = $${paramCount++}`);
            values.push(fornecedorData.email);
        }
        if (fornecedorData.telefone !== undefined) {
            updates.push(`telefone = $${paramCount++}`);
            values.push(fornecedorData.telefone);
        }
        if (fornecedorData.endereco !== undefined) {
            updates.push(`endereco = $${paramCount++}`);
            values.push(fornecedorData.endereco);
        }
        if (fornecedorData.cnpj) {
            updates.push(`cnpj = $${paramCount++}`);
            values.push(fornecedorData.cnpj);
        }

        if (updates.length === 0) {
            return this.findById(id);
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const result = await pool.query(
            `UPDATE fornecedores SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );

        return result.rows[0] || null;
    }

    async delete(id: number): Promise<boolean> {
        const result = await pool.query(
            'DELETE FROM fornecedores WHERE id = $1',
            [id]
        );
        return (result.rowCount ?? 0) > 0;
    }
}

export default new FornecedorRepository();

