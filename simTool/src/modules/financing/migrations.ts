import { migrateVersionedEnvelope } from "../../validation/migrationRunner";
import { CURRENT_TEMPLATE_VERSION } from "../common";
import { financingTemplateSchema } from "./schema";
import type { FinancingTemplate } from "./types";

export function migrateFinancing(input: unknown): FinancingTemplate {
  const migrated = migrateVersionedEnvelope(input, CURRENT_TEMPLATE_VERSION, {});
  return financingTemplateSchema.parse(migrated);
}
