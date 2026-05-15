import { migrateVersionedEnvelope } from "../../validation/migrationRunner";
import { CURRENT_TEMPLATE_VERSION } from "../common";
import { legalFormTemplateSchema } from "./schema";
import type { LegalFormTemplate } from "./types";

export function migrateLegalForm(input: unknown): LegalFormTemplate {
  const migrated = migrateVersionedEnvelope(input, CURRENT_TEMPLATE_VERSION, {});
  return legalFormTemplateSchema.parse(migrated);
}
