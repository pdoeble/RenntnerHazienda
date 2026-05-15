import type { z } from "zod";
import type {
  contributionBasisSchema,
  contributionRuleSchema,
  ownerSchema,
  ownershipDataSchema,
  ownershipTemplateSchema
} from "./schema";

export type Owner = z.infer<typeof ownerSchema>;
export type ContributionBasis = z.infer<typeof contributionBasisSchema>;
export type ContributionRule = z.infer<typeof contributionRuleSchema>;
export type OwnershipData = z.infer<typeof ownershipDataSchema>;
export type OwnershipTemplate = z.infer<typeof ownershipTemplateSchema>;
