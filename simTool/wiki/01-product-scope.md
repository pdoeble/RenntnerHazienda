# Product Scope

## Goal

The app helps model and compare financing structures for purchasing real estate through an organization with multiple owners.

The organization may be, for example:

- company
- association
- cooperative-like structure
- civil-law partnership
- other jointly owned vehicle

The app shall make ownership, funding, costs, liquidity, cashflow, and debt transparent.

It must run as a static web app on GitHub Pages.

## Primary Use Case

A group wants to buy a property together.

They need to understand:

- who owns what share
- which legal structure is assumed
- how much capital is needed upfront
- which costs occur at acquisition
- which operating costs occur later
- how owner contributions are calculated
- whether liquidity remains sufficient
- how debt develops over time
- how cashflow behaves under assumptions

The app is a planning and comparison tool, not a legal or financial advisory system.

## Target Users

Primary users:

- project initiators
- prospective co-owners
- association or company representatives
- technically capable users preparing financing scenarios

Secondary users:

- advisors reviewing assumptions
- banks or funding partners reviewing structured exports
- group members comparing contribution scenarios

The UI should be understandable without reading the code.

## Core Concept

The app consists of independent input modules and derived visualization modules.

Input modules define assumptions.

Visualization modules display calculated consequences.

Input data is saved as small reusable template files. A project file references these templates and combines them into one planning scenario.

## Input Modules

The left side of the app contains these independent input tabs.

### Eignerschaft

Defines the owners and ownership-related rules.

Examples:

- owner names or labels
- owner type
- ownership shares
- voting shares
- liability shares
- contribution split rules
- custom allocation keys

This module answers:

> Who participates, and according to which shares?

### Gesellschaftsform

Defines the assumed legal structure.

Examples:

- GbR
- GmbH
- UG
- Verein
- eG
- KG
- other

This module may also define abstract assumptions such as:

- liability model
- tax treatment assumption
- voting logic
- notes

This module must not provide legal advice.

It only records assumptions selected by the user.

### Capex

Defines capital expenditure outside the pure purchase price.

Examples:

- renovation
- modernization
- energy upgrades
- planning costs
- permits
- furnishing
- contingency
- one-time technical equipment
- other investment items

Each item should have at least:

- label
- category
- amount
- timing
- funding source assumption

### Immobilie

Defines the real estate object.

Examples:

- purchase price
- location or federal state
- usable/rentable area
- number of units
- expected rent
- vacancy assumption
- purchase timing
- object notes

This module describes the asset being purchased.

### Nebenkosten

Defines acquisition-related extra costs.

Examples:

- real estate transfer tax
- notary
- land registry
- broker fee
- appraisal
- legal setup cost
- financing arrangement cost
- other one-time transaction costs

This module should allow both percentage-based and fixed-cost entries where useful.

### Opex

Defines recurring operating expenses.

Examples:

- insurance
- maintenance
- administration
- utilities
- property management
- reserves
- accounting
- tax advisory
- association/company administration cost
- non-recoverable costs
- inflation assumptions

This module answers:

> What does the property or ownership structure cost over time?

## Visualization Modules

The right side of the app contains read-only visualization tabs.

Visualization tabs must not mutate project data.

They render calculated results from the calculation engine.

### Liquidität

Shows whether the project remains solvent over time.

Typical outputs:

- starting liquidity
- required owner contributions
- recurring inflows
- recurring outflows
- liquidity reserve
- minimum liquidity
- liquidity gaps
- months with funding deficits

This view should make funding shortfalls obvious.

### Beiträge

Shows how much each owner must contribute.

Typical outputs:

- initial contribution per owner
- recurring contribution per owner
- special contribution per owner
- contribution basis
- ownership-share-based allocation
- equal split
- custom allocation

This view is important because ownership shares and contribution rules may differ.

### Cashflow

Shows the economic operating result over time.

Typical outputs:

- rental income
- vacancy effect
- operating expenses
- reserves
- interest
- principal repayment
- free cashflow
- cumulative cashflow

