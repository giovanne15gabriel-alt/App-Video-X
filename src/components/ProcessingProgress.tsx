import React from 'react';
import {
  Loader2,
  CheckCircle2,
  Cpu,
  Terminal,
  Zap,
  Scissors,
  Captions,
  FileCheck,
} from 'lucide-react';

export interface PipelineStage {
  id: number;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
}

export const STAGES: PipelineStage[] = [
  {
    id: 1,
    label: 'Enviando arquivo e validando...',
    sublabel: 'Ingestão de mídia bruta e verificação de integridade de áudio/vídeo',
    icon: <Cpu className="w-4 h-4" />,
  },
  {
    id: 2,
    label: 'Analisando contexto e timestamps...',
    sublabel: 'Mapeamento de transcrição, picos de retenção e ganchos de alto impacto',
    icon: <Zap className="w-4 h-4" />,
  },
  {
    id: 3,
    label: 'Aplicando FFmpeg (Cortes, Zooms e Formatos)...',
    sublabel: 'Execução de jump cuts, enquadramento vertical 9:16 e timelapses inteligentes',
    icon: <Scissors className="w-4 h-4" />,
  },
  {
    id: 4,
    label: 'Gerando legendas animadas...',
    sublabel: 'Sincronização palavra por palavra com estilo dinâmico e correção de cor',
    icon: <Captions className="w-4 h-4" />,
  },
  {
    id: 5,
    label: 'Renderização Concluída!',
    sublabel: 'Arquivos gerados prontos para visualização e download autônomo',
    icon: <FileCheck className="w-4 h-4" />,
  },
];

interface ProcessingProgressProps {
  currentStageIndex: number; // 0 to 4
  progressPercent: number; // 0 to 100
  terminalLogs: string[];
}

export const ProcessingProgress: React.FC<ProcessingProgressProps> = ({
  currentStageIndex,
  progressPercent,
  terminalLogs,
}) => {
  return (
    <div className="bg-[#1C2541]/90 border border-[#D4AF37]/40 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl mb-10">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-ping" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
              Pipeline Autônomo em Execução
            </span>
          </div>
          <h3 className="text-xl font-bold text-white">
            {STAGES[currentStageIndex]?.label || 'Processando Mídia...'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {STAGES[currentStageIndex]?.sublabel}
          </p>
        </div>

        {/* Progress Percentage Badge */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="text-right">
            <div className="text-3xl font-black text-[#D4AF37] font-mono leading-none">
              {progressPercent}%
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Progresso Geral</div>
          </div>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full bg-[#090D16] rounded-full h-3.5 p-0.5 mb-8 border border-slate-700/60 overflow-hidden">
        <div
          className="bg-gradient-to-r from-[#D4AF37] via-[#E0A96D] to-[#F3E5AB] h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_15px_rgba(212,175,55,0.7)]"
          style={{ width: `${Math.min(100, Math.max(2, progressPercent))}%` }}
        />
      </div>

      {/* 5 Stages Grid / Stepper */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-6">
        {STAGES.map((stage, idx) => {
          const isDone = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;

          return (
            <div
              key={stage.id}
              className={`p-3 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-[#0B132B] border-[#D4AF37] ring-1 ring-[#D4AF37] shadow-lg'
                  : isDone
                  ? 'bg-[#090D16]/60 border-emerald-500/30 text-slate-300'
                  : 'bg-[#090D16]/30 border-slate-800 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isCurrent
                      ? 'bg-[#D4AF37] text-[#090D16]'
                      : isDone
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : stage.id}
                </span>
                {isCurrent && (
                  <Loader2 className="w-3.5 h-3.5 text-[#D4AF37] animate-spin" />
                )}
              </div>
              <div
                className={`text-xs font-bold leading-tight ${
                  isCurrent
                    ? 'text-white'
                    : isDone
                    ? 'text-slate-200'
                    : 'text-slate-500'
                }`}
              >
                {stage.label.split('(')[0]}
              </div>
            </div>
          );
        })}
      </div>

      {/* Terminal Telemetry Console */}
      <div className="bg-[#090D16] rounded-xl border border-slate-800 p-4 font-mono text-[11px]">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="font-semibold text-slate-300">Live Engine Telemetry</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-sans font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Processador Ativo (GPU Cluster)
          </span>
        </div>
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-2 scrollbar-thin">
          {terminalLogs.map((log, index) => (
            <div key={index} className="flex items-start gap-2 text-slate-300">
              <span className="text-[#D4AF37] select-none font-bold">&gt;</span>
              <span className="leading-relaxed">{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
