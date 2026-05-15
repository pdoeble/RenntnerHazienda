import { CURRENT_TEMPLATE_VERSION } from "../common";
import { migrateVersionedEnvelope } from "../../validation/migrationRunner";
import { ownershipTemplateSchema } from "./schema";
import type { OwnershipTemplate } from "./types";

export function migrateOwnership(input: unknown): OwnershipTemplate {
  const migrated = migrateVersionedEnvelope(input, CURRENT_TEMPLATE_VERSION, {});
  return ownershipTemplateSchema.parse(migrated);
}
