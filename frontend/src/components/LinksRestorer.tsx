import React, { useState } from 'react';

export interface AccessedLink {
  id: string;
  url: string;
  title: string;
  domain: string;
  favicon: string;
  category: string;
  visitCount: number;
  isBookmarked: boolean;
  lastVisitedAt: string;
}

interface LinksRestorerProps {
  links: AccessedLink[];
  onOpenLink: (url: string) => void;
  onToggleBookmark: (id: string) => void;
  onDelete: (id: string) => void;
  onAddLink: (url: string, title?: string, category?: string) => void;
}

export const LinksRestorer: React.FC<LinksRestorerProps> = ({
  links,
  onOpenLink,
  onToggleBookmark,
  onDelete,
  onAddLink,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('ALL');
  const [newUrl, setNewUrl] = useState('');

  const filteredLinks = links
    .filter((link) => {
      const matchesSearch =
        link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.domain.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = selectedCat === 'ALL' || link.category === selectedCat;
      return matchesSearch && matchesCat;
    })
    .sort((a, b) => (b.isBookmarked ? 1 : 0) - (a.isBookmarked ? 1 : 0));

  const categories = ['ALL', 'Desenvolvimento', 'Servidores & DevOps', 'Documentação', 'Notícias & Tech', 'Design & UI'];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    onAddLink(newUrl);
    setNewUrl('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="card-glass p-6 rounded-3xl border border-slate-700/50 bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🔗</span>
              <h2 className="text-2xl font-black tracking-tight text-slate-100">Restaurador de Links Acessados</h2>
            </div>
            <p className="text-slate-400 text-sm">
              Recuperação e reabertura dos <strong className="text-blue-400">100 últimos endereços web acessados</strong> com 1-clique.
            </p>
          </div>

          <form onSubmit={handleAddSubmit} className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Registrar nova URL no histórico..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="flex-1 md:w-72 bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition"
            >
              Gravar Link
            </button>
          </form>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-2xl">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all ${
                selectedCat === cat
                  ? 'bg-blue-600 text-white font-bold shadow-[0_2px_10px_rgba(37,99,235,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {cat === 'ALL' ? 'Todos (100)' : cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Pesquisar por título ou URL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <span className="absolute left-3.5 top-2.5 text-slate-500 text-xs">🔍</span>
        </div>
      </div>

      {/* Counter */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
        <span>Exibindo <strong>{filteredLinks.length}</strong> de <strong>{links.length}</strong> últimos links gravados</span>
        <span>Ordenados por favoritos e acessos recentes</span>
      </div>

      {/* Links List */}
      <div className="space-y-3">
        {filteredLinks.length === 0 ? (
          <div className="text-center py-16 card-glass rounded-3xl border border-slate-800">
            <span className="text-4xl block mb-2">🔍</span>
            <p className="text-slate-400 text-sm">Nenhum link encontrado para os filtros selecionados.</p>
          </div>
        ) : (
          filteredLinks.map((link) => (
            <div
              key={link.id}
              className={`group p-4 rounded-2xl border transition-all duration-300 ${
                link.isBookmarked
                  ? 'bg-slate-900/90 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                  : 'bg-slate-900/50 hover:bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Favicon / Icon */}
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center p-2 shrink-0">
                    <img
                      src={link.favicon}
                      alt={link.domain}
                      className="w-5 h-5 object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span className="text-xs font-bold text-slate-500 hidden group-has-[:none]:inline">🌐</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-sm text-slate-100 truncate hover:text-blue-400 transition cursor-pointer" onClick={() => onOpenLink(link.url)}>
                        {link.title}
                      </span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                        {link.category}
                      </span>
                      {link.visitCount > 1 && (
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                          {link.visitCount} acessos
                        </span>
                      )}
                    </div>

                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-mono text-slate-400 hover:text-blue-300 truncate block underline underline-offset-2"
                    >
                      {link.url}
                    </a>

                    <div className="text-[11px] font-mono text-slate-500 mt-1">
                      Última visita: {new Date(link.lastVisitedAt).toLocaleString('pt-BR')} • {link.domain}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => onToggleBookmark(link.id)}
                    title={link.isBookmarked ? 'Desfavoritar' : 'Favoritar link'}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition ${
                      link.isBookmarked
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {link.isBookmarked ? '⭐ Favorito' : '⭐ Favoritar'}
                  </button>

                  <button
                    onClick={() => onOpenLink(link.url)}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-[0_2px_12px_rgba(37,99,235,0.3)] transition active:scale-95 flex items-center gap-1.5"
                  >
                    <span>🚀</span>
                    <span>Restaurar Guia</span>
                  </button>

                  <button
                    onClick={() => onDelete(link.id)}
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
