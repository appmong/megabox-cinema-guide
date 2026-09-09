# megabox-cinema-guide

전국 메가박스 지점 안내(비공식) — Astro 정적 사이트.

지점별 위치·오시는 길·주차·예매·관람료·FAQ를 정리하고, 실시간 상영시간표·예매는 메가박스 공식 홈페이지로 링크아웃합니다.

## 개발

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # data 생성 + 정적 빌드 → dist/
```

## 구조

- `_source/` — 원본 데이터(`megabox_theaters.json` 지점 목록 · `pages/*.html` 지점별 완성 본문)
- `scripts/build-data.mjs` — 원본을 `src/data/cinemas.json`(115지점)으로 통합. `npm run data`
- `scripts/gen-og.mjs` — OG 이미지·아이콘 생성. `npm run og`
- `src/pages/[slug].astro` — 지점 상세. 슬러그 체계 `/{지점명}-메가박스-상영시간표/`
- `src/pages/지역/` — 지역별 목록. 지역명 슬래시(대전/충청/세종 등)는 URL에서 `regionSlug`로 `-` 치환
- `src/lib/cinemas.ts` — 좌표 보유 → 근처 지점 하버사인(실거리) 기반
- `src/site.config.ts` — 브랜드·인증·애드센스·공식 링크·면책 문구

## 배포

Cloudflare Pages: 빌드 `npm run build`, 출력 `dist`, `NODE_VERSION=22`. 도메인 `megabox.anywhereifyoucan.com`(승인 도메인 서브도메인) CNAME 연결.

---

본 사이트는 메가박스(주식회사 메가박스중앙) 및 공식 서비스와 무관한 비공식 정보 안내 사이트입니다.
