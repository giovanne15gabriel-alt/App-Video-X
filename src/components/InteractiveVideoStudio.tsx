import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  Download,
  Volume2,
  VolumeX,
  Sparkles,
  Sliders,
  Palette,
  AtSign,
  Scissors,
  Music,
  Check,
  RefreshCw,
  Clock,
  Layers,
  ZoomIn,
  Gauge,
  User,
  Image as ImageIcon,
} from 'lucide-react';
import {
  GeneratedOutput,
  COLOR_PALETTES,
  formatDuration,
  formatBytes,
  buildScenesForOutput,
  SceneData,
  VoiceGender,
} from '../utils/videoEngine';
import confetti from 'canvas-confetti';

interface InteractiveVideoStudioProps {
  output: GeneratedOutput | null;
  onClose: () => void;
  onDownload: (output: GeneratedOutput) => void;
  onUpdateOutput?: (updated: GeneratedOutput) => void;
}

export const InteractiveVideoStudio: React.FC<InteractiveVideoStudioProps> = ({
  output,
  onClose,
  onDownload,
  onUpdateOutput,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isReRendering, setIsReRendering] = useState(false);

  // Studio custom parameters
  const [studioHandle, setStudioHandle] = useState(output?.creatorHandle || '@editorx.oficial');
  const [studioColorHex, setStudioColorHex] = useState(output?.colorHex || '#D4AF37');
  const [zoomLevel, setZoomLevel] = useState<'1.0x' | '1.15x' | '1.25x'>('1.15x');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(output?.playbackSpeed || 1.0);
  const [studioVoiceGender, setStudioVoiceGender] = useState<VoiceGender>(output?.voiceGender || 'male');
  const [musicVol, setMusicVol] = useState<'low' | 'medium' | 'off'>('low');

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (output) {
      setStudioHandle(output.creatorHandle || '@editorx.oficial');
      setStudioColorHex(output.colorHex || '#D4AF37');
      setPlaybackSpeed(output.playbackSpeed || 1.0);
      setStudioVoiceGender(output.voiceGender || 'male');
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.playbackRate = output.playbackSpeed || 1.0;
        videoRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [output]);

  if (!output) return null;

  const isVertical = output.aspectRatio === '9:16';

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (!duration && videoRef.current.duration) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handlePlaybackSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Re-render video with new @, voice gender, playback speed and color palette
  const handleReRender = async () => {
    setIsReRendering(true);

    try {
      const res = await fetch('/api/render-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: output.title,
          topic: output.hookHeadline,
          script: output.summary,
          creatorHandle: studioHandle,
          colorHex: studioColorHex,
          aspectRatio: output.aspectRatio,
          durationSeconds: output.durationSeconds,
          voiceGender: studioVoiceGender,
          playbackSpeed,
          filename: output.downloadFileName,
        }),
      });

      const data = await res.json();
      if (data.success && onUpdateOutput) {
        const updated: GeneratedOutput = {
          ...output,
          creatorHandle: studioHandle,
          colorHex: studioColorHex,
          voiceGender: studioVoiceGender,
          playbackSpeed,
          videoUrl: `${output.videoUrl.split('?')[0]}?t=${Date.now()}`,
          scenes: data.scenes || output.scenes,
        };
        onUpdateOutput(updated);
      }
    } catch (e) {
      console.warn('Re-render fallback:', e);
    } finally {
      setIsReRendering(false);
    }
  };

  const handleTriggerDownload = () => {
    setIsDownloading(true);
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: [studioColorHex, '#D4AF37', '#FFFFFF'],
      });
      onDownload(output);
      setTimeout(() => setIsDownloading(false), 1000);
    } catch {
      setIsDownloading(false);
    }
  };

  // Calculate active scene
  const scenes = output.scenes && output.scenes.length > 0
    ? output.scenes
    : buildScenesForOutput(output.title, output.durationSeconds || 65, output.videoStyle);
  
  const currentProgressRatio = duration > 0 ? currentTime / duration : currentTime / (output.durationSeconds || 65);
  const activeSceneIndex = Math.min(
    scenes.length - 1,
    Math.max(0, Math.floor(currentProgressRatio * scenes.length))
  );
  const activeScene = scenes[activeSceneIndex] || scenes[0];

  const handleJumpToScene = (index: number) => {
    const targetScene = scenes[index];
    if (targetScene && videoRef.current) {
      const targetTime = targetScene.startTime ?? (index * (duration || output.durationSeconds || 65) / scenes.length);
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  // Find active subtitle word
  const activeWord = output.subtitles.find(
    (w) => currentTime >= w.start && currentTime <= w.end
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#090D16]/95 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-5xl bg-[#0B132B] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-6">
        
        {/* Studio Top Navigation Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#1C2541]/90">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow"
              style={{ backgroundColor: `${studioColorHex}25`, color: studioColorHex, borderColor: `${studioColorHex}50` }}
            >
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                  {output.title}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ≥50s Garantido
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Estúdio de Prévia, Cenas Narrativas, Ajuste de @ e Paleta em Tempo Real
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar estúdio"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Studio Body: Viewport + Editor Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 bg-[#090D16]">
          
          {/* Left Column: Video Viewport & Playback (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            <div
              className={`relative rounded-2xl overflow-hidden border-2 shadow-2xl bg-black flex items-center justify-center ${
                isVertical
                  ? 'w-[260px] sm:w-[300px] aspect-[9/16]'
                  : 'w-full max-w-xl aspect-[16/9]'
              }`}
              style={{ borderColor: `${studioColorHex}60` }}
            >
              {/* Native HTML5 Video Element with Real Rendered Visual Frames */}
              <video
                ref={videoRef}
                src={output.videoUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={() => videoRef.current && setDuration(videoRef.current.duration)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                playsInline
                loop
                className={`w-full h-full object-contain transition-transform duration-300 ${
                  zoomLevel === '1.15x' ? 'scale-105' : zoomLevel === '1.25x' ? 'scale-110' : 'scale-100'
                }`}
              />

              {/* Live Overlay: Creator @ Watermark & Scene Index */}
              <div className="absolute top-3 left-3 right-3 pointer-events-none flex items-center justify-between z-20">
                <span
                  className="px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider shadow-md bg-black/85 backdrop-blur-sm"
                  style={{ color: studioColorHex, borderLeft: `3px solid ${studioColorHex}` }}
                >
                  {studioHandle.toUpperCase()}
                </span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded shadow bg-black/80"
                  style={{ color: studioColorHex, border: `1px solid ${studioColorHex}50` }}
                >
                  ATO 0{activeScene.sceneIndex} DE 05
                </span>
              </div>

              {/* Dynamic Active Scene HUD Callout */}
              <div className="absolute top-12 left-3 right-3 pointer-events-none z-20">
                <div className="bg-[#090D16]/90 border border-slate-700/80 rounded-lg px-2.5 py-1.5 backdrop-blur-sm shadow-lg flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider block" style={{ color: studioColorHex }}>
                      {activeScene.category}
                    </span>
                    <span className="text-[11px] font-bold text-white block truncate max-w-[170px]">
                      {activeScene.headline}
                    </span>
                  </div>
                  {activeScene.keyStat && (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#1C2541] text-emerald-400 border border-emerald-500/30">
                      {activeScene.keyStat}
                    </span>
                  )}
                </div>
              </div>

              {/* Dynamic Subtitle Highlight */}
              {activeWord && (
                <div className="absolute bottom-16 inset-x-4 pointer-events-none text-center z-20">
                  <span
                    className="inline-block px-3 py-1.5 rounded-lg bg-black/90 font-extrabold text-sm tracking-wide shadow-xl border"
                    style={{ color: studioColorHex, borderColor: `${studioColorHex}80` }}
                  >
                    ★ {activeWord.word} ★
                  </span>
                </div>
              )}

              {/* Play / Pause Click Overlay */}
              <button
                type="button"
                onClick={togglePlay}
                className={`absolute inset-0 flex items-center justify-center transition-colors cursor-pointer z-10 ${
                  isPlaying ? 'bg-transparent' : 'bg-black/45'
                }`}
                aria-label={isPlaying ? 'Pausar vídeo' : 'Reproduzir vídeo'}
              >
                {!isPlaying && (
                  <div
                    className="w-16 h-16 rounded-full text-[#090D16] flex items-center justify-center shadow-2xl transition-transform"
                    style={{ backgroundColor: studioColorHex }}
                  >
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </div>
                )}
              </button>
            </div>

            {/* Video Timeline & Controls */}
            <div className="w-full max-w-xl mt-4 space-y-2">
              <input
                type="range"
                min={0}
                max={duration || output.durationSeconds || 60}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="w-full cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                style={{ accentColor: studioColorHex }}
              />
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="p-1.5 rounded bg-[#1C2541] hover:text-white transition-colors cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="p-1.5 rounded bg-[#1C2541] hover:text-white transition-colors cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                  <span className="font-mono">
                    {formatDuration(currentTime)} / {formatDuration(duration || output.durationSeconds)}
                  </span>
                </div>
                <span className="font-mono text-slate-400">
                  {formatBytes(output.fileSizeBytes)}
                </span>
              </div>
            </div>

            {/* Interactive Scene Selector Bar */}
            <div className="w-full max-w-xl mt-4 p-3 rounded-xl bg-[#0B132B] border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" style={{ color: studioColorHex }} />
                  Cenas Narrativas Geradas (5 Atos Factuais)
                </span>
                <span className="text-[10px] font-semibold text-slate-500">
                  Clique em um ato para navegar
                </span>
              </div>

              {/* 5 Scene Navigation Pills */}
              <div className="grid grid-cols-5 gap-1.5 mb-2.5">
                {scenes.map((sc: SceneData, i: number) => {
                  const isActive = activeSceneIndex === i;
                  return (
                    <button
                      key={sc.sceneIndex}
                      type="button"
                      onClick={() => handleJumpToScene(i)}
                      className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                        isActive
                          ? 'border-white bg-[#1C2541] shadow-lg'
                          : 'border-slate-800 bg-[#090D16] hover:border-slate-700'
                      }`}
                      style={isActive ? { borderColor: studioColorHex } : {}}
                    >
                      <span
                        className="text-[10px] font-black block"
                        style={{ color: isActive ? studioColorHex : '#94A3B8' }}
                      >
                        ATO 0{sc.sceneIndex}
                      </span>
                      <span className="text-[8px] text-slate-400 block truncate">
                        {sc.badge.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Scene Narration Dialogue Card */}
              <div
                className="p-2.5 rounded-lg bg-[#090D16] border text-left"
                style={{ borderColor: `${studioColorHex}40` }}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: studioColorHex }}>
                    {activeScene.category}
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    {activeScene.statLabel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-200 font-medium leading-relaxed italic">
                  "{activeScene.spokenText}"
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Customization & Studio Parameters (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-5 bg-[#0B132B] p-5 rounded-xl border border-slate-800">
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                Personalização Visual & Áudio
              </h4>

              {/* Creator @ Watermark Setting */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                  <AtSign className="w-3.5 h-3.5 text-[#D4AF37]" />
                  @ do Canal / Assinatura
                </label>
                <input
                  type="text"
                  value={studioHandle}
                  onChange={(e) => setStudioHandle(e.target.value)}
                  placeholder="@seucanal"
                  className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Color Palette Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Paleta de Cores
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {COLOR_PALETTES.map((pal) => {
                    const isSelected = studioColorHex.toLowerCase() === pal.hex.toLowerCase();
                    return (
                      <button
                        key={pal.id}
                        type="button"
                        onClick={() => setStudioColorHex(pal.hex)}
                        className={`flex items-center gap-2 p-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-white bg-[#1C2541] shadow'
                            : 'border-slate-800 bg-[#090D16] hover:border-slate-700'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
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

              {/* Playback Speed Setting (Requested by User) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-[#D4AF37]" />
                    Velocidade de Reprodução
                  </label>
                  <span className="text-[10px] font-mono text-[#D4AF37] font-bold">
                    {playbackSpeed}x
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[0.75, 1.0, 1.25, 1.5, 2.0].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => handlePlaybackSpeedChange(spd)}
                      className={`py-1.5 px-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer text-center ${
                        playbackSpeed === spd
                          ? 'bg-[#1C2541] border-[#D4AF37] text-white shadow font-black'
                          : 'bg-[#090D16] border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {spd === 1.0 ? '1.0x' : `${spd}x`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Zoom Setting */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                  <ZoomIn className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Zoom &amp; Enquadramento Dinâmico
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['1.0x', '1.15x', '1.25x'] as const).map((z) => (
                    <button
                      key={z}
                      type="button"
                      onClick={() => setZoomLevel(z)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        zoomLevel === z
                          ? 'bg-[#1C2541] border-[#D4AF37] text-white shadow'
                          : 'bg-[#090D16] border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {z}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Gender Setting (Masculina vs Feminina) */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Narração Brasileira (Voz Natural)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStudioVoiceGender('male')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      studioVoiceGender === 'male'
                        ? 'bg-[#1C2541] border-[#D4AF37] text-white shadow'
                        : 'bg-[#090D16] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>👨 Masculina</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudioVoiceGender('female')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      studioVoiceGender === 'female'
                        ? 'bg-[#1C2541] border-[#D4AF37] text-white shadow'
                        : 'bg-[#090D16] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>👩 Feminina</span>
                  </button>
                </div>
              </div>

              {/* Audio & Music Level */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Trilha Sonora Sem Copyright
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'low', label: '-22dB (Baixo)' },
                    { id: 'medium', label: '-18dB (Médio)' },
                    { id: 'off', label: 'Sem Trilha' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMusicVol(m.id as any)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                        musicVol === m.id
                          ? 'bg-[#1C2541] border-[#D4AF37] text-white'
                          : 'bg-[#090D16] border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Studio Action Buttons */}
            <div className="space-y-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleReRender}
                disabled={isReRendering}
                className="w-full py-2.5 rounded-xl bg-[#1C2541] hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isReRendering ? 'animate-spin' : ''}`} />
                <span>{isReRendering ? 'Renderizando...' : 'Atualizar Vídeo com Novos Ajustes'}</span>
              </button>

              <button
                type="button"
                onClick={handleTriggerDownload}
                disabled={isDownloading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E0A96D] text-[#090D16] text-xs font-black uppercase tracking-wider transition-all shadow-lg hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>{isDownloading ? 'Baixando...' : `${output.downloadLabel} (.MP4)`}</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
