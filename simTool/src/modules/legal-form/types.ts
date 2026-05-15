import type { z } from "zod";
import type {
  legalFormDataSchema,
  legalFormTemplateSchema,
  legalFormValueSchema,
  liabilityModelSchema,
  taxModelSchema,
  votingModelSchema
} from "./schema";

export type LegalFormValue = z.infer<typeof legalFormValueSchema>;
export type LiabilityModel = z.infer<typeof liabilityModelSchema>;
export type TaxModel = z.infer<typeof taxModelSchema>;
export type VotingModel = z.infer<typeof votingModelSchema>;
export type LegalFormData = z.infer<typeof legalFormDataSchema>;
export type LegalFormTemplate = z.infer<typeof legalFormTemplateSchema>;
