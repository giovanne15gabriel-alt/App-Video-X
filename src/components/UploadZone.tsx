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
  FileText,
  Mic,
  AtSign,
  Palette,
  Volume2,
  Music,
  Sliders,
} from 'lucide-react';
import {
  formatBytes,
  formatDuration,
  type ModelId,
  type VideoMetadata,
  MODELS,
  COLOR_PALETTES,
  SHORTS_MIN_DURATION_SECONDS,
} from '../utils/videoEngine';

interface UploadZoneProps {
  modelId: ModelId;
  media: VideoMetadata | null;
  onMediaSelect: (media: VideoMetadata | null) => void;
  creatorHandle: string;
  onCreatorHandleChange: (handle: string) => void;
  selectedColorHex: string;
  onColorSelect: (hex: string) => void;
  disabled?: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  modelId,
  media,
  onMediaSelect,
  creatorHandle,
  onCreatorHandleChange,
  selectedColorHex,
  onColorSelect,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadMode, setUploadMode] = useState<'script' | 'file' | 'youtube'>(
    modelId === 'doc_shorts' ? 'script' : 'file'
  );
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isLoadingYtdl, setIsLoadingYtdl] = useState(false);
  const [ytdlError, setYtdlError] = useState<string | null>(null);

  // Script mode states for Model 1
  const [scriptContent, setScriptContent] = useState('');
  const [scriptTopic, setScriptTopic] = useState('Leis, Dados e Consolidação');

  // Audio mix preferences
  const [musicVolume, setMusicVolume] = useState<'low' | 'medium' | 'muted'>('low');
  const [sfxEnabled, setSfxEnabled] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
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
    const isModel1 = modelId === 'doc_shorts';
    const simulatedDuration = isModel1 ? 74 : file.size > 50000000 ? 3600 : 62;

    const videoData: VideoMetadata = {
      title: file.name,
      durationSeconds: simulatedDuration,
      sizeBytes: file.size,
      format: file.type || 'video/mp4',
      source: 'upload',
      creatorHandle,
      colorHex: selectedColorHex,
    };
    onMediaSelect(videoData);
    setYtdlError(null);
  };

  // Submit script for Model 1
  const handleApplyScript = () => {
    if (!scriptContent.trim() || scriptContent.trim().length < 15) {
      return;
    }

    onMediaSelect({
      title: `Roteiro: ${scriptTopic || 'Documentário Investigativo'}`,
      durationSeconds: 74, // 1m14s (>= 50s)
      sizeBytes: 15 * 1024 * 1024,
      format: 'text/script',
      source: 'script',
      scriptContent: scriptContent.trim(),
      scriptTopic: scriptTopic.trim(),
      creatorHandle,
      colorHex: selectedColorHex,
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
        creatorHandle,
        colorHex: selectedColorHex,
      });
    } catch (err: any) {
      setYtdlError(err.message || 'Erro ao processar URL do YouTube');
    } finally {
      setIsLoadingYtdl(false);
    }
  };

  // Load sample content
  const handleLoadSample = (sampleType: ModelId) => {
    if (sampleType === 'doc_shorts') {
      const sample = `A consolidação municipal no Brasil avalia critérios fiscais e geográficos sob a luz do Artigo 18 da Constituição Federal. Distritos mantêm serviços essenciais enquanto a gestão financeira ganha sustentabilidade e transparência.`;
      setScriptContent(sample);
      setScriptTopic('Consolidação Municipal & Leis Fiscais');
      onMediaSelect({
        title: 'Roteiro: Consolidação Municipal & Leis Fiscais',
        durationSeconds: 74,
        sizeBytes: 15 * 1024 * 1024,
        format: 'text/script',
        source: 'script',
        scriptContent: sample,
        scriptTopic: 'Consolidação Municipal & Leis Fiscais',
        creatorHandle,
        colorHex: selectedColorHex,
      });
    } else if (sampleType === 'long_processor') {
      onMediaSelect({
        title: 'Gravação_Podcast_Entrevista_Completa_2h.mp4',
        durationSeconds: 4320, // 1h 12m
        sizeBytes: 1.8 * 1024 * 1024 * 1024,
        format: 'video/mp4',
        source: 'demo',
        creatorHandle,
        colorHex: selectedColorHex,
      });
    } else {
      onMediaSelect({
        title: 'Apresentacao_Tecnica_Software_Engenharia.mp4',
        durationSeconds: 62,
        sizeBytes: 11.5 * 1024 * 1024,
        format: 'video/mp4',
        source: 'demo',
        creatorHandle,
        colorHex: selectedColorHex,
      });
    }
  };

  return (
    <section className="mb-10" aria-label="Zona de Upload e Configuração de Mídia">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              Seção 2 • Upload, Roteiro & Identidade Visual
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {modelId === 'doc_shorts'
              ? 'Roteiro Escrito ou Upload de Vídeo Bruto'
              : 'Envie seu Arquivo Bruto de Vídeo'}
          </h2>
        </div>

        {/* Quick Sample Loader */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 hidden sm:inline">Exemplo Rápido:</span>
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleLoadSample(modelId)}
            className="text-xs px-3.5 py-1.5 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#E0A96D] border border-[#D4AF37]/30 font-medium transition-all flex items-center gap-1.5 cursor-pointer"
            title="Carregar exemplo pré-configurado para teste rápido"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Carregar Exemplo ({currentModel.badge.split(' ')[0]})</span>
          </button>
        </div>
      </div>

      {/* Main Upload & Configuration Card */}
      <div className="bg-[#1C2541]/80 rounded-2xl border border-slate-800 p-6 md:p-8 backdrop-blur-sm space-y-6">
        
        {/* Source Mode Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1 bg-[#0B132B] rounded-xl w-fit border border-slate-800">
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
                  ? 'bg-[#1C2541] text-white shadow border border-[#D4AF37]/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 text-[#D4AF37]" />
              Escrever / Enviar Roteiro Escrito
            </button>
          )}

          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setUploadMode('file');
              setYtdlError(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              uploadMode === 'file'
                ? 'bg-[#1C2541] text-white shadow border border-[#D4AF37]/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-[#D4AF37]" />
            Upload de Arquivo Local (até {currentModel.maxInputDurationMinutes} min)
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setUploadMode('youtube');
              setYtdlError(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              uploadMode === 'youtube'
                ? 'bg-[#1C2541] text-white shadow border border-[#D4AF37]/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Youtube className="w-4 h-4 text-red-500" />
            Importar via YouTube
          </button>
        </div>

        {/* MODE: Script Text Input for Model 1 */}
        {uploadMode === 'script' && modelId === 'doc_shorts' && (
          <div className="space-y-4">
            <div className="bg-[#090D16]/70 rounded-xl p-5 border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Roteiro para Montagem Documental com Narração
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#E0A96D] bg-[#D4AF37]/10 px-3 py-1 rounded-lg border border-[#D4AF37]/20">
                  <Mic className="w-3.5 h-3.5" />
                  <span>Narração Brasileira Padrão Masculina Agradável</span>
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Tópico / Foco da Pesquisa (Fatos, Leis e Dados)
                </label>
                <input
                  type="text"
                  value={scriptTopic}
                  onChange={(e) => setScriptTopic(e.target.value)}
                  placeholder="Ex: Artigo 18 da Constituição, Indicadores de Gestão, Reforma Fiscais"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B132B] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="mb-3">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Texto do Roteiro Escrito
                </label>
                <textarea
                  rows={4}
                  value={scriptContent}
                  onChange={(e) => setScriptContent(e.target.value)}
                  placeholder="Insira aqui o roteiro ou tese do vídeo. O sistema estruturará os dados, cartelas visuais, ritmo documental e narração brasileira..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B132B] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Tempo mínimo garantido: 50 segundos. Formato vertical 9:16.
                </span>
                <button
                  type="button"
                  onClick={handleApplyScript}
                  disabled={!scriptContent.trim() || scriptContent.trim().length < 15}
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
                      <span>Duração: 1:14 (≥50s)</span>
                      <span>•</span>
                      <span className="text-emerald-400">Pronto para Edição</span>
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

        {/* MODE: File Drag & Drop */}
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
                    ? 'Vídeo bruto de até 3 minutos. Cortes de impacto com tempo mínimo estrito de 50s.'
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
            )}
          </div>
        )}

        {/* MODE: YouTube Import */}
        {uploadMode === 'youtube' && (
          <div className="space-y-4">
            <div className="bg-[#090D16]/50 rounded-xl p-5 border border-slate-800">
              <label htmlFor="yt-url" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                URL do Vídeo do YouTube
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
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#0B132B] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <button
                  type="button"
                  disabled={disabled || isLoadingYtdl || !youtubeUrl.trim()}
                  onClick={handleFetchYouTube}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E0A96D] text-[#090D16] font-bold text-xs tracking-wide uppercase transition-all shadow flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  {isLoadingYtdl ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Extraindo...
                    </>
                  ) : (
                    <>
                      <Link className="w-4 h-4" />
                      Buscar Vídeo
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
                      <span>Duração: {formatDuration(media.durationSeconds)}</span>
                      <span>•</span>
                      <span className="text-emerald-400">Stream Mapeado</span>
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

        {/* CUSTOMIZATION PANEL: Creator @, Color Palette & Audio FX */}
        <div className="pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. Creator @ / Handle */}
          <div className="bg-[#090D16]/60 rounded-xl p-4 border border-slate-800/80">
            <div className="flex items-center gap-2 mb-2">
              <AtSign className="w-4 h-4 text-[#D4AF37]" />
              <label htmlFor="creator-handle" className="text-xs font-bold uppercase tracking-wider text-white">
                @ do Canal / Criador
              </label>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Inserido no topo do vídeo em cartela estilizada com a paleta escolhida.
            </p>
            <div className="relative">
              <input
                id="creator-handle"
                type="text"
                disabled={disabled}
                value={creatorHandle}
                onChange={(e) => onCreatorHandleChange(e.target.value)}
                placeholder="@seucanal"
                className="w-full px-3.5 py-2 rounded-xl bg-[#0B132B] border border-slate-700 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* 2. Color Palette Selector */}
          <div className="bg-[#090D16]/60 rounded-xl p-4 border border-slate-800/80">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="w-4 h-4 text-[#D4AF37]" />
              <label className="text-xs font-bold uppercase tracking-wider text-white">
                Paleta de Cores
              </label>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Define a cor de destaque das legendas, cartelas e badges.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {COLOR_PALETTES.map((pal) => {
                const isSelected = selectedColorHex.toLowerCase() === pal.hex.toLowerCase();
                return (
                  <button
                    key={pal.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => onColorSelect(pal.hex)}
                    className={`flex items-center gap-2 p-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-white bg-[#1C2541] shadow'
                        : 'border-slate-800 hover:border-slate-700 bg-[#0B132B]'
                    }`}
                    title={pal.name}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow"
                      style={{ backgroundColor: pal.hex }}
                    />
                    <span className="text-[10px] font-semibold text-slate-200 truncate">
                      {pal.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Audio & SFX Configuration */}
          <div className="bg-[#090D16]/60 rounded-xl p-4 border border-slate-800/80">
            <div className="flex items-center gap-2 mb-2">
              <Music className="w-4 h-4 text-[#D4AF37]" />
              <label className="text-xs font-bold uppercase tracking-wider text-white">
                Trilha & Efeitos Sonoros
              </label>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Música de fundo sem direitos autorais e SFX suaves (não cobrem a voz).
            </p>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0B132B] border border-slate-800">
                <span className="text-slate-300 font-medium">Voz Principal (Protagonista):</span>
                <span className="text-emerald-400 font-bold">100% (Destaque)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0B132B] border border-slate-800">
                <span className="text-slate-300 font-medium">Trilha Sem Copyright:</span>
                <span className="text-[#D4AF37] font-bold">-22 dB (Baixo)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0B132B] border border-slate-800">
                <span className="text-slate-300 font-medium">SFX de Cortes (Whoosh):</span>
                <span className="text-emerald-400 font-bold">Ativo (-18 dB)</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
