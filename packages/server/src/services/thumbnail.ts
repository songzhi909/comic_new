import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

fs.mkdirSync(config.thumbnailsDir, { recursive: true });

export async function getOrGenerateThumbnail(imagePath: string): Promise<Buffer> {
  const hash = Buffer.from(imagePath).toString('base64url');
  const thumbPath = path.join(config.thumbnailsDir, `${hash}.jpg`);

  if (fs.existsSync(thumbPath)) {
    return fs.readFileSync(thumbPath);
  }

  const buffer = await sharp(imagePath)
    .resize(300, 400, { fit: 'cover' })
    .jpeg({ quality: 80 })
    .toBuffer();

  fs.writeFileSync(thumbPath, buffer);
  return buffer;
}

export async function getResizedImage(imagePath: string, width: number): Promise<Buffer> {
  const hash = Buffer.from(`${imagePath}_${width}`).toString('base64url');
  const resizedDir = path.join(config.thumbnailsDir, 'resized');
  fs.mkdirSync(resizedDir, { recursive: true });
  const resizedPath = path.join(resizedDir, `${hash}.jpg`);

  if (fs.existsSync(resizedPath)) {
    return fs.readFileSync(resizedPath);
  }

  const buffer = await sharp(imagePath)
    .resize(width, null, { withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  fs.writeFileSync(resizedPath, buffer);
  return buffer;
}
