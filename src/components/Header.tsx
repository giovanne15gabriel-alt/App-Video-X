import React from 'react';
import { Film, Zap, Clock, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

interface HeaderProps {
  credits: {
    remaining: number;
    total: number;
    quotaHours: number;
    aiStatus: string;
  };
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ credits, onReset }) => {
  return (
    <header className="border-b border-[#1C2541]/70 bg-[#0B132B]/90 backdrop-blur-md sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logotype */}
        <button
          onClick={onReset}
          className="flex items-center gap-3 text-left group focus:outline-none"
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
                PRO AI SAAS
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Edição Autônoma de Vídeos com IA de Última Geração
            </p>
          </div>
        </button>

        {/* Status / Credits / Session Menu */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Engine Status */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1C2541]/50 border border-slate-700/50 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium">Gemini 1.5 Pro Engine</span>
          </div>

          {/* Credits Gauge */}
          <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-[#1C2541]/80 border border-[#D4AF37]/30 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
              <Zap className="w-4 h-4 fill-[#D4AF37]" />
            </div>
            <div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-300">Créditos:</span>
                <span className="text-[#E0A96D] ml-2 font-mono">
                  {credits.remaining}/{credits.total}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <Clock className="w-3 h-3 text-[#D4AF37]" />
                <span>Cota disponível: {credits.quotaHours}h</span>
              </div>
            </div>
          </div>

          {/* User Avatar & Plan */}
          <div className="hidden lg:flex items-center gap-3 pl-3 border-l border-slate-800">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#E0A96D] p-[1.5px]">
              <div className="w-full h-full rounded-full bg-[#0B132B] flex items-center justify-center text-xs font-bold text-[#E0A96D]">
                GX
              </div>
            </div>
            <div className="text-xs">
              <div className="font-semibold text-slate-200">Workspace Enterprise</div>
              <div className="text-[10px] text-emerald-400 font-mono">Processamento Ativo</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
