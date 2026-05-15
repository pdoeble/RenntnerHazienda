# UI and Visualization

## Purpose

This document defines the user interface and visualization rules for the real estate financing app.

The UI must support:

- a two-column working layout
- independent input tabs
- read-only visualization tabs
- template load/save controls
- project load/save controls
- visible validation and calculation diagnostics
- traceable financial numbers
- static GitHub Pages deployment

The app should be understandable for non-developers while preserving a strict technical architecture.

## Core Principle

The left side edits assumptions.

The right side shows consequences.

Visualization components must not mutate project data.

## Main Layout

The app uses two main columns on desktop.

```text
┌───────────────────────────────┬────────────────────────────────────┐
│ Left Column                   │ Right Column                        │
│ Input Tabs                    │ Visualization Tabs                  │
├───────────────────────────────┼────────────────────────────────────┤
│ Eignerschaft                  │ Liquidität                          │
│ Gesellschaftsform             │ Beiträge                            │
│ Immobilie                     │ Cashflow                            │
│   inkl. Nebenkosten           │ Schulden                            │
│   Renovierungen, Finanzierung │                                    │
│ Opex                          │                                    │
└───────────────────────────────┴────────────────────────────────────┘
```

Desktop should prioritize this two-column layout.

Small screens may use a stacked layout.

## Top-Level App Shell

The app shell should show:

- app title
- current project name
- autosave status
- dirty state
- project controls
- optional disclaimer access
- current calculation status

Recommended top bar elements:

```text
[Project Name] [Unsaved changes] [Autosaved locally] [Load Project] [Save Project] [Export]
```

The user should always know whether the current state is saved.

## Left Column: Input Tabs

Required input tabs:

1. Eignerschaft
2. Gesellschaftsform
3. Immobilie
4. Opex

`Capex`, `closingCosts`, and `financing` remain separate internal template domains for compatibility and persistence. The current UI exposes them through the `Immobilie` tab instead of separate visible tabs.

Each input tab must provide:

- form fields for the domain
- template name
- validation state
- Load
- Save
- Save As
- Reset, optional
- Duplicate, optional

Input tabs must not directly read or mutate other input tabs.

## Right Column: Visualization Tabs

Required visualization tabs:

1. Liquidität
2. Beiträge
3. Cashflow
4. Schulden

Visualization tabs consume `CalculationResult`.

They must not consume raw form state directly.

They must not write to project state.

They may use local display state such as:

- selected year
- chart aggregation
- expanded table rows
- visible series
- sorting
- filters

## Input Tab Header Pattern

Each input tab should use a consistent header.

Recommended pattern:

```text
[Eignerschaft] [Template: Standard Eignerschaft] [Dirty] [Load] [Save] [Save As]
```

Required elements:

- tab title
- loaded template name
- dirty indicator
- validation status
- template actions

## Project Control Pattern

Project-level controls should be separate from template-level controls.

Recommended controls:

- Load Project
- Save Project
- Save Project As
- Export Portable Project
- Import Portable Project

Do not confuse project save with template save.

A project save stores the manifest.

A template save stores one input module.

## Dirty State Display

Dirty state must be visible.

At minimum show:

- unsaved project changes
- unsaved template changes
- autosave timestamp

Example labels:

```text
Unsaved changes
Autosaved locally 14:32
Saved to file
Direct file save unavailable
```

Dirty state should not block editing.

Dirty state should warn before destructive actions.

## Validation Display

Invalid input must be shown near the source field where possible.

Also show a summary at tab level.

Recommended severity styles:

| Severity | Meaning |
|---|---|
| Error | Blocks calculation or file loading |
| Warning | Calculation may proceed but assumption is questionable |
| Info | Helpful context |

The UI must not silently fix critical invalid inputs.

Examples:

- owner shares sum to 98%
- purchase price is missing
- custom contribution rule references unknown owner
- unsupported project version
- template hash mismatch

## Diagnostics Display

Calculation diagnostics should be visible in the right column.

Recommended locations:

- global diagnostics panel
- per visualization tab
- inline chart/table warnings

Example:

```text
Warning: Liquidity becomes negative in month 8.
Source: Capex item "Renovierung", Opex item "Versicherung"
```

