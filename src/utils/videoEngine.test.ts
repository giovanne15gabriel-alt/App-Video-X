import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MODELS,
  SHORTS_MIN_DURATION_SECONDS,
  SHORTS_MAX_DURATION_SECONDS,
  COLOR_PALETTES,
  validateModelSubmission,
  generateOutputsForModel,
  formatBytes,
  formatDuration,
  buildFFmpegCommand,
  type VideoMetadata,
} from './videoEngine';

test('MODELS configuration contains all 3 required models and Model 1 script support', () => {
  assert.ok(MODELS.doc_shorts, 'Modelo 1 must exist');
  assert.ok(MODELS.long_processor, 'Modelo 2 must exist');
  assert.ok(MODELS.corp_tech, 'Modelo 3 must exist');

  // Model 1: Documentary Shorts - max 3 min input duration, supports script
  assert.equal(MODELS.doc_shorts.maxInputDurationMinutes, 3);
  assert.equal(MODELS.doc_shorts.supportsScriptInput, true);
  assert.equal(MODELS.doc_shorts.expectedOutputsCount, 1);
  assert.equal(MODELS.doc_shorts.aspectRatio, '9:16');

  // Model 2: Long processor up to 2 hours, exactly 5 outputs
  assert.equal(MODELS.long_processor.maxInputDurationMinutes, 120);
  assert.equal(MODELS.long_processor.expectedOutputsCount, 5);

  // Model 3: Corporate tech
  assert.equal(MODELS.corp_tech.expectedOutputsCount, 1);
  assert.equal(MODELS.corp_tech.aspectRatio, '9:16');
});

test('All shorts generated strictly adhere to minimum 50s and maximum 180s constraint', () => {
  assert.equal(SHORTS_MIN_DURATION_SECONDS, 50, 'Minimum shorts duration must be 50 seconds');
  assert.equal(SHORTS_MAX_DURATION_SECONDS, 180, 'Maximum shorts duration must be 180 seconds');

  const models = ['doc_shorts', 'long_processor', 'corp_tech'] as const;
  for (const m of models) {
    const outputs = generateOutputsForModel(m, 'Teste Geral.mp4', '@canal.teste', '#06B6D4');
    const shorts = outputs.filter((o) => o.type === 'short');
    for (const short of shorts) {
      assert.ok(
        short.durationSeconds >= 50,
        `Short "${short.title}" has duration ${short.durationSeconds}s which is less than 50s minimum!`
      );
      assert.ok(
        short.durationSeconds <= 180,
        `Short "${short.title}" has duration ${short.durationSeconds}s which exceeds 180s maximum!`
      );
      assert.equal(short.creatorHandle, '@canal.teste');
      assert.equal(short.colorHex, '#06B6D4');
    }
  }
});

test('validateModelSubmission accepts valid written script for Model 1', () => {
  const scriptMedia: VideoMetadata = {
    title: 'Roteiro_PEC_Fiscal.txt',
    durationSeconds: 75,
    sizeBytes: 1200,
    format: 'text/plain',
    source: 'script',
    scriptContent: 'A nova proposta de consolidação municipal propõe unificar cidades com base no Artigo 18 da Constituição.',
    scriptTopic: 'Economia e Leis',
  };

  const res = validateModelSubmission('doc_shorts', scriptMedia);
  assert.equal(res.valid, true);

  // Reject too short script (< 20 chars)
  const invalidScript: VideoMetadata = {
    ...scriptMedia,
    scriptContent: 'Muito curto',
  };
  const resBad = validateModelSubmission('doc_shorts', invalidScript);
  assert.equal(resBad.valid, false);
});

test('generateOutputsForModel provides real videoUrl and real file sizes', () => {
  const outputs = generateOutputsForModel('long_processor', 'Aula de Podcast.mp4');
  assert.equal(outputs.length, 5);

  for (const out of outputs) {
    assert.ok(out.videoUrl.endsWith('.mp4'), `Output ${out.id} must point to a real .mp4 video`);
    assert.ok(out.fileSizeBytes > 100000, `Output ${out.id} size must be a real video file, got ${out.fileSizeBytes}`);
  }
});

test('COLOR_PALETTES provides standard professional palettes', () => {
  assert.ok(COLOR_PALETTES.length >= 6);
  assert.ok(COLOR_PALETTES.some((c) => c.hex === '#D4AF37'));
  assert.ok(COLOR_PALETTES.some((c) => c.hex === '#06B6D4'));
});
