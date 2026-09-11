export const REAL_ESTATE_PROMPT = `Professionally enhance this exact real-estate photograph for a truthful property listing. Improve exposure, natural daylight balance, white balance, dynamic range, detail, gentle sharpness, noise, compression artifacts and mild blur. Deliver a crisp, elegant, photorealistic architectural photograph in natural colours, without excessive HDR or plastic textures. Preserve the exact camera view, room dimensions, layout, windows, doors, exterior view, furniture, fixtures, materials and actual property condition. Do not add, remove, replace or reposition furniture or objects. Do not conceal stains, cracks, damp, mold, wear, damage or other physical defects on walls or furniture. Do not invent details that cannot be recovered from the source. No text, watermark, people or borders. Match the input aspect ratio.`;

export type Prediction = { id: string; status: string; outputs?: string[] };
export async function waveRequest(path: string, body?: object): Promise<Prediction> {
  const key = process.env.WAVESPEED_API_KEY;
  if (!key) throw new Error('ai_configuration');
  const response = await fetch(`https://api.wavespeed.ai/api/v3/${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(35_000), cache: 'no-store',
  });
  // Provider error text can contain input URLs or credentials. Expose only stable codes.
  if (!response.ok) throw new Error(response.status === 402 ? 'ai_credit' : response.status === 401 || response.status === 403 ? 'ai_configuration' : response.status === 429 ? 'ai_busy' : response.status >= 500 ? 'ai_unavailable' : 'ai_rejected');
  const json = await response.json();
  const data = json.data ?? json;
  if (!data || typeof data.id !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(data.id)) throw new Error('ai_response');
  return data as Prediction;
}

export async function downloadResult(value: string): Promise<Uint8Array> {
  const url = new URL(value);
  const host = url.hostname;
  if (url.protocol !== 'https:' || url.username || url.password || url.port || !(host.endsWith('.wavespeed.ai') || host.endsWith('.cloudfront.net'))) throw new Error('result_host');
  const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(25_000) });
  if (!response.ok || !response.body) throw new Error('result_download');
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = []; let length = 0;
  while (true) {
    const { done, value: chunk } = await reader.read();
    if (done) break;
    length += chunk.length;
    if (length > 25 * 1024 * 1024) { await reader.cancel(); throw new Error('result_size'); }
    chunks.push(chunk);
  }
  const bytes = Buffer.concat(chunks);
  if (bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WEBP') throw new Error('result_format');
  return bytes;
}