Do not hide diagnostics behind console logs.

## Form Behavior

Forms should use controlled inputs or a consistent form library.

Required behavior:

- numeric fields accept decimal input
- numeric values are stored as numbers
- percentages are entered as percent values
- currency formatting is UI-only
- validation runs after edits
- invalid values remain visible for correction
- field labels use German UI terms

Do not persist formatted strings such as `750.000 €`.

## Required Input UI Details

### Eignerschaft

Should allow:

- add owner
- remove owner
- edit owner display name
- select owner type
- edit owner equity contribution
- show ownership share derived from `owner.equityContribution / totalOwnerEquity`
- edit voting share, optional
- edit liability share, optional
- define contribution rules

The UI should clearly show the total owner equity and each derived share.

Recommended visualization inside tab:

```text
Total equity: 200,000 EUR
Derived ownership: 100%
Total voting: 100%
Total liability: 100%
```

### Gesellschaftsform

Should allow:

- select legal form
- select liability model
- select tax model
- select voting model, optional
- add notes

The UI must present this as assumption modeling, not advice.

Use wording such as:

```text
Annahme zur Gesellschaftsform
```

Avoid wording such as:

```text
Empfohlene Gesellschaftsform
```

### Capex

Status: no longer a separate visible MVP tab.

Renovation/capex entries are currently edited as `property.renovationItems` in the `Immobilie` tab. The internal `capex` template remains available for importing older project files and migrating renovation data into the property template.

The integrated renovation editor should allow:

- add capex item
- remove capex item
- edit label
- edit category
- edit amount
- edit timing month
- edit financing assumption
- add notes

Show total capex.

Group by category if useful.

### Immobilie

Should allow:

- edit purchase price
- select federal state
- edit address or object label, optional
- edit rentable area
- edit units
- edit expected monthly rent
- edit vacancy rate
- edit purchase month
- edit reserve months
- edit closing cost percentages and fixed closing costs
- add/remove renovation items
- edit loan interest, term, start month, and monthly additional repayment through the integrated financing section
- add notes

Show basic derived indicators where useful:

- price per square meter
- rent per square meter
- gross rent multiplier, optional

Derived indicators in input tabs must be clearly marked as derived.

### Nebenkosten

Status: no longer a separate visible MVP tab.

Closing costs are edited inside the `Immobilie` tab as `property.closingCosts`. The internal `closingCosts` template remains for compatibility with older project files.

The integrated closing-cost editor should allow:

- edit real estate transfer tax percentage
- edit notary percentage
- edit land registry percentage
- edit broker percentage
- add fixed other costs
- edit timing month for other costs

Show:

- percentage-based costs
- fixed costs
- total closing costs
- total acquisition cost

### Opex

Should allow:

- add recurring opex item
- remove item
- edit label
- edit category
- select annual cost mode: fixed, rentable area, plot area, or property value
- edit annual amount or annual rate according to the selected mode
- edit inflation assumption
- mark recoverable from tenants
- add notes

Show:

- monthly equivalent
- yearly equivalent
- total recoverable opex
- total non-recoverable opex

## Visualization: Liquidität

Purpose:

Show whether the project remains solvent over time.

Recommended components:

- line chart of liquidity over time
- table of monthly or yearly liquidity
- minimum liquidity card
- first negative month indicator
- inflow/outflow breakdown

Required key figures:

- starting liquidity
- final liquidity
- minimum liquidity
- first negative month, if any
- total inflows
- total outflows

Warnings:

- negative liquidity
- insufficient initial contributions
- capex before funding
- missing contribution rule

## Visualization: Beiträge

Purpose:

Show how much each owner contributes.

Recommended components:

- stacked bar chart by owner
- contribution table
- initial contribution summary
- recurring contribution schedule
- allocation rule explanation

Required key figures:

- total contribution by owner
- initial contribution by owner
- yearly recalculated recurring monthly contribution by owner
- allocation basis
- share percentage derived from owner equity

The contribution view must use owner IDs internally and display owner names only as labels.

## Visualization: Cashflow

Purpose:

Show operating financial performance over time.

Recommended components:

