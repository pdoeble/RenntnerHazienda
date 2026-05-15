import { migrateVersionedEnvelope } from "../../validation/migrationRunner";
import { CURRENT_TEMPLATE_VERSION } from "../common";
import { closingCostsTemplateSchema } from "./schema";
import type { ClosingCostsTemplate } from "./types";

export function migrateClosingCosts(input: unknown): ClosingCostsTemplate {
  const migrated = migrateVersionedEnvelope(input, CURRENT_TEMPLATE_VERSION, {});
  return closingCostsTemplateSchema.parse(migrated);
}
