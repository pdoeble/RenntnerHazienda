# Data Model and Templates

## Purpose

This document defines the persisted data model.

The app uses small reusable template files for each input domain and a project manifest that combines them.

The design must support:

- independent saving of input tabs
- reusable assumptions
- validation
- migration
- project reconstruction
- portable export
- future storage adapters

## Core Principle

Persisted data must be explicit, versioned, and validated.

Every persisted file must include:

- `schema`
- `version`
- `id`
- `name`
- `data`

No imported file may enter the application state without validation.

## File Types

Use JSON files.

### Required template file types

```text
.ownership.json
.legal-form.json
.capex.json
.property.json
.closing-costs.json
.opex.json
```

### Required project file type

```text
.immo-project.json
```

### Optional portable export file type

```text
.immo-project.zip
```

## Common Template Envelope

Every input template uses the same outer structure.

```ts
type TemplateEnvelope<TData> = {
  schema: string;
  version: number;
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  data: TData;
};
```

Example:

```json
{
  "schema": "immo-finance.ownership",
  "version": 1,
  "id": "ownership-standard-001",
  "name": "Standard Eignerschaft",
  "description": "Example ownership structure",
  "createdAt": "2026-05-15T10:00:00.000Z",
  "updatedAt": "2026-05-15T10:00:00.000Z",
  "data": {}
}
```

## Schema Identifiers

Use these schema identifiers:

| Domain | Schema |
|---|---|
| Eignerschaft | `immo-finance.ownership` |
| Gesellschaftsform | `immo-finance.legal-form` |
| Capex | `immo-finance.capex` |
| Immobilie | `immo-finance.property` |
| Nebenkosten | `immo-finance.closing-costs` |
| Opex | `immo-finance.opex` |
| Project | `immo-finance.project` |

Schema identifiers are stable public contracts.

Do not rename them casually.

## Template Kinds

Use this internal enum or equivalent union type:

```ts
type TemplateKind =
  | "ownership"
  | "legalForm"
  | "capex"
  | "property"
  | "closingCosts"
  | "opex";
```

Use German labels in the UI and English identifiers in code.

## File Naming

Use readable kebab-case filenames.

Examples:

```text
standard-owners.ownership.json
gbr-basic.legal-form.json
renovation-base.capex.json
property-house-a.property.json
bw-standard.closing-costs.json
opex-standard.opex.json
project-house-a.immo-project.json
```

The filename is not the source of truth.

The file content is authoritative.

## Project Manifest

The project file combines input templates.

It references template files and may include hashes and embedded snapshots.

```ts
type ProjectManifest = {
  schema: "immo-finance.project";
  version: number;
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;

  templateRefs: {
    ownership: TemplateRef;
    legalForm: TemplateRef;
    capex: TemplateRef;
    property: TemplateRef;
    closingCosts: TemplateRef;
    opex: TemplateRef;
  };

  templateHashes?: Partial<Record<TemplateKind, string>>;
  embeddedSnapshots?: Partial<ProjectTemplateSnapshot>;
  metadata?: ProjectMetadata;
};
```

Example:

```json
{
  "schema": "immo-finance.project",
  "version": 1,
  "id": "project-house-a",
  "name": "Projekt Haus A",
  "description": "Example project manifest",
  "createdAt": "2026-05-15T10:00:00.000Z",
  "updatedAt": "2026-05-15T10:00:00.000Z",
  "templateRefs": {
    "ownership": {
      "kind": "ownership",
      "path": "../templates/ownership/standard-owners.ownership.json"
    },
    "legalForm": {
      "kind": "legalForm",
      "path": "../templates/legal-form/gbr-basic.legal-form.json"
    },
    "capex": {
      "kind": "capex",
      "path": "../templates/capex/renovation-base.capex.json"
    },
    "property": {
      "kind": "property",
      "path": "../templates/property/property-house-a.property.json"
    },
    "closingCosts": {
      "kind": "closingCosts",
      "path": "../templates/closing-costs/bw-standard.closing-costs.json"
    },
    "opex": {
      "kind": "opex",
      "path": "../templates/opex/opex-standard.opex.json"
    }
  },
  "templateHashes": {
    "ownership": "sha256-placeholder",
    "legalForm": "sha256-placeholder",
    "capex": "sha256-placeholder",
    "property": "sha256-placeholder",
    "closingCosts": "sha256-placeholder",
    "opex": "sha256-placeholder"
  }
}
```

## Template References

A template reference identifies where a template can be loaded from.