- monthly/yearly cashflow chart
- income and expense breakdown
- cumulative cashflow chart
- table by period

Required key figures:

- rental income
- vacancy loss
- effective income
- recoverable opex
- non-recoverable opex
- debt service
- net cashflow before contributions
- cumulative cashflow

The UI should distinguish operating costs from debt service.

## Visualization: Schulden

Purpose:

Show debt structure and amortization.

Recommended components:

- remaining debt line chart
- interest/principal stacked bar chart
- loan summary table
- debt service table
- refinancing risk indicator, optional

Required key figures:

- initial debt
- remaining debt
- total interest paid
- total principal repaid
- monthly debt service
- final remaining debt

If debt is derived because no dedicated financing tab exists, show that clearly.

Example:

```text
Debt model derived from acquisition cost minus owner contributions.
```

## Chart Rules

Charts must be readable and traceable.

Rules:

- always label axes
- always show units
- use EUR formatting for money
- avoid 3D charts
- avoid decorative-only charts
- provide table fallback for important numbers
- do not hide negative values
- show the selected time horizon

Charts should not perform domain calculations.

Charts only visualize `CalculationResult`.

## Table Rules

Tables should support:

- clear column headers
- German labels
- EUR formatting
- percentage formatting
- sorting where useful
- horizontal scrolling on small screens

Important calculated values should be available in tables, not only charts.

## Formatting Rules

Use central formatting helpers.

Examples:

```ts
formatMoney(value, "de-DE", "EUR")
formatPercent(value, "de-DE")
formatMonth(monthIndex)
```

Do not format money manually inside components.

Do not store formatted values in state.

## Language Rules

UI language should be German.

Internal code may use English.

Examples:

| UI | Code |
|---|---|
| Eignerschaft | ownership |
| Gesellschaftsform | legalForm |
| Nebenkosten | closingCosts |
| Liquidität | liquidity |
| Beiträge | contributions |
| Schulden | debt |

Do not mix German and English in the same visible UI label unless the term is intentionally retained, such as `Capex` or `Opex`.

## Disclaimer UI

The app shell currently does not show a visible disclaimer panel.

Product boundaries remain documented in `01-product-scope.md`. If report exports are added later, legal/product boundary text can be included in those generated artifacts without taking space from the working UI.

## Accessibility Basics

Minimum requirements:

- keyboard-accessible tabs
- visible focus states
- labels for all inputs
- sufficient contrast
- no information conveyed by color alone
- error messages linked to fields where possible
- charts accompanied by summary values or tables

The MVP does not need perfect accessibility, but it must avoid obvious blockers.

## Responsive Behavior

Desktop:

- two columns
- input left
- visualizations right
- both columns independently scrollable if needed

Tablet:

- two columns if width allows
- otherwise stacked

Mobile:

- stacked layout
- input tabs first
- visualization tabs below
- tables may horizontally scroll
- controls remain reachable

Do not optimize mobile at the expense of desktop usability.

## Component Structure

Recommended UI component structure:

```text
src/ui/
  buttons/
    FileActionButton.tsx
    SaveStatusBadge.tsx

  forms/
    MoneyInput.tsx
    PercentInput.tsx
    MonthInput.tsx
    TextField.tsx
    SelectField.tsx
    ValidationMessage.tsx

  charts/
    LiquidityChart.tsx
    ContributionChart.tsx
    CashflowChart.tsx
    DebtChart.tsx

  tables/
    LiquidityTable.tsx
    ContributionTable.tsx
    CashflowTable.tsx
    DebtTable.tsx

  status/
    AutosaveStatus.tsx
    DirtyStateIndicator.tsx
    DiagnosticsPanel.tsx
    PersistenceModeBadge.tsx
```

Domain-specific forms live in `src/modules`.

Shared UI primitives live in `src/ui`.

## State Mutation Rules

Allowed to mutate project data:

- input forms through explicit project store actions
- project load/import flows
- template load flows
- migration flows before state insertion

Not allowed to mutate project data:

- visualization tabs
- chart components
- table components
- formatting helpers
- calculation functions
- persistence status components

## User Feedback Rules

Every long or destructive operation should provide feedback.

Examples:

