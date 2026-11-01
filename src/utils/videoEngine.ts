/**
 * Video Processing Engine & Business Logic for Editor X
 */

export type ModelId = 'doc_shorts' | 'long_processor' | 'corp_tech';

export interface ModelConfig {
  id: ModelId;
  name: string;
  tagline: string;
  badge: string;
  aspectRatio: '9:16' | '16:9' | 'hybrid';
  maxInputDurationMinutes: number;
  expectedOutputsCount: number;
  description: string;
  features: string[];
  requiresReferenceVideo: boolean;
}

export const MODELS: Record<ModelId, ModelConfig> = {
  doc_shorts: {
    id: 'doc_shorts',
    name: 'Modelo 1: Documentário Shorts',
    tagline: 'Estilo Narrativo, Ritmo Vox e Cartelas Visuais',
    badge: '1 Vídeo Vertical (9:16)',
    aspectRatio: '9:16',
    maxInputDurationMinutes: 30,
    expectedOutputsCount: 1,
    description: 'Cruza seu vídeo bruto com um vídeo de referência estética para extrair ritmo, tom narrativo, cortes dinâmicos de impacto, trilha sugerida e legendas palavra por palavra.',
    features: [
      'Análise de referência estética via Gemini 1.5 Pro',
      'Enquadramento vertical inteligente (9:16)',
      'Legendas animadas palavra por palavra (Karaokê)',
      'Cortes de impacto e trilha sonora sugerida'
    ],
    requiresReferenceVideo: true,
  },
  long_processor: {
    id: 'long_processor',
    name: 'Modelo 2: Processador de Vídeos Longos',
    tagline: 'Entrada de até 2 horas -> 5 Saídas Otimizadas',
    badge: '5 Vídeos Gerados (3 Shorts + 2 YouTube)',
    aspectRatio: 'hybrid',
    maxInputDurationMinutes: 120,
    expectedOutputsCount: 5,
    description: 'Transforma gravações extensas (aulas, podcasts, palestras de até 2h) em 3 cortes curtos virais com jump cuts e 2 vídeos longos de YouTube (15 min) com cortes limpos e legendas profissionais.',
    features: [
      'Suporte para arquivos brutos de até 2h / 2GB ou YouTube URL',
      'Mapeamento de picos de engajamento e retenção',
      '3 Cortes Curtos (9:16) com Jump Cuts e Punch Zooms',
      '2 Vídeos Longos (16:9) de até 15 min com cortes limpos'
    ],
    requiresReferenceVideo: false,
  },
  corp_tech: {
    id: 'corp_tech',
    name: 'Modelo 3: Demonstração Técnica & Apps',
    tagline: 'Engenharia, Softwares BIM e Apresentações Corporativas',
    badge: '1 Vídeo Vertical (9:16)',
    aspectRatio: '9:16',
    maxInputDurationMinutes: 45,
    expectedOutputsCount: 1,
    description: 'Focado em apresentações técnicas de software e obras. Detecta as explicações mais assertivas, elimina hesitações/silêncios, aplica timelapse inteligente em ações repetitivas e renderiza com legendas corporativas sóbrias.',
    features: [
      'Remoção autônoma de hesitações e silêncios técnicos',
      'Timelapse inteligente em etapas repetitivas de modelagem/carregamento',
      'Tipografia corporativa limpa de alta autoridade',
      'Render vertical 9:16 otimizado para LinkedIn e Reels'
    ],
    requiresReferenceVideo: false,
  },
};

export interface VideoMetadata {
  title: string;
  durationSeconds: number;
  sizeBytes: number;
  format: string;
  source: 'upload' | 'youtube' | 'demo';
  youtubeUrl?: string;
  referenceName?: string;
}

export interface WordCaption {
  word: string;
  start: number; // in seconds
  end: number;
}

export interface GeneratedOutput {
  id: string;
  title: string;
  type: 'short' | 'long';
  aspectRatio: '9:16' | '16:9';
  durationSeconds: number;
  formattedDuration: string;
  retentionScore: number; // 0 - 100
  summary: string;
  hookHeadline: string;
  subtitles: WordCaption[];
  tags: string[];
  downloadFileName: string;
  downloadLabel: string;
  videoStyle: 'documentary' | 'viral_short' | 'youtube_clean' | 'corporate_tech';
  timelapseApplied?: boolean;
  jumpCutsCount?: number;
}

/**
 * Validates inputs for a chosen model
 */
