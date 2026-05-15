import { TEMPLATE_FILE_SUFFIXES, TEMPLATE_SCHEMA_IDS } from "../../domain/templates";
import type { InputModule } from "../common";
import { defaultOpexTemplate } from "./defaults";
import { migrateOpex } from "./migrations";
import { validateOpex } from "./validate";
import type { OpexTemplate } from "./types";

export const opexModule: InputModule<OpexTemplate> = {
  kind: "opex",
  label: "Opex",
  schemaId: TEMPLATE_SCHEMA_IDS.opex,
  fileSuffix: TEMPLATE_FILE_SUFFIXES.opex,
  defaultTemplate: defaultOpexTemplate,
  migrate: migrateOpex,
  validate: validateOpex
};

export type { OpexTemplate };
