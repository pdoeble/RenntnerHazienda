import { defaultCapexTemplate } from "../modules/capex/defaults";
import type { CapexTemplate } from "../modules/capex/types";
import { defaultClosingCostsTemplate } from "../modules/closing-costs/defaults";
import type { ClosingCostsTemplate } from "../modules/closing-costs/types";
import { defaultLegalFormTemplate } from "../modules/legal-form/defaults";
import type { LegalFormTemplate } from "../modules/legal-form/types";
import { defaultOpexTemplate } from "../modules/opex/defaults";
import type { OpexTemplate } from "../modules/opex/types";
import { defaultOwnershipTemplate } from "../modules/ownership/defaults";
import type { OwnershipTemplate } from "../modules/ownership/types";
import { defaultPropertyTemplate } from "../modules/property/defaults";
import type { PropertyTemplate } from "../modules/property/types";

export type ProjectState = {
  ownership: OwnershipTemplate;
  legalForm: LegalFormTemplate;
  capex: CapexTemplate;
  property: PropertyTemplate;
  closingCosts: ClosingCostsTemplate;
  opex: OpexTemplate;
};

export const defaultProjectState: ProjectState = {
  ownership: defaultOwnershipTemplate,
  legalForm: defaultLegalFormTemplate,
  capex: defaultCapexTemplate,
  property: defaultPropertyTemplate,
  closingCosts: defaultClosingCostsTemplate,
  opex: defaultOpexTemplate
};

export type DirtyState = Record<keyof ProjectState | "project", boolean>;

export const initialDirtyState: DirtyState = {
  ownership: false,
  legalForm: false,
  capex: false,
  property: false,
  closingCosts: false,
  opex: false,
  project: false
};
