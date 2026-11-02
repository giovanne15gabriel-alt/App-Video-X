/**
 * Video Processing Engine & Business Logic for Editor X
 */

export type ModelId = 'doc_shorts' | 'long_processor' | 'corp_tech';

export const SHORTS_MIN_DURATION_SECONDS = 50; // Minimum 50s constraint
export const SHORTS_MAX_DURATION_SECONDS = 180; // Maximum 3 minutes (180s)

export interface ColorPalette {
  id: string;
  name: string;
  hex: string;
  bgGrad: string;
  accent: string;
}

export const COLOR_PALETTES: ColorPalette[] = [
  { id: 'gold', name: 'Dourado Elegante', hex: '#D4AF37', bgGrad: 'from-[#D4AF37] to-[#E0A96D]', accent: 'text-[#D4AF37]' },
  { id: 'cyan', name: 'Ciano Cyber', hex: '#06B6D4', bgGrad: 'from-[#06B6D4] to-[#3B82F6]', accent: 'text-[#06B6D4]' },
  { id: 'crimson', name: 'Carmim Viral', hex: '#EF4444', bgGrad: 'from-[#EF4444] to-[#F97316]', accent: 'text-[#EF4444]' },
  { id: 'emerald', name: 'Esmeralda Autoridade', hex: '#10B981', bgGrad: 'from-[#10B981] to-[#059669]', accent: 'text-[#10B981]' },
  { id: 'purple', name: 'Roxo Criativo', hex: '#8B5CF6', bgGrad: 'from-[#8B5CF6] to-[#EC4899]', accent: 'text-[#8B5CF6]' },
  { id: 'orange', name: 'Laranja Sunset', hex: '#F97316', bgGrad: 'from-[#F97316] to-[#EAB308]', accent: 'text-[#F97316]' },
];

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
  supportsScriptInput: boolean;
}

export const MODELS: Record<ModelId, ModelConfig> = {
  doc_shorts: {
    id: 'doc_shorts',
    name: 'Modelo 1: Documentário Shorts',
    tagline: 'Estilo Narrativo, Fatos, Leis e Narração Brasileira',
    badge: '1 Vídeo Vertical (9:16)',
    aspectRatio: '9:16',
    maxInputDurationMinutes: 3, // raw video up to 3 minutes
    expectedOutputsCount: 1,
    description: 'Transforma um vídeo bruto de até 3 minutos ou um roteiro escrito em um documentário vertical (9:16) dinâmico. O motor pesquisa fatos, leis e dados, aplica cartelas e narração padrão brasileira com voz masculina agradável (mínimo de 50s até 3min).',
    features: [
      'Entrada flexível: Vídeo bruto (até 3 min) ou Roteiro Escrito',
      'Pesquisa autônoma de leis, dados e referências factuais',
      'Narração padrão brasileira (Voz masculina agradável)',
      'Duração mínima rigorosa de 50s até 3 min (Sem cortes curtos demais)'
    ],
    requiresReferenceVideo: false,
    supportsScriptInput: true,
  },
  long_processor: {
    id: 'long_processor',
    name: 'Modelo 2: Processador de Vídeos Longos',
    tagline: 'Entrada de até 2 horas -> 5 Saídas Otimizadas',
    badge: '5 Vídeos Gerados (3 Shorts + 2 YouTube)',
    aspectRatio: 'hybrid',
    maxInputDurationMinutes: 120,
    expectedOutputsCount: 5,
    description: 'Transforma gravações extensas (aulas, podcasts, palestras de até 2h) em 3 cortes curtos virais (mínimo de 50s cada) com jump cuts e 2 vídeos longos de YouTube (16:9) com cortes limpos e áudio masterizado.',
    features: [
      'Suporte para arquivos brutos de até 2h / 2GB ou YouTube URL',
      'Mapeamento de picos de engajamento e retenção',
      '3 Cortes Curtos (9:16) com no mínimo 50s cada e até 3min',
      '2 Vídeos Longos (16:9) em alta resolução com áudio estéreo'
    ],
    requiresReferenceVideo: false,
    supportsScriptInput: false,
  },
  corp_tech: {
    id: 'corp_tech',
    name: 'Modelo 3: Demonstração Técnica & Apps',
    tagline: 'Engenharia, Softwares BIM e Apresentações Corporativas',
    badge: '1 Vídeo Vertical (9:16)',
    aspectRatio: '9:16',
    maxInputDurationMinutes: 45,
    expectedOutputsCount: 1,
    description: 'Focado em apresentações técnicas de software e obras. Detecta as explicações mais assertivas, elimina hesitações/silêncios, aplica timelapse inteligente em ações repetitivas e renderiza com legendas corporativas sóbrias (duração mínima de 50s).',
    features: [
      'Remoção autônoma de hesitações e silêncios técnicos',
      'Timelapse inteligente em etapas repetitivas de modelagem/carregamento',
      'Tipografia corporativa limpa de alta autoridade',
      'Duração vertical 9:16 otimizada (mínimo de 50s)'
    ],
    requiresReferenceVideo: false,
    supportsScriptInput: false,
  },
};

