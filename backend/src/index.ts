import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { generateSeedClipboard, generateSeedImages, generateSeedLinks } from './seedData';
import { SystemWatcher } from './systemWatcher';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Diretorio e utilitarios de persistencia local de fallback
const STORAGE_DIR = path.join(__dirname, '../.storage');
if (!fs.existsSync(STORAGE_DIR)) {
  try { fs.mkdirSync(STORAGE_DIR, { recursive: true }); } catch (e) {}
}
const CLIP_FILE = path.join(STORAGE_DIR, 'clipboard.json');
const IMG_FILE = path.join(STORAGE_DIR, 'images.json');
const LNK_FILE = path.join(STORAGE_DIR, 'links.json');

function loadLocalFile<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as T;
    }
  } catch (e) {}
  return fallback;
}

function saveLocalFile(filePath: string, data: any) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {}
}

// Lista de clientes conectados ao Server-Sent Events (SSE) para atualização em tempo real
let sseClients: Response[] = [];

function broadcastEvent(type: 'clipboard' | 'image' | 'link', payload: any) {
  const data = JSON.stringify({ type, payload, timestamp: new Date().toISOString() });
  sseClients.forEach((client) => {
    client.write(`data: ${data}\n\n`);
  });
}

// Fallback de memória carregado dos arquivos persistentes locais
let memoryClipboard = loadLocalFile(CLIP_FILE, generateSeedClipboard());
let memoryImages = loadLocalFile(IMG_FILE, generateSeedImages());
let memoryLinks = loadLocalFile(LNK_FILE, generateSeedLinks());

// Rotinas de Expurgo Automático mantendo no máximo os 100 registros mais recentes
async function pruneClipboard() {
  try {
    const allClips = await prisma.clipboardItem.findMany({
      select: { id: true, isPinned: true },
      orderBy: { createdAt: 'desc' },
    });
    if (allClips.length > 100) {
      const toDelete = allClips.slice(100).filter((item) => !item.isPinned).map((item) => item.id);
      if (toDelete.length > 0) {
        await prisma.clipboardItem.deleteMany({
          where: { id: { in: toDelete } },
        });
      }
    }
  } catch (e) {}

  if (memoryClipboard.length > 100) {
    const pinned = memoryClipboard.filter((item: any) => item.isPinned);
    const unpinned = memoryClipboard.filter((item: any) => !item.isPinned);
    memoryClipboard = [...unpinned.slice(0, 100 - Math.min(pinned.length, 100)), ...pinned].slice(0, 100);
  }
  saveLocalFile(CLIP_FILE, memoryClipboard);
}

async function pruneImages() {
  try {
    const allImgs = await prisma.deletedImage.findMany({
      select: { id: true },
      orderBy: { deletedAt: 'desc' },
    });
    if (allImgs.length > 100) {
      const toDelete = allImgs.slice(100).map((item) => item.id);
      if (toDelete.length > 0) {
        await prisma.deletedImage.deleteMany({
          where: { id: { in: toDelete } },
        });
      }
    }
  } catch (e) {}

  if (memoryImages.length > 100) {
    memoryImages = memoryImages.slice(0, 100);
  }
  saveLocalFile(IMG_FILE, memoryImages);
}

async function pruneLinks() {
  try {
    const allLinks = await prisma.accessedLink.findMany({
      select: { id: true, isBookmarked: true },
      orderBy: { lastVisitedAt: 'desc' },
    });
    if (allLinks.length > 100) {
      const toDelete = allLinks.slice(100).filter((item) => !item.isBookmarked).map((item) => item.id);
      if (toDelete.length > 0) {
        await prisma.accessedLink.deleteMany({
          where: { id: { in: toDelete } },
        });
      }
    }
  } catch (e) {}

  if (memoryLinks.length > 100) {
    memoryLinks = memoryLinks.slice(0, 100);
  }
  saveLocalFile(LNK_FILE, memoryLinks);
}

// Inicializa o monitoramento automático de imagens deletadas no PC
const systemWatcher = new SystemWatcher(prisma, broadcastEvent);
systemWatcher.start();

