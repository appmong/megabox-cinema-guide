import cinemasData from "../data/cinemas.json";

export interface Cinema {
  id: string;
  slug: string;
  url: string;
  name: string;
  nameEn: string;
  region: string;
  address: string;
  lat: number | null;
  lng: number | null;
  screenCount: number | null;
  seatCount: number | null;
  specials: string[];
  title: string;
  description: string;
  bodyHtml: string;
}

export const CINEMAS = cinemasData as Cinema[];

/** 인덱스 등장 순서를 유지한 지역 목록 */
export const REGIONS: string[] = [...new Set(CINEMAS.map((c) => c.region))];

/** 지역 표시명 → URL 슬러그 (슬래시 포함 지역명 대응: "대전/충청" → "대전-충청") */
export function regionSlug(region: string): string {
  return region.replace(/\//g, "-");
}

/** URL 슬러그 → 지역 표시명 (역매핑) */
export function regionFromSlug(slug: string): string | undefined {
  return REGIONS.find((r) => regionSlug(r) === slug);
}

/** 지역 → 지점 배열 */
export function byRegion(): { region: string; cinemas: Cinema[] }[] {
  return REGIONS.map((region) => ({
    region,
    cinemas: CINEMAS.filter((c) => c.region === region),
  }));
}

export function getCinema(slug: string): Cinema | undefined {
  return CINEMAS.find((c) => c.slug === slug);
}

/** 하버사인 거리(km) */
function distanceKm(a: Cinema, b: Cinema): number {
  if (a.lat == null || a.lng == null || b.lat == null || b.lng == null) return Infinity;
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** 가까운 지점 N개 — 좌표가 있으면 거리순, 없으면 같은 지역 지점으로 폴백 */
export function nearby(target: Cinema, n = 6): Cinema[] {
  const others = CINEMAS.filter((c) => c.id !== target.id);
  if (target.lat != null && target.lng != null) {
    return others
      .map((c) => ({ c, d: distanceKm(target, c) }))
      .filter((x) => x.d !== Infinity)
      .sort((x, y) => x.d - y.d)
      .slice(0, n)
      .map((x) => x.c);
  }
  // 좌표 없음: 같은 지역 지점으로 폴백
  const sameRegion = others.filter((c) => c.region === target.region);
  return sameRegion.slice(0, n);
}
