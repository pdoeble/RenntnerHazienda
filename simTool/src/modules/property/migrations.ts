import { migrateVersionedEnvelope } from "../../validation/migrationRunner";
import { CURRENT_TEMPLATE_VERSION } from "../common";
import { propertyTemplateSchema } from "./schema";
import type { PropertyTemplate } from "./types";

export function migrateProperty(input: unknown): PropertyTemplate {
  const migrated = migrateVersionedEnvelope(input, CURRENT_TEMPLATE_VERSION, {});
  return propertyTemplateSchema.parse(migrated);
}
