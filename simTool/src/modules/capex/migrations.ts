import { migrateVersionedEnvelope } from "../../validation/migrationRunner";
import { CURRENT_TEMPLATE_VERSION } from "../common";
import { capexTemplateSchema } from "./schema";
import type { CapexTemplate } from "./types";

export function migrateCapex(input: unknown): CapexTemplate {
  const migrated = migrateVersionedEnvelope(input, CURRENT_TEMPLATE_VERSION, {});
  return capexTemplateSchema.parse(migrated);
}
