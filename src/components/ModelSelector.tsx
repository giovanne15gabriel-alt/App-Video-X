import React from 'react';
import { Video, Sparkles, Layers, Scissors, CheckCircle2, Flame, Building2, MonitorPlay } from 'lucide-react';
import { MODELS, type ModelId } from '../utils/videoEngine';

interface ModelSelectorProps {
  selectedModelId: ModelId;
  onSelectModel: (id: ModelId) => void;
  disabled?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModelId,
  onSelectModel,
  disabled = false,
}) => {
  const modelIcons: Record<ModelId, React.ReactNode> = {
    doc_shorts: <Sparkles className="w-6 h-6 text-[#D4AF37]" />,
    long_processor: <Flame className="w-6 h-6 text-[#E0A96D]" />,
    corp_tech: <Building2 className="w-6 h-6 text-[#D4AF37]" />,
  };

  return (
    <section className="mb-10" aria-label="Seleção de Modelos de Edição">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              Seção 1 • Modelos Inteligentes de Edição
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Escolha o Pipeline Autônomo da sua Produção
          </h2>
        </div>
        <div className="text-xs text-slate-400">
          Selecione o modelo adequado para o seu formato de entrada e objetivo final.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {(Object.keys(MODELS) as ModelId[]).map((id) => {
          const model = MODELS[id];
          const isSelected = selectedModelId === id;

          return (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectModel(id)}
              className={`relative text-left p-6 rounded-2xl transition-all duration-300 flex flex-col justify-between group overflow-hidden border ${
                isSelected
                  ? 'bg-gradient-to-b from-[#1C2541] to-[#121B35] border-[#D4AF37] shadow-[0_0_30px_-5px_rgba(212,175,55,0.3)] ring-1 ring-[#D4AF37]'
                  : 'bg-[#1C2541]/70 hover:bg-[#1C2541] border-slate-800 hover:border-[#D4AF37]/50 hover:shadow-lg'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {/* Highlight ribbon for selected */}
              {isSelected && (
                <div className="absolute top-0 right-0 bg-[#D4AF37] text-[#090D16] text-[10px] font-black tracking-wider uppercase px-3 py-1 rounded-bl-xl shadow">
                  SELECIONADO
                </div>
              )}

              {/* Card Top */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                      isSelected
                        ? 'bg-[#D4AF37]/20 border border-[#D4AF37]/40'
                        : 'bg-[#0B132B] border border-slate-700/60'
                    }`}
                  >
                    {modelIcons[id]}
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                      isSelected
                        ? 'bg-[#D4AF37]/15 text-[#E0A96D] border-[#D4AF37]/40'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700'
                    }`}
                  >
                    {model.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#E0A96D] transition-colors">
                  {model.name}
                </h3>
                <p className="text-xs font-medium text-[#D4AF37]/90 mb-3">
                  {model.tagline}
                </p>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {model.description}
                </p>

                {/* Feature Bullet Points */}
                <div className="space-y-2 pt-3 border-t border-slate-800/80 mb-5">
                  {model.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-300">
                      <CheckCircle2
                        className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                          isSelected ? 'text-[#D4AF37]' : 'text-slate-500'
                        }`}
                      />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Bottom Meta */}
              <div className="pt-4 border-t border-slate-800/70 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <Scissors className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Máx: {model.maxInputDurationMinutes} min
                </span>
                <span className="font-semibold text-slate-300">
                  {model.expectedOutputsCount} {model.expectedOutputsCount === 1 ? 'vídeo' : 'vídeos prontos'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
