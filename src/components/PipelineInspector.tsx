import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Sparkles, Sliders, Code2, Film, Layers } from 'lucide-react';
import { ModelId, MODELS } from '../utils/videoEngine';

interface PipelineInspectorProps {
  modelId: ModelId;
  ffmpegCommand: string;
  aiInsights: {
    hookDetected: string;
    narrativePacing: string;
    viralScore: number;
    soundtrackSuggestion: string;
    cleanCutsCount: number;
  };
  onClose: () => void;
}

export const PipelineInspector: React.FC<PipelineInspectorProps> = ({
  modelId,
  ffmpegCommand,
  aiInsights,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const model = MODELS[modelId];

  const handleCopy = () => {
    navigator.clipboard.writeText(ffmpegCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090D16]/90 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inspector-title"
    >
      <div className="relative w-full max-w-3xl bg-[#0B132B] border border-[#D4AF37]/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#1C2541]/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/30">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 id="inspector-title" className="text-base font-bold text-white">
                Inspetor Técnico de IA & Pipeline FFmpeg
              </h3>
              <p className="text-xs text-slate-400">
                Detalhamento dos parâmetros do {model.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* AI Insights Card */}
          <div className="bg-[#1C2541]/60 rounded-xl p-5 border border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                Análise Narrativa e Estratégia de Retenção
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-[#0B132B] border border-slate-800">
                <span className="text-slate-400 block mb-1">Gancho Inicial Detectado:</span>
                <span className="font-semibold text-white">{aiInsights.hookDetected}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#0B132B] border border-slate-800">
                <span className="text-slate-400 block mb-1">Estratégia de Ritmo & Cortes:</span>
                <span className="font-semibold text-white">{aiInsights.narrativePacing}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#0B132B] border border-slate-800">
                <span className="text-slate-400 block mb-1">Trilha Sonora Sugerida:</span>
                <span className="font-semibold text-[#E0A96D]">{aiInsights.soundtrackSuggestion}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#0B132B] border border-slate-800">
                <span className="text-slate-400 block mb-1">Cortes Inteligentes Mapeados:</span>
                <span className="font-semibold text-emerald-400">{aiInsights.cleanCutsCount} transições</span>
              </div>
            </div>
          </div>

          {/* FFmpeg Automation Command Card */}
          <div className="bg-[#090D16] rounded-xl border border-slate-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#D4AF37]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Comandos de Automação de Vídeo (FFmpeg Engine)
                </h4>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#1C2541] hover:bg-slate-700 text-slate-300 font-mono flex items-center gap-1.5 transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Script</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 rounded-lg bg-black/60 border border-slate-800/80 font-mono text-[11px] text-amber-200/90 whitespace-pre-wrap break-all leading-relaxed overflow-x-auto">
              {ffmpegCommand}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#0B132B] border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase transition-colors"
          >
            Fechar Inspetor
          </button>
        </div>
      </div>
    </div>
  );
};
