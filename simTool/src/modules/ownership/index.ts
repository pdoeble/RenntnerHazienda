import { TEMPLATE_FILE_SUFFIXES, TEMPLATE_SCHEMA_IDS } from "../../domain/templates";
import type { InputModule } from "../common";
import { defaultOwnershipTemplate } from "./defaults";
import { migrateOwnership } from "./migrations";
import { validateOwnership } from "./validate";
import type { OwnershipTemplate } from "./types";

export const ownershipModule: InputModule<OwnershipTemplate> = {
  kind: "ownership",
  label: "Eignerschaft",
  schemaId: TEMPLATE_SCHEMA_IDS.ownership,
  fileSuffix: TEMPLATE_FILE_SUFFIXES.ownership,
  defaultTemplate: defaultOwnershipTemplate,
  migrate: migrateOwnership,
  validate: validateOwnership
};

export type { OwnershipTemplate };
