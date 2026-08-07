// Helper para geração de 100 itens em cada uma das 3 seções do Restaurador Pglyph

export const generateSeedClipboard = () => {
  const categories = [
    { type: 'CODE', prefix: 'const express = require("express");\nconst app = express();\napp.listen(5000);' },
    { type: 'CODE', prefix: 'SELECT * FROM "ClipboardItem" WHERE "isPinned" = true ORDER BY "createdAt" DESC;' },
    { type: 'CODE', prefix: 'docker compose up -d --build postgres backend frontend' },
    { type: 'CODE', prefix: 'git commit -m "feat(restorer): adiciona suporte a 100 itens da area de transferencia"' },
    { type: 'CODE', prefix: 'export interface RestorerState {\n  clipboard: ClipboardItem[];\n  images: DeletedImage[];\n  links: AccessedLink[];\n}' },
    { type: 'URL', prefix: 'https://github.com/RROliSil/Pglyph/pull/42' },
    { type: 'URL', prefix: 'http://portainer.local:9000/#/2/docker/containers' },
    { type: 'SECRET', prefix: 'pglyph_sec_key_99f8a2b17c8d9e0f1a2b3c4d5e6f' },
    { type: 'TEXT', prefix: 'Reunião de alinhamento com equipe de infraestrutura sobre redeploy no Portainer' },
    { type: 'TEXT', prefix: 'Lista de tarefas Pglyph: 1. CTRL+C (100) 2. Imagens Deletadas (100) 3. Links Acessados (100)' },
  ];

  const items = [];
  const now = Date.now();

  for (let i = 1; i <= 100; i++) {
    const template = categories[i % categories.length];
    let content = template.prefix;
    if (template.type === 'CODE') {
      content = `${template.prefix} // Ref #${100 - i + 1}`;
    } else if (template.type === 'URL') {
      content = `${template.prefix}?ref=item_${100 - i + 1}`;
    } else if (template.type === 'SECRET') {
      content = `pglyph_token_prod_${(10000 + i).toString(16)}_${Math.random().toString(36).substring(2, 8)}`;
    } else {
      content = `${template.prefix} [Item ${100 - i + 1} capturado no CTRL+C]`;
    }

    items.push({
      id: `clip-${101 - i}`,
      content,
      contentType: template.type,
      charCount: content.length,
      isPinned: i % 7 === 0,
      restoredCount: Math.floor(Math.random() * 5),
      createdAt: new Date(now - i * 1800000), // 30 minutos de intervalo
    });
  }

  return items;
};

export const generateSeedImages = () => {
  const imageNames = [
    { name: 'screenshot_portainer_dashboard.png', cat: 'Prints', size: '2.4 MB' },
    { name: 'mockup_pglyph_rune_tile.jpg', cat: 'Design', size: '1.8 MB' },
    { name: 'invoice_aws_cloud_august.pdf.png', cat: 'Documentos', size: '920 KB' },
    { name: 'diagram_microservices_architecture.png', cat: 'Diagramas', size: '3.1 MB' },
    { name: 'banner_hero_cyberpunk_theme.webp', cat: 'Design', size: '4.5 MB' },
    { name: 'photo_dev_team_sync.jpg', cat: 'Fotos', size: '5.2 MB' },
    { name: 'logo_pglyph_vector_dark.svg', cat: 'Design', size: '410 KB' },
    { name: 'screenshot_prisma_migration_error.png', cat: 'Prints', size: '1.1 MB' },
    { name: 'receipt_domain_renew_2026.png', cat: 'Documentos', size: '680 KB' },
    { name: 'wireframe_restorer_3_tabs.png', cat: 'Design', size: '2.9 MB' },
  ];

  const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#3b82f6'];

  const items = [];
  const now = Date.now();

  for (let i = 1; i <= 100; i++) {
    const template = imageNames[i % imageNames.length];
    const fileName = `${i < 10 ? '0' : ''}${i}_${template.name}`;
    const color = colors[i % colors.length];
    
    // SVG minimalista como preview data URI
    const svgPreview = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%23181825"/><rect x="20" y="20" width="260" height="160" rx="12" fill="${encodeURIComponent(color)}" fill-opacity="0.15" stroke="${encodeURIComponent(color)}" stroke-width="2"/><text x="150" y="95" font-family="sans-serif" font-size="14" font-weight="bold" fill="%23e2e8f0" text-anchor="middle">Pglyph Media #${101 - i}</text><text x="150" y="120" font-family="sans-serif" font-size="11" fill="%2394a3b8" text-anchor="middle">${template.cat} • ${template.size}</text></svg>`;

    const isRestored = i % 8 === 0;

    items.push({
      id: `img-${101 - i}`,
      fileName,
      originalPath: `C:/Users/Rafael/Pictures/Pglyph_Backups/${template.cat}/${fileName}`,
      fileSize: template.size,
      previewUrl: svgPreview,
      category: template.cat,
      deletedAt: new Date(now - i * 3600000), // 1 hora de intervalo
      isRestored,
      restoredAt: isRestored ? new Date(now - i * 1800000) : null,
    });
  }

  return items;
};

export const generateSeedLinks = () => {
  const sites = [
    { title: 'GitHub - RROliSil/Pglyph', url: 'https://github.com/RROliSil/Pglyph', domain: 'github.com', cat: 'Desenvolvimento' },
    { title: 'Portainer.io - Container Management', url: 'https://portainer.io/dashboard', domain: 'portainer.io', cat: 'Servidores & DevOps' },
    { title: 'React Documentation - Hooks & Components', url: 'https://react.dev/reference/react', domain: 'react.dev', cat: 'Documentação' },
    { title: 'Prisma Client & Schema Reference', url: 'https://prisma.io/docs/concepts/components/prisma-schema', domain: 'prisma.io', cat: 'Documentação' },
    { title: 'Vite 5 Guide - Next Generation Frontend Tooling', url: 'https://vitejs.dev/guide/', domain: 'vitejs.dev', cat: 'Desenvolvimento' },
    { title: 'MDN Web Docs - Clipboard API Interface', url: 'https://developer.mozilla.org/pt-BR/docs/Web/API/Clipboard_API', domain: 'developer.mozilla.org', cat: 'Documentação' },
    { title: 'Docker Hub - Official Postgres Image', url: 'https://hub.docker.com/_/postgres', domain: 'hub.docker.com', cat: 'Servidores & DevOps' },
    { title: 'Hacker News - Tech & Startups', url: 'https://news.ycombinator.com', domain: 'ycombinator.com', cat: 'Notícias & Tech' },
    { title: 'Glassmorphism Design Generator & UI Assets', url: 'https://ui.glass/generator', domain: 'ui.glass', cat: 'Design & UI' },
    { title: 'Stack Overflow - Express CORS setup guide', url: 'https://stackoverflow.com/questions/3504788/express-cors', domain: 'stackoverflow.com', cat: 'Desenvolvimento' },
  ];

  const items = [];
  const now = Date.now();

  for (let i = 1; i <= 100; i++) {
    const site = sites[i % sites.length];
    const fullUrl = `${site.url}?session=${101 - i}`;
    const favicon = `https://www.google.com/s2/favicons?domain=${site.domain}&sz=64`;

    items.push({
      id: `link-${101 - i}`,
      url: fullUrl,
      title: `${site.title} #${101 - i}`,
      domain: site.domain,
      favicon,
      category: site.cat,
      visitCount: Math.floor(Math.random() * 15) + 1,
      isBookmarked: i % 6 === 0,
      lastVisitedAt: new Date(now - i * 1200000), // 20 minutos de intervalo
    });
  }

  return items;
};
