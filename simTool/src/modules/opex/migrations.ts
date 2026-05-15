import { migrateVersionedEnvelope } from "../../validation/migrationRunner";
import { CURRENT_TEMPLATE_VERSION } from "../common";
import { opexTemplateSchema } from "./schema";
import type { OpexTemplate } from "./types";

export function migrateOpex(input: unknown): OpexTemplate {
  const migrated = migrateVersionedEnvelope(input, CURRENT_TEMPLATE_VERSION, {});
  return opexTemplateSchema.parse(migrated);
}
