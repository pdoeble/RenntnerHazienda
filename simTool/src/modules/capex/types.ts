import type { z } from "zod";
import type {
  capexCategorySchema,
  capexDataSchema,
  capexFinancingSchema,
  capexItemSchema,
  capexTemplateSchema
} from "./schema";

export type CapexCategory = z.infer<typeof capexCategorySchema>;
export type CapexFinancing = z.infer<typeof capexFinancingSchema>;
export type CapexItem = z.infer<typeof capexItemSchema>;
export type CapexData = z.infer<typeof capexDataSchema>;
export type CapexTemplate = z.infer<typeof capexTemplateSchema>;
