import React, { useState } from 'react';

export interface DeletedImage {
  id: string;
  fileName: string;
  originalPath: string;
  fileSize: string;
  previewUrl: string;
  category: string;
  deletedAt: string;
  isRestored: boolean;
  restoredAt?: string | null;
}

interface ImagesRestorerProps {
  images: DeletedImage[];
  onRestore: (id: string) => void;
  onDeletePermanent: (id: string) => void;
}

export const ImagesRestorer: React.FC<ImagesRestorerProps> = ({
  images,
  onRestore,
  onDeletePermanent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('ALL');
  const [activeZoomImage, setActiveZoomImage] = useState<DeletedImage | null>(null);

  const filteredImages = images.filter((img) => {
    const matchesSearch =
      img.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.originalPath.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCat === 'ALL' || img.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  const categories = ['ALL', 'Prints', 'Design', 'Documentos', 'Fotos', 'Diagramas'];

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="card-glass p-6 rounded-3xl border border-slate-700/50 bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🖼️</span>
              <h2 className="text-2xl font-black tracking-tight text-slate-100">Restaurador de Imagens Deletadas</h2>
            </div>
            <p className="text-slate-400 text-sm">
              Varredura de recuperação das <strong className="text-purple-400">100 últimas imagens deletadas no PC</strong> com restauração direta para o disco rígido.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-2.5 text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-wider">Espaço em Risco</span>
              <span className="text-sm font-extrabold text-purple-400 font-mono">~380.5 MB Recuperáveis</span>
            </div>
          </div>
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
                  ? 'bg-purple-600 text-white font-bold shadow-[0_2px_10px_rgba(147,51,234,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {cat === 'ALL' ? 'Todas (100)' : cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Buscar por nome ou caminho do PC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
          <span className="absolute left-3.5 top-2.5 text-slate-500 text-xs">🔍</span>
        </div>
      </div>

      {/* Counter */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
        <span>Exibindo <strong>{filteredImages.length}</strong> de <strong>{images.length}</strong> últimas imagens deletadas</span>
        <span>Ordenado da mais recente para mais antiga</span>
      </div>

      {/* Grid of Images */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-16 card-glass rounded-3xl border border-slate-800">
          <span className="text-4xl block mb-2">🔍</span>
          <p className="text-slate-400 text-sm">Nenhuma imagem deletada encontrada com os critérios informados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredImages.map((img) => (
            <div
              key={img.id}
              className={`group relative rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between ${
                img.isRestored
                  ? 'bg-slate-900/40 border-emerald-500/30'
                  : 'bg-slate-900/70 border-slate-800 hover:border-purple-500/50 hover:shadow-[0_4px_25px_rgba(147,51,234,0.15)]'
              }`}
            >
              {/* Image Preview Container */}
              <div className="relative h-44 bg-slate-950 overflow-hidden cursor-pointer" onClick={() => setActiveZoomImage(img)}>
                <img
                  src={img.previewUrl}
                  alt={img.fileName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                />
                
                {/* Category & Status Overlay */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-purple-300 border border-purple-500/30">
                    {img.category}
                  </span>
                </div>

                <div className="absolute top-2 right-2">
                  {img.isRestored ? (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/90 text-slate-950 shadow-md">
                      ✓ RESTAURADA
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-500/80 text-white backdrop-blur-md">
                      DELETADA
                    </span>
                  )}
                </div>

                {/* Hover Zoom Prompt */}
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold text-slate-200 gap-1.5">
                  <span>🔍 Clique para ampliar</span>
                </div>
              </div>

              {/* Card Meta & Actions */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-mono font-bold text-xs text-slate-100 truncate" title={img.fileName}>
                    {img.fileName}
                  </h4>
                  <p className="text-[11px] font-mono text-slate-500 truncate mt-1" title={img.originalPath}>
                    📁 {img.originalPath}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
                    <span>💾 {img.fileSize}</span>
                    <span>🕒 {new Date(img.deletedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                  {img.isRestored ? (
                    <button
                      disabled
                      className="flex-1 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs cursor-default flex items-center justify-center gap-1"
                    >
                      <span>✓ Imagem Restaurada</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onRestore(img.id)}
                      className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-[0_2px_10px_rgba(147,51,234,0.3)] transition active:scale-95 flex items-center justify-center gap-1"
                    >
                      <span>♻️</span>
                      <span>Restaurar Imagem</span>
                    </button>
                  )}

                  <button
                    onClick={() => onDeletePermanent(img.id)}
                    title="Excluir do histórico do restaurador"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 text-xs transition"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Zoom em Alta Resolução */}
      {activeZoomImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActiveZoomImage(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-mono font-bold text-base text-slate-100">{activeZoomImage.fileName}</h3>
                <p className="text-xs text-slate-400 font-mono">{activeZoomImage.originalPath}</p>
              </div>
              <button
                onClick={() => setActiveZoomImage(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 max-h-[60vh] flex items-center justify-center">
              <img src={activeZoomImage.previewUrl} alt={activeZoomImage.fileName} className="max-h-[60vh] object-contain" />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div className="text-xs font-mono text-slate-400">
                Tamanho: <strong className="text-purple-400">{activeZoomImage.fileSize}</strong> • Categoria: <strong>{activeZoomImage.category}</strong>
              </div>

              {!activeZoomImage.isRestored && (
                <button
                  onClick={() => {
                    onRestore(activeZoomImage.id);
                    setActiveZoomImage((prev) => (prev ? { ...prev, isRestored: true } : null));
                  }}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition"
                >
                  ♻️ Restaurar esta Imagem no PC
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
