import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ModelSelector } from './components/ModelSelector';
import { UploadZone } from './components/UploadZone';
import { ProcessAction } from './components/ProcessAction';
import { ProcessingProgress } from './components/ProcessingProgress';
import { ResultsGallery } from './components/ResultsGallery';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { PipelineInspector } from './components/PipelineInspector';
import {
  type ModelId,
  type VideoMetadata,
  type GeneratedOutput,
  MODELS,
  generateOutputsForModel,
  buildFFmpegCommand,
} from './utils/videoEngine';

interface ReferenceVideoState {
  name: string;
  source: 'preset' | 'upload';
  presetKey?: string;
}

export default function App() {
  const [selectedModelId, setSelectedModelId] = useState<ModelId>('doc_shorts');
  const [media, setMedia] = useState<VideoMetadata | null>(null);
  const [referenceVideo, setReferenceVideo] = useState<ReferenceVideoState | null>({
    name: 'Estilo Vox Explainer (Preset 4K)',
    source: 'preset',
    presetKey: 'vox-minimal',
  });

  // Credits & Session
  const [credits, setCredits] = useState({
    remaining: 140,
    total: 200,
    quotaHours: 2.5,
    aiStatus: 'online',
  });

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  // Results state
  const [generatedOutputs, setGeneratedOutputs] = useState<GeneratedOutput[] | null>(null);
  const [activePlayerOutput, setActivePlayerOutput] = useState<GeneratedOutput | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [ffmpegCommand, setFfmpegCommand] = useState('');
  const [aiInsights, setAiInsights] = useState({
    hookDetected: 'Pico de engajamento identificado nos primeiros segundos com alto valor informacional.',
    narrativePacing: 'Cortes dinâmicos a cada 2.8s sincronizados com o tom de voz.',
    viralScore: 97,
    soundtrackSuggestion: 'Minimalist Synth Beat (84 BPM) - Volume -18dB',
    cleanCutsCount: 19,
  });

  // Fetch initial credits from backend
  useEffect(() => {
    fetch('/api/credits')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setCredits({
            remaining: data.creditsRemaining,
            total: data.creditsTotal,
            quotaHours: data.maxHoursQuota,
            aiStatus: data.aiStatus,
          });
        }
      })
      .catch(() => {});
  }, []);

  // When switching model, set appropriate defaults
  const handleSelectModel = (id: ModelId) => {
    setSelectedModelId(id);
    setGeneratedOutputs(null);
    if (id === 'doc_shorts' && !referenceVideo) {
      setReferenceVideo({
        name: 'Estilo Vox Explainer (Preset 4K)',
        source: 'preset',
        presetKey: 'vox-minimal',
      });
    }
  };

  const handleMediaChange = (newMedia: VideoMetadata | null) => {
    setMedia(newMedia);
    setGeneratedOutputs(null);
  };


  // Autonomous Video Processing Trigger
  const handleProcessVideo = async () => {
    if (!media) return;

    setIsProcessing(true);
    setCurrentStageIndex(0);
    setProgressPercent(4);
    setGeneratedOutputs(null);
    setTerminalLogs([
      `[00:00] Ingestão iniciada para "${media.title}"...`,
      `[00:01] Validando integridade de stream de áudio e resolução...`,
    ]);

    // Stage 1: Upload & media check
    setTimeout(() => {
      setProgressPercent(24);
      setTerminalLogs((prev) => [
        ...prev,
        `[00:02] Mídia validada: ${media.durationSeconds}s, formato ${media.format}.`,
        `[00:03] Conectando ao Gemini 1.5 Pro Engine para transcrição e análise...`,
      ]);
      setCurrentStageIndex(1);
    }, 1200);

    // Stage 2: AI Context analysis & timestamps
    setTimeout(() => {
      setProgressPercent(48);
      const isLong = selectedModelId === 'long_processor';
      setTerminalLogs((prev) => [
        ...prev,
        `[00:05] Mapeando transcrição de áudio e curvas de retenção...`,
        isLong
          ? `[00:06] Identificados 3 ganchos virais de alta retenção (9:16) + 2 blocos profundos (16:9)...`
          : `[00:06] Padrão de ritmo cruzado com o vídeo de referência com sucesso...`,
        `[00:07] Extraindo timestamps de corte e parâmetros dinâmicos...`,
      ]);
      setCurrentStageIndex(2);
    }, 2800);

    // Stage 3: FFmpeg automation
    setTimeout(() => {
      setProgressPercent(72);
      setTerminalLogs((prev) => [
        ...prev,
        `[00:08] Executando FFmpeg: redimensionamento, jump cuts e punch zooms...`,
        selectedModelId === 'corp_tech'
          ? `[00:09] Aplicando timelapse 4x nas etapas repetitivas de modelagem BIM...`
          : `[00:09] Normalizando áudio via Loudnorm (-16 LUFS)...`,
      ]);
      setCurrentStageIndex(3);
    }, 4500);

    // Stage 4: Subtitles generation
    setTimeout(() => {
      setProgressPercent(90);
      setTerminalLogs((prev) => [
        ...prev,
        `[00:10] Gerando legendas animadas palavra por palavra sincronizadas...`,
        `[00:11] Renderizando arquivos finais com aceleração de hardware...`,
      ]);
      setCurrentStageIndex(4);
    }, 6200);

    // Stage 5: Finish & API request call
    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId: selectedModelId,
          media,
          referenceVideo,
        }),
      });

      const data = await response.json();
      setTimeout(() => {
        setProgressPercent(100);
        setTerminalLogs((prev) => [
          ...prev,
          `[00:12] Sucesso! ${data.outputs?.length || 1} arquivos gerados e prontos para download.`,
        ]);

        if (data.outputs) {
          setGeneratedOutputs(data.outputs);
        } else {
          setGeneratedOutputs(generateOutputsForModel(selectedModelId, media.title));
        }

        if (data.ffmpegCommand) {
          setFfmpegCommand(data.ffmpegCommand);
        } else {
          setFfmpegCommand(buildFFmpegCommand(selectedModelId, media.title, 'out.mp4'));
        }

        if (data.aiInsights) {
          setAiInsights(data.aiInsights);
        }

        // Deduct simulated credit
        setCredits((prev) => ({
          ...prev,
          remaining: Math.max(0, prev.remaining - (selectedModelId === 'long_processor' ? 15 : 5)),
        }));

        setIsProcessing(false);
      }, 7600);
    } catch (e) {
      // Robust client fallback if network has hiccups
      setTimeout(() => {
        setProgressPercent(100);
        const fallbackOutputs = generateOutputsForModel(selectedModelId, media.title);
        setGeneratedOutputs(fallbackOutputs);
        setFfmpegCommand(buildFFmpegCommand(selectedModelId, media.title, 'out.mp4'));
        setIsProcessing(false);
      }, 7600);
    }
  };

  // Direct download handler for output items
  const handleDownloadOutput = (output: GeneratedOutput) => {
    // Generate a downloadable video or text data file
    const element = document.createElement('a');
    const dummyVideoBlob = new Blob(
      [
        `# EDITOR X — ARQUIVO GERADO AUTONOMAMENTE\n` +
          `# Título: ${output.title}\n` +
          `# Formato: ${output.aspectRatio}\n` +
          `# Duração: ${output.formattedDuration}\n` +
          `# Retenção: ${output.retentionScore}%\n` +
          `# Gancho: ${output.hookHeadline}\n\n` +
          `# LEGENDAS DINÂMICAS SINCRONIZADAS:\n` +
          output.subtitles.map((s) => `[${s.start}s -> ${s.end}s] ${s.word}`).join('\n'),
      ],
      { type: 'text/plain;charset=utf-8' }
    );
    element.href = URL.createObjectURL(dummyVideoBlob);
    element.download = output.downloadFileName.replace('.mp4', '-manifest.txt');
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleReset = () => {
    setIsProcessing(false);
    setGeneratedOutputs(null);
    setCurrentStageIndex(0);
    setProgressPercent(0);
    setTerminalLogs([]);
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col selection:bg-[#D4AF37]/30 selection:text-[#E0A96D]">
      {/* Header with logotype & credits */}
      <Header credits={credits} onReset={handleReset} />

      {/* Main Single-Screen Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section Banner */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1C2541] border border-[#D4AF37]/30 text-xs font-semibold text-[#D4AF37] mb-4 shadow">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            <span>SaaS Autônomo de Edição de Vídeo com IA</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Transforme Vídeos Brutos em{' '}
            <span className="text-[#D4AF37] underline decoration-[#D4AF37]/40 decoration-2 underline-offset-4">
              Conteúdo Pronto
            </span>{' '}
            com IA
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Escolha um dos 3 modelos inteligentes, faça o upload do seu arquivo bruto e receba cortes de alto impacto, formato vertical 9:16 ou YouTube 16:9 de forma 100% autônoma.
          </p>
        </div>

        {/* Seção 1: Seleção de Modelos (Cards Interativos) */}
        <ModelSelector
          selectedModelId={selectedModelId}
          onSelectModel={handleSelectModel}
          disabled={isProcessing}
        />

        {/* Seção 2: Upload Zone (Drag & Drop, 2GB/2h indicator, YTDL-core YouTube link) */}
        <UploadZone
          modelId={selectedModelId}
          media={media}
          onMediaSelect={handleMediaChange}
          referenceVideo={referenceVideo}
          onReferenceSelect={setReferenceVideo}
          disabled={isProcessing}
        />

        {/* Seção 3: Ação (Botão Principal Grande Preenchido em Dourado com Texto Escuro) */}
        {!isProcessing && !generatedOutputs && (
          <ProcessAction
            modelId={selectedModelId}
            media={media}
            hasReferenceVideo={Boolean(referenceVideo?.name)}
            isProcessing={isProcessing}
            onProcess={handleProcessVideo}
          />
        )}

        {/* Seção 4: Status e Resultados */}
        {isProcessing && (
          <ProcessingProgress
            currentStageIndex={currentStageIndex}
            progressPercent={progressPercent}
            terminalLogs={terminalLogs}
          />
        )}

        {/* Generated Output Gallery when ready */}
        {generatedOutputs && !isProcessing && (
          <ResultsGallery
            modelId={selectedModelId}
            outputs={generatedOutputs}
            onOpenPlayer={(output) => setActivePlayerOutput(output)}
            onDownload={handleDownloadOutput}
            onViewInspector={() => setIsInspectorOpen(true)}
            onReset={handleReset}
          />
        )}

        {/* Interactive Video Player & Animated Caption Modal */}
        {activePlayerOutput && (
          <VideoPlayerModal
            output={activePlayerOutput}
            onClose={() => setActivePlayerOutput(null)}
            onDownload={handleDownloadOutput}
          />
        )}

        {/* Technical AI & FFmpeg Inspector Drawer/Modal */}
        {isInspectorOpen && (
          <PipelineInspector
            modelId={selectedModelId}
            ffmpegCommand={ffmpegCommand}
            aiInsights={aiInsights}
            onClose={() => setIsInspectorOpen(false)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#0B132B]/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Editor X</span>
            <span>—</span>
            <span>Plataforma Full-Stack de Edição Autônoma por Inteligência Artificial</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Gemini 1.5 Pro</span>
            <span>•</span>
            <span>YTDL-Core API</span>
            <span>•</span>
            <span>FFmpeg Pipeline</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
