import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Configuração do pool de conexão com o PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'pglyph_user',
  password: process.env.DB_PASSWORD || 'pglyph_pass',
  database: process.env.DB_NAME || 'pglyph_db',
});

// Endpoint de verificação de saúde da API e status do banco
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const dbRes = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      message: 'API Backend Node.js + Express + TypeScript rodando com sucesso!',
      timestamp: new Date().toISOString(),
      databaseTime: dbRes.rows[0].now,
    });
  } catch (error) {
    res.json({
      status: 'degraded',
      message: 'API rodando, conectando ao PostgreSQL...',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
});
