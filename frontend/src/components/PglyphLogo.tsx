import React from 'react';

interface PglyphLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const PglyphLogo: React.FC<PglyphLogoProps> = ({ size = 'md', showText = true }) => {
  const dimensions = size === 'sm' ? 'w-10 h-10' : size === 'lg' ? 'w-20 h-20' : 'w-12 h-12';
  const runeTextSize = size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-[15px]' : 'text-[11px]';

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Bloco Rúnico idêntico ao ícone Pglyph anexado (Quadrado metálico cinza com glifos escuros) */}
      <div
        className={`relative ${dimensions} rounded-2xl bg-gradient-to-b from-[#e2e4e9] via-[#d5d8df] to-[#c4c7d0] border border-[#f1f3f9]/60 shadow-[0_4px_20px_rgba(0,0,0,0.35)] flex flex-col items-center justify-center p-1.5 transition-transform duration-300 hover:scale-105 group overflow-hidden`}
        style={{
          boxShadow: '0 4px 15px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.8)',
        }}
      >
        {/* Glow sutil ao passar o mouse */}
        <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />

        {/* 3 Linhas de Glifos Rúnicos futuristas baseados na imagem original */}
        <div className={`font-mono font-black text-[#26282e] tracking-[0.18em] leading-tight ${runeTextSize} flex flex-col items-center justify-center opacity-90`}>
          <div className="drop-shadow-[0_1px_0px_rgba(255,255,255,0.5)]">ᚠᚢᚦᚨ ᚱᚾᛁ'X</div>
          <div className="drop-shadow-[0_1px_0px_rgba(255,255,255,0.5)]">ᚺᚾᛁᛃ ᛏC C YS</div>
          <div className="drop-shadow-[0_1px_0px_rgba(255,255,255,0.5)]">\X ᚠ ᛘ ᛏ Π/</div>
        </div>
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
