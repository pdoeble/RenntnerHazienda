import { z } from "zod";
import { TEMPLATE_SCHEMA_IDS } from "../../domain/templates";
import {
  idSchema,
  monthIndexSchema,
  nonEmptyStringSchema,
  nonNegativeNumberSchema,
  templateEnvelopeSchema
} from "../../validation/commonSchemas";

export const closingCostItemSchema = z
  .object({
    id: idSchema,
    label: nonEmptyStringSchema,
    amount: nonNegativeNumberSchema,
    timingMonth: monthIndexSchema.optional(),
    notes: z.string().optional()
  })
  .strict();

export const closingCostsDataSchema = z
  .object({
    realEstateTransferTaxPct: nonNegativeNumberSchema,
    notaryPct: nonNegativeNumberSchema,
    landRegistryPct: nonNegativeNumberSchema,
    brokerPct: nonNegativeNumberSchema,
    otherCosts: z.array(closingCostItemSchema)
  })
  .strict();

export const closingCostsTemplateSchema = templateEnvelopeSchema(
  TEMPLATE_SCHEMA_IDS.closingCosts,
  closingCostsDataSchema
);
