import { z } from "zod";
import { TEMPLATE_SCHEMA_IDS } from "../../domain/templates";
import {
  idSchema,
  monthIndexSchema,
  nonEmptyStringSchema,
  nonNegativeNumberSchema,
  templateEnvelopeSchema
} from "../../validation/commonSchemas";

export const capexCategorySchema = z.enum([
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

export const capexFinancingSchema = z.enum([
  "equity",
  "loan",
  "grant",
  "mixed"
]);

export const capexItemSchema = z
  .object({
    id: idSchema,
    label: nonEmptyStringSchema,
    category: capexCategorySchema,
    amount: nonNegativeNumberSchema,
    timingMonth: monthIndexSchema,
    financing: capexFinancingSchema,
    notes: z.string().optional()
  })
  .strict();

export const capexDataSchema = z
  .object({
    items: z.array(capexItemSchema)
  })
  .strict();

export const capexTemplateSchema = templateEnvelopeSchema(
  TEMPLATE_SCHEMA_IDS.capex,
  capexDataSchema
);
