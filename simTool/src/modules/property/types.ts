import type { z } from "zod";
import type {
  germanFederalStateSchema,
  propertyDataSchema,
  propertyTemplateSchema
} from "./schema";

export type GermanFederalState = z.infer<typeof germanFederalStateSchema>;
export type PropertyData = z.infer<typeof propertyDataSchema>;
export type PropertyTemplate = z.infer<typeof propertyTemplateSchema>;