async function autoMigrateDatabase() {
  try {
    console.log('🔄 [DB Auto-Migrate] Verificando e criando tabelas do Pglyph no banco PostgreSQL...');
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
          CREATE TYPE "ContentType" AS ENUM ('TEXT', 'CODE', 'URL', 'SECRET');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ClipboardItem" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "content" TEXT NOT NULL,
          "contentType" "ContentType" NOT NULL DEFAULT 'TEXT',
          "charCount" INTEGER NOT NULL,
          "isPinned" BOOLEAN NOT NULL DEFAULT false,
          "restoredCount" INTEGER NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "DeletedImage" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "fileName" TEXT NOT NULL,
          "originalPath" TEXT NOT NULL,
          "fileSize" TEXT NOT NULL,
          "previewUrl" TEXT NOT NULL,
          "category" TEXT NOT NULL,
          "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "isRestored" BOOLEAN NOT NULL DEFAULT false,
          "restoredAt" TIMESTAMP(3)
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "AccessedLink" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "url" TEXT NOT NULL,
          "title" TEXT NOT NULL,
          "domain" TEXT NOT NULL,
          "favicon" TEXT NOT NULL,
          "category" TEXT NOT NULL,
          "visitCount" INTEGER NOT NULL DEFAULT 1,
          "isBookmarked" BOOLEAN NOT NULL DEFAULT false,
          "lastVisitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ [DB Auto-Migrate] Estrutura de tabelas do Pglyph criada/verificada com sucesso no PostgreSQL!');
  } catch (err) {
    console.warn('⚠️ Erro na migração automática de tabelas PostgreSQL:', err instanceof Error ? err.message : err);
  }
}

async function ensureSeeded() {
  await autoMigrateDatabase();

  try {
    const clipCount = await prisma.clipboardItem.count();
    if (clipCount === 0) {
      console.log('🌱 Populando 100 itens da Área de Transferência no banco PostgreSQL...');
      const seedClips = generateSeedClipboard();
      for (const item of seedClips) {
        await prisma.clipboardItem.create({
          data: {
            id: item.id,
            content: item.content,
            contentType: item.contentType as any,
            charCount: item.charCount,
            isPinned: item.isPinned,
            restoredCount: item.restoredCount,
            createdAt: item.createdAt,
          },
        });
      }
    }

    const imgCount = await prisma.deletedImage.count();
    if (imgCount === 0) {
      console.log('🌱 Populando 100 Imagens Deletadas no banco PostgreSQL...');
      const seedImgs = generateSeedImages();
      for (const item of seedImgs) {
        await prisma.deletedImage.create({
          data: {
            id: item.id,
            fileName: item.fileName,
            originalPath: item.originalPath,
            fileSize: item.fileSize,
            previewUrl: item.previewUrl,
            category: item.category,
            deletedAt: item.deletedAt,
            isRestored: item.isRestored,
            restoredAt: item.restoredAt,
          },
        });
      }
    }

    const linkCount = await prisma.accessedLink.count();
    if (linkCount === 0) {
      console.log('🌱 Populando 100 Links Acessados no banco PostgreSQL...');
      const seedLnks = generateSeedLinks();
      for (const item of seedLnks) {
        await prisma.accessedLink.create({
          data: {
            id: item.id,
            url: item.url,
            title: item.title,
            domain: item.domain,
            favicon: item.favicon,
            category: item.category,
            visitCount: item.visitCount,
            isBookmarked: item.isBookmarked,
            lastVisitedAt: item.lastVisitedAt,
          },
        });
      }
    }

    saveLocalFile(CLIP_FILE, memoryClipboard);
    saveLocalFile(IMG_FILE, memoryImages);
    saveLocalFile(LNK_FILE, memoryLinks);
  } catch (err) {
    console.warn('⚠️ Aviso ao sincronizar com PostgreSQL via Prisma:', err instanceof Error ? err.message : err);
  }
}

ensureSeeded();

// --- STREAM SSE EM TEMPO REAL ---
app.get('/api/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  sseClients.push(res);
  console.log(`🔌 [SSE] Novo cliente conectado em tempo real. Total: ${sseClients.length}`);

  req.on('close', () => {
    sseClients = sseClients.filter((c) => c !== res);
  });
});

// --- 1. ENDPOINTS DA ÁREA DE TRANSFERÊNCIA (CTRL+C AUTOMÁTICO) ---

app.get('/api/clipboard', async (_req: Request, res: Response) => {
  try {
    const items = await prisma.clipboardItem.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
    });
    if (items.length > 0) {
      return res.json(items);
    }
  } catch (e) {}
  res.json(memoryClipboard.slice(0, 100));
});

