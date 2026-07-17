import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const palette = {
  navy: [23, 59, 108, 255],
  blue: [40, 120, 181, 255],
  paleBlue: [203, 227, 244, 255],
  white: [255, 255, 255, 255],
  red: [196, 61, 75, 255],
};

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

const crc32 = (buffer) => {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const pngChunk = (type, data) => {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, checksum]);
};

const createIcon = (size) => {
  const pixels = Buffer.alloc(size * size * 4);

  const setPixel = (x, y, color) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const offset = (Math.floor(y) * size + Math.floor(x)) * 4;
    pixels.set(color, offset);
  };

  const fillCircle = (centerX, centerY, radius, color) => {
    const minX = Math.max(0, Math.floor(centerX - radius));
    const maxX = Math.min(size - 1, Math.ceil(centerX + radius));
    const minY = Math.max(0, Math.floor(centerY - radius));
    const maxY = Math.min(size - 1, Math.ceil(centerY + radius));
    const radiusSquared = radius * radius;
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        if ((x - centerX) ** 2 + (y - centerY) ** 2 <= radiusSquared) {
          setPixel(x, y, color);
        }
      }
    }
  };

  const drawLine = (fromX, fromY, toX, toY, width, color) => {
    const distance = Math.hypot(toX - fromX, toY - fromY);
    const steps = Math.ceil(distance * 1.5);
    for (let step = 0; step <= steps; step += 1) {
      const ratio = step / steps;
      fillCircle(
        fromX + (toX - fromX) * ratio,
        fromY + (toY - fromY) * ratio,
        width / 2,
        color,
      );
    }
  };

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) setPixel(x, y, palette.navy);
  }

  fillCircle(size * 0.82, size * 0.18, size * 0.09, palette.blue);
  fillCircle(size * 0.82, size * 0.18, size * 0.035, palette.paleBlue);

  const points = [
    [size * 0.25, size * 0.73],
    [size * 0.48, size * 0.54],
    [size * 0.7, size * 0.34],
  ];
  drawLine(...points[0], ...points[1], size * 0.055, palette.white);
  drawLine(...points[1], ...points[2], size * 0.055, palette.white);

  for (const [x, y] of points.slice(0, 2)) {
    fillCircle(x, y, size * 0.105, palette.white);
    fillCircle(x, y, size * 0.068, palette.blue);
  }
  fillCircle(points[2][0], points[2][1], size * 0.12, palette.white);
  fillCircle(points[2][0], points[2][1], size * 0.078, palette.red);

  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y += 1) {
    const rowOffset = y * (size * 4 + 1);
    raw[rowOffset] = 0;
    pixels.copy(raw, rowOffset + 1, y * size * 4, (y + 1) * size * 4);
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", header),
    pngChunk("IDAT", deflateSync(raw, { level: 9 })),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
};

const iconDirectory = fileURLToPath(new URL("../public/icons/", import.meta.url));
mkdirSync(iconDirectory, { recursive: true });

for (const size of [192, 512]) {
  writeFileSync(`${iconDirectory}app-icon-${size}.png`, createIcon(size));
}

