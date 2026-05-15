import { z } from "zod";
import { TEMPLATE_SCHEMA_IDS } from "../../domain/templates";
import {
  monthIndexSchema,
  nonNegativeNumberSchema,
  percentSchema,
  templateEnvelopeSchema
} from "../../validation/commonSchemas";

export const germanFederalStateSchema = z.enum([
  "BW",
  "BY",
  "BE",
  "BB",
  "HB",
  "HH",
  "HE",
  "MV",
  "NI",
  "NW",
  "RP",
  "SL",
  "SN",
  "ST",
  "SH",
  "TH"
]);

export const propertyDataSchema = z
  .object({
    purchasePrice: nonNegativeNumberSchema,
    federalState: germanFederalStateSchema.optional(),
    address: z.string().optional(),
    rentableAreaSqm: nonNegativeNumberSchema.optional(),
    units: z.number().int().positive().optional(),
    expectedMonthlyRent: nonNegativeNumberSchema.optional(),
    vacancyRatePct: percentSchema.optional(),
    purchaseMonth: monthIndexSchema.optional(),
    notes: z.string().optional()
  })
  .strict();

export const propertyTemplateSchema = templateEnvelopeSchema(
  TEMPLATE_SCHEMA_IDS.property,
  propertyDataSchema
);
