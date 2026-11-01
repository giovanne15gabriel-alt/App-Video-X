import React, { useState } from 'react';
import {
  Download,
  Play,
  Sparkles,
  Flame,
  CheckCircle,
  Clock,
  Layers,
  Scissors,
  Share2,
  Film,
  Zap,
  FolderArchive,
  Eye,
  Sliders,
} from 'lucide-react';
import { GeneratedOutput, ModelId, MODELS } from '../utils/videoEngine';
import confetti from 'canvas-confetti';

interface ResultsGalleryProps {
  modelId: ModelId;
  outputs: GeneratedOutput[];
  onOpenPlayer: (output: GeneratedOutput) => void;
  onDownload: (output: GeneratedOutput) => void;
  onViewInspector: () => void;
  onReset?: () => void;
}

export const ResultsGallery: React.FC<ResultsGalleryProps> = ({
  modelId,
  outputs,
  onOpenPlayer,
  onDownload,
  onViewInspector,
  onReset,
}) => {
  const [downloadedIds, setDownloadedIds] = useState<Record<string, boolean>>({});

  const model = MODELS[modelId];

  // Group outputs for Model 2
  const shortsList = outputs.filter((o) => o.type === 'short');
  const longsList = outputs.filter((o) => o.type === 'long');

  const handleDownloadClick = (e: React.MouseEvent, output: GeneratedOutput) => {
    e.stopPropagation();
    setDownloadedIds((prev) => ({ ...prev, [output.id]: true }));
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#D4AF37', '#E0A96D'],
    });
    onDownload(output);
  };

  const handleDownloadAll = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#E0A96D', '#F3E5AB'],
    });
    outputs.forEach((output, index) => {
      setTimeout(() => {
        onDownload(output);
        setDownloadedIds((prev) => ({ ...prev, [output.id]: true }));
      }, index * 400);
    });
  };

  const renderCard = (output: GeneratedOutput, isVertical: boolean) => {
    const isDownloaded = downloadedIds[output.id];

    return (
      <div
        key={output.id}
        className="bg-[#1C2541]/90 rounded-2xl border border-slate-800 hover:border-[#D4AF37]/60 transition-all duration-300 shadow-xl overflow-hidden flex flex-col justify-between group"
      >
        {/* Card Top Preview / Aspect Ratio Frame */}
        <div
          onClick={() => onOpenPlayer(output)}
          className={`relative bg-[#090D16] cursor-pointer overflow-hidden flex items-center justify-center ${
            isVertical ? 'h-64' : 'h-48'
          }`}
        >
          {/* Simulated thumbnail background */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B] via-transparent to-transparent z-10" />
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Central Mock Video Frame */}
          <div className="z-10 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37] mx-auto flex items-center justify-center mb-2 group-hover:scale-110 group-hover:bg-[#D4AF37] group-hover:text-[#090D16] transition-all shadow-lg">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              Clique para Assistir
            </span>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
              Legendas Animadas Ativas
            </span>
          </div>

          {/* Top Badges */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#090D16]/90 text-[#D4AF37] border border-[#D4AF37]/40 shadow">
              {output.aspectRatio}
            </span>
            {output.timelapseApplied && (
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Timelapse 4x
              </span>
            )}
          </div>

          <div className="absolute top-3 right-3 z-20">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shadow">
              <Flame className="w-3 h-3" />
              {output.retentionScore}% Retenção
            </span>
          </div>

          {/* Duration Badge Bottom Right */}
          <div className="absolute bottom-3 right-3 z-20 bg-black/80 text-white font-mono text-[11px] font-bold px-2 py-0.5 rounded border border-slate-700">
            {output.formattedDuration}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37] mb-1">
              {output.hookHeadline}
            </div>
            <h4 className="text-base font-bold text-white mb-2 line-clamp-1 group-hover:text-[#E0A96D] transition-colors">
              {output.title}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">
              {output.summary}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {output.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-[#0B132B] text-slate-400 border border-slate-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenPlayer(output)}
              className="p-2.5 rounded-xl bg-[#0B132B] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center justify-center shrink-0"
              title="Abrir Player e Prévia"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Main Individual Download Button */}
            <button
              type="button"
              onClick={(e) => handleDownloadClick(e, output)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow cursor-pointer ${
                isDownloaded
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-gradient-to-r from-[#D4AF37] to-[#E0A96D] text-[#090D16] hover:opacity-95 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]'
              }`}
            >
              {isDownloaded ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Baixado!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>{output.downloadLabel}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="mb-14" aria-label="Galeria de Vídeos Gerados">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Seção 4 • Produção Concluída com Sucesso
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Vídeos Prontos para Download e Publicação
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pipeline autônomo gerou {outputs.length} {outputs.length === 1 ? 'arquivo final' : 'arquivos finais'} com enquadramento, cortes dinâmicos e legendas sincronizadas.
          </p>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="text-xs px-4 py-2.5 rounded-xl bg-[#090D16] hover:bg-slate-800 text-slate-300 border border-slate-700 font-semibold transition-all cursor-pointer"
            >
              Nova Produção
            </button>
          )}

          <button
            type="button"
            onClick={onViewInspector}
            className="text-xs px-4 py-2.5 rounded-xl bg-[#1C2541] hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-[#D4AF37]" />
            <span>Inspetor de IA & FFmpeg</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadAll}
            className="text-xs px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E0A96D] text-[#090D16] font-black uppercase tracking-wider shadow-lg hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <FolderArchive className="w-4 h-4" />
            <span>Baixar Todos ({outputs.length})</span>
          </button>
        </div>
      </div>

      {/* Model 2 Layout: Specific breakdown for 3 Shorts + 2 YouTube videos */}
      {modelId === 'long_processor' ? (
        <div className="space-y-10">
          {/* Sub-section: 3 Shorts */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-black uppercase tracking-wider text-[#D4AF37] px-3 py-1 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30">
                3 Cortes Curtos (Formato Shorts / 9:16)
              </span>
              <span className="text-xs text-slate-400">
                Até 3 minutos, foco em viralização, jump cuts e zooms de ênfase.
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {shortsList.map((output) => renderCard(output, true))}
            </div>
          </div>

          {/* Sub-section: 2 Long YouTube Videos */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-black uppercase tracking-wider text-[#E0A96D] px-3 py-1 rounded-lg bg-[#E0A96D]/15 border border-[#E0A96D]/30">
                2 Vídeos Longos (Formato YouTube / 16:9)
              </span>
              <span className="text-xs text-slate-400">
                Até 15 minutos cada, cortes limpos, correção de ritmo e legendas profissionais.
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {longsList.map((output) => renderCard(output, false))}
            </div>
          </div>
        </div>
      ) : (
        /* Model 1 & Model 3: Single or targeted output grid */
        <div className="max-w-xl mx-auto">
          {outputs.map((output) => renderCard(output, true))}
        </div>
      )}
    </section>
  );
};
