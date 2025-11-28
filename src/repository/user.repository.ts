import pool from '../config/db.ts';
import { User, UserCreate } from '../models/user.model.ts';
import bcrypt from 'bcrypt';

export class UserRepository {
    async create(userData: UserCreate): Promise<User> {
        const hashedPassword = await bcrypt.hash(userData.senha, 10);
        const result = await pool.query(
            'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome, email, senha, created_at, updated_at',
            [userData.nome, userData.email, hashedPassword]
        );
        return result.rows[0];
    }

    async findByEmail(email: string): Promise<User | null> {
        const result = await pool.query(
            'SELECT * FROM usuarios WHERE email = $1',
            [email]
        );
        return result.rows[0] || null;
    }

    async findById(id: number): Promise<User | null> {
        const result = await pool.query(
            'SELECT id, nome, email, created_at, updated_at FROM usuarios WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    async findAll(): Promise<User[]> {
        const result = await pool.query(
            'SELECT id, nome, email, created_at, updated_at FROM usuarios ORDER BY id'
        );
        return result.rows;
    }

    async update(id: number, userData: Partial<UserCreate>): Promise<User | null> {
        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (userData.nome) {
            updates.push(`nome = $${paramCount++}`);
            values.push(userData.nome);
        }
        if (userData.email) {
            updates.push(`email = $${paramCount++}`);
            values.push(userData.email);
        }
        if (userData.senha) {
            const hashedPassword = await bcrypt.hash(userData.senha, 10);
            updates.push(`senha = $${paramCount++}`);
            values.push(hashedPassword);
        }

        if (updates.length === 0) {
            return this.findById(id);
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const result = await pool.query(
            `UPDATE usuarios SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, nome, email, created_at, updated_at`,
            values
        );

        return result.rows[0] || null;
    }

    async delete(id: number): Promise<boolean> {
        const result = await pool.query(
            'DELETE FROM usuarios WHERE id = $1',
            [id]
        );
        return (result.rowCount ?? 0) > 0;
    }

    async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }
}

export default new UserRepository();

