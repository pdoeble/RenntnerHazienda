import { z } from "zod";
import { TEMPLATE_SCHEMA_IDS } from "../../domain/templates";
import { templateEnvelopeSchema } from "../../validation/commonSchemas";

export const legalFormValueSchema = z.enum([
  "coOwnership",
  "gbr",
  "gmbh",
  "flexCo",
  "gmbhCoKg",
  "ug",
  "verein",
  "eg",
  "genossenschaft",
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

export const legalCostStatusSchema = z.enum([
  "sourceBacked",
  "planningEstimate",
  "missing"
]);

export const legalFormSourceSchema = z
  .object({
    label: z.string(),
    url: z.string(),
    publisher: z.string().optional(),
    retrievedAt: z.string().optional(),
    scope: z.string().optional()
  })
  .strict();

export const legalFormDataSchema = z
  .object({
    legalForm: legalFormValueSchema,
    liabilityModel: liabilityModelSchema,
    taxModel: taxModelSchema,
    votingModel: votingModelSchema.optional(),
    foundingCostAmount: z.number().finite().min(0).default(0),
    annualAccountingCostAmount: z.number().finite().min(0).default(0),
    annualAdministrationCostAmount: z.number().finite().min(0).default(0),
    annualComplianceCostAmount: z.number().finite().min(0).default(0),
    costStatus: legalCostStatusSchema.default("missing"),
    sourceRefs: z.array(legalFormSourceSchema).default([]),
    notes: z.string().optional()
  })
  .strict();

export const legalFormTemplateSchema = templateEnvelopeSchema(
  TEMPLATE_SCHEMA_IDS.legalForm,
  legalFormDataSchema
);
