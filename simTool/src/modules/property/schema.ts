import { z } from "zod";
import { TEMPLATE_SCHEMA_IDS } from "../../domain/templates";
import {
  idSchema,
  monthIndexSchema,
  nonEmptyStringSchema,
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

export const propertyClosingCostItemSchema = z
  .object({
    id: idSchema,
    label: nonEmptyStringSchema,
    amount: nonNegativeNumberSchema,
    timingMonth: monthIndexSchema.optional(),
    notes: z.string().optional()
  })
  .strict();

export const propertyClosingCostsSchema = z
  .object({
    realEstateTransferTaxPct: nonNegativeNumberSchema.default(0),
    notaryPct: nonNegativeNumberSchema.default(0),
    landRegistryPct: nonNegativeNumberSchema.default(0),
    brokerPct: nonNegativeNumberSchema.default(0),
    otherCosts: z.array(propertyClosingCostItemSchema).default([])
  })
  .strict()
  .default({
    realEstateTransferTaxPct: 0,
    notaryPct: 0,
    landRegistryPct: 0,
    brokerPct: 0,
    otherCosts: []
  });

export const propertyRenovationCategorySchema = z.enum([
  "renovation",
  "modernization",
  "energy",
  "furniture",
  "planning",
  "permits",
  "contingency",
  "technicalEquipment",
  "other"
]);

export const propertyRenovationItemSchema = z
  .object({
    id: idSchema,
    label: nonEmptyStringSchema,
    category: propertyRenovationCategorySchema.default("renovation"),
    amount: nonNegativeNumberSchema,
    timingMonth: monthIndexSchema,
    notes: z.string().optional()
  })
  .strict();

export const propertyDataSchema = z
  .object({
    purchasePrice: nonNegativeNumberSchema,
    federalState: germanFederalStateSchema.optional(),
    address: z.string().optional(),
    rentableAreaSqm: nonNegativeNumberSchema.optional(),
    plotAreaSqm: nonNegativeNumberSchema.optional(),
    units: z.number().int().positive().optional(),
    expectedMonthlyRent: nonNegativeNumberSchema.optional(),
    vacancyRatePct: percentSchema.optional(),
    purchaseMonth: monthIndexSchema.optional(),
    reserveMonths: nonNegativeNumberSchema.default(3),
    closingCosts: propertyClosingCostsSchema,
    renovationItems: z.array(propertyRenovationItemSchema).default([]),
    notes: z.string().optional()
  })
  .strict();

export const propertyTemplateSchema = templateEnvelopeSchema(
  TEMPLATE_SCHEMA_IDS.property,
  propertyDataSchema
);