```ts
type TemplateRef = {
  kind: TemplateKind;
  path?: string;
  name?: string;
  id?: string;
  storageMode?: "file" | "download" | "indexeddb" | "github" | "embedded";
};
```

For MVP, `path` and `kind` are sufficient for file-based workflows.

Do not assume that paths are always resolvable.

Browsers do not have unrestricted filesystem access.

## Hashes

The project manifest should store hashes of referenced templates where possible.

Purpose:

- detect changed templates
- warn about stale project assumptions
- detect mismatches during load
- improve traceability

Use SHA-256.

Example:

```ts
type TemplateHashes = Partial<Record<TemplateKind, string>>;
```

Behavior on hash mismatch:

- warn the user
- allow loading current referenced template
- allow loading embedded snapshot if available
- do not silently ignore the mismatch

## Embedded Snapshots

A project may include embedded copies of templates for portability.

```ts
type ProjectTemplateSnapshot = {
  ownership: OwnershipTemplate;
  legalForm: LegalFormTemplate;
  capex: CapexTemplate;
  property: PropertyTemplate;
  closingCosts: ClosingCostsTemplate;
  opex: OpexTemplate;
};
```

Embedded snapshots are useful when:

- sharing a project as one file
- referenced templates are missing
- template hashes changed
- importing from ZIP
- loading without File System Access API

The MVP may store embedded snapshots optionally.

Portable ZIP export should include both:

- project manifest
- individual template files

## Project Metadata

Use metadata for non-domain details.

```ts
type ProjectMetadata = {
  appVersion?: string;
  currency?: "EUR";
  locale?: "de-DE";
  timeHorizonMonths?: number;
  notes?: string;
};
```

The default currency is `EUR`.

The default locale is `de-DE`.

## Eignerschaft Template

| Property | Value |
|---|---|
| Schema | `immo-finance.ownership` |
| File suffix | `.ownership.json` |

### Type

```ts
type OwnershipTemplate = TemplateEnvelope<OwnershipData>;

type OwnershipData = {
  owners: Owner[];
  contributionRules: ContributionRule[];
};

type Owner = {
  id: string;
  displayName: string;
  type: "person" | "company" | "association" | "other";
  ownershipSharePct: number;
  votingSharePct?: number;
  liabilitySharePct?: number;
  notes?: string;
};

type ContributionRule = {
  id: string;
  name: string;
  basis: "ownershipShare" | "equalSplit" | "custom";
  customShares?: Record<string, number>;
};
```

### Validation rules

- owner IDs must be unique
- owner display names must not be empty
- ownership shares must be non-negative
- ownership shares should sum to 100%
- voting shares, if provided, should sum to 100%
- liability shares, if provided, should sum to 100%
- custom contribution shares must reference known owners
- custom contribution shares should sum to 100%

A sum not equal to 100% may be a validation error or warning depending on implementation phase. For MVP, it should at least produce a visible diagnostic.

### Example

```json
{
  "schema": "immo-finance.ownership",
  "version": 1,
  "id": "ownership-standard-001",
  "name": "Standard Eignerschaft",
  "data": {
    "owners": [
      {
        "id": "owner-a",
        "displayName": "Eigner A",
        "type": "person",
        "ownershipSharePct": 50
      },
      {
        "id": "owner-b",
        "displayName": "Eigner B",
        "type": "person",
        "ownershipSharePct": 50
      }
    ],
    "contributionRules": [
      {
        "id": "rule-ownership",
        "name": "Nach Eigentumsanteil",
        "basis": "ownershipShare"
      }
    ]
  }
}
```

## Gesellschaftsform Template

| Property | Value |
|---|---|
| Schema | `immo-finance.legal-form` |
| File suffix | `.legal-form.json` |

### Type

```ts
type LegalFormTemplate = TemplateEnvelope<LegalFormData>;

type LegalFormData = {
  legalForm:
    | "gbr"
    | "gmbh"
    | "ug"
    | "verein"
    | "eg"
    | "kg"
    | "other";

  liabilityModel: "limited" | "unlimited" | "mixed" | "unknown";
  taxModel: "transparent" | "corporate" | "association" | "unknown";
  votingModel?: "ownershipShare" | "equalPerOwner" | "custom" | "unknown";
  notes?: string;
};
```

### Validation rules

- legal form must be selected
- liability model must be explicit
- tax model may be unknown
- notes may be free text
- app must not infer legal correctness

### Example

