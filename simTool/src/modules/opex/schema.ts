import { z } from "zod";
import { TEMPLATE_SCHEMA_IDS } from "../../domain/templates";
import {
  idSchema,
  nonEmptyStringSchema,
  nonNegativeNumberSchema,
  templateEnvelopeSchema
} from "../../validation/commonSchemas";

export const opexPeriodSchema = z.enum(["monthly", "quarterly", "yearly"]);

export const opexAnnualCostModeSchema = z.enum([
  "fixed",
  "rentableArea",
  "plotArea",
  "propertyValue"
]);

export const opexCategorySchema = z.enum([
  "insurance",
  "maintenance",
  "administration",
  "utilities",
  "propertyManagement",
  "accounting",
  "taxAdvisory",
  "reserve",
  "other"
]);

export const opexItemSchema = z
  .object({
    id: idSchema,
    label: nonEmptyStringSchema,
    amount: nonNegativeNumberSchema,
    period: opexPeriodSchema,
    annualCostMode: opexAnnualCostModeSchema.default("fixed"),
    annualAmount: nonNegativeNumberSchema.optional(),
    inflationPct: z.number().finite().optional(),
    recoverableFromTenants: z.boolean().optional(),
    category: opexCategorySchema.optional(),
    notes: z.string().optional()
  })
  .strict();

export const opexDataSchema = z
  .object({
    recurringItems: z.array(opexItemSchema)
  })
  .strict();

export const opexTemplateSchema = templateEnvelopeSchema(
  TEMPLATE_SCHEMA_IDS.opex,
  opexDataSchema
);
