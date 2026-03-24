// tiny seeded PRNG so scenes are reproducible per seed
function mulberry32(a: number) {
  return function () {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

let rng = Math.random;

export function reseed(seed: number): void { rng = mulberry32(seed); }
export const rand = (a: number, b: number): number => a + rng() * (b - a);
export const irand = (a: number, b: number): number => Math.floor(rand(a, b + 1));
export const pick = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];
export const coin = (p = 0.5): boolean => rng() < p;