```json
{
  "schema": "immo-finance.legal-form",
  "version": 1,
  "id": "legal-form-gbr-basic",
  "name": "GbR Basis",
  "data": {
    "legalForm": "gbr",
    "liabilityModel": "unlimited",
    "taxModel": "transparent",
    "votingModel": "ownershipShare",
    "notes": "Assumption only. Requires external legal verification."
  }
}
```

## Capex Template

| Property | Value |
|---|---|
| Schema | `immo-finance.capex` |
| File suffix | `.capex.json` |

### Type

```ts
type CapexTemplate = TemplateEnvelope<CapexData>;

type CapexData = {
  items: CapexItem[];
};

type CapexItem = {
  id: string;
  label: string;
  category:
    | "renovation"
    | "modernization"
    | "energy"
    | "furniture"
    | "planning"
    | "permits"
    | "contingency"
    | "technicalEquipment"
    | "other";

  amount: number;
  timingMonth: number;
  financing: "equity" | "loan" | "grant" | "mixed";
  notes?: string;
};
```

### Validation rules

- item IDs must be unique
- label must not be empty
- amount must be non-negative
- timing month must be integer and non-negative
- financing source must be selected

### Example

```json
{
  "schema": "immo-finance.capex",
  "version": 1,
  "id": "capex-renovation-base",
  "name": "Sanierung Basis",
  "data": {
    "items": [
      {
        "id": "capex-001",
        "label": "Renovierung",
        "category": "renovation",
        "amount": 50000,
        "timingMonth": 0,
        "financing": "equity"
      }
    ]
  }
}
```

## Immobilie Template

| Property | Value |
|---|---|
| Schema | `immo-finance.property` |
| File suffix | `.property.json` |

### Type

```ts
type PropertyTemplate = TemplateEnvelope<PropertyData>;

type PropertyData = {
  purchasePrice: number;
  federalState?: GermanFederalState;
  address?: string;
  rentableAreaSqm?: number;
  units?: number;
  expectedMonthlyRent?: number;
  vacancyRatePct?: number;
  purchaseMonth?: number;
  notes?: string;
};

type GermanFederalState =
  | "BW"
  | "BY"
  | "BE"
  | "BB"
  | "HB"
  | "HH"
  | "HE"
  | "MV"
  | "NI"
  | "NW"
  | "RP"
  | "SL"
  | "SN"
  | "ST"
  | "SH"
  | "TH";
```

### Validation rules

- purchase price must be non-negative
- rentable area, if provided, must be non-negative
- units, if provided, must be positive integer
- vacancy rate must be between 0 and 100
- expected monthly rent must be non-negative

### Example

```json
{
  "schema": "immo-finance.property",
  "version": 1,
  "id": "property-house-a",
  "name": "Haus A",
  "data": {
    "purchasePrice": 750000,
    "federalState": "BW",
    "rentableAreaSqm": 300,
    "units": 4,
    "expectedMonthlyRent": 4500,
    "vacancyRatePct": 3,
    "purchaseMonth": 0
  }
}
```

## Nebenkosten Template

| Property | Value |
|---|---|
| Schema | `immo-finance.closing-costs` |
| File suffix | `.closing-costs.json` |

### Type

```ts
type ClosingCostsTemplate = TemplateEnvelope<ClosingCostsData>;

type ClosingCostsData = {
  realEstateTransferTaxPct: number;
  notaryPct: number;
  landRegistryPct: number;
  brokerPct: number;
  otherCosts: ClosingCostItem[];
};

type ClosingCostItem = {
  id: string;
  label: string;
  amount: number;
  timingMonth?: number;
  notes?: string;
};
```

### Validation rules

- percentages must be non-negative
- percentages should not exceed plausible upper warning threshold
- other cost IDs must be unique
- other cost amounts must be non-negative
- labels must not be empty

### Example

```json
{
  "schema": "immo-finance.closing-costs",
  "version": 1,
  "id": "closing-costs-bw-standard",
  "name": "BW Standard Nebenkosten",
  "data": {
    "realEstateTransferTaxPct": 5,
    "notaryPct": 1.5,
    "landRegistryPct": 0.5,
    "brokerPct": 3.57,
    "otherCosts": [
      {
        "id": "closing-001",
        "label": "Gutachten",
        "amount": 2500,
        "timingMonth": 0
      }
    ]
  }
}
```

## Opex Template

| Property | Value |
|---|---|
| Schema | `immo-finance.opex` |
| File suffix | `.opex.json` |

### Type

