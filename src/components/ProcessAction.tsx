import React from 'react';
import { Play, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { type ModelId, type VideoMetadata, validateModelSubmission, MODELS } from '../utils/videoEngine';

interface ProcessActionProps {
  modelId: ModelId;
  media: VideoMetadata | null;
  hasReferenceVideo: boolean;
  isProcessing: boolean;
  onProcess: () => void;
}

export const ProcessAction: React.FC<ProcessActionProps> = ({
  modelId,
  media,
  hasReferenceVideo,
  isProcessing,
  onProcess,
}) => {
  const validation = validateModelSubmission(modelId, media, hasReferenceVideo);
  const model = MODELS[modelId];

  return (
    <section className="mb-10 text-center" aria-label="Ação de Processamento">
      <div className="max-w-2xl mx-auto flex flex-col items-center">
        {/* Main Big Gold CTA Button */}
        <button
          type="button"
          onClick={onProcess}
          disabled={!validation.valid || isProcessing}
          className={`w-full sm:w-auto min-w-[340px] px-10 py-5 rounded-2xl font-black text-lg tracking-wide uppercase shadow-[0_0_35px_rgba(212,175,55,0.4)] transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer ${
            validation.valid && !isProcessing
              ? 'bg-gradient-to-r from-[#D4AF37] via-[#E0A96D] to-[#D4AF37] text-[#090D16] hover:scale-[1.02] active:scale-[0.99] hover:shadow-[0_0_50px_rgba(212,175,55,0.6)]'
              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed shadow-none'
          }`}
        >
          <Play className="w-6 h-6 fill-current" />
          <span>{isProcessing ? 'Processando Autonomamente...' : 'Processar Vídeo'}</span>
          <ArrowRight className="w-5 h-5 ml-1" />
        </button>

        {/* Validation hint if disabled */}
        {!validation.valid && !isProcessing && (
          <div className="mt-3 flex items-center gap-2 text-xs text-amber-400 font-medium bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validation.error}</span>
          </div>
        )}

        {validation.valid && !isProcessing && (
          <p className="mt-3 text-xs text-slate-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>
              Pipeline autônomo pronto para gerar{' '}
              <strong className="text-white font-semibold">{model.badge}</strong> sem intervenção manual.
            </span>
          </p>
        )}
      </div>
    </section>
  );
};
