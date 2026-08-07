import React from 'react';

interface PglyphLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const PglyphLogo: React.FC<PglyphLogoProps> = ({ size = 'md', showText = true }) => {
  const dimensions = size === 'sm' ? 'w-10 h-10' : size === 'lg' ? 'w-20 h-20' : 'w-12 h-12';

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Bloco Rúnico idêntico ao ícone Pglyph (usando o mesmo favicon.svg) */}
      <div
        className={`relative ${dimensions} transition-transform duration-300 hover:scale-105 group flex items-center justify-center`}
      >
        <img
          src="/favicon.svg"
          alt="Pglyph Logo"
          className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
        />
        {/* Glow sutil ao passar o mouse */}
        <div className="absolute inset-0 bg-cyan-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-200 to-cyan-400">
              PGLYPH
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              RESTAURADOR
            </span>
          </div>
          <span className="text-xs text-slate-400 font-medium tracking-tight">
            Restaurador Digital de Dados & Mídia
          </span>
        </div>
      )}
    </div>
  );
};
