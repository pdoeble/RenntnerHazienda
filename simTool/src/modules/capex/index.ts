import { TEMPLATE_FILE_SUFFIXES, TEMPLATE_SCHEMA_IDS } from "../../domain/templates";
import type { InputModule } from "../common";
import { defaultCapexTemplate } from "./defaults";
import { migrateCapex } from "./migrations";
import { validateCapex } from "./validate";
import type { CapexTemplate } from "./types";

export const capexModule: InputModule<CapexTemplate> = {
  kind: "capex",
  label: "Capex",
  schemaId: TEMPLATE_SCHEMA_IDS.capex,
  fileSuffix: TEMPLATE_FILE_SUFFIXES.capex,
  defaultTemplate: defaultCapexTemplate,
  migrate: migrateCapex,
  validate: validateCapex
};

export type { CapexTemplate };
