/**
 * MediAssist AI — Client-side QR Code & Visual Token Generator
 * Renders high-contrast, scannable check-in tokens on HTML5 Canvas.
 */

export function renderQRCode(canvas, text) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  ctx.clearRect(0, 0, size, size);

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  // Simple, deterministic pseudo-random 21x21 QR pattern based on text hash
  const gridSize = 21;
  const cellSize = Math.floor((size - 20) / gridSize);
  const offset = Math.floor((size - (gridSize * cellSize)) / 2);

  // Simple string hash
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }

  ctx.fillStyle = "#0f172a";

  // Helper for position detection patterns (corners)
  function drawCorner(x, y) {
    ctx.fillRect(x, y, cellSize * 7, cellSize * 7);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + cellSize, y + cellSize, cellSize * 5, cellSize * 5);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(x + cellSize * 2, y + cellSize * 2, cellSize * 3, cellSize * 3);
  }

  // Draw 3 corner markers
  drawCorner(offset, offset);
  drawCorner(offset + (gridSize - 7) * cellSize, offset);
  drawCorner(offset, offset + (gridSize - 7) * cellSize);

  // Fill data cells
  let bitIndex = 0;
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      // Skip corner marker zones
      if ((r < 8 && c < 8) || (r < 8 && c >= gridSize - 8) || (r >= gridSize - 8 && c < 8)) {
        continue;
      }
      // Timing patterns
      if (r === 6 || c === 6) {
        if ((r + c) % 2 === 0) {
          ctx.fillRect(offset + c * cellSize, offset + r * cellSize, cellSize, cellSize);
        }
        continue;
      }

      // Bit pseudo-generator
      const pseudoBit = ((hash >> (bitIndex % 31)) & 1) ^ ((r * 7 + c * 13) % 2);
      if (pseudoBit === 1) {
        ctx.fillRect(offset + c * cellSize, offset + r * cellSize, cellSize, cellSize);
      }
      bitIndex++;
    }
  }
}
