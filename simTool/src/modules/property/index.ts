import { TEMPLATE_FILE_SUFFIXES, TEMPLATE_SCHEMA_IDS } from "../../domain/templates";
import type { InputModule } from "../common";
import { defaultPropertyTemplate } from "./defaults";
import { migrateProperty } from "./migrations";
import { validateProperty } from "./validate";
import type { PropertyTemplate } from "./types";

export const propertyModule: InputModule<PropertyTemplate> = {
  kind: "property",
  label: "Immobilie",
  schemaId: TEMPLATE_SCHEMA_IDS.property,
  fileSuffix: TEMPLATE_FILE_SUFFIXES.property,
  defaultTemplate: defaultPropertyTemplate,
  migrate: migrateProperty,
  validate: validateProperty
};

export type { PropertyTemplate };
