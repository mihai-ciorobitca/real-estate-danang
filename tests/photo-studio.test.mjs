import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
async function load(file) {
  let source = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
  source = source.replace("from 'sharp'", `from '${pathToFileURL(require.resolve('sharp')).href}'`);
  const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
}
const { movePhoto } = await load('lib/photo-job-types.ts');
const { waveRequest, downloadResult } = await load('lib/wavespeed.ts');
const { encodePhotoResult } = await load('lib/photo-output.ts');

test('move cover to end, move last to cover, keep source identity and reject out-of-range moves', () => {
  const originals = ['a','b','c','d','e','f'];
  assert.deepEqual(movePhoto(originals, 0, 5), ['b','c','d','e','f','a']);
  assert.deepEqual(movePhoto(originals, 5, 0), ['f','a','b','c','d','e']);
  assert.deepEqual(originals, ['a','b','c','d','e','f']);
  assert.equal(movePhoto(originals, 0, -1), originals);
  assert.equal(movePhoto(originals, 5, 6), originals);
});

test('provider errors never expose raw secret-bearing response text', async () => {
  const originalFetch = globalThis.fetch; const originalKey = process.env.WAVESPEED_API_KEY;
  try {
    process.env.WAVESPEED_API_KEY = 'test-key';
    globalThis.fetch = async () => new Response('sensitive internal response', { status: 402 });
    await assert.rejects(waveRequest('test'), { message: 'ai_credit' });
    globalThis.fetch = async () => Response.json({ data: { id: '../unsafe', status: 'created' } });
    await assert.rejects(waveRequest('test'), { message: 'ai_response' });
  } finally { globalThis.fetch = originalFetch; if (originalKey === undefined) delete process.env.WAVESPEED_API_KEY; else process.env.WAVESPEED_API_KEY = originalKey; }
});

test('result fetch rejects private hosts, misleading suffixes and credentials', async () => {
  for (const url of ['http://127.0.0.1/a','https://127.0.0.1/a','https://wavespeed.ai.attacker.test/a','https://user:pass@static.wavespeed.ai/a']) {
    await assert.rejects(downloadResult(url), { message: 'result_host' });
  }
});

test('result fetch rejects non-WebP content rather than storing arbitrary data', async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response('<html>error</html>');
    await assert.rejects(downloadResult('https://static.wavespeed.ai/result.webp'), { message: 'result_format' });
  } finally { globalThis.fetch = originalFetch; }
});

test('storage encoding preserves real 4K dimensions and rejects a low-resolution provider result', async () => {
  const source = await sharp({ create: { width: 4096, height: 3072, channels: 3, background: '#c7bfae' } }).webp({ lossless: true }).toBuffer();
  const encoded = await encodePhotoResult(source);
  const metadata = await sharp(encoded).metadata();
  assert.equal(metadata.width, 4096); assert.equal(metadata.height, 3072);
  assert.ok(encoded.length < 4 * 1024 * 1024);
  const providerTier = await sharp(source).resize(3520,2352).toBuffer();
  const normalized = await sharp(await encodePhotoResult(providerTier)).metadata();
  assert.equal(normalized.width,4096);
  assert.ok(Math.abs(normalized.width / normalized.height - 3520 / 2352) < .001);
  const small = await sharp(source).resize(1024).toBuffer();
  await assert.rejects(encodePhotoResult(small), { message: 'result_resolution' });
});
