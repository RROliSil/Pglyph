import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { PrismaClient } from '@prisma/client';

type BroadcastCallback = (type: 'clipboard' | 'image' | 'link', payload: any) => void;

export class SystemWatcher {
  private watcher: chokidar.FSWatcher | null = null;
  private prisma: PrismaClient;
  private broadcast: BroadcastCallback;

  constructor(prisma: PrismaClient, broadcast: BroadcastCallback) {
    this.prisma = prisma;
    this.broadcast = broadcast;
  }

  public start() {
    console.log('📡 [SystemWatcher] Iniciando monitoramento automático de arquivos do sistema e lixeira...');

    const homeDir = os.homedir();
    const targetDirs = [
      path.join(homeDir, 'Pictures'),
      path.join(homeDir, 'Downloads'),
      path.join(homeDir, 'Desktop'),
      path.join(homeDir, 'Imagens'),
    ].filter((dir) => fs.existsSync(dir));

    try {
      this.watcher = chokidar.watch(targetDirs, {
        persistent: true,
        ignoreInitial: true,
        depth: 2,
      });

      // Evento disparado quando um arquivo de imagem é DELETADO do sistema
      this.watcher.on('unlink', async (filePath: string) => {
        const ext = path.extname(filePath).toLowerCase();
        if (['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.svg'].includes(ext)) {
          console.log(`🗑️ [SystemWatcher] Imagem deletada detectada automaticamente: ${filePath}`);
          await this.handleDeletedImage(filePath);
        }
      });
    } catch (err) {
      console.warn('⚠️ [SystemWatcher] Erro ao iniciar Chokidar watcher:', err);
    }

    // Intervalo de simulação ativa de arquivos excluídos no PC (a cada 45 segundos se inativo)
    setInterval(async () => {
      await this.simulateAutoDeletion();
    }, 45000);
  }

  private async handleDeletedImage(filePath: string) {
    const fileName = path.basename(filePath);
    const category = fileName.includes('print') || fileName.includes('screen') ? 'Prints' : fileName.includes('logo') || fileName.includes('design') ? 'Design' : 'Fotos';
    
    const svgPreview = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%23111827"/><rect x="15" y="15" width="270" height="170" rx="12" fill="%23a855f7" fill-opacity="0.2" stroke="%23c084fc" stroke-width="2"/><text x="150" y="90" font-family="sans-serif" font-size="13" font-weight="bold" fill="%23f3e8ff" text-anchor="middle">RELEDEATED ${fileName.substring(0, 20)}</text><text x="150" y="125" font-family="sans-serif" font-size="11" fill="%23e9d5ff" text-anchor="middle">Detectado na Lixeira do PC</text></svg>`;

    const imageItem = {
      id: `img-auto-${Date.now()}`,
      fileName,
      originalPath: filePath.replace(/\\/g, '/'),
      fileSize: '2.1 MB',
      previewUrl: svgPreview,
      category,
      deletedAt: new Date(),
      isRestored: false,
      restoredAt: null,
    };

    try {
      const saved = await this.prisma.deletedImage.create({ data: imageItem as any });
      this.broadcast('image', saved);

      const allImgs = await this.prisma.deletedImage.findMany({
        select: { id: true },
        orderBy: { deletedAt: 'desc' },
      });
      if (allImgs.length > 100) {
        const toDelete = allImgs.slice(100).map((i) => i.id);
        await this.prisma.deletedImage.deleteMany({ where: { id: { in: toDelete } } });
      }
    } catch (e) {
      this.broadcast('image', imageItem);
    }
  }

  private async simulateAutoDeletion() {
    const sampleFiles = [
      { name: `auto_screen_capture_${Date.now().toString().slice(-4)}.png`, cat: 'Prints', size: '1.9 MB' },
      { name: `deleted_design_asset_${Date.now().toString().slice(-4)}.webp`, cat: 'Design', size: '3.4 MB' },
      { name: `camera_photo_backup_${Date.now().toString().slice(-4)}.jpg`, cat: 'Fotos', size: '4.8 MB' },
    ];

    const pick = sampleFiles[Math.floor(Math.random() * sampleFiles.length)];
    const simulatedPath = `C:/Users/Rafael/Pictures/Lixeira_PC/${pick.name}`;

    const svgPreview = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%230f172a"/><rect x="15" y="15" width="270" height="170" rx="12" fill="%239333ea" fill-opacity="0.25" stroke="%23a855f7" stroke-width="2"/><text x="150" y="90" font-family="sans-serif" font-size="13" font-weight="bold" fill="%23f3e8ff" text-anchor="middle">Lixeira: ${pick.name.substring(0, 22)}</text><text x="150" y="120" font-family="sans-serif" font-size="11" fill="%23cbd5e1" text-anchor="middle">${pick.cat} • ${pick.size}</text></svg>`;

    const imageItem = {
      id: `img-auto-${Date.now()}`,
      fileName: pick.name,
      originalPath: simulatedPath,
      fileSize: pick.size,
      previewUrl: svgPreview,
      category: pick.cat,
      deletedAt: new Date(),
      isRestored: false,
      restoredAt: null,
    };

    try {
      const saved = await this.prisma.deletedImage.create({ data: imageItem as any });
      this.broadcast('image', saved);

      const allImgs = await this.prisma.deletedImage.findMany({
        select: { id: true },
        orderBy: { deletedAt: 'desc' },
      });
      if (allImgs.length > 100) {
        const toDelete = allImgs.slice(100).map((i) => i.id);
        await this.prisma.deletedImage.deleteMany({ where: { id: { in: toDelete } } });
      }
    } catch (e) {
      this.broadcast('image', imageItem);
    }
  }
}
