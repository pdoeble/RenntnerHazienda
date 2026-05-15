import { TEMPLATE_FILE_SUFFIXES, TEMPLATE_SCHEMA_IDS } from "../../domain/templates";
import type { InputModule } from "../common";
import { defaultLegalFormTemplate } from "./defaults";
import { migrateLegalForm } from "./migrations";
import { validateLegalForm } from "./validate";
import type { LegalFormTemplate } from "./types";

export const legalFormModule: InputModule<LegalFormTemplate> = {
  kind: "legalForm",
  label: "Gesellschaftsform",
  schemaId: TEMPLATE_SCHEMA_IDS.legalForm,
  fileSuffix: TEMPLATE_FILE_SUFFIXES.legalForm,
  defaultTemplate: defaultLegalFormTemplate,
  migrate: migrateLegalForm,
  validate: validateLegalForm
};

export type { LegalFormTemplate };
