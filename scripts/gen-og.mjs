#!/usr/bin/env node
// OG 이미지(public/og/home.png) + 아이콘(apple-touch-icon.png, logo.png) 생성
//   npm run og
import sharp from "sharp";
import { readFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const cfg = readFileSync(resolve(root, "src/site.config.ts"), "utf8");
const pick = (re, fb) => (cfg.match(re)?.[1] ?? fb);
const NAME = pick(/name:\s*"([^"]*)"/, "메가박스 상영시간표");
const URL = pick(/url:\s*"([^"]*)"/, "");
const HOST = URL.replace(/^https?:\/\//, "").replace(/\/+$/, "");
const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

const FONT = "'Malgun Gothic','Apple SD Gothic Neo',sans-serif";

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#3a1c71"/><stop offset="1" stop-color="#24124a"/>
  </linearGradient></defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <g transform="translate(90,110)">
    <rect x="0" y="0" width="88" height="88" rx="18" fill="#ffffff"/>
    <text x="44" y="70" text-anchor="middle" font-family="Arial,'Helvetica Neue',sans-serif" font-size="60" font-weight="800" fill="#3a1c71">M</text>
  </g>
  <text x="94" y="330" font-family="${FONT}" font-size="62" font-weight="800" fill="#ffffff" letter-spacing="-2">전국 메가박스 지점</text>
  <text x="94" y="410" font-family="${FONT}" font-size="62" font-weight="800" fill="#ffffff" letter-spacing="-2">상영시간표 안내</text>
  <text x="96" y="470" font-family="${FONT}" font-size="28" font-weight="500" fill="#d9ccf2">지점별 위치 · 주차 · 예매 · 관람료 한눈에</text>
  <text x="96" y="556" font-family="${FONT}" font-size="26" font-weight="700" fill="#c3aeec">${esc(HOST)}</text>
</svg>`;

const icon = readFileSync(resolve(root, "public/favicon.svg"));

mkdirSync(resolve(root, "public/og"), { recursive: true });
const a = await sharp(Buffer.from(og), { density: 150 }).png().toFile(resolve(root, "public/og/home.png"));
await sharp(icon, { density: 400 }).resize(180, 180).png().toFile(resolve(root, "public/apple-touch-icon.png"));
await sharp(icon, { density: 400 }).resize(512, 512).png().toFile(resolve(root, "public/logo.png"));
console.log(`  ✓ og/home.png (${a.width}x${a.height}) · apple-touch-icon.png · logo.png`);
