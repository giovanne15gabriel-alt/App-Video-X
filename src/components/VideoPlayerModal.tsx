import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  Download,
  Volume2,
  VolumeX,
  Maximize2,
  Sparkles,
  Share2,
  Clock,
  Flame,
  CheckCircle,
  FileVideo,
  Layers,
  HardDrive,
} from 'lucide-react';
import { GeneratedOutput, formatDuration, formatBytes } from '../utils/videoEngine';
import confetti from 'canvas-confetti';

interface VideoPlayerModalProps {
  output: GeneratedOutput | null;
  onClose: () => void;
  onDownload: (output: GeneratedOutput) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  output,
  onClose,
  onDownload,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (output && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
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

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // Direct Browser Download of the Real MP4 File
  const handleGenerateDirectDownload = () => {
    setIsDownloading(true);

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#E0A96D', '#F3E5AB'],
      });

      // Call parent download trigger which downloads the real .mp4 file
      onDownload(output);
      setTimeout(() => setIsDownloading(false), 1000);
    } catch (e) {
      console.error(e);
      setIsDownloading(false);
    }
  };

  // Find active subtitle word
  const activeWord = output.subtitles.find(
    (w) => currentTime >= w.start && currentTime <= w.end
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090D16]/90 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-title"
    >
      <div className="relative w-full max-w-4xl bg-[#0B132B] border border-[#D4AF37]/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#1C2541]/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 id="player-title" className="text-base font-bold text-white line-clamp-1">
                {output.title}
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="text-[#D4AF37] font-semibold">
                  Formato: {output.aspectRatio}
                </span>
                <span>•</span>
                <span>Duração: {output.formattedDuration}</span>
                <span>•</span>
                <span className="text-emerald-400 font-medium">
                  {output.retentionScore}% Retenção
                </span>
                <span>•</span>
                <span className="text-slate-300 font-mono">
                  {formatBytes(output.fileSizeBytes)}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar player"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real HTML5 Video Player Viewport */}
        <div className="p-6 bg-[#090D16] flex flex-col items-center justify-center min-h-[460px]">
          <div
            className={`relative rounded-2xl overflow-hidden border-2 border-[#D4AF37]/40 shadow-[0_0_40px_rgba(212,175,55,0.2)] bg-black flex items-center justify-center ${
              isVertical ? 'w-[280px] sm:w-[320px] aspect-[9/16]' : 'w-full max-w-2xl aspect-[16/9]'
            }`}
          >
            {/* Real HTML5 Video with real Audio & Video Stream */}
            <video
              ref={videoRef}
              src={output.videoUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              playsInline
              loop
              className="w-full h-full object-contain"
            />

            {/* Subtitles Overlay synced to real audio playback */}
            {activeWord && (
              <div className="absolute bottom-12 inset-x-4 pointer-events-none text-center">
                <span className="inline-block px-3 py-1 rounded-lg bg-black/75 text-[#D4AF37] border border-[#D4AF37]/50 font-bold text-sm tracking-wide shadow-lg animate-pulse">
                  ★ {activeWord.word} ★
                </span>
              </div>
            )}

            {/* In-canvas Play/Pause Overlay Click */}
            <button
              type="button"
              onClick={togglePlay}
              className={`absolute inset-0 flex items-center justify-center transition-colors group cursor-pointer ${
                isPlaying ? 'bg-transparent' : 'bg-black/40'
              }`}
              aria-label={isPlaying ? 'Pausar vídeo' : 'Reproduzir vídeo'}
            >
              {!isPlaying && (
                <div className="w-16 h-16 rounded-full bg-[#D4AF37] text-[#090D16] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
              )}
            </button>
          </div>

          {/* Player Controls Bar */}
          <div className="w-full max-w-2xl mt-4 flex items-center justify-between gap-4 px-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlay}
                className="p-2.5 rounded-xl bg-[#1C2541] hover:bg-[#D4AF37] text-white hover:text-[#090D16] transition-all cursor-pointer"
                aria-label={isPlaying ? 'Pausar' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              </button>
              <span className="text-xs font-mono text-slate-300">
                {formatDuration(currentTime)} / {formatDuration(duration || output.durationSeconds)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                className="p-2.5 rounded-xl bg-[#1C2541] hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                aria-label={isMuted ? 'Desmutar' : 'Mutar'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer & Direct Real MP4 Download */}
        <div className="px-6 py-4 bg-[#0B132B] border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            <span className="font-semibold text-slate-200">Arquivo MP4 Real:</span>{' '}
            <code className="text-[#E0A96D]">{output.downloadFileName}</code>{' '}
            <span className="text-slate-500">({formatBytes(output.fileSizeBytes)})</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors w-full sm:w-auto cursor-pointer"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={handleGenerateDirectDownload}
              disabled={isDownloading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E0A96D] text-[#090D16] text-xs font-black uppercase tracking-wider shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>{isDownloading ? 'Baixando...' : `${output.downloadLabel} (.MP4)`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
