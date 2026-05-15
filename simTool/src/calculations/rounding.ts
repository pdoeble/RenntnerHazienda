export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function roundPct(value: number): number {
  return Math.round((value + Number.EPSILON) * 10000) / 10000;
}
