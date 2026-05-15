export function clampItems<T>(items: readonly T[], count: number): T[] {
  return items.slice(0, count);
}
