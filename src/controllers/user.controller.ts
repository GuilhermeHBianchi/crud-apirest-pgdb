import { Request, Response } from 'express';
import userRepository from '../repository/user.repository.ts';
import { UserCreate, UserLogin } from '../models/user.model.ts';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-key-aqui-mude-em-producao';

export class UserController {
    async createUser(req: Request, res: Response) {
        try {
            const userData: UserCreate = req.body;

            if (!userData.nome || !userData.email || !userData.senha) {
                return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
            }

            // Verifica se o email já existe
            const existingUser = await userRepository.findByEmail(userData.email);
            if (existingUser) {
                return res.status(400).json({ error: 'Email já cadastrado' });
            }

            const user = await userRepository.create(userData);
            const { senha, ...userWithoutPassword } = user;
            
            res.status(201).json({
                message: 'Usuário criado com sucesso',
                user: userWithoutPassword
            });
        } catch (error: any) {
            console.error('Erro ao criar usuário:', error);
            res.status(500).json({ error: 'Erro ao criar usuário', details: error.message });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const loginData: UserLogin = req.body;

            if (!loginData.email || !loginData.senha) {
                return res.status(400).json({ error: 'Email e senha são obrigatórios' });
            }

            const user = await userRepository.findByEmail(loginData.email);
            if (!user) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }

            const isValidPassword = await userRepository.comparePassword(loginData.senha, user.senha);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }

            const token = jwt.sign(
                { userId: user.id, email: user.email },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            const { senha, ...userWithoutPassword } = user;

            res.json({
                message: 'Login realizado com sucesso',
                token,
                user: userWithoutPassword
            });
        } catch (error: any) {
            console.error('Erro ao fazer login:', error);
            res.status(500).json({ error: 'Erro ao fazer login', details: error.message });
        }
    }

    async getAllUsers(_req: Request, res: Response) {
        try {
            const users = await userRepository.findAll();
            res.json(users);
        } catch (error: any) {
            console.error('Erro ao buscar usuários:', error);
            res.status(500).json({ error: 'Erro ao buscar usuários', details: error.message });
        }
    }

    async getUserById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id || '0');
            if (isNaN(id)) {
                return res.status(400).json({ error: 'ID inválido' });
            }
            const user = await userRepository.findById(id);

            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            res.json(user);
        } catch (error: any) {
            console.error('Erro ao buscar usuário:', error);
            res.status(500).json({ error: 'Erro ao buscar usuário', details: error.message });
        }
    }

    async updateUser(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id || '0');
            if (isNaN(id)) {
                return res.status(400).json({ error: 'ID inválido' });
            }
            const userData: Partial<UserCreate> = req.body;

            const user = await userRepository.update(id, userData);

            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            res.json({
                message: 'Usuário atualizado com sucesso',
                user
            });
        } catch (error: any) {
            console.error('Erro ao atualizar usuário:', error);
            res.status(500).json({ error: 'Erro ao atualizar usuário', details: error.message });
        }
    }

    async deleteUser(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id || '0');
            if (isNaN(id)) {
                return res.status(400).json({ error: 'ID inválido' });
            }
            const deleted = await userRepository.delete(id);

            if (!deleted) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            res.json({ message: 'Usuário deletado com sucesso' });
        } catch (error: any) {
            console.error('Erro ao deletar usuário:', error);
            res.status(500).json({ error: 'Erro ao deletar usuário', details: error.message });
        }
    }
}

export default new UserController();

