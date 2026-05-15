import { z } from "zod";
import { TEMPLATE_SCHEMA_IDS } from "../../domain/templates";
import {
  monthIndexSchema,
  nonEmptyStringSchema,
  nonNegativeNumberSchema,
  percentSchema,
  templateEnvelopeSchema
} from "../../validation/commonSchemas";

export const financingDataSchema = z
  .object({
    loanName: nonEmptyStringSchema,
    equitySharePct: percentSchema,
    annualInterestRatePct: nonNegativeNumberSchema.max(25),
    termYears: z.number().int().min(1).max(60),
    startMonth: monthIndexSchema,
    additionalMonthlyRepayment: nonNegativeNumberSchema
  })
  .strict();

export const financingTemplateSchema = templateEnvelopeSchema(
  TEMPLATE_SCHEMA_IDS.financing,
  financingDataSchema
);