export function validateModelSubmission(
  modelId: ModelId,
  media: VideoMetadata | null,
  hasReferenceVideo: boolean
): { valid: boolean; error?: string } {
  if (!media) {
    return { valid: false, error: 'Selecione ou faça o upload de um vídeo bruto para iniciar.' };
  }

  const model = MODELS[modelId];
  if (!model) {
    return { valid: false, error: 'Modelo de edição inválido.' };
  }

  const maxSeconds = model.maxInputDurationMinutes * 60;
  if (media.durationSeconds > maxSeconds) {
    return {
      valid: false,
      error: `A duração (${Math.round(media.durationSeconds / 60)} min) excede o limite máximo permitido de ${model.maxInputDurationMinutes} minutos para este modelo.`,
    };
  }

  if (model.requiresReferenceVideo && !hasReferenceVideo) {
    return {
      valid: false,
      error: 'O Modelo 1 exige um vídeo de referência estética (estilo de corte e cartelas).',
    };
  }

  return { valid: true };
}

/**
 * Format bytes into human readable format
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!+bytes) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Format seconds into mm:ss or hh:mm:ss
 */
export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Generate simulated outputs conforming to the exact specification
 */
export function generateOutputsForModel(
  modelId: ModelId,
  mediaTitle: string
): GeneratedOutput[] {
  const baseTitle = mediaTitle.replace(/\.[^/.]+$/, '').trim() || 'Vídeo';

  if (modelId === 'doc_shorts') {
    // Model 1: Exactly 1 vertical documentary short video
    return [
      {
        id: 'out-doc-1',
        title: `${baseTitle} — Corte Documentário`,
        type: 'short',
        aspectRatio: '9:16',
        durationSeconds: 58,
        formattedDuration: '0:58',
        retentionScore: 97,
        summary: 'Abertura de choque, cartelas com textura granulada e narração rítmica orientada pelo vídeo de referência.',
        hookHeadline: 'O Segredo que Ninguém Te Contou Revelado',
        videoStyle: 'documentary',
        downloadFileName: `editor-x-doc-${slugify(baseTitle)}.mp4`,
        downloadLabel: 'Baixar Short Documentário',
        tags: ['Documentário', '9:16', 'Karaokê Subtitles', 'Soundtrack Vox'],
        subtitles: [
          { word: 'Tudo', start: 0.2, end: 0.5 },
          { word: 'mudou', start: 0.6, end: 1.0 },
          { word: 'no', start: 1.1, end: 1.3 },
          { word: 'instante', start: 1.4, end: 1.8 },
          { word: 'em', start: 1.9, end: 2.1 },
          { word: 'que', start: 2.2, end: 2.4 },
          { word: 'percebemos', start: 2.5, end: 3.1 },
          { word: 'a', start: 3.2, end: 3.3 },
          { word: 'verdade.', start: 3.4, end: 4.2 },
          { word: 'Este', start: 4.4, end: 4.7 },
          { word: 'padrão', start: 4.8, end: 5.3 },
          { word: 'se', start: 5.4, end: 5.6 },
          { word: 'repetiu', start: 5.7, end: 6.2 },
          { word: 'por', start: 6.3, end: 6.5 },
          { word: 'décadas.', start: 6.6, end: 7.5 },
        ],
      },
    ];
  }

  if (modelId === 'long_processor') {
    // Model 2: EXACTLY 5 outputs:
    // 3 Shorts (9:16, up to 3 mins) + 2 Longs (16:9, up to 15 mins)
    return [
      {
        id: 'out-short-1',
        title: `Short 1: O Gatilho da Virada — ${baseTitle}`,
        type: 'short',
        aspectRatio: '9:16',
        durationSeconds: 64,
        formattedDuration: '1:04',
        retentionScore: 98,
        summary: 'Pico de retenção detectado aos 14:20 da gravação original. Jump cuts aplicados para eliminar pausas e zooms de ênfase.',
        hookHeadline: 'Por que 99% das pessoas erram exatamente aqui?',
        videoStyle: 'viral_short',
        jumpCutsCount: 18,
        downloadFileName: `editor-x-short1-${slugify(baseTitle)}.mp4`,
        downloadLabel: 'Baixar Short 1',
        tags: ['Viral Short', '9:16', 'Jump Cuts', 'Punch Zooms'],
        subtitles: [
          { word: 'Preste', start: 0.1, end: 0.4 },
          { word: 'muita', start: 0.5, end: 0.8 },
          { word: 'atenção', start: 0.9, end: 1.4 },
          { word: 'neste', start: 1.5, end: 1.7 },
          { word: 'detalhe', start: 1.8, end: 2.3 },
          { word: 'específico.', start: 2.4, end: 3.1 },
        ],
      },
      {
        id: 'out-short-2',
        title: `Short 2: A Regra de Ouro — ${baseTitle}`,
        type: 'short',
        aspectRatio: '9:16',
        durationSeconds: 52,
        formattedDuration: '0:52',
        retentionScore: 94,
        summary: 'Momento de revelação e tese central aos 42:10. Punch cuts sincronizados com a modulação de voz.',
        hookHeadline: 'A única métrica que realmente importa no final',
        videoStyle: 'viral_short',
        jumpCutsCount: 14,
        downloadFileName: `editor-x-short2-${slugify(baseTitle)}.mp4`,
        downloadLabel: 'Baixar Short 2',
        tags: ['Viral Short', '9:16', 'Hook 3s', 'Legendas Dinâmicas'],
        subtitles: [
          { word: 'Se', start: 0.1, end: 0.3 },
          { word: 'você', start: 0.4, end: 0.6 },
          { word: 'ignorar', start: 0.7, end: 1.2 },
          { word: 'isso,', start: 1.3, end: 1.7 },
          { word: 'nada', start: 1.8, end: 2.1 },
          { word: 'vai', start: 2.2, end: 2.4 },
          { word: 'funcionar.', start: 2.5, end: 3.2 },
        ],
      },
      {
        id: 'out-short-3',
        title: `Short 3: O Erro Crítico — ${baseTitle}`,
        type: 'short',
        aspectRatio: '9:16',
        durationSeconds: 47,
        formattedDuration: '0:47',
        retentionScore: 91,
        summary: 'Pergunta contundente do host aos 1:15:00 com resposta direta sem rodeios.',
        hookHeadline: 'Não cometa esse erro antes de começar seu projeto',
        videoStyle: 'viral_short',
        jumpCutsCount: 12,
        downloadFileName: `editor-x-short3-${slugify(baseTitle)}.mp4`,
        downloadLabel: 'Baixar Short 3',
        tags: ['Viral Short', '9:16', 'Corte Rápido', 'Engajamento'],
        subtitles: [
          { word: 'Nunca', start: 0.1, end: 0.5 },
          { word: 'faça', start: 0.6, end: 0.9 },
          { word: 'isso', start: 1.0, end: 1.3 },
          { word: 'em', start: 1.4, end: 1.6 },
          { word: 'produção.', start: 1.7, end: 2.4 },
        ],
      },
      {
        id: 'out-long-1',
        title: `YouTube 1: Masterclass Parte A — ${baseTitle}`,
        type: 'long',
        aspectRatio: '16:9',
        durationSeconds: 885, // ~14m45s
        formattedDuration: '14:45',
        retentionScore: 96,
        summary: 'Bloco denso de conteúdo profundo com introdução conectiva, remoção de hesitações e legendas de alta legibilidade.',
        hookHeadline: 'Fundamentos e Estruturação Completa da Tese',
        videoStyle: 'youtube_clean',
        downloadFileName: `editor-x-youtube1-${slugify(baseTitle)}.mp4`,
        downloadLabel: 'Baixar YouTube 1',
        tags: ['YouTube 16:9', '15 Minutos', 'Cortes Limpos', 'Legendas Profissionais'],
        subtitles: [
          { word: 'Neste', start: 0.1, end: 0.4 },
          { word: 'módulo', start: 0.5, end: 0.9 },
          { word: 'vamos', start: 1.0, end: 1.3 },
          { word: 'analisar', start: 1.4, end: 1.9 },
          { word: 'os', start: 2.0, end: 2.2 },
          { word: 'princípios', start: 2.3, end: 2.9 },
          { word: 'estruturais.', start: 3.0, end: 3.8 },
        ],
      },
      {
        id: 'out-long-2',
        title: `YouTube 2: Masterclass Parte B — ${baseTitle}`,
        type: 'long',
        aspectRatio: '16:9',
        durationSeconds: 790, // ~13m10s
        formattedDuration: '13:10',
        retentionScore: 93,
        summary: 'Execução prática e debate com fechamento assertivo, normalização de áudio e cartelas de capítulos.',
        hookHeadline: 'Implementação Prática e Estudos de Caso Reais',
        videoStyle: 'youtube_clean',
        downloadFileName: `editor-x-youtube2-${slugify(baseTitle)}.mp4`,
        downloadLabel: 'Baixar YouTube 2',
        tags: ['YouTube 16:9', 'Conteúdo Profundo', 'Audio Normalizado', 'Capítulos'],
        subtitles: [
          { word: 'Passando', start: 0.1, end: 0.6 },
          { word: 'para', start: 0.7, end: 0.9 },
          { word: 'a', start: 1.0, end: 1.1 },
          { word: 'execução', start: 1.2, end: 1.8 },
          { word: 'prática,', start: 1.9, end: 2.4 },
          { word: 'veja', start: 2.5, end: 2.8 },
          { word: 'o', start: 2.9, end: 3.1 },
          { word: 'diagrama.', start: 3.2, end: 3.9 },
        ],
      },
    ];
  }

  // Model 3: 1 Corporate Tech Shorts (9:16) with smart timelapse
  return [
    {
      id: 'out-corp-1',
      title: `${baseTitle} — Demonstração Técnica & BIM`,
      type: 'short',
      aspectRatio: '9:16',
      durationSeconds: 62,
      formattedDuration: '1:02',
      retentionScore: 95,
      summary: 'Hesitações e pausas técnicas descartadas. Timelapse 4x aplicado nas telas de carregamento e modelagem 3D repetitiva.',
      hookHeadline: 'Demonstração Prática de Alta Precisão Técnica',
      videoStyle: 'corporate_tech',
      timelapseApplied: true,
      downloadFileName: `editor-x-corp-${slugify(baseTitle)}.mp4`,
      downloadLabel: 'Baixar Short Corporativo',
      tags: ['Corporate 9:16', 'Smart Timelapse', 'BIM / Software', 'Autoridade Técnica'],
      subtitles: [
        { word: 'Integração', start: 0.1, end: 0.7 },
        { word: 'direta', start: 0.8, end: 1.2 },
        { word: 'com', start: 1.3, end: 1.5 },
        { word: 'os', start: 1.6, end: 1.8 },
        { word: 'modelos', start: 1.9, end: 2.4 },
        { word: 'estruturais', start: 2.5, end: 3.2 },
        { word: 'em', start: 3.3, end: 3.5 },
        { word: 'tempo', start: 3.6, end: 3.9 },
        { word: 'real.', start: 4.0, end: 4.7 },
      ],
    },
  ];
}

