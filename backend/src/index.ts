import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Endpoint de verificação de saúde da API e status do banco via Prisma ORM
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    // Testa consulta ao banco via Prisma
    const userCount = await prisma.user.count();
    const result = await prisma.$queryRaw<Array<{ now: Date }>>`SELECT NOW()`;

    res.json({
      status: 'ok',
      orm: 'Prisma ORM',
      message: 'API Backend Node.js + Express + TypeScript com Prisma ORM rodando com sucesso!',
      timestamp: new Date().toISOString(),
      userCount,
      databaseTime: result[0]?.now || null,
    });
  } catch (error) {
    res.json({
      status: 'degraded',
      orm: 'Prisma ORM',
      message: 'API rodando, sincronizando schema Prisma no PostgreSQL...',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend com Prisma ORM rodando na porta ${PORT}`);
});
