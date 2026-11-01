import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MODELS,
  validateModelSubmission,
  generateOutputsForModel,
  formatBytes,
  formatDuration,
  buildFFmpegCommand,
  type VideoMetadata,
} from './videoEngine';

test('MODELS configuration contains all 3 required models with exact business specs', () => {
  assert.ok(MODELS.doc_shorts, 'Modelo 1 must exist');
  assert.ok(MODELS.long_processor, 'Modelo 2 must exist');
  assert.ok(MODELS.corp_tech, 'Modelo 3 must exist');

  // Model 1: Documentary Shorts
  assert.equal(MODELS.doc_shorts.requiresReferenceVideo, true);
  assert.equal(MODELS.doc_shorts.expectedOutputsCount, 1);
  assert.equal(MODELS.doc_shorts.aspectRatio, '9:16');

  // Model 2: Long processor up to 2 hours, exactly 5 outputs
  assert.equal(MODELS.long_processor.maxInputDurationMinutes, 120);
  assert.equal(MODELS.long_processor.expectedOutputsCount, 5);

  // Model 3: Corporate tech
  assert.equal(MODELS.corp_tech.expectedOutputsCount, 1);
  assert.equal(MODELS.corp_tech.aspectRatio, '9:16');
});

test('validateModelSubmission validates required reference video for Model 1', () => {
  const dummyMedia: VideoMetadata = {
    title: 'Meu Podcast.mp4',
    durationSeconds: 600,
    sizeBytes: 150000000,
    format: 'video/mp4',
    source: 'upload',
  };

  // Model 1 without reference video must fail
  const res1 = validateModelSubmission('doc_shorts', dummyMedia, false);
  assert.equal(res1.valid, false);
  assert.match(res1.error || '', /referência/i);

  // Model 1 with reference video must pass
  const res2 = validateModelSubmission('doc_shorts', dummyMedia, true);
  assert.equal(res2.valid, true);
});

test('validateModelSubmission rejects videos exceeding model duration limit', () => {
  const tooLongMedia: VideoMetadata = {
    title: 'Filme Completo.mp4',
    durationSeconds: 150 * 60, // 150 min (exceeds 120 min max for Model 2)
    sizeBytes: 1000000000,
    format: 'video/mp4',
    source: 'upload',
  };

  const res = validateModelSubmission('long_processor', tooLongMedia, false);
  assert.equal(res.valid, false);
  assert.match(res.error || '', /excede o limite/i);
});

test('generateOutputsForModel outputs exactly 5 files for Model 2 (3 shorts + 2 long)', () => {
  const outputs = generateOutputsForModel('long_processor', 'Aula Magistral de IA.mp4');
  assert.equal(outputs.length, 5, 'Model 2 must generate exactly 5 outputs');

  const shorts = outputs.filter((o) => o.type === 'short' && o.aspectRatio === '9:16');
  const longs = outputs.filter((o) => o.type === 'long' && o.aspectRatio === '16:9');

  assert.equal(shorts.length, 3, 'Must have 3 short vertical videos');
  assert.equal(longs.length, 2, 'Must have 2 long YouTube videos');

  // Verify labels
  assert.equal(shorts[0].downloadLabel, 'Baixar Short 1');
  assert.equal(shorts[1].downloadLabel, 'Baixar Short 2');
  assert.equal(shorts[2].downloadLabel, 'Baixar Short 3');
  assert.equal(longs[0].downloadLabel, 'Baixar YouTube 1');
  assert.equal(longs[1].downloadLabel, 'Baixar YouTube 2');
});

test('generateOutputsForModel outputs 1 stylized video for Model 1 and Model 3', () => {
  const docOutputs = generateOutputsForModel('doc_shorts', 'Historia da Internet.mp4');
  assert.equal(docOutputs.length, 1);
  assert.equal(docOutputs[0].aspectRatio, '9:16');
  assert.equal(docOutputs[0].downloadLabel, 'Baixar Short Documentário');

  const techOutputs = generateOutputsForModel('corp_tech', 'Demonstracao Revit BIM.mp4');
  assert.equal(techOutputs.length, 1);
  assert.equal(techOutputs[0].aspectRatio, '9:16');
  assert.equal(techOutputs[0].timelapseApplied, true);
  assert.equal(techOutputs[0].downloadLabel, 'Baixar Short Corporativo');
});

test('formatBytes and formatDuration produce clean outputs', () => {
  assert.equal(formatBytes(1024), '1 KB');
  assert.equal(formatBytes(1048576 * 500), '500 MB');
  assert.equal(formatDuration(65), '1:05');
  assert.equal(formatDuration(3665), '1:01:05');
});

test('buildFFmpegCommand creates valid filter chains for all models', () => {
  const cmd1 = buildFFmpegCommand('doc_shorts', 'raw.mp4', 'out.mp4');
  assert.match(cmd1, /scale=1080:1920/);
  assert.match(cmd1, /subtitles=/);

  const cmd2 = buildFFmpegCommand('long_processor', 'raw.mp4', 'out.mp4');
  assert.match(cmd2, /out_short_1\.mp4/);
  assert.match(cmd2, /out_youtube_1\.mp4/);

  const cmd3 = buildFFmpegCommand('corp_tech', 'raw.mp4', 'out.mp4');
  assert.match(cmd3, /setpts/);
});
