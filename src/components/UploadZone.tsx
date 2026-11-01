import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileVideo,
  Youtube,
  Trash2,
  HardDrive,
  Clock,
  Sparkles,
  Link,
  Film,
  Check,
  Loader2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  formatBytes,
  formatDuration,
  type ModelId,
  type VideoMetadata,
  MODELS,
} from '../utils/videoEngine';

interface ReferenceVideoState {
  name: string;
  source: 'preset' | 'upload';
  presetKey?: string;
}

interface UploadZoneProps {
  modelId: ModelId;
  media: VideoMetadata | null;
  onMediaSelect: (media: VideoMetadata | null) => void;
  referenceVideo: ReferenceVideoState | null;
  onReferenceSelect: (ref: ReferenceVideoState | null) => void;
  disabled?: boolean;
}

const REFERENCE_PRESETS = [
  {
    id: 'vox-minimal',
    name: 'Estilo Vox Explainer',
    tagline: 'Cortes rápidos, cartelas tipográficas em alto contraste e zooms analíticos.',
  },
  {
    id: 'magnates-gold',
    name: 'Estilo Magnates Media',
    tagline: 'Estética escura cinematográfica, brilhos dourados e ritmo envolvente de tensão.',
  },
  {
    id: 'harris-map',
    name: 'Estilo Johnny Harris',
    tagline: 'Jornalismo visual dinâmico, mapas ilustrados e legendas expressivas.',
  },
];

