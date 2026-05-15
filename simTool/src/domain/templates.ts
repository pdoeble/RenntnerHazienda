export const TEMPLATE_SCHEMA_IDS = {
  ownership: "immo-finance.ownership",
  legalForm: "immo-finance.legal-form",
  capex: "immo-finance.capex",
  property: "immo-finance.property",
  closingCosts: "immo-finance.closing-costs",
  opex: "immo-finance.opex",
  financing: "immo-finance.financing",
  strategy: "immo-finance.strategy"
} as const;

export const TEMPLATE_FILE_SUFFIXES = {
  ownership: ".ownership.json",
  legalForm: ".legal-form.json",
  capex: ".capex.json",
  property: ".property.json",
  closingCosts: ".closing-costs.json",
  opex: ".opex.json",
  financing: ".financing.json",
  strategy: ".strategy.json"
} as const;

export const TEMPLATE_KINDS = [
  "ownership",
  "legalForm",
  "capex",
  "property",
  "closingCosts",
  "opex",
  "financing",
  "strategy"
] as const;

export type TemplateKind = (typeof TEMPLATE_KINDS)[number];

export const VISIBLE_INPUT_KINDS = [
  "ownership",
  "legalForm",
  "property",
  "financing",
  "strategy",
  "opex"
] as const satisfies readonly TemplateKind[];

export type TemplateSchemaId = (typeof TEMPLATE_SCHEMA_IDS)[TemplateKind];

export type TemplateEnvelope<TData> = {
  schema: string;
  version: number;
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  data: TData;
};

export type TemplateRef = {
  kind: TemplateKind;
  path?: string;
  name?: string;
  id?: string;
  storageMode?: "file" | "download" | "indexeddb" | "github" | "embedded";
};

export type SourceRef = {
  kind: TemplateKind;
  itemId?: string;
  field?: string;
};
