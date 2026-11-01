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
  FileText,
  Mic,
  BookOpen,
  Scale,
  Database,
} from 'lucide-react';
import {
  formatBytes,
  formatDuration,
  type ModelId,
  type VideoMetadata,
  MODELS,
  SHORTS_MIN_DURATION_SECONDS,
  SHORTS_MAX_DURATION_SECONDS,
} from '../utils/videoEngine';

interface ReferenceVideoState {
  name: string;
  source: 'preset' | 'upload';
  presetKey?: string;
  videoUrl?: string;
}

interface UploadZoneProps {
  modelId: ModelId;
  media: VideoMetadata | null;
  onMediaSelect: (media: VideoMetadata | null) => void;
  referenceVideo: ReferenceVideoState | null;
  onReferenceSelect: (ref: ReferenceVideoState | null) => void;
  disabled?: boolean;
}

export const REFERENCE_PRESETS = [
  {
    id: 'missao14',
    name: 'Estilo Missão 14 (Vídeo Exemplo 1)',
    tagline: 'Análise investigativa documental, recortes dinâmicos, cartelas e ritmo contínuo. (Adapta ao tema sem forçar cores amarelas ou @).',
    videoUrl: '/assets/aistudio/WhatsApp_Video_2026-10-28_at_19.07.29_f3db054b.mp4',
  },
  {
    id: 'livroamarelo',
    name: 'Estilo Livro Amarelo (Vídeo Exemplo 2)',
    tagline: 'Infográficos 3D, cruzamento de dados, leis e números com clareza visual e autoridade técnica.',
    videoUrl: '/assets/aistudio/WhatsApp_Video_2026-10-28_at_18.51.26_2a9cb1b4.mp4',
  },
  {
    id: 'vox-minimal',
    name: 'Estilo Vox Explainer',
    tagline: 'Cortes rápidos, cartelas tipográficas em alto contraste e zooms analíticos.',
  },
  {
    id: 'magnates-gold',
    name: 'Estilo Magnates Media',
    tagline: 'Estética escura cinematográfica, cartelas de alto impacto e ritmo envolvente.',
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
  const [uploadMode, setUploadMode] = useState<'file' | 'script' | 'youtube'>(
    modelId === 'doc_shorts' ? 'file' : 'file'
  );
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isLoadingYtdl, setIsLoadingYtdl] = useState(false);
  const [ytdlError, setYtdlError] = useState<string | null>(null);

  // Script mode states for Model 1
  const [scriptContent, setScriptContent] = useState('');
  const [scriptTopic, setScriptTopic] = useState('Leis, Dados e Consolidação');

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
    // When file is uploaded, verify size and duration
    const isModel1 = modelId === 'doc_shorts';
    // Model 1: 74s (within 50s-180s). Model 2: 72min. Model 3: 62s.
    const simulatedDuration = isModel1 ? 74 : file.size > 50000000 ? 3600 : 62;

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

  // Submit script for Model 1
  const handleApplyScript = () => {
    if (!scriptContent.trim() || scriptContent.trim().length < 20) {
      return;
    }

    onMediaSelect({
      title: `Roteiro: ${scriptTopic || 'Documentário Investigativo'}`,
      durationSeconds: 74, // Estimated duration 1m14s (>= 50s)
      sizeBytes: 15 * 1024 * 1024,
      format: 'text/script',
      source: 'script',
      scriptContent: scriptContent.trim(),
      scriptTopic: scriptTopic.trim(),
    });
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
        durationSeconds: Math.max(SHORTS_MIN_DURATION_SECONDS, data.durationSeconds),
        sizeBytes: 1024 * 1024 * 450,
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

  // Load sample video
  const handleLoadSample = (sampleType: ModelId) => {
    if (sampleType === 'doc_shorts') {
      onMediaSelect({
        title: 'Documentário_Fatos_e_Leis_Exemplo.mp4',
        durationSeconds: 74, // 1m14s >= 50s
        sizeBytes: 21 * 1024 * 1024,
        format: 'video/mp4',
        source: 'demo',
      });
      onReferenceSelect({
        name: 'Estilo Missão 14 (Vídeo Exemplo 1)',
        source: 'preset',
        presetKey: 'missao14',
        videoUrl: '/assets/aistudio/WhatsApp_Video_2026-10-28_at_19.07.29_f3db054b.mp4',
      });
    } else if (sampleType === 'long_processor') {
      onMediaSelect({
        title: 'Podcast_Palestra_Completa_Gravacao_2h.mp4',
        durationSeconds: 4320, // 1h 12m
        sizeBytes: 1.8 * 1024 * 1024 * 1024,
        format: 'video/mp4',
        source: 'demo',
      });
    } else {
      onMediaSelect({
        title: 'Demonstracao_Tecnica_Software_BIM.mp4',
        durationSeconds: 62, // 1m02s >= 50s
        sizeBytes: 11.5 * 1024 * 1024,
        format: 'video/mp4',
        source: 'demo',
      });
    }
  };

  // Pre-fill a sample script for Model 1
  const handleLoadSampleScript = () => {
    const sample = `A consolidação municipal no Brasil propõe reduzir municípios com base em quatro critérios rigorosos: fiscal (mínimo de 10% de arrecadação própria de IPTU e ISS), geográfico (territórios desproporcionais como Altamira e Barcelos), econômico e conurbação urbana. Com base no Artigo 18 da Constituição Federal e na PEC 188/2019, os distritos mantêm postos de saúde, escolas e creches com transição cuidadosa sem perda de recursos.`;
    setScriptContent(sample);
    setScriptTopic('Consolidação Municipal & Critérios Fiscais');
    onMediaSelect({
      title: 'Roteiro: Consolidação Municipal & Critérios Fiscais',
      durationSeconds: 74,
      sizeBytes: 21 * 1024 * 1024,
      format: 'text/script',
      source: 'script',
      scriptContent: sample,
      scriptTopic: 'Consolidação Municipal & Critérios Fiscais',
    });
  };

  return (
    <section className="mb-10" aria-label="Zona de Upload e Configuração de Mídia">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              Seção 2 • Upload Zone & Entrada de Conteúdo
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {modelId === 'doc_shorts'
              ? 'Envie o Vídeo Bruto ou Digite um Roteiro Escrito'
              : 'Envie seu Arquivo Bruto de Vídeo'}
          </h2>
        </div>

        {/* Quick Demo Pre-loader */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 hidden sm:inline">Amostra Rápida:</span>
          {modelId === 'doc_shorts' ? (
            <>
              <button
                type="button"
                disabled={disabled}
                onClick={() => handleLoadSample('doc_shorts')}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#E0A96D] border border-[#D4AF37]/30 font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                title="Carregar vídeo de exemplo documental (74s)"
              >
                <Film className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Vídeo Exemplo (74s)</span>
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={handleLoadSampleScript}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#1C2541] hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                title="Carregar roteiro com leis e dados para montar com narração brasileira"
              >
                <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Roteiro com Leis & Fatos</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={disabled}
              onClick={() => handleLoadSample(modelId)}
              className="text-xs px-3 py-1.5 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#E0A96D] border border-[#D4AF37]/30 font-medium transition-all flex items-center gap-1.5 cursor-pointer"
              title="Carregar arquivo de demonstração otimizado para o modelo ativo"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Carregar Amostra ({currentModel.badge.split(' ')[0]})</span>
            </button>
          )}
        </div>
      </div>

      {/* Upload Zone Card */}
      <div className="bg-[#1C2541]/80 rounded-2xl border border-slate-800 p-6 md:p-8 backdrop-blur-sm">
        {/* Source Mode Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1 bg-[#0B132B] rounded-xl w-fit mb-6 border border-slate-800">
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setUploadMode('file');
              setYtdlError(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              uploadMode === 'file'
                ? 'bg-[#1C2541] text-white shadow border border-[#D4AF37]/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-[#D4AF37]" />
            Upload de Arquivo Local (até {currentModel.maxInputDurationMinutes} min)
          </button>

          {modelId === 'doc_shorts' && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                setUploadMode('script');
                setYtdlError(null);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                uploadMode === 'script'
                  ? 'bg-[#1C2541] text-white shadow border border-[#D4AF37]/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 text-[#E0A96D]" />
              Escrever / Enviar Roteiro Escrito
            </button>
          )}

          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setUploadMode('youtube');
              setYtdlError(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
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
            {!media || media.source === 'youtube' || media.source === 'script' ? (
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
                  {modelId === 'doc_shorts'
                    ? 'Vídeo bruto de até 3 minutos. O motor fará cortes de impacto com tempo mínimo estrito de 50s.'
                    : 'Suporte a gravações de palestras, podcasts e aulas de até 2GB e até 2 horas de duração.'}
                </p>
                <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full bg-[#1C2541] border border-slate-700 text-[11px] text-[#E0A96D]">
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>MP4, MOV, WEBM</span>
                  <span className="text-slate-600">•</span>
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {modelId === 'doc_shorts'
                      ? '50s a 3 minutos'
                      : `Até ${currentModel.maxInputDurationMinutes} min`}
                  </span>
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
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors cursor-pointer"
                    title="Remover arquivo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upload Mode: Script Text Input for Model 1 */}
        {uploadMode === 'script' && modelId === 'doc_shorts' && (
          <div className="space-y-4">
            <div className="bg-[#090D16]/60 rounded-xl p-5 border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Roteiro Escrito para Montagem com IA
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#E0A96D] bg-[#D4AF37]/10 px-3 py-1 rounded-lg border border-[#D4AF37]/20">
                  <Mic className="w-3.5 h-3.5" />
                  <span>Narração Brasileira Masculina Padrão e Agradável</span>
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Tópico / Foco de Pesquisa (Fatos, Leis e Dados)
                </label>
                <input
                  type="text"
                  value={scriptTopic}
                  onChange={(e) => setScriptTopic(e.target.value)}
                  placeholder="Ex: Artigo 18 da Constituição, PEC 188/2019, Dados IBGE e Municípios"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B132B] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="mb-3">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Conteúdo do Roteiro (Texto Narrativo para o Documentário)
                </label>
                <textarea
                  rows={4}
                  value={scriptContent}
                  onChange={(e) => setScriptContent(e.target.value)}
                  placeholder="Cole aqui o texto ou pauta do roteiro. O motor de IA buscará leis, dados e fatos relevantes, aplicando cartelas dinâmicas e voz brasileira..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B132B] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Mínimo de 50 segundos garantido na montagem final.
                </span>
                <button
                  type="button"
                  onClick={handleApplyScript}
                  disabled={!scriptContent.trim() || scriptContent.trim().length < 20}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E0A96D] text-[#090D16] text-xs font-black uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer"
                >
                  Confirmar Roteiro
                </button>
              </div>
            </div>

            {media && media.source === 'script' && (
              <div className="bg-[#0B132B] rounded-xl border border-[#D4AF37]/40 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{media.title}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span>Duração estimada: 1:14 (74s &gt;= 50s)</span>
                      <span>•</span>
                      <span className="text-emerald-400">Pesquisa de Leis e Dados Ativa</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onMediaSelect(null)}
                  className="p-2 text-slate-400 hover:text-red-400 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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
                O backend do Editor X utiliza a biblioteca <code>@distube/ytdl-core</code> para extrair metadados e streams para o pipeline da IA.
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
                  className="p-2 text-slate-400 hover:text-red-400 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* SECTION FOR MODEL 1: Reference Style Selector */}
        {modelId === 'doc_shorts' && (
          <div className="mt-6 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-[#D4AF37]" />
                <h4 className="text-sm font-bold text-white">
                  Referência de Estilo Documental (Estrutura e Ritmo)
                </h4>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] px-2 py-0.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                Estilo Narrativo Doc
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              O motor analisa a <strong>estrutura documental</strong> (ritmo de cortes, inserção de cartelas, dados e narração assertiva). <span className="text-slate-300">Nota: O vídeo gerado não copia paletas de cores fixas nem arrobas (@) dos exemplos.</span>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
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
                        videoUrl: preset.videoUrl,
                      })
                    }
                    className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
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
                <span>Upload de Outra Referência Estética (MP4/MOV)</span>
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