export const UploadZone: React.FC<UploadZoneProps> = ({
  modelId,
  media,
  onMediaSelect,
  referenceVideo,
  onReferenceSelect,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'youtube'>('file');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isLoadingYtdl, setIsLoadingYtdl] = useState(false);
  const [ytdlError, setYtdlError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const refFileInputRef = useRef<HTMLInputElement>(null);

  const currentModel = MODELS[modelId];

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    // Generate duration and metadata
    const simulatedDuration = file.size > 50000000 ? 3600 : 75; // if large, simulate long video
    const videoData: VideoMetadata = {
      title: file.name,
      durationSeconds: simulatedDuration,
      sizeBytes: file.size,
      format: file.type || 'video/mp4',
      source: 'upload',
    };
    onMediaSelect(videoData);
    setYtdlError(null);
  };

  // Fetch YouTube Info via backend YTDL-core endpoint
  const handleFetchYouTube = async () => {
    if (!youtubeUrl.trim()) {
      setYtdlError('Por favor insira um link válido do YouTube.');
      return;
    }

    setIsLoadingYtdl(true);
    setYtdlError(null);

    try {
      const res = await fetch('/api/youtube/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: youtubeUrl.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao buscar vídeo no YouTube');
      }

      onMediaSelect({
        title: data.title,
        durationSeconds: data.durationSeconds,
        sizeBytes: 1024 * 1024 * 450, // estimated 450MB
        format: 'video/youtube',
        source: 'youtube',
        youtubeUrl: youtubeUrl.trim(),
      });
    } catch (err: any) {
      setYtdlError(err.message || 'Erro ao processar URL do YouTube');
    } finally {
      setIsLoadingYtdl(false);
    }
  };

  // Load deterministic sample video
  const handleLoadSample = (sampleType: ModelId) => {
    if (sampleType === 'doc_shorts') {
      onMediaSelect({
        title: 'Gravação_História_da_Tecnologia_Bruto.mp4',
        durationSeconds: 180, // 3 min
        sizeBytes: 145 * 1024 * 1024,
        format: 'video/mp4',
        source: 'demo',
      });
      onReferenceSelect({
        name: 'Estilo Vox Explainer (Preset 4K)',
        source: 'preset',
        presetKey: 'vox-minimal',
      });
    } else if (sampleType === 'long_processor') {
      onMediaSelect({
        title: 'Podcast_Episodio_42_A_Revolucao_da_IA_Gravação_2h.mp4',
        durationSeconds: 4320, // 1h 12m
        sizeBytes: 1.8 * 1024 * 1024 * 1024, // 1.8 GB
        format: 'video/mp4',
        source: 'demo',
      });
    } else {
      onMediaSelect({
        title: 'Modelagem_BIM_Revit_Estrutural_Demonstracao.mp4',
        durationSeconds: 720, // 12 min
        sizeBytes: 320 * 1024 * 1024,
        format: 'video/mp4',
        source: 'demo',
      });
    }
  };

  return (
    <section className="mb-10" aria-label="Zona de Upload e Configuração de Mídia">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              Seção 2 • Upload Zone & Mídia Bruta
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Envie seu Arquivo Bruto de Vídeo
          </h2>
        </div>
        {/* Quick Demo Pre-loader */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden sm:inline">Teste Rápido:</span>
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleLoadSample(modelId)}
            className="text-xs px-3 py-1.5 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#E0A96D] border border-[#D4AF37]/30 font-medium transition-all flex items-center gap-1.5"
            title="Carregar arquivo de demonstração otimizado para o modelo ativo"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Carregar Amostra ({currentModel.badge.split(' ')[0]})</span>
          </button>
        </div>
      </div>

      {/* Upload Zone Card */}
      <div className="bg-[#1C2541]/80 rounded-2xl border border-slate-800 p-6 md:p-8 backdrop-blur-sm">
        {/* Source Mode Tabs */}
        <div className="flex items-center gap-2 p-1 bg-[#0B132B] rounded-xl w-fit mb-6 border border-slate-800">
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setUploadMode('file');
              setYtdlError(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              uploadMode === 'file'
                ? 'bg-[#1C2541] text-white shadow border border-[#D4AF37]/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-[#D4AF37]" />
            Upload de Arquivo Local (até 2GB / 2h)
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setUploadMode('youtube');
              setYtdlError(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              uploadMode === 'youtube'
                ? 'bg-[#1C2541] text-white shadow border border-[#D4AF37]/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Youtube className="w-4 h-4 text-red-500" />
            Importar via YouTube (YTDL Core)
          </button>
        </div>

        {/* Upload Mode: File Drag & Drop */}
        {uploadMode === 'file' && (
          <div>
            {!media || media.source === 'youtube' ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !disabled && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
                  isDragging
                    ? 'border-[#D4AF37] bg-[#D4AF37]/10 scale-[1.01]'
                    : 'border-slate-700/80 hover:border-[#D4AF37]/60 bg-[#090D16]/50 hover:bg-[#090D16]/70'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/quicktime,video/webm,video/x-matroska,.mkv,.mov,.mp4"
                  onChange={handleFileInputChange}
                  className="hidden"
                  disabled={disabled}
                />
                <div className="w-16 h-16 rounded-2xl bg-[#1C2541] border border-[#D4AF37]/30 text-[#D4AF37] mx-auto flex items-center justify-center mb-4 shadow-lg group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Arraste e solte o arquivo de vídeo bruto aqui
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                  Suporte avançado para arquivos de alta duração: gravações de palestras, podcasts e aulas de até{' '}
                  <strong className="text-slate-200">2GB</strong> e até{' '}
                  <strong className="text-slate-200">2 horas de duração</strong>.
                </p>
                <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full bg-[#1C2541] border border-slate-700 text-[11px] text-[#E0A96D]">
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>MP4, MOV, WEBM, MKV</span>
                  <span className="text-slate-600">•</span>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Até {currentModel.maxInputDurationMinutes} min para este modelo</span>
                </div>
              </div>
            ) : (
              /* Selected File Details Card */
              <div className="bg-[#0B132B] rounded-xl border border-[#D4AF37]/40 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
                    <FileVideo className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm sm:text-base break-all">
                        {media.title}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Pronto
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1 font-mono text-slate-300">
                        <HardDrive className="w-3.5 h-3.5 text-[#D4AF37]" />
                        {formatBytes(media.sizeBytes)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                        {formatDuration(media.durationSeconds)}
                      </span>
                      <span>•</span>
                      <span className="uppercase text-[11px] text-[#E0A96D]">
                        {media.format.replace('video/', '')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onMediaSelect(null)}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors"
                    title="Remover arquivo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upload Mode: YouTube with YTDL-core */}
        {uploadMode === 'youtube' && (
          <div className="space-y-4">
            <div className="bg-[#090D16]/50 rounded-xl p-5 border border-slate-800">
              <label htmlFor="yt-url" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                URL do Vídeo do YouTube (Palestras, Podcasts ou Lives)
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Youtube className="w-5 h-5 text-red-500" />
                  </div>
                  <input
                    id="yt-url"
                    type="url"
                    disabled={disabled || isLoadingYtdl}
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#0B132B] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>
                <button
                  type="button"
                  disabled={disabled || isLoadingYtdl || !youtubeUrl.trim()}
                  onClick={handleFetchYouTube}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E0A96D] hover:opacity-90 text-[#090D16] font-bold text-xs tracking-wide uppercase transition-all shadow disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  {isLoadingYtdl ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Extraindo via YTDL...
                    </>
                  ) : (
                    <>
                      <Link className="w-4 h-4" />
                      Buscar Mídia YTDL
                    </>
                  )}
                </button>
              </div>

              {ytdlError && (
                <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{ytdlError}</span>
                </div>
              )}

              <p className="text-[11px] text-slate-400 mt-2">
                O backend do Editor X utiliza a biblioteca <code>@distube/ytdl-core</code> para extrair metadados, streams e timestamps para o pipeline da IA.
              </p>
            </div>

            {media && media.source === 'youtube' && (
              <div className="bg-[#0B132B] rounded-xl border border-[#D4AF37]/40 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
                    <Youtube className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{media.title}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span>Duração detectada: {formatDuration(media.durationSeconds)}</span>
                      <span>•</span>
                      <span className="text-emerald-400">YTDL Stream Mapeado</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onMediaSelect(null)}
                  className="p-2 text-slate-400 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* SECTION FOR MODEL 1: Reference Video Input */}
        {modelId === 'doc_shorts' && (
          <div className="mt-6 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-[#D4AF37]" />
                <h4 className="text-sm font-bold text-white">
                  Vídeo de Referência Estética (Obrigatório para Modelo 1)
                </h4>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] px-2 py-0.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                Padrão Vox / Mini-Doc
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              O Gemini 1.5 Pro analisará o vídeo de referência para extrair padrões de corte, ritmo, tom de voz, cartelas visuais e estrutura narrativa.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {REFERENCE_PRESETS.map((preset) => {
                const isSelected = referenceVideo?.presetKey === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      onReferenceSelect({
                        name: preset.name,
                        source: 'preset',
                        presetKey: preset.id,
                      })
                    }
                    className={`p-3.5 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-white shadow ring-1 ring-[#D4AF37]'
                        : 'bg-[#0B132B] border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{preset.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#D4AF37]" />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {preset.tagline}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Custom Reference File Upload */}
            <div className="flex items-center gap-3">
              <input
                ref={refFileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                disabled={disabled}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    onReferenceSelect({
                      name: e.target.files[0].name,
                      source: 'upload',
                    });
                  }
                }}
              />
              <button
                type="button"
                disabled={disabled}
                onClick={() => refFileInputRef.current?.click()}
                className="text-xs px-3.5 py-2 rounded-xl bg-[#090D16] border border-slate-700 hover:border-[#D4AF37]/50 text-slate-300 hover:text-white font-medium flex items-center gap-2 transition-all cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Upload de Referência Personalizada (MP4/MOV)</span>
              </button>

              {referenceVideo?.source === 'upload' && (
                <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                  <Check className="w-3.5 h-3.5" />
                  Arquivo: {referenceVideo.name}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
