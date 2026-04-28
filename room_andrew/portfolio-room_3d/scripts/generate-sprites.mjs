import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "assets", "sprites");

const frameSize = 48;
const sheetWidth = frameSize * 3;
const sheetHeight = frameSize * 4;
const scale = frameSize / 32;

const characters = [
  {
    key: "player",
    file: "player.png",
    skin: "#f0c7a6",
    hair: "#4b2d1f",
    hairStyle: "bushy",
    shirt: "#73d6ff",
    pants: "#172554",
    accent: "#ff9c39",
  },
  {
    key: "jamaal",
    file: "jamaal.png",
    skin: "#6f3f2a",
    hair: "#17110d",
    hairStyle: "dreads",
    shirt: "#ffcf5a",
    pants: "#21243f",
    accent: "#73d6ff",
  },
  {
    key: "jonathan",
    file: "jonathan.png",
    skin: "#bf7a4b",
    hair: "#20120d",
    hairStyle: "spiky",
    shirt: "#ef476f",
    pants: "#20233a",
    accent: "#b98cff",
  },
  {
    key: "kapa",
    file: "kapa.png",
    skin: "#d6aa75",
    hair: "#111015",
    hairStyle: "long",
    shirt: "#b98cff",
    pants: "#1d2742",
    accent: "#06d6a0",
  },
];

function rgba(hex) {
  const value = hex.replace("#", "");
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
    255,
  ];
}

function createCanvas(width, height) {
  return new Uint8Array(width * height * 4);
}

function s(value) {
  return Math.round(value * scale);
}

function setPixel(canvas, width, x, y, color) {
  if (x < 0 || y < 0 || x >= width || y >= sheetHeight) return;
  const offset = (y * width + x) * 4;
  canvas[offset] = color[0];
  canvas[offset + 1] = color[1];
  canvas[offset + 2] = color[2];
  canvas[offset + 3] = color[3];
}

function rect(canvas, width, x, y, w, h, color) {
  x = s(x);
  y = s(y);
  w = Math.max(1, s(w));
  h = Math.max(1, s(h));

  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) {
      setPixel(canvas, width, xx, yy, color);
    }
  }
}

function ellipse(canvas, width, cx, cy, rx, ry, color) {
  cx = s(cx);
  cy = s(cy);
  rx = Math.max(1, s(rx));
  ry = Math.max(1, s(ry));

  for (let yy = Math.floor(cy - ry); yy <= Math.ceil(cy + ry); yy += 1) {
    for (let xx = Math.floor(cx - rx); xx <= Math.ceil(cx + rx); xx += 1) {
      const dx = (xx - cx) / rx;
      const dy = (yy - cy) / ry;
      if (dx * dx + dy * dy <= 1) setPixel(canvas, width, xx, yy, color);
    }
  }
}

function line(canvas, width, x1, y1, x2, y2, color) {
  x1 = s(x1);
  y1 = s(y1);
  x2 = s(x2);
  y2 = s(y2);

  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
  for (let i = 0; i <= steps; i += 1) {
    const t = steps === 0 ? 0 : i / steps;
    setPixel(canvas, width, Math.round(x1 + (x2 - x1) * t), Math.round(y1 + (y2 - y1) * t), color);
  }
}

function drawHair(canvas, width, x, y, direction, style, hair) {
  if (style === "bushy") {
    ellipse(canvas, width, x + 16, y + 8, 9, 6, hair);
    ellipse(canvas, width, x + 10, y + 10, 5, 5, hair);
    ellipse(canvas, width, x + 22, y + 10, 5, 5, hair);
    rect(canvas, width, x + 8, y + 8, 16, 4, hair);
  }

  if (style === "dreads") {
    rect(canvas, width, x + 8, y + 5, 16, 6, hair);
    for (const dx of [7, 10, 13, 18, 21, 24]) {
      line(canvas, width, x + dx, y + 9, x + dx - (dx % 2), y + 20, hair);
      rect(canvas, width, x + dx - 1, y + 18, 2, 4, hair);
    }
  }

  if (style === "spiky") {
    rect(canvas, width, x + 9, y + 7, 14, 5, hair);
    for (const [px, py] of [
      [9, 7],
      [13, 4],
      [17, 6],
      [21, 4],
      [24, 8],
    ]) {
      line(canvas, width, x + px, y + 11, x + px, y + py, hair);
      line(canvas, width, x + px + 1, y + 11, x + px, y + py, hair);
    }
  }

  if (style === "long") {
    ellipse(canvas, width, x + 16, y + 8, 8, 5, hair);
    rect(canvas, width, x + 7, y + 8, 5, 17, hair);
    rect(canvas, width, x + 20, y + 8, 5, 17, hair);
    rect(canvas, width, x + 10, y + 5, 12, 5, hair);
  }

  if (direction === "up") {
    rect(canvas, width, x + 8, y + 7, 16, 13, hair);
  }
}

