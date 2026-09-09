#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// _source/ 원본(메가박스 지점 목록 JSON · 지점별 완성 HTML)을
// 하나의 src/data/cinemas.json 으로 통합합니다.
//   - URL 슬러그: {지점명}-메가박스-상영시간표 (괄호·공백 제거)
//   - 본문(bodyHtml): _source/pages/{brchNo}_{지점명}.html 그대로
//   - 좌표(lat/lng) 보존 → 근처 지점 하버사인 거리 기반
//
//   node scripts/build-data.mjs   또는   npm run data
// ─────────────────────────────────────────────────────────────
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const SRC = resolve(root, "_source");

const theaters = JSON.parse(readFileSync(resolve(SRC, "megabox_theaters.json"), "utf8"));

const strip = (s) =>
  (s || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

// 지점명 → 슬러그 (괄호·공백 제거 + '-메가박스-상영시간표')
const norm = (name) =>
  name.replace(/[（）()]/g, "").replace(/\s+/g, "") + "-메가박스-상영시간표";

const usedSlug = new Set();
const cinemas = [];
const problems = [];

for (const t of theaters) {
  if (t.ok === false) {
    problems.push(`비운영 제외: ${t.brchNo} ${t.name}`);
    continue;
  }
  let slug = norm(t.name);
  if (usedSlug.has(slug)) {
    problems.push(`동명 슬러그 충돌 제외: ${t.brchNo} ${t.name} (${t.region})`);
    continue;
  }
  usedSlug.add(slug);

  const htmlName = `${t.brchNo}_${t.name}.html`;
  let bodyHtml = "";
  try {
    bodyHtml = readFileSync(resolve(SRC, "pages", htmlName), "utf8")
      .replace(/<!--[\s\S]*?-->/g, "") // 붙여넣기용 주석 제거
      .trim();
  } catch {
    // 본문 파일 없음(휴관 지점 등: 파일명이 `..(휴관).html`) → 제외
    problems.push(`본문 없어 제외(휴관 등): ${htmlName}`);
    usedSlug.delete(slug);
    continue;
  }

  const h1 = strip((bodyHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1]);
  const firstP = strip((bodyHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/i) || [])[1]);

  const screens = Number.parseInt(t.screens, 10);

  cinemas.push({
    id: t.brchNo,
    slug,
    url: `/${slug}/`,
    name: t.name,
    nameEn: "",
    region: t.region,
    address: t.address || "",
    lat: Number.parseFloat(t.lat) || null,
    lng: Number.parseFloat(t.lng) || null,
    screenCount: Number.isFinite(screens) ? screens : null,
    seatCount: null,
    specials: [],
    title: h1 || `메가박스 ${t.name} 상영시간표`,
    description: (
      firstP ||
      `메가박스 ${t.name} 상영시간표, 위치, 주차, 예매, 가격 정보를 한 번에 정리했습니다.`
    ).slice(0, 155),
    bodyHtml,
  });
}

// 지역 등장 순서 유지(원본 목록 순서)
const regionOrder = [...new Set(theaters.map((t) => t.region))];
cinemas.sort(
  (a, b) =>
    regionOrder.indexOf(a.region) - regionOrder.indexOf(b.region) ||
    a.name.localeCompare(b.name, "ko"),
);

mkdirSync(resolve(root, "src/data"), { recursive: true });
writeFileSync(
  resolve(root, "src/data/cinemas.json"),
  JSON.stringify(cinemas, null, 0),
  "utf8",
);

console.log(`  ✓ src/data/cinemas.json — ${cinemas.length}개 지점 / ${regionOrder.length}개 지역`);
if (problems.length) {
  console.log(`  ⚠ 참고 ${problems.length}건:`);
  for (const p of problems) console.log("     -", p);
}
