import React from 'react';
import { Film, Sparkles, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset }) => {
  return (
    <header className="border-b border-[#1C2541]/70 bg-[#0B132B]/90 backdrop-blur-md sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logotype */}
        <button
          onClick={onReset}
          className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer"
          title="Reiniciar Editor X"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1C2541] to-[#090D16] border border-[#D4AF37]/40 flex items-center justify-center shadow-lg group-hover:border-[#D4AF37] transition-all">
            <span className="font-extrabold text-xl tracking-tight text-white flex items-center">
              E<span className="text-[#D4AF37]">X</span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-wider text-white">
                EDITOR <span className="text-[#D4AF37] drop-shadow-[0_0_12px_rgba(212,175,55,0.4)]">X</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#E0A96D] border border-[#D4AF37]/30">
                ESTÚDIO AUTÔNOMO
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Automação de Cortes, Legendas Animadas, Zooms e Documentários
            </p>
          </div>
        </button>

        {/* Engine Status & Workspace */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1C2541]/80 border border-slate-700/60 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium">Motor de Renderização Ativo</span>
          </div>

          {/* User Workspace badge */}
          <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-800 text-xs text-slate-300">
            <div className="w-8 h-8 rounded-full bg-[#1C2541] border border-[#D4AF37]/30 flex items-center justify-center font-bold text-[#D4AF37]">
              EX
            </div>
            <div className="text-left">
              <div className="font-semibold text-white">Editor X Pro</div>
              <div className="text-[10px] text-emerald-400 font-mono">Processamento Ilimitado</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
