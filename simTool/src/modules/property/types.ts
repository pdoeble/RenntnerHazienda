import type { z } from "zod";
import type {
  austrianFederalStateSchema,
  propertyClosingCostItemSchema,
  propertyClosingCostsSchema,
  propertyDataSchema,
  propertyRenovationItemSchema,
  propertyUseTypeSchema,
  propertyTemplateSchema
} from "./schema";

export type AustrianFederalState = z.infer<typeof austrianFederalStateSchema>;
export type PropertyUseType = z.infer<typeof propertyUseTypeSchema>;
export type PropertyClosingCostItem = z.infer<
  typeof propertyClosingCostItemSchema
>;
export type PropertyClosingCosts = z.infer<typeof propertyClosingCostsSchema>;
export type PropertyRenovationItem = z.infer<
  typeof propertyRenovationItemSchema
>;
export type PropertyData = z.infer<typeof propertyDataSchema>;
export type PropertyTemplate = z.infer<typeof propertyTemplateSchema>;
