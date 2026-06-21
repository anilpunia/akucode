// generate-icons.mjs — run once: node generate-icons.mjs
// Generates icon-192.png and icon-512.png from icon.svg

import { readFileSync, writeFileSync } from 'fs';
import { createCanvas, loadImage } from 'canvas';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Dark background
  ctx.fillStyle = '#0a0a0f';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();

  // Purple radial gradient background
  const radial = ctx.createRadialGradient(size * 0.5, size * 0.4, 0, size * 0.5, size * 0.5, size * 0.6);
  radial.addColorStop(0, '#2d1b69');
  radial.addColorStop(1, '#0a0a0f');
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fillStyle = radial;
  ctx.fill();

  // Shield path (scaled)
  const s = size / 512;
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#a78bfa');
  grad.addColorStop(0.5, '#7c3aed');
  grad.addColorStop(1, '#6366f1');

  ctx.shadowColor = '#7c3aed';
  ctx.shadowBlur = size * 0.06;

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(256 * s, 96 * s);
  ctx.lineTo(368 * s, 140 * s);
  ctx.lineTo(368 * s, 256 * s);
  ctx.bezierCurveTo(368 * s, 316 * s, 320 * s, 364 * s, 256 * s, 392 * s);
  ctx.bezierCurveTo(192 * s, 364 * s, 144 * s, 316 * s, 144 * s, 256 * s);
  ctx.lineTo(144 * s, 140 * s);
  ctx.closePath();
  ctx.fill();

  // Checkmark
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.lineWidth = 18 * s;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(220 * s, 256 * s);
  ctx.lineTo(244 * s, 280 * s);
  ctx.lineTo(296 * s, 228 * s);
  ctx.stroke();

  const buffer = canvas.toBuffer('image/png');
  writeFileSync(join(__dirname, 'public', `icon-${size}.png`), buffer);
  console.log(`✅ icon-${size}.png created`);
}

try {
  await generateIcon(192);
  await generateIcon(512);
  console.log('Icons generated successfully!');
} catch (err) {
  console.error('canvas package not available — install with: npm install canvas');
  console.log('Alternative: use https://realfavicongenerator.net with public/icon.svg');
}
