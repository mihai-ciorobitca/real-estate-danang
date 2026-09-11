import sharp from 'sharp';

/** Normalize the provider's ~8 MP 4K tier to a 4096 px long edge, within the 4 MiB bucket. */
export async function encodePhotoResult(bytes: Uint8Array): Promise<Buffer> {
  const metadata = await sharp(bytes, { limitInputPixels: 40_000_000 }).metadata();
  if (!metadata.width || !metadata.height || metadata.width * metadata.height < 7_000_000) throw new Error('result_resolution');
  for (const quality of [90, 82, 74, 64, 54]) {
    const encoded = await sharp(bytes, { limitInputPixels: 40_000_000 }).resize({ width: 4096, height: 4096, fit: 'inside' }).webp({ quality, effort: 4 }).toBuffer();
    if (encoded.length < 3.9 * 1024 * 1024) return encoded;
  }
  throw new Error('result_size');
}
