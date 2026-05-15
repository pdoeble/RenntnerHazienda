import { migrateVersionedEnvelope } from "../../validation/migrationRunner";
import { CURRENT_TEMPLATE_VERSION } from "../common";
import { strategyTemplateSchema } from "./schema";
import type { StrategyTemplate } from "./types";

export function migrateStrategy(input: unknown): StrategyTemplate {
  const migrated = migrateVersionedEnvelope(input, CURRENT_TEMPLATE_VERSION, {});
  return strategyTemplateSchema.parse(migrated);
}
