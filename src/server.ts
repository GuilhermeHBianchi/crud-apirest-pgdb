import express, { Response } from 'express';
import cors from 'cors';
import userRouter from './routes/user.route.ts';
import fornecedorRouter from './routes/fornecedor.route.ts';
import produtoRouter from './routes/produto.route.ts';
import pool from './config/db.ts';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Swagger
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Swagger (sem dist)
const swaggerDocument = YAML.load(
    join(__dirname, 'swagger', 'swagger.yaml')
);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rotas
app.get('/', (_, res: Response) => {
    res.json({
        message: 'API de Controle de Estoque',
        version: '1.0.0',
        docs: '/api-docs'
    });
});

app.use('/api/usuarios', userRouter);
app.use('/api/fornecedores', fornecedorRouter);
app.use('/api/produtos', produtoRouter);

// Inicializar banco
async function initializeDatabase() {
    try {
        const schema = readFileSync(
            join(__dirname, 'database', 'schema.sql'),
            'utf-8'
        );

        await pool.query(schema);
        console.log('✅ Banco inicializado');
    } catch (error: any) {
        if (error.code === '42P07') {
            console.log('ℹ️  Tabelas já existem');
        } else {
            console.error('❌ Erro ao inicializar BD:', error.message);
        }
    }
}

app.listen(PORT, async () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📄 Swagger disponível em http://localhost:${PORT}/api-docs`);
    await initializeDatabase();
});
