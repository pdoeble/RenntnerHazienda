import { TEMPLATE_FILE_SUFFIXES, TEMPLATE_SCHEMA_IDS } from "../../domain/templates";
import type { InputModule } from "../common";
import { defaultClosingCostsTemplate } from "./defaults";
import { migrateClosingCosts } from "./migrations";
import { validateClosingCosts } from "./validate";
import type { ClosingCostsTemplate } from "./types";

export const closingCostsModule: InputModule<ClosingCostsTemplate> = {
  kind: "closingCosts",
  label: "Nebenkosten",
  schemaId: TEMPLATE_SCHEMA_IDS.closingCosts,
  fileSuffix: TEMPLATE_FILE_SUFFIXES.closingCosts,
  defaultTemplate: defaultClosingCostsTemplate,
  migrate: migrateClosingCosts,
  validate: validateClosingCosts
};

export type { ClosingCostsTemplate };
