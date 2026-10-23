const fs = require('fs');
const path = require('path');

const dir = path.join('public', 'icons');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// Create SVG icon
const svg = [
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'>",
  "  <rect width='512' height='512' rx='80' fill='#0d0a1a'/>",
  "  <circle cx='256' cy='200' r='120' fill='#1a0a35' stroke='#8b5cf6' stroke-width='8'/>",
  "  <text x='256' y='240' font-family='Arial' font-size='100' text-anchor='middle'>🌍</text>",
  "  <text x='256' y='390' font-family='Arial Black' font-size='100' font-weight='900' text-anchor='middle' fill='#a78bfa'>2Life</text>",
  "</svg>"
].join('\n');

fs.writeFileSync(path.join(dir, 'icon.svg'), svg);
console.log('SVG icon created');

// Minimal 1x1 transparent PNG placeholder
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);
fs.writeFileSync(path.join(dir, 'icon-192.png'), png);
fs.writeFileSync(path.join(dir, 'icon-512.png'), png);
console.log('Done');
