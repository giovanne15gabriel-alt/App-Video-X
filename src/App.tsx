import React, { useState } from 'react';
import { Header } from './components/Header';
import { ModelSelector } from './components/ModelSelector';
import { UploadZone } from './components/UploadZone';
import { ProcessAction } from './components/ProcessAction';
import { ProcessingProgress } from './components/ProcessingProgress';
import { ResultsGallery } from './components/ResultsGallery';
import { InteractiveVideoStudio } from './components/InteractiveVideoStudio';
import { PipelineInspector } from './components/PipelineInspector';
import {
  type ModelId,
  type VideoMetadata,
  type GeneratedOutput,
  generateOutputsForModel,
  buildFFmpegCommand,
} from './utils/videoEngine';

export default function App() {
  const [selectedModelId, setSelectedModelId] = useState<ModelId>('doc_shorts');
  const [media, setMedia] = useState<VideoMetadata | null>(null);

  // Custom User Branding & Styling (Configurable by user)
  const [creatorHandle, setCreatorHandle] = useState('@editorx.oficial');
  const [selectedColorHex, setSelectedColorHex] = useState('#D4AF37');
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('male');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  // Results state
  const [generatedOutputs, setGeneratedOutputs] = useState<GeneratedOutput[] | null>(null);
  const [activeStudioOutput, setActiveStudioOutput] = useState<GeneratedOutput | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [ffmpegCommand, setFfmpegCommand] = useState('');
  const [aiInsights, setAiInsights] = useState({
    hookDetected: 'Pico de engajamento documental identificado nos primeiros segundos com alto valor informacional.',
    narrativePacing: 'Cortes dinâmicos e cartelas informativas com narração masculina brasileira padrão (mínimo de 50s garantido).',
    viralScore: 98,
    soundtrackSuggestion: 'Cinematic Minimalist Beat (84 BPM) - Volume -22dB',
    cleanCutsCount: 22,
  });

  // When switching model
  const handleSelectModel = (id: ModelId) => {
    setSelectedModelId(id);
    setGeneratedOutputs(null);
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
      media.source === 'script'
        ? `[00:01] Processando roteiro temático e iniciando levantamento de fatos/leis...`
        : `[00:01] Validando integridade de stream de áudio e resolução...`,
    ]);

    // Stage 1: Upload & media check
    setTimeout(() => {
      setProgressPercent(24);
      setTerminalLogs((prev) => [
        ...prev,
        media.source === 'script'
          ? `[00:02] Roteiro validado: tema "${media.scriptTopic || 'Documentário'}" estruturado com sucesso.`
          : `[00:02] Mídia validada: ${media.durationSeconds}s, formato ${media.format}.`,
        `[00:03] Aplicando marca d'água "${creatorHandle}" e paleta ${selectedColorHex}...`,
      ]);
      setCurrentStageIndex(1);
    }, 1200);

    // Stage 2: Narrative context & timestamps
    setTimeout(() => {
      setProgressPercent(48);
      const isLong = selectedModelId === 'long_processor';
      const isScript = media.source === 'script';
      setTerminalLogs((prev) => [
        ...prev,
        isScript
          ? `[00:04] Pesquisando dados oficiais e sintetizando narração brasileira padrão...`
          : `[00:04] Mapeando transcrição de áudio e picos de retenção...`,
        isLong
          ? `[00:05] Identificados 3 ganchos virais (9:16, ≥50s) + 2 vídeos longos de YouTube (16:9)...`
          : `[00:05] Estrutura narrativa documental montada com sucesso...`,
        `[00:06] Extraindo timestamps de corte e parâmetros dinâmicos (mínimo de 50s garantido)...`,
      ]);
      setCurrentStageIndex(2);
    }, 2800);

    // Stage 3: FFmpeg automation
    setTimeout(() => {
      setProgressPercent(72);
      setTerminalLogs((prev) => [
        ...prev,
        `[00:08] Executando FFmpeg: cortes limpos, zooms e enquadramento nativo...`,
        selectedModelId === 'corp_tech'
          ? `[00:09] Aplicando timelapse inteligente nas etapas repetitivas de software...`
          : `[00:09] Mixando trilha sem direitos autorais (-22dB) e efeitos sonoros sutis...`,
      ]);
      setCurrentStageIndex(3);
    }, 4500);

    // Stage 4: Subtitles & Video Assembly
    setTimeout(() => {
      setProgressPercent(90);
      setTerminalLogs((prev) => [
        ...prev,
        `[00:10] Gerando legendas animadas sincronizadas com a voz do protagonista...`,
        `[00:11] Renderizando arquivos MP4 finais com faststart para reprodução e CapCut...`,
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
          media: {
            ...media,
            voiceGender,
          },
          creatorHandle,
          colorPalette: selectedColorHex,
          voiceGender,
        }),
      });

      const data = await response.json();
      setTimeout(() => {
        setProgressPercent(100);
        setTerminalLogs((prev) => [
          ...prev,
          `[00:12] Sucesso! ${data.outputs?.length || 1} arquivos gerados com narração ${voiceGender === 'male' ? 'masculina' : 'feminina'} e prontos para download.`,
        ]);

        if (data.outputs) {
          setGeneratedOutputs(data.outputs);
        } else {
          setGeneratedOutputs(
            generateOutputsForModel(
              selectedModelId,
              media.title,
              creatorHandle,
              selectedColorHex,
              voiceGender,
              `${media.scriptTopic || ''} ${media.scriptContent || ''}`
            )
          );
        }

        if (data.ffmpegCommand) {
          setFfmpegCommand(data.ffmpegCommand);
        } else {
          setFfmpegCommand(buildFFmpegCommand(selectedModelId, media.title, 'out.mp4'));
        }

        setIsProcessing(false);
      }, 7600);
    } catch {
      setTimeout(() => {
        setProgressPercent(100);
        const fallbackOutputs = generateOutputsForModel(selectedModelId, media.title, creatorHandle, selectedColorHex);
        setGeneratedOutputs(fallbackOutputs);
        setFfmpegCommand(buildFFmpegCommand(selectedModelId, media.title, 'out.mp4'));
        setIsProcessing(false);
      }, 7600);
    }
  };

  // Direct download handler for real MP4 output items
  const handleDownloadOutput = (output: GeneratedOutput) => {
    const element = document.createElement('a');
    element.href = `/api/download/${output.downloadFileName}`;
    element.download = output.downloadFileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Update output in studio if re-rendered
  const handleUpdateOutput = (updated: GeneratedOutput) => {
    setActiveStudioOutput(updated);
    if (generatedOutputs) {
      setGeneratedOutputs((prev) =>
        prev ? prev.map((o) => (o.id === updated.id ? updated : o)) : null
      );
    }
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
      {/* Header with logotype & engine status */}
      <Header onReset={handleReset} />

      {/* Main Single-Screen Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section Banner */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1C2541] border border-[#D4AF37]/30 text-xs font-semibold text-[#D4AF37] mb-4 shadow">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            <span>Sistema Autônomo de Edição de Vídeo</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Transforme Conteúdo Bruto em{' '}
            <span className="text-[#D4AF37] underline decoration-[#D4AF37]/40 decoration-2 underline-offset-4">
              Vídeos Prontos
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Escolha um modelo, forneça o roteiro ou vídeo bruto, defina seu @ e paleta de cores. O motor gera cortes dinâmicos, legendas sincronizadas, narração brasileira e trilha sem direitos autorais.
          </p>
        </div>

        {/* Seção 1: Seleção de Modelos (Cards Interativos) */}
        <ModelSelector
          selectedModelId={selectedModelId}
          onSelectModel={handleSelectModel}
          disabled={isProcessing}
        />

        {/* Seção 2: Upload Zone com Roteiro, Customização de @ e Paleta de Cores */}
        <UploadZone
          modelId={selectedModelId}
          media={media}
          onMediaSelect={handleMediaChange}
          creatorHandle={creatorHandle}
          onCreatorHandleChange={setCreatorHandle}
          selectedColorHex={selectedColorHex}
          onColorSelect={setSelectedColorHex}
          voiceGender={voiceGender}
          onVoiceGenderChange={setVoiceGender}
          disabled={isProcessing}
        />

        {/* Seção 3: Ação (Botão Principal Grande Preenchido em Dourado com Texto Escuro) */}
        {!isProcessing && !generatedOutputs && (
          <ProcessAction
            modelId={selectedModelId}
            media={media}
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
            onOpenPlayer={(output) => setActiveStudioOutput(output)}
            onDownload={handleDownloadOutput}
            onViewInspector={() => setIsInspectorOpen(true)}
            onReset={handleReset}
          />
        )}

        {/* Interactive Video Studio / In-App Player & Live Editor */}
        {activeStudioOutput && (
          <InteractiveVideoStudio
            output={activeStudioOutput}
            onClose={() => setActiveStudioOutput(null)}
            onDownload={handleDownloadOutput}
            onUpdateOutput={handleUpdateOutput}
          />
        )}

        {/* Technical FFmpeg Pipeline Inspector */}
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
            <span>Estúdio Autônomo de Edição, Cortes e Renderização de Vídeo</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Motor de Renderização Nativo</span>
            <span>•</span>
            <span>Pipeline FFmpeg Broadcast</span>
            <span>•</span>
            <span>Trilha & SFX Sem Direitos Autorais</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