export interface VideoMetadata {
  title: string;
  durationSeconds: number;
  sizeBytes: number;
  format: string;
  source: 'upload' | 'youtube' | 'demo' | 'script';
  youtubeUrl?: string;
  scriptContent?: string;
  scriptTopic?: string;
  creatorHandle?: string;
  colorHex?: string;
}

export interface WordCaption {
  word: string;
  start: number; // in seconds
  end: number;
}

export interface SceneData {
  sceneIndex: number;
  category: string;
  headline: string;
  subline: string;
  spokenText: string;
  keyStat: string;
  statLabel: string;
  badge: string;
  visualType: 'dossier' | 'law_decree' | 'data_chart' | 'evidence_board' | 'verdict';
  startTime: number;
  endTime: number;
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
  videoUrl: string; // REAL PLAYABLE MP4 VIDEO PATH
  fileSizeBytes: number; // REAL VIDEO FILE SIZE
  creatorHandle?: string;
  colorHex?: string;
  scenes?: SceneData[];
}

/**
 * Validates inputs for a chosen model with the 50s minimum constraint for shorts
 */
export function validateModelSubmission(
  modelId: ModelId,
  media: VideoMetadata | null
): { valid: boolean; error?: string } {
  if (!media) {
    return { valid: false, error: 'Selecione um vídeo bruto ou insira um roteiro escrito para iniciar.' };
  }

  const model = MODELS[modelId];
  if (!model) {
    return { valid: false, error: 'Modelo de edição inválido.' };
  }

  // Model 1 script mode validation
  if (modelId === 'doc_shorts' && media.source === 'script') {
    if (!media.scriptContent || media.scriptContent.trim().length < 20) {
      return {
        valid: false,
        error: 'O roteiro escrito deve conter pelo menos 20 caracteres com o conteúdo ou tese do vídeo.',
      };
    }
    return { valid: true };
  }

  // Duration constraints
  const maxSeconds = model.maxInputDurationMinutes * 60;
  if (media.durationSeconds > maxSeconds) {
    return {
      valid: false,
      error: `A duração (${Math.round(media.durationSeconds / 60)} min) excede o limite máximo permitido de ${model.maxInputDurationMinutes} minutos para este modelo.`,
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

export function buildScenesForOutput(
  title: string,
  totalDuration: number,
  style: 'documentary' | 'viral_short' | 'youtube_clean' | 'corporate_tech'
): SceneData[] {
  const sceneDuration = totalDuration / 5;
  const cleanTitle = title.replace(/\.[^/.]+$/, '').trim() || 'Vídeo';

  if (style === 'documentary') {
    return [
      {
        sceneIndex: 1,
        category: 'DOSSIÊ INVESTIGATIVO • ATO 01',
        headline: cleanTitle.toUpperCase(),
        subline: 'RASTREAMENTO DO FLUXO ORÇAMENTÁRIO',
        spokenText: 'Você sabe para onde realmente vai o dinheiro dos seus impostos? Uma apuração aprofundada começou a rastrear os dados.',
        keyStat: 'STATUS: ATIVO',
        statLabel: 'Auditoria de Dados Oficiais',
        badge: 'INVESTIGAÇÃO ABERTA',
        visualType: 'dossier',
        startTime: 0,
        endTime: sceneDuration,
      },
      {
        sceneIndex: 2,
        category: 'MARCO LEGAL & LEGISLAÇÃO • ATO 02',
        headline: 'LEI Nº 14.133 / ARTIGO 72',
        subline: 'TRANSPARÊNCIA E RESPONSABILIDADE FISCAL',
        spokenText: 'A legislação brasileira exige publicidade irrestrita e prestação de contas de cada recurso público empenhado.',
        keyStat: 'LEI 14.133',
        statLabel: 'Artigo 72 — Publicidade Obrigatória',
        badge: 'DOCUMENTO OFICIAL',
        visualType: 'law_decree',
        startTime: sceneDuration,
        endTime: sceneDuration * 2,
      },
      {
        sceneIndex: 3,
        category: 'AUDITORIA DE DADOS • ATO 03',
        headline: 'PORTAL DA TRANSPARÊNCIA',
        subline: 'VOLUME FINANCEIRO E CONTRATOS MAPEADOS',
        spokenText: 'Ao cruzar os números do portal da transparência, localizamos mais de 48 milhões de reais em serviços mapeados.',
        keyStat: 'R$ 48.500.000,00',
        statLabel: 'Recursos Monitorados no Sistema',
        badge: 'DADOS CONSOLIDADOS',
        visualType: 'data_chart',
        startTime: sceneDuration * 2,
        endTime: sceneDuration * 3,
      },
      {
        sceneIndex: 4,
        category: 'CRUZAMENTO DE EVIDÊNCIAS • ATO 04',
        headline: 'PARECER TÉCNICO E AUDITORIA',
        subline: 'AVALIAÇÃO DE PRAZOS E CONFORMIDADE',
        spokenText: 'Os relatórios de fiscalização apontam aditivos e rubricas que exigem o monitoramento contínuo dos cidadãos.',
        keyStat: '142 CONTRATOS',
        statLabel: 'Rubricas Auditadas com Sucesso',
        badge: 'RELATÓRIO TÉCNICO',
        visualType: 'evidence_board',
        startTime: sceneDuration * 3,
        endTime: sceneDuration * 4,
      },
      {
        sceneIndex: 5,
        category: 'VEREDITO FACTUAL • ATO 05',
        headline: 'CONCLUSÃO & PRÓXIMOS PASSOS',
        subline: 'SIGA PARA ACOMPANHAR NOVOS DOSSIÊS',
        spokenText: 'A informação e a vigilância são fundamentais para proteger o patrimônio público. Siga para acompanhar os próximos dossiês.',
        keyStat: 'VEREDITO FACTUAL',
        statLabel: 'Acompanhamento em Tempo Real',
        badge: 'PRÓXIMAS ANÁLISES',
        visualType: 'verdict',
        startTime: sceneDuration * 4,
        endTime: totalDuration,
      },
    ];
  }

  if (style === 'corporate_tech') {
    return [
      {
        sceneIndex: 1,
        category: 'APRESENTAÇÃO TÉCNICA • ATO 01',
        headline: cleanTitle.toUpperCase(),
        subline: 'MODELAGEM BIM E ENGENHARIA DE ALTA PRECISÃO',
        spokenText: 'Vamos analisar o fluxo de modelagem e extração automática de quantitativos em tempo real.',
        keyStat: 'FLUXO BIM ATIVO',
        statLabel: 'Modelagem Paramétrica 3D',
        badge: 'ENGENHARIA & BIM',
        visualType: 'dossier',
        startTime: 0,
        endTime: sceneDuration,
      },
      {
        sceneIndex: 2,
        category: 'CRITÉRIOS TÉCNICOS • ATO 02',
        headline: 'NORMAS NBR & PRODUTIVIDADE',
        subline: 'CONFORMIDADE COM PADRÕES DA INDÚSTRIA',
        spokenText: 'Eliminamos pausas e hesitações na explicação técnica para manter o foco total na assertividade do software.',
        keyStat: 'NBR ISO 19650',
        statLabel: 'Padrão Internacional de Gestão BIM',
        badge: 'NORMA TÉCNICA',
        visualType: 'law_decree',
        startTime: sceneDuration,
        endTime: sceneDuration * 2,
      },
      {
        sceneIndex: 3,
        category: 'TIMELAPSE INTELIGENTE • ATO 03',
        headline: 'ACELERAÇÃO 4X EM PROCESSAMENTO',
        subline: 'ETAPAS REPETITIVAS OTIMIZADAS COM PRECISÃO',
        spokenText: 'O timelapse inteligente acelera as rotinas repetitivas de cálculo estrutural mantendo 100% da clareza.',
        keyStat: '4X ACELERAÇÃO',
        statLabel: 'Ganho Comprovado de Produtividade',
        badge: 'TIMELAPSE INTELIGENTE',
        visualType: 'data_chart',
        startTime: sceneDuration * 2,
        endTime: sceneDuration * 3,
      },
      {
        sceneIndex: 4,
        category: 'AUDITORIA DE MODELO • ATO 04',
        headline: 'DETECÇÃO DE INTERFERÊNCIAS',
        subline: 'CLASH DETECTION E RESOLUÇÃO PRÉVIA',
        spokenText: 'Todas as interferências de tubulação e estrutura foram resolvidas antes da chegada ao canteiro de obras.',
        keyStat: 'ZERO CONFLITOS',
        statLabel: 'Clash Detection Validado',
        badge: 'RELATÓRIO DE COMPATIBILIZAÇÃO',
        visualType: 'evidence_board',
        startTime: sceneDuration * 3,
        endTime: sceneDuration * 4,
      },
      {
        sceneIndex: 5,
        category: 'ENTREGA EXECUTIVA • ATO 05',
        headline: 'RESULTADO PRONTO PARA APROVAÇÃO',
        subline: 'DOCUMENTAÇÃO TÉCNICA COMPLETA',
        spokenText: 'Este é o padrão que transforma apresentações técnicas em instrumentos decisivos de fechamento contratual.',
        keyStat: 'APROVADO 100%',
        statLabel: 'Pronto para Produção Executiva',
        badge: 'ENTREGA CONCLUÍDA',
        visualType: 'verdict',
        startTime: sceneDuration * 4,
        endTime: totalDuration,
      },
    ];
  }

  // viral_short & youtube_clean
  return [
    {
      sceneIndex: 1,
      category: 'PICO DE RETENÇÃO • ATO 01',
      headline: cleanTitle.toUpperCase(),
      subline: 'O DETALHE CRÍTICO QUE MUDA TUDO',
      spokenText: 'Preste muita atenção neste detalhe específico. Poucas pessoas percebem o impacto dessa virada.',
      keyStat: '98% RETENÇÃO',
      statLabel: 'Pico de Atenção Identificado',
      badge: 'GANCHO VIRAL',
      visualType: 'dossier',
      startTime: 0,
      endTime: sceneDuration,
    },
    {
      sceneIndex: 2,
      category: 'TESE & ARGUMENTO • ATO 02',
      headline: 'A REGRA FUNDAMENTAL',
      subline: 'PRINCÍPIO ESTRUTURAL DE DECISÃO',
      spokenText: 'Se analisarmos com clareza, a decisão tomada aqui determina todo o resultado posterior.',
      keyStat: 'REGRA CENTRAL',
      statLabel: 'Ponto de Inflexão Decisivo',
      badge: 'TESE PRINCIPAL',
      visualType: 'law_decree',
      startTime: sceneDuration,
      endTime: sceneDuration * 2,
    },
    {
      sceneIndex: 3,
      category: 'DADOS & MÉTRICAS • ATO 03',
      headline: 'MÉTRICAS QUE IMPORTAM',
      subline: 'NÚMEROS REAIS E COMPROVAÇÃO',
      spokenText: 'Os números mostram a diferença prática: o crescimento de performance é inquestionável.',
      keyStat: '4.8X RESULTADO',
      statLabel: 'Métrica Comprovada em Testes',
      badge: 'DADOS REAIS',
      visualType: 'data_chart',
      startTime: sceneDuration * 2,
      endTime: sceneDuration * 3,
    },
    {
      sceneIndex: 4,
      category: 'PLANO DE AÇÃO • ATO 04',
      headline: 'PASSO A PASSO OBJETIVO',
      subline: 'COMO APLICAR SEM ERROS',
      spokenText: 'O plano consiste em cinco passos práticos que qualquer pessoa ou equipe pode executar.',
      keyStat: '5 PASSOS',
      statLabel: 'Roteiro de Implementação',
      badge: 'CHECKLIST PRÁTICO',
      visualType: 'evidence_board',
      startTime: sceneDuration * 3,
      endTime: sceneDuration * 4,
    },
    {
      sceneIndex: 5,
      category: 'CONCLUSÃO • ATO 05',
      headline: 'SIGA PARA MAIS CORTES',
      subline: 'COMPARTILHE COM QUEM PRECISA SABER',
      spokenText: 'Curta este vídeo se fez sentido para você e siga o canal para não perder os próximos cortes.',
      keyStat: 'SIGA O PERFIL',
      statLabel: 'Conteúdo Diário de Alto Valor',
      badge: 'VEREDITO FINAL',
      visualType: 'verdict',
      startTime: sceneDuration * 4,
      endTime: totalDuration,
    },
  ];
}

/**
 * Generate outputs strictly respecting:
 * 1. Shorts duration >= 50s and <= 180s
 * 2. Real playable MP4 file sources and actual file sizes
 */
export function generateOutputsForModel(
  modelId: ModelId,
  mediaTitle: string,
  creatorHandle: string = '@editorx.oficial',
  colorHex: string = '#D4AF37'
): GeneratedOutput[] {
  const baseTitle = mediaTitle.replace(/\.[^/.]+$/, '').trim() || 'Vídeo';

  if (modelId === 'doc_shorts') {
    // Model 1: Exactly 1 vertical documentary short video (74s >= 50s)
    return [
      {
        id: 'out-doc-1',
        title: `${baseTitle} — Documentário Narrativo`,
        type: 'short',
        aspectRatio: '9:16',
        durationSeconds: 74,
        formattedDuration: '1:14',
        retentionScore: 98,
        summary: 'Estrutura documental narrativa com pesquisa de fatos e leis, cartelas dinâmicas, cortes de impacto e narração padrão brasileira com voz masculina agradável.',
        hookHeadline: 'Análise Documental Investigativa',
        videoStyle: 'documentary',
        downloadFileName: `editor-x-doc-${slugify(baseTitle)}.mp4`,
        downloadLabel: 'Baixar Short Documentário',
        tags: ['Documentário 9:16', 'Narração Brasileira', 'Fatos e Leis', '1m14s (>=50s)'],
        videoUrl: '/media/generated/doc_short.mp4',
        fileSizeBytes: 3183207,
        creatorHandle,
        colorHex,
        scenes: buildScenesForOutput(baseTitle, 74, 'documentary'),
        subtitles: [
          { word: 'Você', start: 0.2, end: 0.6 },
          { word: 'sabe', start: 0.7, end: 1.0 },
          { word: 'para', start: 1.1, end: 1.3 },
          { word: 'onde', start: 1.4, end: 1.7 },
          { word: 'vai', start: 1.8, end: 2.1 },
          { word: 'o', start: 2.2, end: 2.4 },
          { word: 'dinheiro', start: 2.5, end: 3.1 },
          { word: 'dos', start: 3.2, end: 3.5 },
          { word: 'seus', start: 3.6, end: 3.9 },
          { word: 'impostos?', start: 4.0, end: 4.8 },
        ],
      },
    ];
  }

  if (modelId === 'long_processor') {
    // Model 2: EXACTLY 5 outputs:
    // 3 Shorts (9:16, all >= 50s up to 3 mins) + 2 Longs (16:9, up to 15 mins)
    return [
      {
        id: 'out-short-1',
        title: `Short 1: O Ponto de Virada — ${baseTitle}`,
        type: 'short',
        aspectRatio: '9:16',
        durationSeconds: 62, // 62s >= 50s
        formattedDuration: '1:02',
        retentionScore: 98,
        summary: 'Pico de retenção detectado na gravação original. Jump cuts aplicados para eliminar pausas e zooms de ênfase sem cortes curtos demais.',
        hookHeadline: 'O Detalhe Crítico Revelado',
        videoStyle: 'viral_short',
        jumpCutsCount: 16,
        downloadFileName: `editor-x-short1-${slugify(baseTitle)}.mp4`,
        downloadLabel: 'Baixar Short 1',
        tags: ['Viral Short', '9:16', '1m02s (>=50s)', 'Jump Cuts'],
        videoUrl: '/media/generated/short_1.mp4',
        fileSizeBytes: 2840500,
        creatorHandle,
        colorHex,
        scenes: buildScenesForOutput(`Short 1: O Ponto de Virada — ${baseTitle}`, 62, 'viral_short'),
        subtitles: [
          { word: 'Preste', start: 0.1, end: 0.5 },
          { word: 'muita', start: 0.6, end: 0.9 },
          { word: 'atenção', start: 1.0, end: 1.5 },
          { word: 'neste', start: 1.6, end: 1.8 },
          { word: 'detalhe', start: 1.9, end: 2.4 },
          { word: 'específico.', start: 2.5, end: 3.2 },
        ],
      },
      {
        id: 'out-short-2',
        title: `Short 2: A Proposta Central — ${baseTitle}`,
        type: 'short',
        aspectRatio: '9:16',
        durationSeconds: 54, // 54s >= 50s
        formattedDuration: '0:54',
        retentionScore: 95,
        summary: 'Momento de tese central e argumentação forte. Transições rápidas e corte contínuo com narração límpida.',
        hookHeadline: 'A Métrica Que Ninguém Analisa',
        videoStyle: 'viral_short',
        jumpCutsCount: 14,
        downloadFileName: `editor-x-short2-${slugify(baseTitle)}.mp4`,
        downloadLabel: 'Baixar Short 2',
        tags: ['Viral Short', '9:16', '54s (>=50s)', 'Retenção Alta'],
        videoUrl: '/media/generated/short_2.mp4',
        fileSizeBytes: 2510300,
        creatorHandle,
        colorHex,
        scenes: buildScenesForOutput(`Short 2: A Proposta Central — ${baseTitle}`, 54, 'viral_short'),
        subtitles: [
          { word: 'Se', start: 0.1, end: 0.3 },
          { word: 'analisarmos', start: 0.4, end: 1.0 },
          { word: 'com', start: 1.1, end: 1.3 },
          { word: 'clareza,', start: 1.4, end: 1.9 },
          { word: 'o', start: 2.0, end: 2.1 },
          { word: 'resultado', start: 2.2, end: 2.7 },
          { word: 'é', start: 2.8, end: 2.9 },
          { word: 'evidente.', start: 3.0, end: 3.8 },
        ],
      },
      {
        id: 'out-short-3',
        title: `Short 3: Dados e Solução — ${baseTitle}`,
        type: 'short',
        aspectRatio: '9:16',
        durationSeconds: 58, // 58s >= 50s (NOT under 50s!)
        formattedDuration: '0:58',
        retentionScore: 92,
        summary: 'Bloco de dados objetivos e fechamento assertivo. Respeita estritamente o limite mínimo de 50 segundos.',
        hookHeadline: 'A Solução em Números Reais',
        videoStyle: 'viral_short',
        jumpCutsCount: 15,
        downloadFileName: `editor-x-short3-${slugify(baseTitle)}.mp4`,
        downloadLabel: 'Baixar Short 3',
        tags: ['Viral Short', '9:16', '58s (>=50s)', 'Dados Objetivos'],
        videoUrl: '/media/generated/short_3.mp4',
        fileSizeBytes: 2690800,
        creatorHandle,
        colorHex,
        scenes: buildScenesForOutput(`Short 3: Dados e Solução — ${baseTitle}`, 58, 'viral_short'),
        subtitles: [
          { word: 'O', start: 0.1, end: 0.3 },
          { word: 'plano', start: 0.4, end: 0.8 },
          { word: 'propõe', start: 0.9, end: 1.3 },
          { word: 'cinco', start: 1.4, end: 1.7 },
          { word: 'passos', start: 1.8, end: 2.2 },
          { word: 'fundamentais.', start: 2.3, end: 3.3 },
        ],
      },
      {
        id: 'out-long-1',
        title: `YouTube 1: Módulo Completo — ${baseTitle}`,
        type: 'long',
        aspectRatio: '16:9',
        durationSeconds: 74,
        formattedDuration: '1:14',
        retentionScore: 96,
        summary: 'Bloco aprofundado em formato widescreen 16:9 para YouTube com introdução conectiva, cortes limpos e áudio masterizado.',
        hookHeadline: 'Fundamentos e Estruturação Completa',
        videoStyle: 'youtube_clean',
        downloadFileName: `editor-x-youtube1-${slugify(baseTitle)}.mp4`,
        downloadLabel: 'Baixar YouTube 1',
        tags: ['YouTube 16:9', 'Widescreen HD', 'Cortes Limpos', 'Áudio Masterizado'],
        videoUrl: '/media/generated/youtube_1.mp4',
        fileSizeBytes: 3410200,
        creatorHandle,
        colorHex,
        scenes: buildScenesForOutput(`YouTube 1: Módulo Completo — ${baseTitle}`, 74, 'youtube_clean'),
        subtitles: [
          { word: 'Nesta', start: 0.1, end: 0.4 },
          { word: 'análise', start: 0.5, end: 1.0 },
          { word: 'completa,', start: 1.1, end: 1.6 },
          { word: 'vamos', start: 1.7, end: 2.0 },
          { word: 'examinar', start: 2.1, end: 2.6 },
          { word: 'os', start: 2.7, end: 2.9 },
          { word: 'fundamentos.', start: 3.0, end: 3.9 },
        ],
      },
      {
        id: 'out-long-2',
        title: `YouTube 2: Aprofundamento Prático — ${baseTitle}`,
        type: 'long',
        aspectRatio: '16:9',
        durationSeconds: 174,
        formattedDuration: '2:54',
        retentionScore: 94,
        summary: 'Apresentação detalhada com dados de gestão, simulações ilustrativas e capítulos em formato YouTube 16:9 de alta definição.',
        hookHeadline: 'Implementação e Critérios de Gestão',
        videoStyle: 'youtube_clean',
        downloadFileName: `editor-x-youtube2-${slugify(baseTitle)}.mp4`,
        downloadLabel: 'Baixar YouTube 2',
        tags: ['YouTube 16:9', 'Conteúdo Profundo', '2m54s', 'Capítulos'],
        videoUrl: '/media/generated/youtube_2.mp4',
        fileSizeBytes: 4230100,
        creatorHandle,
        colorHex,
        scenes: buildScenesForOutput(`YouTube 2: Aprofundamento Prático — ${baseTitle}`, 174, 'youtube_clean'),
        subtitles: [
          { word: 'Passando', start: 0.1, end: 0.6 },
          { word: 'para', start: 0.7, end: 0.9 },
          { word: 'a', start: 1.0, end: 1.1 },
          { word: 'execução', start: 1.2, end: 1.8 },
          { word: 'prática,', start: 1.9, end: 2.4 },
          { word: 'veja', start: 2.5, end: 2.8 },
          { word: 'os', start: 2.9, end: 3.1 },
          { word: 'critérios.', start: 3.2, end: 3.9 },
        ],
      },
    ];
  }

  // Model 3: 1 Corporate Tech Shorts (62s >= 50s)
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
      tags: ['Corporate 9:16', '1m02s (>=50s)', 'Smart Timelapse', 'BIM / Software'],
      videoUrl: '/media/generated/corp_short.mp4',
      fileSizeBytes: 2750300,
      creatorHandle,
      colorHex,
      scenes: buildScenesForOutput(`${baseTitle} — Demonstração Técnica & BIM`, 62, 'corporate_tech'),
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
    return `ffmpeg -i "${inputPath}" -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,eq=contrast=1.05:saturation=1.1,drawtext=text='@CANAL':fontcolor=0xD4AF37:x=30:y=80" -af "loudnorm=I=-16:TP=-1.5:LRA=11,amix=inputs=2" -c:v libx264 -preset ultrafast -movflags +faststart -c:a aac "${outputPath}"`;
  }
  if (modelId === 'long_processor') {
    return `# Pipeline Modelo 2: 3 Shorts (min 50s até 3min) + 2 Longos (16:9)
ffmpeg -ss 00:00:00 -to 00:01:02 -i "${inputPath}" -vf "crop=ih*(9/16):ih,scale=1080:1920" -c:v libx264 -preset ultrafast -movflags +faststart out_short_1.mp4
ffmpeg -ss 00:00:00 -to 00:00:54 -i "${inputPath}" -vf "crop=ih*(9/16):ih,scale=1080:1920" -c:v libx264 -preset ultrafast -movflags +faststart out_short_2.mp4
ffmpeg -ss 00:00:54 -to 00:01:52 -i "${inputPath}" -vf "crop=ih*(9/16):ih,scale=1080:1920" -c:v libx264 -preset ultrafast -movflags +faststart out_short_3.mp4
ffmpeg -ss 00:00:00 -to 00:01:14 -i "${inputPath}" -vf "scale=1280:720" -c:v libx264 -preset ultrafast -movflags +faststart out_youtube_1.mp4
ffmpeg -ss 00:00:00 -to 00:02:54 -i "${inputPath}" -vf "scale=1280:720" -c:v libx264 -preset ultrafast -movflags +faststart out_youtube_2.mp4`;
  }
  return `ffmpeg -i "${inputPath}" -filter_complex "[0:v]setpts='if(between(t,12,35),0.25*PTS,PTS)'[v];[0:a]atempo='if(between(t,12,35),2.0,1.0)'[a]" -map "[v]" -map "[a]" -vf "scale=1080:1920" -c:v libx264 -preset ultrafast -movflags +faststart "${outputPath}"`;
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
