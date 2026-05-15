import type { z } from "zod";
import type {
  germanFederalStateSchema,
  propertyClosingCostItemSchema,
  propertyClosingCostsSchema,
  propertyDataSchema,
  propertyRenovationItemSchema,
  propertyTemplateSchema
} from "./schema";

export type GermanFederalState = z.infer<typeof germanFederalStateSchema>;
export type PropertyClosingCostItem = z.infer<
  typeof propertyClosingCostItemSchema
>;
export type PropertyClosingCosts = z.infer<typeof propertyClosingCostsSchema>;
export type PropertyRenovationItem = z.infer<
  typeof propertyRenovationItemSchema
>;
export type PropertyData = z.infer<typeof propertyDataSchema>;
export type PropertyTemplate = z.infer<typeof propertyTemplateSchema>;
