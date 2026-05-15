import { TEMPLATE_FILE_SUFFIXES, TEMPLATE_SCHEMA_IDS } from "../../domain/templates";
import type { InputModule } from "../common";
import { defaultStrategyTemplate } from "./defaults";
import { migrateStrategy } from "./migrations";
import { validateStrategy } from "./validate";
import type { StrategyTemplate } from "./types";

export const strategyModule: InputModule<StrategyTemplate> = {
  kind: "strategy",
  label: "Strategie",
  schemaId: TEMPLATE_SCHEMA_IDS.strategy,
  fileSuffix: TEMPLATE_FILE_SUFFIXES.strategy,
  defaultTemplate: defaultStrategyTemplate,
  migrate: migrateStrategy,
  validate: validateStrategy
};

export type { StrategyTemplate };