// Captura automática instantânea do CTRL+C
app.post('/api/clipboard', async (req: Request, res: Response) => {
  const { content, contentType } = req.body;
  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: 'Conteúdo é obrigatório' });
  }

  const newItem = {
    id: `clip-auto-${Date.now()}`,
    content,
    contentType: contentType || (content.startsWith('http') ? 'URL' : content.includes(';') || content.includes('{') ? 'CODE' : 'TEXT'),
    charCount: content.length,
    isPinned: false,
    restoredCount: 0,
    createdAt: new Date(),
  };

  try {
    const saved = await prisma.clipboardItem.create({
      data: {
        content: newItem.content,
        contentType: newItem.contentType as any,
        charCount: newItem.charCount,
        isPinned: newItem.isPinned,
        restoredCount: newItem.restoredCount,
      },
    });
    memoryClipboard = [saved as any, ...memoryClipboard.filter((i: any) => i.id !== saved.id)];
    await pruneClipboard();
    broadcastEvent('clipboard', saved);
    return res.status(201).json(saved);
  } catch (e) {
    memoryClipboard = [newItem as any, ...memoryClipboard.filter((i: any) => i.id !== newItem.id)];
    await pruneClipboard();
    broadcastEvent('clipboard', newItem);
    return res.status(201).json(newItem);
  }
});

app.post('/api/clipboard/:id/restore', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updated = await prisma.clipboardItem.update({
      where: { id },
      data: { restoredCount: { increment: 1 } },
    });
    return res.json(updated);
  } catch (e) {
    const idx = memoryClipboard.findIndex((item) => item.id === id);
    if (idx !== -1) {
      memoryClipboard[idx].restoredCount += 1;
      saveLocalFile(CLIP_FILE, memoryClipboard);
      return res.json(memoryClipboard[idx]);
    }
    return res.status(404).json({ error: 'Item não encontrado' });
  }
});

app.put('/api/clipboard/:id/pin', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const existing = await prisma.clipboardItem.findUnique({ where: { id } });
    if (existing) {
      const updated = await prisma.clipboardItem.update({
        where: { id },
        data: { isPinned: !existing.isPinned },
      });
      return res.json(updated);
    }
  } catch (e) {
    const idx = memoryClipboard.findIndex((item) => item.id === id);
    if (idx !== -1) {
      memoryClipboard[idx].isPinned = !memoryClipboard[idx].isPinned;
      saveLocalFile(CLIP_FILE, memoryClipboard);
      return res.json(memoryClipboard[idx]);
    }
  }
  res.status(404).json({ error: 'Item não encontrado' });
});

app.delete('/api/clipboard/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.clipboardItem.delete({ where: { id } });
  } catch (e) {}
  memoryClipboard = memoryClipboard.filter((item) => item.id !== id);
  saveLocalFile(CLIP_FILE, memoryClipboard);
  res.json({ message: 'Item removido com sucesso' });
});

// --- 2. ENDPOINTS DE IMAGENS DELETADAS ---

app.get('/api/images', async (_req: Request, res: Response) => {
  try {
    const images = await prisma.deletedImage.findMany({
      take: 100,
      orderBy: { deletedAt: 'desc' },
    });
    if (images.length > 0) {
      return res.json(images);
    }
  } catch (e) {}
  res.json(memoryImages.slice(0, 100));
});

app.post('/api/images/:id/restore', async (req: Request, res: Response) => {
  const { id } = req.params;
  const now = new Date();
  try {
    const updated = await prisma.deletedImage.update({
      where: { id },
      data: { isRestored: true, restoredAt: now },
    });
    return res.json(updated);
  } catch (e) {
    const idx = memoryImages.findIndex((item) => item.id === id);
    if (idx !== -1) {
      memoryImages[idx].isRestored = true;
      memoryImages[idx].restoredAt = now;
      saveLocalFile(IMG_FILE, memoryImages);
      return res.json(memoryImages[idx]);
    }
    return res.status(404).json({ error: 'Imagem não encontrada' });
  }
});

app.delete('/api/images/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.deletedImage.delete({ where: { id } });
  } catch (e) {}
  memoryImages = memoryImages.filter((item) => item.id !== id);
  saveLocalFile(IMG_FILE, memoryImages);
  res.json({ message: 'Imagem excluída permanentemente' });
});

// --- 3. ENDPOINTS DE LINKS ACESSADOS (NAVEGAÇÃO AUTOMÁTICA) ---

app.get('/api/links', async (_req: Request, res: Response) => {
  try {
    const links = await prisma.accessedLink.findMany({
      take: 100,
      orderBy: { lastVisitedAt: 'desc' },
    });
    if (links.length > 0) {
      return res.json(links);
    }
  } catch (e) {}
  res.json(memoryLinks.slice(0, 100));
});

