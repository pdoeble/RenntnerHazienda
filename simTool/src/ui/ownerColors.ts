export const OWNER_COLORS = [
  "#5b8f8a",
  "#7aa7c7",
  "#a58ac9",
  "#d3a06b",
  "#d7837f",
  "#77b7c5",
  "#9aae73",
  "#c884a8",
  "#7b8794",
  "#b79ad5",
  "#dda37a",
  "#7fb38b"
] as const;

export function ownerColor(index: number): string {
  return OWNER_COLORS[index % OWNER_COLORS.length]!;
}

export function ownerPastelColor(index: number): string {
  return `${ownerColor(index)}1f`;
}