/**
 * Builds the simulated FFmpeg command for the pipeline inspector
 */
export function buildFFmpegCommand(
  modelId: ModelId,
  inputPath: string,
  outputPath: string
): string {
  if (modelId === 'doc_shorts') {
    return `ffmpeg -i "${inputPath}" -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,eq=contrast=1.08:saturation=1.12,subtitles=subs.ass:force_style='Fontname=Inter,Fontsize=22,PrimaryColour=&H00E0A96D&,Bold=1'" -af "loudnorm=I=-16:TP=-1.5:LRA=11,acompressor" -c:v libx264 -preset fast -crf 19 -c:a aac -b:a 192k "${outputPath}"`;
  }
  if (modelId === 'long_processor') {
    return `# Pipeline Modelo 2: Gerando 3 Cortes Curtos (9:16) + 2 Longos (16:9)
ffmpeg -ss 00:14:20 -to 00:15:24 -i "${inputPath}" -vf "crop=ih*(9/16):ih,scale=1080:1920,zoompan=z='if(lte(mod(on,30),15),1.1,1.0)':d=1,subtitles=short1.ass" -c:v libx264 -crf 18 out_short_1.mp4
ffmpeg -ss 00:42:10 -to 00:43:02 -i "${inputPath}" -vf "crop=ih*(9/16):ih,scale=1080:1920,subtitles=short2.ass" -c:v libx264 -crf 18 out_short_2.mp4
ffmpeg -ss 01:15:00 -to 01:15:47 -i "${inputPath}" -vf "crop=ih*(9/16):ih,scale=1080:1920,subtitles=short3.ass" -c:v libx264 -crf 18 out_short_3.mp4
ffmpeg -ss 00:01:00 -to 00:15:45 -i "${inputPath}" -vf "mpdecimate,subtitles=long1.srt:force_style='Fontname=Inter,Fontsize=18'" -c:v libx264 -crf 20 out_youtube_1.mp4
ffmpeg -ss 00:30:00 -to 00:43:10 -i "${inputPath}" -vf "mpdecimate,subtitles=long2.srt:force_style='Fontname=Inter,Fontsize=18'" -c:v libx264 -crf 20 out_youtube_2.mp4`;
  }
  return `ffmpeg -i "${inputPath}" -filter_complex "[0:v]setpts='if(between(t,12,35),0.25*PTS,PTS)'[v];[0:a]atempo='if(between(t,12,35),2.0,1.0)'[a]" -map "[v]" -map "[a]" -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,subtitles=tech_subs.ass:force_style='Fontname=Inter,Fontsize=20,PrimaryColour=&H00FFFFFF&,BackColour=&H80090D16&'" -c:v libx264 -crf 18 "${outputPath}"`;
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}