function drawCharacterFrame(canvas, width, character, col, row) {
  const x = col * 32;
  const y = row * 32;
  const direction = ["down", "left", "right", "up"][row];
  const step = col === 1 ? -1 : col === 2 ? 1 : 0;

  const outline = rgba("#080816");
  const skin = rgba(character.skin);
  const hair = rgba(character.hair);
  const shirt = rgba(character.shirt);
  const pants = rgba(character.pants);
  const accent = rgba(character.accent);
  const highlight = rgba("#fff2cc");
  const shadow = rgba("#2b324a");
  const boot = rgba("#111827");
  const eye = rgba("#0b1020");

  const centerX = x + 16;

  rect(canvas, width, centerX - 6, y + 16, 12, 11, outline);
  rect(canvas, width, centerX - 5, y + 16, 10, 10, shirt);
  rect(canvas, width, centerX - 4, y + 17, 8, 1, highlight);
  rect(canvas, width, centerX - 4, y + 20, 8, 2, accent);
  rect(canvas, width, centerX - 5, y + 24, 10, 2, shadow);

  rect(canvas, width, centerX - 8, y + 17, 3, 8, outline);
  rect(canvas, width, centerX + 5, y + 17, 3, 8, outline);
  rect(canvas, width, centerX - 8, y + 18 + step, 3, 7, skin);
  rect(canvas, width, centerX + 5, y + 18 - step, 3, 7, skin);

  rect(canvas, width, centerX - 5, y + 26, 4, 4, pants);
  rect(canvas, width, centerX + 1, y + 26, 4, 4, pants);
  rect(canvas, width, centerX - 5, y + 29 + Math.max(step, 0), 4, 2, boot);
  rect(canvas, width, centerX + 1, y + 29 + Math.max(-step, 0), 4, 2, boot);

  ellipse(canvas, width, centerX, y + 11, 7, 7, outline);
  ellipse(canvas, width, centerX, y + 11, 6, 6, skin);
  drawHair(canvas, width, x, y, direction, character.hairStyle, hair);

  if (direction === "down") {
    rect(canvas, width, centerX - 4, y + 11, 2, 2, eye);
    rect(canvas, width, centerX + 3, y + 11, 2, 2, eye);
    rect(canvas, width, centerX - 2, y + 14, 4, 1, rgba("#8b4d35"));
  }

  if (direction === "left") {
    rect(canvas, width, centerX - 5, y + 11, 2, 2, eye);
    rect(canvas, width, centerX - 7, y + 15, 3, 2, skin);
  }

  if (direction === "right") {
    rect(canvas, width, centerX + 3, y + 11, 2, 2, eye);
    rect(canvas, width, centerX + 4, y + 15, 3, 2, skin);
  }
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function writePng(path, width, height, rgbaData) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0;
    Buffer.from(rgbaData.buffer, y * width * 4, width * 4).copy(raw, rowStart + 1);
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);

  writeFileSync(path, png);
}

mkdirSync(outDir, { recursive: true });

for (const character of characters) {
  const canvas = createCanvas(sheetWidth, sheetHeight);

  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      drawCharacterFrame(canvas, sheetWidth, character, col, row);
    }
  }

  writePng(join(outDir, character.file), sheetWidth, sheetHeight, canvas);
}

console.log(`Wrote ${characters.length} spritesheets to ${outDir}`);
