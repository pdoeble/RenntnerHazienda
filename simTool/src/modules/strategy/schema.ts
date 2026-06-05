import { z } from "zod";
import { TEMPLATE_SCHEMA_IDS } from "../../domain/templates";
import {
  idSchema,
  nonEmptyStringSchema,
  nonNegativeNumberSchema,
  percentSchema,
  templateEnvelopeSchema
} from "../../validation/commonSchemas";

export const contributionPolicySchema = z.enum([
  "minimumObligationPlusReserveTopUp"
]);

export const pointShareModeSchema = z.enum([
  "usage",
  "blended",
  "tier",
  "equity"
]);

export const capitalShareModeSchema = z.enum([
  "scheduledPrincipal",
  "manualMonthly"
]);

export const goNoGoStatusSchema = z.enum([
  "open",
  "clarified",
  "notApplicable",
  "critical"
]);

export const goNoGoCheckSchema = z
  .object({
    id: idSchema,
    label: nonEmptyStringSchema,
    status: goNoGoStatusSchema,
    notes: z.string().optional()
  })
  .strict();

export const strategyDataSchema = z
  .object({
    reserveMonths: nonNegativeNumberSchema.default(3),
    minimumLiquidityAmount: nonNegativeNumberSchema.default(15000),
    targetLiquidityAmount: nonNegativeNumberSchema.default(30000),
    contributionPolicy: contributionPolicySchema.default(
      "minimumObligationPlusReserveTopUp"
    ),
    rentOffsetsOwnerContributions: z.boolean().default(false),
    targetEquityRatioPct: percentSchema.default(20),
    pointShareMode: pointShareModeSchema.default("usage"),
    pointTierWeight: percentSchema.default(50),
    pointEquityWeight: percentSchema.default(50),
    capitalShareMode: capitalShareModeSchema.default("scheduledPrincipal"),
    capitalValuationInterestPct: z.number().finite().default(2),
    appreciationPercentPerYear: z.number().finite().default(2),
    ownerWeekendUsagePct: percentSchema.default(80),
    guestWeekendUsagePct: percentSchema.default(50),
    goNoGoChecks: z.array(goNoGoCheckSchema).default([])
  })
  .strict();

export const strategyTemplateSchema = templateEnvelopeSchema(
  TEMPLATE_SCHEMA_IDS.strategy,
  strategyDataSchema
);
