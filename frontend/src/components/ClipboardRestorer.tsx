import React, { useState } from 'react';

export interface ClipboardItem {
  id: string;
  content: string;
  contentType: 'TEXT' | 'CODE' | 'URL' | 'SECRET';
  charCount: number;
  isPinned: boolean;
  restoredCount: number;
  createdAt: string;
}

interface ClipboardRestorerProps {
  items: ClipboardItem[];
  onRestore: (id: string, content: string) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
  onAddManual: (content: string, type: 'TEXT' | 'CODE' | 'URL' | 'SECRET') => void;
}

export const ClipboardRestorer: React.FC<ClipboardRestorerProps> = ({
  items,
  onRestore,
  onTogglePin,
  onDelete,
  onAddManual,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<'TEXT' | 'CODE' | 'URL' | 'SECRET'>('TEXT');

  const filteredItems = items
    .filter((item) => {
      const matchesSearch = item.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'ALL' || item.contentType === selectedType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  const handlePasteCapture = async () => {
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) {
          onAddManual(text, text.startsWith('http') ? 'URL' : text.includes(';') || text.includes('{') ? 'CODE' : 'TEXT');
        }
      }
    } catch (err) {
      alert('Por favor, cole seu texto no campo de teste abaixo.');
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    onAddManual(newContent, newType);
    setNewContent('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="card-glass p-6 rounded-3xl border border-slate-700/50 bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">📋</span>
              <h2 className="text-2xl font-black tracking-tight text-slate-100">Restaurador de CTRL+C</h2>
            </div>
            <p className="text-slate-400 text-sm">
              Armazena e restaura instantaneamente os <strong className="text-cyan-400">100 últimos itens copiados</strong> para a sua Área de Transferência.
            </p>
          </div>

          <button
            onClick={handlePasteCapture}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-[0_4px_20px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <span>⚡</span>
            <span>Capturar CTRL+C Atual</span>
          </button>
        </div>

        {/* Input para adicionar/simular nova cópia */}
        <form onSubmit={handleAddSubmit} className="mt-5 pt-5 border-t border-slate-700/60 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Digite ou cole qualquer texto para gravar nas últimas 100 cópias..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="flex-1 bg-slate-950/70 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
          />
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as any)}
            className="bg-slate-950/70 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="TEXT">Texto Comum</option>
            <option value="CODE">Código / Script</option>
            <option value="URL">Link / Web URL</option>
            <option value="SECRET">Senha / Token</option>
          </select>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-semibold text-sm transition"
          >
            Gravar Cópias
          </button>
        </form>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Type Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-2xl">
          {[
            { label: 'Todos (100)', value: 'ALL' },
            { label: '💻 Código', value: 'CODE' },
            { label: '📝 Texto', value: 'TEXT' },
            { label: '🔗 URLs', value: 'URL' },
            { label: '🔑 Segredos', value: 'SECRET' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedType(tab.value)}
              className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all ${
                selectedType === tab.value
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_2px_10px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Pesquisar nos 100 itens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <span className="absolute left-3.5 top-2.5 text-slate-500 text-xs">🔍</span>
        </div>
      </div>

      {/* Items List Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
          <span>Exibindo <strong>{filteredItems.length}</strong> de <strong>{items.length}</strong> últimas cópias no CTRL+C</span>
          <span>Organizado por recência & fixados</span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-16 card-glass rounded-3xl border border-slate-800">
            <span className="text-4xl block mb-2">🔍</span>
            <p className="text-slate-400 text-sm">Nenhuma cópia do CTRL+C encontrada para este filtro.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`group relative p-4 rounded-2xl border transition-all duration-300 hover:shadow-xl ${
                item.isPinned
                  ? 'bg-slate-900/90 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                  : 'bg-slate-900/50 hover:bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                        item.contentType === 'CODE'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                          : item.contentType === 'URL'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : item.contentType === 'SECRET'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {item.contentType}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(item.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • {item.charCount} caracteres
                    </span>
                    {item.restoredCount > 0 && (
                      <span className="text-[10px] bg-slate-800 text-cyan-400 px-2 py-0.5 rounded-full font-mono">
                        Restaurado {item.restoredCount}x
                      </span>
                    )}
                  </div>

                  {/* Content Preview */}
                  <div
                    className={`font-mono text-xs p-3 rounded-xl border overflow-x-auto max-h-36 ${
                      item.contentType === 'CODE'
                        ? 'bg-slate-950 text-cyan-300 border-slate-800'
                        : item.contentType === 'SECRET'
                        ? 'bg-slate-950 text-amber-300 border-slate-800 tracking-widest blur-[1px] hover:blur-none transition'
                        : 'bg-slate-950/70 text-slate-200 border-slate-850'
                    }`}
                  >
                    <pre className="whitespace-pre-wrap break-all">{item.content}</pre>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => onTogglePin(item.id)}
                    title={item.isPinned ? 'Desfixar' : 'Fixar no topo'}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition ${
                      item.isPinned
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {item.isPinned ? '📌 Fixado' : '📌 Fixar'}
                  </button>

                  <button
                    onClick={() => onRestore(item.id, item.content)}
                    className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-[0_2px_12px_rgba(6,182,212,0.3)] transition active:scale-95 flex items-center gap-1.5"
                  >
                    <span>📋</span>
                    <span>Restaurar no CTRL+C</span>
                  </button>

                  <button
                    onClick={() => onDelete(item.id)}
                    title="Remover do histórico"
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-red-500/20 hover:text-red-400 border border-slate-700 text-slate-400 text-xs transition"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
