import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { GeneratedOutput, formatDuration } from '../utils/videoEngine';
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
  const [isMuted, setIsMuted] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  if (!output) return null;

  const duration = Math.min(output.durationSeconds, 60); // Preview loop 60s max
  const isVertical = output.aspectRatio === '9:16';

  // Handle Play/Pause
  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  // Canvas interactive rendering loop with animated word-by-word captions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = performance.now() - currentTime * 1000;

    const render = (time: number) => {
      if (isPlaying) {
        const elapsed = (time - startTime) / 1000;
        const cur = elapsed % duration;
        setCurrentTime(cur);

        // Canvas dimensions
        const width = canvas.width;
        const height = canvas.height;

        // Background dark gradient matching visual design
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, '#090D16');
        bgGrad.addColorStop(0.5, '#121B35');
        bgGrad.addColorStop(1, '#0B132B');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Draw animated background visualizer bars / grid
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.08)';
        ctx.lineWidth = 1;
        const gridSize = 40;
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Draw animated pulsating waveform in center
        const centerY = isVertical ? height * 0.45 : height * 0.48;
        ctx.save();
        ctx.translate(width / 2, centerY);

        // Style specific visual accent
        if (output.videoStyle === 'documentary') {
          // Vox documentary card style
          ctx.fillStyle = 'rgba(212, 175, 55, 0.15)';
          ctx.fillRect(-width * 0.38, -height * 0.18, width * 0.76, height * 0.36);
          ctx.strokeStyle = '#D4AF37';
          ctx.lineWidth = 2;
          ctx.strokeRect(-width * 0.38, -height * 0.18, width * 0.76, height * 0.36);

          ctx.fillStyle = '#E0A96D';
          ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('DOCUMENTARY ARCHIVE // 00:01', 0, -height * 0.12);
        } else if (output.videoStyle === 'corporate_tech') {
          // Technical / BIM viewport styling
          ctx.strokeStyle = 'rgba(224, 169, 109, 0.4)';
          ctx.strokeRect(-width * 0.4, -height * 0.2, width * 0.8, height * 0.4);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '12px "JetBrains Mono", monospace';
          ctx.textAlign = 'left';
          ctx.fillText('BIM MODEL 3D // CAD ENGINE [60 FPS]', -width * 0.36, -height * 0.15);
          if (output.timelapseApplied) {
            ctx.fillStyle = '#D4AF37';
            ctx.fillText('⚡ TIMELAPSE 4X ATIVO', -width * 0.36, -height * 0.10);
          }
        }

        // Animated sound waves
        ctx.beginPath();
        const barsCount = 36;
        const spacing = isVertical ? 6 : 10;
        const totalW = barsCount * spacing;
        for (let i = 0; i < barsCount; i++) {
          const bx = -totalW / 2 + i * spacing;
          const bh =
            Math.sin(cur * 8 + i * 0.5) * (isVertical ? 35 : 45) +
            Math.cos(cur * 4 + i * 0.3) * 15;
          ctx.fillStyle = i % 2 === 0 ? '#D4AF37' : '#E0A96D';
          ctx.fillRect(bx, -Math.abs(bh) / 2, spacing - 2, Math.abs(bh) + 6);
        }
        ctx.restore();

        // Top Hook Badge
        ctx.fillStyle = '#D4AF37';
        ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(output.hookHeadline.toUpperCase(), width / 2, isVertical ? 60 : 40);

        // Subtitles Overlay (Word by Word Karaoke Highlight)
        const subY = isVertical ? height * 0.75 : height * 0.82;
        ctx.fillStyle = 'rgba(9, 13, 22, 0.75)';
        const boxH = 50;
        ctx.fillRect(width * 0.05, subY - 30, width * 0.9, boxH);
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
        ctx.strokeRect(width * 0.05, subY - 30, width * 0.9, boxH);

        // Find active subtitle words
        const words = output.subtitles;
        let startX = width * 0.1;
        ctx.font = isVertical
          ? 'bold 18px "Plus Jakarta Sans", sans-serif'
          : 'bold 20px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';

        const lineWords = words.map((w) => {
          const isActive = cur >= w.start && cur <= w.end;
          return { ...w, isActive };
        });

        // Draw animated words
        const totalLineText = words.map((w) => w.word).join(' ');
        ctx.fillStyle = '#94A3B8';
        ctx.fillText(totalLineText, width / 2, subY);

        // Highlight active word
        const activeWord = lineWords.find((w) => w.isActive);
        if (activeWord) {
          ctx.save();
          ctx.fillStyle = '#D4AF37';
          ctx.shadowColor = 'rgba(212, 175, 55, 0.8)';
          ctx.shadowBlur = 10;
          ctx.fillText(`★ ${activeWord.word} ★`, width / 2, subY);
          ctx.restore();
        }

        // Watermark
        ctx.fillStyle = 'rgba(212, 175, 55, 0.4)';
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText('PROCESSED BY EDITOR X', width - 20, height - 15);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, output, duration, isVertical]);

  // Direct Browser Download Generator
  const handleGenerateDirectDownload = () => {
    setIsDownloading(true);

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#E0A96D', '#F3E5AB'],
      });

      // Notify parent to process download
      onDownload(output);

      // Create downloadable synthetic media file for instantaneous testing
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = output.downloadFileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
          setIsDownloading(false);
        }, 'image/png');
      } else {
        setIsDownloading(false);
      }
    } catch (e) {
      console.error(e);
      setIsDownloading(false);
    }
  };

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
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-[#D4AF37] font-semibold">
                  Formato: {output.aspectRatio}
                </span>
                <span>•</span>
                <span>Duração: {output.formattedDuration}</span>
                <span>•</span>
                <span className="text-emerald-400 font-medium">
                  {output.retentionScore}% Retenção Prevista
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

        {/* Player Viewport Container */}
        <div className="p-6 bg-[#090D16] flex flex-col items-center justify-center min-h-[460px]">
          <div
            className={`relative rounded-2xl overflow-hidden border-2 border-[#D4AF37]/40 shadow-[0_0_40px_rgba(212,175,55,0.2)] bg-black ${
              isVertical ? 'w-[280px] sm:w-[320px] aspect-[9/16]' : 'w-full max-w-2xl aspect-[16/9]'
            }`}
          >
            <canvas
              ref={canvasRef}
              width={isVertical ? 540 : 960}
              height={isVertical ? 960 : 540}
              className="w-full h-full object-cover"
            />

            {/* In-canvas Play/Pause Overlay Button */}
            <button
              type="button"
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors group cursor-pointer"
              aria-label={isPlaying ? 'Pausar vídeo' : 'Reproduzir vídeo'}
            >
              {!isPlaying && (
                <div className="w-16 h-16 rounded-full bg-[#D4AF37] text-[#090D16] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
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
                {formatDuration(currentTime)} / {output.formattedDuration}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMuted((p) => !p)}
                className="p-2.5 rounded-xl bg-[#1C2541] hover:bg-slate-700 text-slate-300 transition-colors"
                aria-label={isMuted ? 'Desmutar' : 'Mutar'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer & Direct Download CTA */}
        <div className="px-6 py-4 bg-[#0B132B] border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            <span className="font-semibold text-slate-200">Arquivo de saída:</span>{' '}
            <code className="text-[#E0A96D]">{output.downloadFileName}</code>
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
              <span>{isDownloading ? 'Baixando...' : output.downloadLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
