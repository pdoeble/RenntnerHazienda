# AGENTS.md

## Project Goal

Build a static, GitHub Pages-compatible web app for interactively modeling real estate acquisition financing through an organization with multiple owners.

The app is not a simple mortgage calculator. It is a modular project-and-template-based planning tool.

## Tech Stack

Use:

- React
- TypeScript
- Vite
- Zod or equivalent runtime validation
- IndexedDB for local autosave
- JSON import/export for templates and projects
- Optional File System Access API where supported
- Recharts or equivalent charting library

The app must run as a static website on GitHub Pages.

## Required Reading

Before implementing or changing architecture, read:

1. `wiki/01-product-scope.md`
2. `wiki/02-architecture.md`
3. `wiki/03-data-model-and-templates.md`
4. `wiki/04-persistence.md`
5. `wiki/05-calculation-engine.md`
6. `wiki/06-ui-and-visualization.md`

## Core Layout

The app has two main columns:

- Left column: input tabs
- Right column: visualization tabs

Input tabs:

- Eignerschaft
- Gesellschaftsform
- Capex
- Immobilie
- Nebenkosten
- Opex

Visualization tabs:

- Liquidität
- Beiträge
- Cashflow
- Schulden

## Non-Negotiable Architecture Rules

- Keep input modules independent.
- Do not let one input tab directly read or mutate another input tab.
- Do not put business calculations inside React components.
- Do not put persistence logic inside form components.
- Do not let visualization components mutate project data.
- Validate every imported file before using it.
- Every persisted file must include `schema`, `version`, `id`, `name`, and `data`.
- Support schema migrations instead of silently breaking old files.
- Treat GitHub Pages as static hosting only.
- Do not assume the app can write back to its own repository.

## Data Flow

The intended data flow is:

Input Templates  
→ Validated Project State  
→ Project Snapshot  
→ Calculation Engine  
→ Calculation Result  
→ Read-only Visualizations

React components may render and dispatch user edits, but they must not own domain logic.

## Persistence Rules

Each input tab supports:

- Load
- Save
- Save As

The overall project supports:

- Load Project
- Save Project
- Save Project As
- Export Portable Project
- Import Portable Project

Autosave should use IndexedDB.

File-based save should use the File System Access API when available and JSON download/upload as fallback.

The project file may reference individual input templates, but it should also store hashes and may store embedded snapshots for portability.

## Calculation Rules

All domain calculations belong in `src/calculations`.

Required calculation domains:

- Liquidity
- Contributions
- Cashflow
- Debt

Calculations must operate on validated snapshots, not raw form state.

## UI Rules

The UI must remain understandable for non-developers.

Show:

- current project name
- loaded template names per input tab
- unsaved changes
- validation errors
- calculation warnings
- autosave status
- export/import controls

Do not hide invalid inputs silently.

## Testing Requirements

At minimum, add tests for:

- schema validation
- template migration
- project manifest loading
- contribution allocation
- cashflow calculation
- debt amortization
- persistence fallback behavior

## Definition of Done

A feature is complete only if:

- data model is typed
- schema validation exists
- invalid input is handled visibly
- calculations are outside UI components
- persistence behavior is defined
- relevant tests exist
- the app still builds as a static GitHub Pages site

## Forbidden Changes

Do not introduce:

- server dependency for MVP
- database dependency for MVP
- authentication dependency for MVP
- hard-coded real project data
- hard-coded sensitive personal data
- legal, tax, or financing advice as app output
- direct GitHub write-back without explicit storage adapter and authentication design