// Registro imediato de navegação de link
app.post('/api/links', async (req: Request, res: Response) => {
  const { url, title, category } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL é obrigatória' });
  }

  let domain = 'web';
  try {
    const parsed = new URL(url);
    domain = parsed.hostname;
  } catch (e) {}

  const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  const newItem = {
    id: `link-auto-${Date.now()}`,
    url,
    title: title || domain,
    domain,
    favicon,
    category: category || 'Navegação Web',
    visitCount: 1,
    isBookmarked: false,
    lastVisitedAt: new Date(),
  };

  try {
    const saved = await prisma.accessedLink.create({ data: newItem });
    memoryLinks = [saved as any, ...memoryLinks.filter((i: any) => i.id !== saved.id)];
    await pruneLinks();
    broadcastEvent('link', saved);
    return res.status(201).json(saved);
  } catch (e) {
    memoryLinks = [newItem as any, ...memoryLinks.filter((i: any) => i.id !== newItem.id)];
    await pruneLinks();
    broadcastEvent('link', newItem);
    return res.status(201).json(newItem);
  }
});

app.put('/api/links/:id/bookmark', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const existing = await prisma.accessedLink.findUnique({ where: { id } });
    if (existing) {
      const updated = await prisma.accessedLink.update({
        where: { id },
        data: { isBookmarked: !existing.isBookmarked },
      });
      return res.json(updated);
    }
  } catch (e) {
    const idx = memoryLinks.findIndex((item) => item.id === id);
    if (idx !== -1) {
      memoryLinks[idx].isBookmarked = !memoryLinks[idx].isBookmarked;
      saveLocalFile(LNK_FILE, memoryLinks);
      return res.json(memoryLinks[idx]);
    }
  }
  res.status(404).json({ error: 'Link não encontrado' });
});

app.delete('/api/links/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.accessedLink.delete({ where: { id } });
  } catch (e) {}
  memoryLinks = memoryLinks.filter((item) => item.id !== id);
  saveLocalFile(LNK_FILE, memoryLinks);
  res.json({ message: 'Link removido do histórico' });
});

// --- ESTATÍSTICAS E HEALTH ---

app.get('/api/stats', async (_req: Request, res: Response) => {
  let clipCount = memoryClipboard.length;
  let imgCount = memoryImages.length;
  let linkCount = memoryLinks.length;
  let restoredImgs = memoryImages.filter((i) => i.isRestored).length;

  try {
    clipCount = await prisma.clipboardItem.count();
    imgCount = await prisma.deletedImage.count();
    linkCount = await prisma.accessedLink.count();
    restoredImgs = await prisma.deletedImage.count({ where: { isRestored: true } });
  } catch (e) {}

  res.json({
    clipboardTotal: clipCount,
    imagesTotal: imgCount,
    imagesRestored: restoredImgs,
    linksTotal: linkCount,
    activeStreamClients: sseClients.length,
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/seed', async (_req: Request, res: Response) => {
  memoryClipboard = generateSeedClipboard();
  memoryImages = generateSeedImages();
  memoryLinks = generateSeedLinks();

  try {
    await prisma.clipboardItem.deleteMany({});
    await prisma.deletedImage.deleteMany({});
    await prisma.accessedLink.deleteMany({});
    await ensureSeeded();
  } catch (e) {}

  saveLocalFile(CLIP_FILE, memoryClipboard);
  saveLocalFile(IMG_FILE, memoryImages);
  saveLocalFile(LNK_FILE, memoryLinks);

  res.json({ message: '100 itens gerados com sucesso para cada uma das 3 seções do Pglyph Restaurador!' });
});

app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const userCount = await prisma.user.count();
    const clipCount = await prisma.clipboardItem.count();
    const result = await prisma.$queryRaw<Array<{ now: Date }>>`SELECT NOW()`;

    res.json({
      status: 'ok',
      orm: 'Prisma ORM',
      app: 'Pglyph Restaurador (Auto-Capture Engine)',
      message: 'API Backend com suporte a captura automática em tempo real ativada!',
      timestamp: new Date().toISOString(),
      userCount,
      clipboardCount: clipCount,
      databaseTime: result[0]?.now || null,
    });
  } catch (error) {
    res.json({
      status: 'degraded',
      orm: 'Prisma ORM',
      app: 'Pglyph Restaurador',
      message: 'API rodando em modo híbrido com fallback de memória...',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Pglyph Restaurador Backend (Auto-Capture Engine) rodando na porta ${PORT}`);
});
