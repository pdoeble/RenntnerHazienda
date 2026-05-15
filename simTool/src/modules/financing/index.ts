import { TEMPLATE_FILE_SUFFIXES, TEMPLATE_SCHEMA_IDS } from "../../domain/templates";
import type { InputModule } from "../common";
import { defaultFinancingTemplate } from "./defaults";
import { migrateFinancing } from "./migrations";
import { validateFinancing } from "./validate";
import type { FinancingTemplate } from "./types";

export const financingModule: InputModule<FinancingTemplate> = {
  kind: "financing",
  label: "Finanzierung",
  schemaId: TEMPLATE_SCHEMA_IDS.financing,
  fileSuffix: TEMPLATE_FILE_SUFFIXES.financing,
  defaultTemplate: defaultFinancingTemplate,
  migrate: migrateFinancing,
  validate: validateFinancing
};

export type { FinancingTemplate };