- file loaded successfully
- save completed
- export completed
- import failed
- autosave restored
- template hash mismatch
- browser does not support direct save

User-cancelled file operations should not be shown as errors.

## Empty States

Each visualization tab needs an empty or invalid state.

Examples:

```text
Keine Berechnung möglich, weil Pflichtangaben fehlen.
```

```text
Noch keine Eigentümer definiert.
```

```text
Keine Schulden modelliert.
```

Do not render broken charts with empty data.

## Error Recovery

When a file load fails:

- keep current project state
- show specific error
- allow user to try another file
- do not clear existing inputs

When calculation fails:

- show diagnostics
- keep input data editable
- avoid crashing the entire app

When a chart cannot render:

- show table or diagnostic fallback

## Testing Requirements

Add UI tests or component tests for:

- switching input tabs
- switching visualization tabs
- dirty indicator after edit
- validation message display
- save fallback label
- diagnostics panel rendering
- empty visualization state
- contribution table rendering
- negative liquidity warning display

Add integration tests where practical for:

- load template
- edit input
- recalculation
- visualization update
- save/export action

## Anti-Patterns

Do not:

- calculate business logic inside chart components
- mutate project state from visualization tabs
- hide validation errors
- store formatted strings as domain data
- use owner display names as IDs
- make project save and template save ambiguous
- require login for MVP
- require backend for MVP
- create charts without table alternatives
- silently ignore missing referenced templates
- present legal or financial recommendations as facts

## Implementation Principle

The interface should make the model inspectable.

A user should be able to answer:

1. What assumptions did I enter?
2. Which template contains them?
3. Which project combines them?
4. Which warning affects the result?
5. Where does each visualized number come from?

---

## Implementation Status: Interactive Inputs

As of 2026-05-15:

- Numeric assumptions are editable through a slider plus direct number input.
- Changes update React state immediately and recalculate visualizations from the current project snapshot.
- Visible input tabs are `Eignerschaft`, `Gesellschaftsform`, `Immobilie`, and `Opex`.
- Eigner names and equity contributions are editable; owner shares are derived from total owner equity.
- Financing is displayed inside the `Immobilie` tab as a separate section.
- Closing costs and renovation items are displayed inside the `Immobilie` tab.
- Renovation items and opex blocks can be added and removed in the UI.
- Opex annual costs support fixed, rentable-area, plot-area, and property-value bases.
- Contribution visualizations include initial equity and yearly recalculated monthly contribution schedules.
- Project and template load/save/export use browser JSON upload/download fallback.
- The visible disclaimer panel was removed from the app shell; legal and product boundaries remain documented in the wiki.

Next UI steps:

- Add inline totals for closing costs, renovation totals, and annual opex equivalents directly inside the input tabs.
- Add richer empty states for blocked calculations.
- Add optional editing for fixed other closing-cost items.

---

## Implementation Status: Decision Dashboard MVP

As of 2026-05-15:

- Visible input tabs are `Eignerschaft`, `Gesellschaftsform`, `Immobilie`, `Finanzierung`, `Strategie`, and `Opex`.
- `Finanzierung` is a dedicated tab again; `Strategie` is a dedicated tab for liquidity goals, equity ratio target, contribution policy, rent-offset behavior, and Go/No-Go statuses.
- `Immobilie` now uses Austria-oriented labels and fields: Austrian federal state, municipality, use type, tourism fees, USt, USt refund month, and mortgage registration fee.
- Visualization starts with `Dashboard` before detailed tabs.
- `Kapitalbedarf` shows a purchase bridge from purchase price through USt, closing costs, mortgage registration, renovations, reserve, owner equity, and debt.
- `Beitraege` shows owner burden with initial equity, base monthly obligation, reserve top-up, special assessment, and total monthly contribution.
- `Cashflow` separates operating result, interest, principal repayment, and liquidity cashflow.
- `Zeitachse` lists critical events with month, type, and amount.

Next visualization steps:

- Add full stress-test scenarios.
- Add use-mix calendar/night model and break-even nights.
- Add bank package readiness and assumption risk contribution views.
- Add source/check status directly next to sensitive legal, tax, and financing inputs.
