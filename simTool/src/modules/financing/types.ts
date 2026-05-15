import type { z } from "zod";
import type { financingDataSchema, financingTemplateSchema } from "./schema";

export type FinancingData = z.infer<typeof financingDataSchema>;
export type FinancingTemplate = z.infer<typeof financingTemplateSchema>;
