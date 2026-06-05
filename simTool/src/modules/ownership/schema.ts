import { z } from "zod";
import { TEMPLATE_SCHEMA_IDS } from "../../domain/templates";
import {
  idSchema,
  nonEmptyStringSchema,
  nonNegativeNumberSchema,
  percentSchema,
  templateEnvelopeSchema
} from "../../validation/commonSchemas";

export const ownerTypeSchema = z.enum([
  "person",
  "company",
  "association",
  "other"
]);

export const ownerSchema = z
  .object({
    id: idSchema,
    displayName: nonEmptyStringSchema,
    type: ownerTypeSchema,
    participationTier: nonNegativeNumberSchema.default(0),
    equityContribution: nonNegativeNumberSchema.default(0),
    startEquityContribution: nonNegativeNumberSchema.default(0),
    monthlyCapitalContribution: nonNegativeNumberSchema.default(0),
    monthlyUsageContribution: nonNegativeNumberSchema.default(0),
    monthlyNetIncomeAmount: nonNegativeNumberSchema.default(0),
    usagePointBudget: nonNegativeNumberSchema.default(0),
    ownershipSharePct: percentSchema,
    companySharePct: percentSchema.optional(),
    capitalValueAtLoanEnd: nonNegativeNumberSchema.optional(),
    votingSharePct: percentSchema.optional(),
    liabilitySharePct: percentSchema.optional(),
    homeLocationId: z.string().optional(),
    notes: z.string().optional()
  })
  .strict();

export const contributionBasisSchema = z.enum([
  "ownershipShare",
  "equalSplit",
  "custom"
]);

export const contributionRuleSchema = z
  .object({
    id: idSchema,
    name: nonEmptyStringSchema,
    basis: contributionBasisSchema,
    customShares: z
      .record(idSchema, z.number().finite().min(0).max(100))
      .optional()
  })
  .strict()
  .superRefine((rule, context) => {
    if (rule.basis === "custom" && !rule.customShares) {
      context.addIssue({
        code: "custom",
        path: ["customShares"],
        message: "Custom contribution rules require customShares."
      });
    }
  });

export const ownershipDataSchema = z
  .object({
    owners: z.array(ownerSchema).min(1),
    contributionRules: z.array(contributionRuleSchema)
  })
  .strict();

export const ownershipTemplateSchema = templateEnvelopeSchema(
  TEMPLATE_SCHEMA_IDS.ownership,
  ownershipDataSchema
);