This view should support monthly and yearly aggregation.

### Schulden

Shows financing and debt development.

Typical outputs:

- loan amounts
- interest rate assumptions
- repayment assumptions
- remaining debt
- interest paid
- principal repaid
- debt service
- fixed-interest period
- refinancing risk

This view should make debt and interest sensitivity visible.

## Project and Template Philosophy

Each input tab can be saved independently as a template.

Example templates:

- `standard-owners.ownership.json`
- `gbr-basic.legal-form.json`
- `renovation-base.capex.json`
- `property-a.property.json`
- `bw-standard.closing-costs.json`
- `opex-standard.opex.json`

An overall project file references these templates.

Example:

- `project-house-a.immo-project.json`

The project file is not a monolithic data dump by default. It is primarily a manifest describing which input templates belong together.

For robustness, the project file may also contain:

- template hashes
- embedded snapshots
- metadata
- schema versions

## MVP Scope

The MVP must include:

- static GitHub Pages deployment
- two-column layout
- all six input tabs
- all four visualization tabs
- template load/save/save-as logic
- project load/save/save-as logic
- IndexedDB autosave
- JSON import/export fallback
- validated schemas for all persisted files
- calculation pipeline from snapshot to results
- clear display of validation errors
- clear display of calculation warnings

The MVP should support one active project at a time.

The MVP should allow multiple owners.

The MVP should allow multiple cost items.

The MVP should allow multiple loan or debt entries if the debt model is implemented early; otherwise, at least the data model must not prevent this extension.

## Explicit Non-Goals

The MVP must not require:

- backend server
- database
- user accounts
- login
- payment processing
- real-time collaboration
- automatic bank API integration
- automatic live interest rates
- automatic tax calculation
- automatic legal recommendations
- direct write-back to GitHub repositories

These features may be considered later only through explicit architecture extensions.

## Legal, Tax, and Financial Boundaries

The app must not present outputs as binding advice.

It may show calculations based on user assumptions.

It must not decide:

- which legal form is best
- whether a structure is legally valid
- whether a financing is approved
- whether tax treatment is correct
- whether a user should buy the property
- whether an owner can afford the contribution

Use neutral language such as:

- "assumed"
- "modeled"
- "estimated"
- "based on current inputs"
- "requires external verification"

Avoid advisory language such as:

- "you should"
- "this is legally optimal"
- "this is tax efficient"
- "this financing is safe"
- "this structure is recommended"

## Required Disclaimer

The app should include a visible disclaimer similar to:

> This tool is for scenario modeling only. It does not provide legal, tax, financing, or investment advice. All assumptions, costs, interest rates, legal structures, and tax effects must be verified with qualified professionals before making decisions.

The disclaimer should be visible in the app and included in exported project reports if such exports are later implemented.

## Terminology

Use consistent terms throughout the app.

Preferred German UI terms:

| Concept | UI Term |
|---|---|
| ownership | Eignerschaft |
| legal form | Gesellschaftsform |
| capital expenditure | Capex |
| property | Immobilie |
| closing/acquisition costs | Nebenkosten |
| operating expenditure | Opex |
| liquidity | Liquidität |
| contributions | Beiträge |
| cashflow | Cashflow |
| debt | Schulden |
| template | Template |
| project | Projekt |
| save as | Speichern unter |
| load | Laden |

Internal TypeScript names may use English.

Example:

- UI: `Eignerschaft`
- Code module: `ownership`
- File suffix: `.ownership.json`

## Success Criteria

The product is successful when a user can:

1. define a property acquisition scenario
2. define several owners
3. choose or describe a legal structure assumption
4. enter purchase costs, capex, and opex
5. save each input module as a template
6. combine templates into a project
7. reload the project later
8. inspect liquidity, contributions, cashflow, and debt
9. understand warnings and invalid assumptions
10. export or share the project files without needing a backend

## Product Principle

Optimize for traceability over convenience.

A user must be able to understand where every number comes from.