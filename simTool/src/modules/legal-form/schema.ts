import { z } from "zod";
import { TEMPLATE_SCHEMA_IDS } from "../../domain/templates";
import { templateEnvelopeSchema } from "../../validation/commonSchemas";

export const legalFormValueSchema = z.enum([
  "gbr",
  "gmbh",
  "ug",
  "verein",
  "eg",
  "kg",
  "other"
]);

export const liabilityModelSchema = z.enum([
  "limited",
  "unlimited",
  "mixed",
  "unknown"
]);

export const taxModelSchema = z.enum([
  "transparent",
  "corporate",
  "association",
  "unknown"
]);

export const votingModelSchema = z.enum([
  "ownershipShare",
  "equalPerOwner",
  "custom",
  "unknown"
]);

export const legalFormDataSchema = z
  .object({
    legalForm: legalFormValueSchema,
    liabilityModel: liabilityModelSchema,
    taxModel: taxModelSchema,
    votingModel: votingModelSchema.optional(),
    notes: z.string().optional()
  })
  .strict();

export const legalFormTemplateSchema = templateEnvelopeSchema(
  TEMPLATE_SCHEMA_IDS.legalForm,
  legalFormDataSchema
);
