import { z } from "zod";

export const idSchema = z.string().trim().min(1);
export const nonEmptyStringSchema = z.string().trim().min(1);
export const nonNegativeNumberSchema = z.number().finite().min(0);
export const percentSchema = z.number().finite().min(0).max(100);
export const monthIndexSchema = z.number().int().min(0);

export function templateEnvelopeSchema<TData extends z.ZodType>(
  schemaId: string,
  dataSchema: TData
) {
  return z
    .object({
      schema: z.literal(schemaId),
      version: z.literal(1),
      id: idSchema,
      name: nonEmptyStringSchema,
      description: z.string().optional(),
      createdAt: z.string().optional(),
      updatedAt: z.string().optional(),
      data: dataSchema
    })
    .strict();
}

export function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function isApproximately(
  actual: number,
  expected: number,
  tolerance = 0.0001
): boolean {
  return Math.abs(actual - expected) <= tolerance;
}

export function findDuplicateIds(
  items: readonly { id: string }[]
): readonly string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const item of items) {
    if (seen.has(item.id)) {
      duplicates.add(item.id);
    }
    seen.add(item.id);
  }

  return [...duplicates];
}
