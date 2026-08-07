import React from 'react';

interface GeneralDashboardProps {
  clipboardCount: number;
  imagesCount: number;
  imagesRestoredCount: number;
  linksCount: number;
  onNavigateTab: (tab: 'clipboard' | 'images' | 'links') => void;
  onTriggerSeed: () => void;
}

export const GeneralDashboard: React.FC<GeneralDashboardProps> = ({
  clipboardCount,
  imagesCount,
  imagesRestoredCount,
  linksCount,
  onNavigateTab,
  onTriggerSeed,
}) => {
  return (
    <div className="space-y-6">
      {/* Hero Welcome Card */}
      <div className="card-glass p-8 rounded-3xl border border-slate-700/60 bg-gradient-to-br from-slate-900/90 via-slate-900/95 to-slate-950/90 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-cyan-500/10 via-purple-500/10 to-blue-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
            <span>⚡ PGLYPH RESTORER ENGINE V2.0</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight leading-tight">
            Centro de Controle de Restauração Digital
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed">
            O <strong className="text-cyan-400">Pglyph Restaurador</strong> é o seu cofre de segurança ativo.
            Gerencie e recupere com 1-clique as <strong className="text-cyan-400">últimas 100 cópias do CTRL+C</strong>, as <strong className="text-purple-400">últimas 100 imagens deletadas no PC</strong> e os <strong className="text-blue-400">últimos 100 links acessados</strong>.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('clipboard')}
              className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs shadow-[0_4px_20px_rgba(6,182,212,0.3)] transition active:scale-95 flex items-center gap-2"
            >
              <span>📋</span>
              <span>Abrir CTRL+C (100)</span>
            </button>

            <button
              onClick={() => onNavigateTab('images')}
              className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-[0_4px_20px_rgba(147,51,234,0.3)] transition active:scale-95 flex items-center gap-2"
            >
              <span>🖼️</span>
              <span>Abrir Imagens Deletadas (100)</span>
            </button>

            <button
              onClick={() => onNavigateTab('links')}
              className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-[0_4px_20px_rgba(37,99,235,0.3)] transition active:scale-95 flex items-center gap-2"
            >
              <span>🔗</span>
              <span>Abrir Links Acessados (100)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Clipboard */}
        <div
          onClick={() => onNavigateTab('clipboard')}
          className="group p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-[0_4px_25px_rgba(6,182,212,0.15)] cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-2xl">
                📋
              </div>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                100 itens limite
              </span>
            </div>
            <h3 className="font-extrabold text-lg text-slate-100 group-hover:text-cyan-400 transition">
              Área de Transferência
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Textos, códigos, segredos e URLs copiados recentemente no seu teclado.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-2xl font-black font-mono text-cyan-400">{clipboardCount} / 100</span>
            <span className="text-xs font-bold text-slate-300 group-hover:translate-x-1 transition">Ver lista →</span>
          </div>
        </div>

        {/* Card 2: Deleted Images */}
        <div
          onClick={() => onNavigateTab('images')}
          className="group p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_4px_25px_rgba(147,51,234,0.15)] cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-2xl">
                🖼️
              </div>
              <span className="text-[11px] font-mono text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                {imagesRestoredCount} restauradas
              </span>
            </div>
            <h3 className="font-extrabold text-lg text-slate-100 group-hover:text-purple-400 transition">
              Imagens Deletadas no PC
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Prints, fotos e arquivos gráficos varridos da lixeira do seu sistema.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-2xl font-black font-mono text-purple-400">{imagesCount} / 100</span>
            <span className="text-xs font-bold text-slate-300 group-hover:translate-x-1 transition">Ver imagens →</span>
          </div>
        </div>

        {/* Card 3: Links */}
        <div
          onClick={() => onNavigateTab('links')}
          className="group p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 transition-all duration-300 hover:shadow-[0_4px_25px_rgba(37,99,235,0.15)] cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-2xl">
                🔗
              </div>
              <span className="text-[11px] font-mono text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                100 links ativos
              </span>
            </div>
            <h3 className="font-extrabold text-lg text-slate-100 group-hover:text-blue-400 transition">
              Links Web Acessados
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Histórico de navegação completo com favicons, títulos e reabertura direta.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-2xl font-black font-mono text-blue-400">{linksCount} / 100</span>
            <span className="text-xs font-bold text-slate-300 group-hover:translate-x-1 transition">Ver histórico →</span>
          </div>
        </div>
      </div>

      {/* Database Reset / Maintenance Section */}
      <div className="p-6 rounded-3xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-extrabold text-sm text-slate-200">🔄 Repopular Dados Demonstrativos</h4>
          <p className="text-xs text-slate-400">
            Regera instantaneamente 100 itens completos em cada uma das 3 seções do banco PostgreSQL.
          </p>
        </div>
        <button
          onClick={onTriggerSeed}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition shrink-0"
        >
          ⚙️ Regenerar 3x100 Itens
        </button>
      </div>
    </div>
  );
};
