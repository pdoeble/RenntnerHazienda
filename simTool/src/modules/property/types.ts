import type { z } from "zod";
import type {
  austrianFederalStateSchema,
  candidateHouseSchema,
  mapDataQualitySchema,
  mapEnrichmentSchema,
  propertyClosingCostItemSchema,
  propertyClosingCostsSchema,
  propertyDataSchema,
  skiAreaSchema,
  propertyRenovationItemSchema,
  travelTimeSchema,
  propertyUseTypeSchema,
  propertyTemplateSchema
} from "./schema";

export type AustrianFederalState = z.infer<typeof austrianFederalStateSchema>;
export type MapDataQuality = z.infer<typeof mapDataQualitySchema>;
export type TravelTime = z.infer<typeof travelTimeSchema>;
export type SkiArea = z.infer<typeof skiAreaSchema>;
export type CandidateHouse = z.infer<typeof candidateHouseSchema>;
export type MapEnrichment = z.infer<typeof mapEnrichmentSchema>;
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
