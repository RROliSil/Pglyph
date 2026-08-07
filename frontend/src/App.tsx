import React, { useEffect, useState, useCallback } from 'react';
import { PglyphLogo } from './components/PglyphLogo';
import { ClipboardRestorer, ClipboardItem } from './components/ClipboardRestorer';
import { ImagesRestorer, DeletedImage } from './components/ImagesRestorer';
import { LinksRestorer, AccessedLink } from './components/LinksRestorer';
import { GeneralDashboard } from './components/GeneralDashboard';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clipboard' | 'images' | 'links'>('dashboard');

  const [clipboardItems, setClipboardItems] = useState<ClipboardItem[]>([]);
  const [deletedImages, setDeletedImages] = useState<DeletedImage[]>([]);
  const [accessedLinks, setAccessedLinks] = useState<AccessedLink[]>([]);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [apiHealth, setApiHealth] = useState<string>('Conectando...');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchAllData = async () => {
    try {
      const [resClip, resImg, resLnk, resHealth] = await Promise.all([
        fetch('/api/clipboard').then((r) => r.json()),
        fetch('/api/images').then((r) => r.json()),
        fetch('/api/links').then((r) => r.json()),
        fetch('/api/health').then((r) => r.json()).catch(() => ({ status: 'off' })),
      ]);

      if (Array.isArray(resClip)) setClipboardItems(resClip);
      if (Array.isArray(resImg)) setDeletedImages(resImg);
      if (Array.isArray(resLnk)) setAccessedLinks(resLnk);

      if (resHealth.status === 'ok') {
        setApiHealth('Auto-Capture Engine Online');
      } else {
        setApiHealth('Modo Local Híbrido');
      }
    } catch (err) {
      setApiHealth('Conectando ao Container Backend...');
    }
  };

  // --- Função para gravar novo CTRL+C no backend ---
  const sendAutoClipboard = useCallback(async (content: string) => {
    if (!content || !content.trim()) return;

    try {
      const res = await fetch('/api/clipboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      setClipboardItems((prev) => {
        // Evita duplicata se já estiver no topo
        if (prev.length > 0 && prev[0].content === content) return prev;
        return [data, ...prev].slice(0, 100);
      });
      showToast('⚡ CTRL+C Capturado e registrado automaticamente!');
    } catch (e) {}
  }, []);

  // --- ESCUTADOR AUTOMÁTICO DE CTRL+C E CLIPBOARD ---
  useEffect(() => {
    const handleGlobalCopy = (e: ClipboardEvent) => {
      const selection = window.getSelection()?.toString();
      if (selection && selection.trim()) {
        sendAutoClipboard(selection);
      } else if (e.clipboardData) {
        const text = e.clipboardData.getData('text');
        if (text) sendAutoClipboard(text);
      }
    };

    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
        setTimeout(async () => {
          try {
            if (navigator.clipboard) {
              const text = await navigator.clipboard.readText();
              if (text && text.trim()) {
                sendAutoClipboard(text);
              }
            }
          } catch (err) {}
        }, 150);
      }
    };

    window.addEventListener('copy', handleGlobalCopy);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('copy', handleGlobalCopy);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [sendAutoClipboard]);

  // --- ESCUTADOR AUTOMÁTICO DE LINKS ACESSADOS ---
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (target && target.href && !target.href.startsWith('javascript:')) {
        const url = target.href;
        const title = target.innerText || target.getAttribute('title') || target.href;

        fetch('/api/links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, title, category: 'Navegação ao Vivo' }),
        })
          .then((r) => r.json())
          .then((data) => {
            setAccessedLinks((prev) => [data, ...prev].slice(0, 100));
            showToast('🔗 Link acessado registrado de imediato!');
          })
          .catch(() => {});
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  // --- STREAM SSE EM TEMPO REAL COM O BACKEND ---
  useEffect(() => {
    fetchAllData();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/stream');

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'clipboard' && data.payload) {
            setClipboardItems((prev) => [data.payload, ...prev.filter((i) => i.id !== data.payload.id)].slice(0, 100));
            showToast('⚡ Novo CTRL+C sincronizado ao vivo!');
          } else if (data.type === 'image' && data.payload) {
            setDeletedImages((prev) => [data.payload, ...prev.filter((i) => i.id !== data.payload.id)].slice(0, 100));
            showToast('🗑️ Imagem excluída do PC capturada automaticamente!');
          } else if (data.type === 'link' && data.payload) {
            setAccessedLinks((prev) => [data.payload, ...prev.filter((i) => i.id !== data.payload.id)].slice(0, 100));
            showToast('🔗 Novo link acessado registrado no histórico!');
          }
        } catch (e) {}
      };
    } catch (e) {}

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  // --- Handlers de Ação: CTRL+C ---
  const handleRestoreClipboard = async (id: string, content: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(content);
      }
    } catch (e) {}

    showToast('✨ Item restaurado com sucesso para a sua Área de Transferência (CTRL+C)!');

    try {
      await fetch(`/api/clipboard/${id}/restore`, { method: 'POST' });
    } catch (e) {}

    setClipboardItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, restoredCount: item.restoredCount + 1 } : item))
    );
  };

  const handleTogglePinClipboard = async (id: string) => {
    try {
      await fetch(`/api/clipboard/${id}/pin`, { method: 'PUT' });
    } catch (e) {}

    setClipboardItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isPinned: !item.isPinned } : item))
    );
  };

  const handleDeleteClipboard = async (id: string) => {
    try {
      await fetch(`/api/clipboard/${id}`, { method: 'DELETE' });
    } catch (e) {}
    setClipboardItems((prev) => prev.filter((item) => item.id !== id));
    showToast('🗑️ Item removido do histórico de cópias.');
  };

  const handleAddClipboardManual = async (content: string, type: 'TEXT' | 'CODE' | 'URL' | 'SECRET') => {
    try {
      const res = await fetch('/api/clipboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, contentType: type }),
      });
      const data = await res.json();
      setClipboardItems((prev) => [data, ...prev].slice(0, 100));
      showToast('📥 Cópia gravada no topo dos 100 itens!');
    } catch (e) {
      const newItem: ClipboardItem = {
        id: `clip-loc-${Date.now()}`,
        content,
        contentType: type,
        charCount: content.length,
        isPinned: false,
        restoredCount: 0,
        createdAt: new Date().toISOString(),
      };
      setClipboardItems((prev) => [newItem, ...prev].slice(0, 100));
      showToast('📥 Cópia gravada no topo!');
    }
  };

  // --- Handlers de Ação: Imagens Deletadas ---
  const handleRestoreImage = async (id: string) => {
    try {
      await fetch(`/api/images/${id}/restore`, { method: 'POST' });
    } catch (e) {}

    setDeletedImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, isRestored: true, restoredAt: new Date().toISOString() } : img))
    );
    showToast('♻️ Imagem restaurada com sucesso no diretório do PC!');
  };

  const handleDeleteImagePermanent = async (id: string) => {
    try {
      await fetch(`/api/images/${id}`, { method: 'DELETE' });
    } catch (e) {}
    setDeletedImages((prev) => prev.filter((img) => img.id !== id));
    showToast('🗑️ Imagem excluída do histórico do restaurador.');
  };

  // --- Handlers de Ação: Links Acessados ---
  const handleOpenLink = (url: string) => {
    window.open(url, '_blank');

    fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, category: 'Guia Restaurada' }),
    }).catch(() => {});

    showToast('🚀 Guia restaurada e aberta em nova aba!');
  };

  const handleToggleBookmarkLink = async (id: string) => {
    try {
      await fetch(`/api/links/${id}/bookmark`, { method: 'PUT' });
    } catch (e) {}

    setAccessedLinks((prev) =>
      prev.map((link) => (link.id === id ? { ...link, isBookmarked: !link.isBookmarked } : link))
    );
  };

  const handleDeleteLink = async (id: string) => {
    try {
      await fetch(`/api/links/${id}`, { method: 'DELETE' });
    } catch (e) {}
    setAccessedLinks((prev) => prev.filter((link) => link.id !== id));
    showToast('🗑️ Link removido do histórico de acessos.');
  };

  const handleAddLink = async (url: string, title?: string, category?: string) => {
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, title, category }),
      });
      const data = await res.json();
      setAccessedLinks((prev) => [data, ...prev].slice(0, 100));
      showToast('🔗 Novo link adicionado aos 100 últimos acessos!');
    } catch (e) {}
  };

  const handleTriggerSeed = async () => {
    try {
      await fetch('/api/seed', { method: 'POST' });
      await fetchAllData();
      showToast('🔄 100 novos itens atualizados para as 3 páginas com sucesso!');
    } catch (e) {
      showToast('⚠️ Erro ao comunicar com a API de seed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0e12] text-slate-100 flex flex-col font-sans antialiased">
      {/* Top Fixed Header Navbar */}
      <header className="sticky top-0 z-40 bg-[#121319]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-6">
          <div className="cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <PglyphLogo size="md" showText={true} />
          </div>

          {/* Navigation Tab Bar */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800/80 rounded-2xl">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800 text-slate-100 shadow-md border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <span>📊 Painel Geral</span>
            </button>

            <button
              onClick={() => setActiveTab('clipboard')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === 'clipboard'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_2px_12px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <span>📋 CTRL+C</span>
              <span className="bg-slate-950/30 text-current px-2 py-0.5 rounded-full text-[10px] font-mono">
                {clipboardItems.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('images')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === 'images'
                  ? 'bg-purple-600 text-white shadow-[0_2px_12px_rgba(147,51,234,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <span>🖼️ Imagens Deletadas</span>
              <span className="bg-slate-950/30 text-current px-2 py-0.5 rounded-full text-[10px] font-mono">
                {deletedImages.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('links')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === 'links'
                  ? 'bg-blue-600 text-white shadow-[0_2px_12px_rgba(37,99,235,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <span>🔗 Links Acessados</span>
              <span className="bg-slate-950/30 text-current px-2 py-0.5 rounded-full text-[10px] font-mono">
                {accessedLinks.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Right Status Badge & Reset */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-bold">{apiHealth}</span>
          </div>

          <button
            onClick={handleTriggerSeed}
            title="Resetar e popular com 100 novos itens em cada aba"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5"
          >
            <span>🔄</span>
            <span className="hidden sm:inline">100 Itens Seed</span>
          </button>
        </div>
      </header>

      {/* Mobile Tab Navigation */}
      <div className="flex lg:hidden overflow-x-auto bg-[#121319] border-b border-slate-800 p-2 gap-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 ${
            activeTab === 'dashboard' ? 'bg-slate-800 text-white' : 'text-slate-400'
          }`}
        >
          📊 Painel
        </button>
        <button
          onClick={() => setActiveTab('clipboard')}
          className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 ${
            activeTab === 'clipboard' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
          }`}
        >
          📋 CTRL+C ({clipboardItems.length})
        </button>
        <button
          onClick={() => setActiveTab('images')}
          className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 ${
            activeTab === 'images' ? 'bg-purple-600 text-white' : 'text-slate-400'
          }`}
        >
          🖼️ Imagens ({deletedImages.length})
        </button>
        <button
          onClick={() => setActiveTab('links')}
          className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 ${
            activeTab === 'links' ? 'bg-blue-600 text-white' : 'text-slate-400'
          }`}
        >
          🔗 Links ({accessedLinks.length})
        </button>
      </div>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {activeTab === 'dashboard' && (
          <GeneralDashboard
            clipboardCount={clipboardItems.length}
            imagesCount={deletedImages.length}
            imagesRestoredCount={deletedImages.filter((i) => i.isRestored).length}
            linksCount={accessedLinks.length}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onTriggerSeed={handleTriggerSeed}
          />
        )}

        {activeTab === 'clipboard' && (
          <ClipboardRestorer
            items={clipboardItems}
            onRestore={handleRestoreClipboard}
            onTogglePin={handleTogglePinClipboard}
            onDelete={handleDeleteClipboard}
            onAddManual={handleAddClipboardManual}
          />
        )}

        {activeTab === 'images' && (
          <ImagesRestorer
            images={deletedImages}
            onRestore={handleRestoreImage}
            onDeletePermanent={handleDeleteImagePermanent}
          />
        )}

        {activeTab === 'links' && (
          <LinksRestorer
            links={accessedLinks}
            onOpenLink={handleOpenLink}
            onToggleBookmark={handleToggleBookmarkLink}
            onDelete={handleDeleteLink}
            onAddLink={handleAddLink}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#121319] px-4 py-4 text-center text-xs text-slate-500 font-mono">
        Pglyph Restaurador Digital • Captura Automática em Tempo Real (CTRL+C, Lixeira & Links)
      </footer>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500/50 text-slate-100 px-5 py-3.5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center gap-3 animate-bounce">
          <span className="text-cyan-400 text-lg">⚡</span>
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-slate-200 font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