```ts
type OpexTemplate = TemplateEnvelope<OpexData>;

type OpexData = {
  recurringItems: OpexItem[];
};

type OpexItem = {
  id: string;
  label: string;
  amount: number;
  period: "monthly" | "quarterly" | "yearly";
  inflationPct?: number;
  recoverableFromTenants?: boolean;
  category?:
    | "insurance"
    | "maintenance"
    | "administration"
    | "utilities"
    | "propertyManagement"
    | "accounting"
    | "taxAdvisory"
    | "reserve"
    | "other";
  notes?: string;
};
```

### Validation rules

- item IDs must be unique
- label must not be empty
- amount must be non-negative
- period must be selected
- inflation percentage may be negative but should produce warning if unusual
- recoverable and non-recoverable costs must be distinguishable

### Example

```json
{
  "schema": "immo-finance.opex",
  "version": 1,
  "id": "opex-standard",
  "name": "Opex Standard",
  "data": {
    "recurringItems": [
      {
        "id": "opex-001",
        "label": "Instandhaltungsrücklage",
        "amount": 6000,
        "period": "yearly",
        "inflationPct": 2,
        "recoverableFromTenants": false,
        "category": "reserve"
      },
      {
        "id": "opex-002",
        "label": "Versicherung",
        "amount": 1200,
        "period": "yearly",
        "inflationPct": 2,
        "recoverableFromTenants": false,
        "category": "insurance"
      }
    ]
  }
}
```

## Debt Extension

The original input tab list does not include a separate financing or debt tab.

However, the visualization includes Schulden.

Therefore the data model must not block future debt modeling.

For MVP, debt may initially be derived from:

```text
purchase price
+ closing costs
+ capex
- equity contributions
```

Later, introduce a dedicated financing module if required.

Potential future file suffix:

```text
.financing.json
```

Potential future schema:

```text
immo-finance.financing
```

Do not hard-code assumptions that only one loan exists.

## Numeric Conventions

Use numbers in persisted JSON.

Do not persist formatted strings such as:

```text
"750.000 €"
"5 %"
```

Persist as:

```json
{
  "amount": 750000,
  "ratePct": 5
}
```

Formatting belongs to the UI.

## Date and Time Conventions

Use ISO strings for timestamps.

Example:

```text
2026-05-15T10:00:00.000Z
```

Use integer month offsets for project timelines where possible.

Example:

```ts
timingMonth: 0
```

Means project month 0.

This keeps calculations simple and avoids calendar ambiguity.

## IDs

IDs must be stable within files.

Use generated IDs or readable IDs.

Examples:

```text
owner-a
capex-001
opex-insurance
```

Rules:

- IDs must not be empty
- IDs must be unique within their local collection
- project references should use IDs, not display names
- display names may change without breaking references

## Versioning

Every file has a numeric version.

Initial version:

```json
{
  "version": 1
}
```

Breaking data changes require version increment and migration.

Do not change the meaning of an existing field silently.

## Migrations

Each module owns its migrations.

Example:

```ts
function migrateOwnership(input: unknown): OwnershipTemplate {
  // v1 -> current
}
```

Migration flow:

```text
parse JSON
  ↓
read schema
  ↓
read version
  ↓
run migrations
  ↓
validate current schema
  ↓
return typed template
```

If migration fails, show a visible error.

Do not guess missing critical values.

## Validation Severity

Validation should distinguish:

```ts
type DiagnosticSeverity = "error" | "warning" | "info";
```

Examples:

| Case | Severity |
|---|---|
| invalid JSON | error |
| unknown schema | error |
| unsupported version | error |
| negative purchase price | error |
| owner shares sum to 98% | warning or error |
| missing notes | info or none |
| changed template hash | warning |
| missing embedded snapshot | warning |

Errors block calculation.

Warnings allow calculation but must be visible.

## Traceability

Every calculated number should be traceable back to source input.

This requires stable IDs in input files.

For example, a cashflow output may reference:

```ts
sourceRefs: [
  { kind: "opex", itemId: "opex-001" },
  { kind: "property", field: "expectedMonthlyRent" }
]
```

This does not need to be perfect in MVP, but the data model should not prevent it.

## Compatibility Rule

When changing schemas:

1. add new field as optional first
2. implement migration
3. add validation
4. update examples
5. update tests
6. only then make the field required if necessary

## Anti-Patterns

Do not persist:

- formatted currency strings
- localized number strings
- React component state
- chart state as domain data
- file handles inside JSON
- functions
- derived calculation results as source data
- legal conclusions
- tax conclusions
- unvalidated arbitrary objects

## Product Principle

Templates are assumptions.

Projects are compositions of assumptions.

Calculations are consequences.

Do not blur these layers.
