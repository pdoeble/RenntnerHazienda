import type { z } from "zod";
import type {
  contributionPolicySchema,
  goNoGoCheckSchema,
  goNoGoStatusSchema,
  strategyDataSchema,
  strategyTemplateSchema
} from "./schema";

export type ContributionPolicy = z.infer<typeof contributionPolicySchema>;
export type GoNoGoStatus = z.infer<typeof goNoGoStatusSchema>;
export type GoNoGoCheck = z.infer<typeof goNoGoCheckSchema>;
export type StrategyData = z.infer<typeof strategyDataSchema>;
export type StrategyTemplate = z.infer<typeof strategyTemplateSchema>;
