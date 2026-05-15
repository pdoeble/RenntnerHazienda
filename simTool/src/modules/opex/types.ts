import type { z } from "zod";
import type {
  opexCategorySchema,
  opexDataSchema,
  opexItemSchema,
  opexPeriodSchema,
  opexTemplateSchema
} from "./schema";

export type OpexPeriod = z.infer<typeof opexPeriodSchema>;
export type OpexCategory = z.infer<typeof opexCategorySchema>;
export type OpexItem = z.infer<typeof opexItemSchema>;
export type OpexData = z.infer<typeof opexDataSchema>;
export type OpexTemplate = z.infer<typeof opexTemplateSchema>;
