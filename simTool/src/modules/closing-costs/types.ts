import type { z } from "zod";
import type {
  closingCostItemSchema,
  closingCostsDataSchema,
  closingCostsTemplateSchema
} from "./schema";

export type ClosingCostItem = z.infer<typeof closingCostItemSchema>;
export type ClosingCostsData = z.infer<typeof closingCostsDataSchema>;
export type ClosingCostsTemplate = z.infer<
  typeof closingCostsTemplateSchema
>;
