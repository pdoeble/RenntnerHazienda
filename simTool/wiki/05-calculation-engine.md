# Calculation Engine

## Purpose

This document defines how domain calculations are structured.

The calculation engine turns validated project assumptions into read-only results for visualization.

It must be independent from:

- React
- browser storage
- file handles
- UI state
- chart libraries

All business calculations belong in `src/calculations`.

## Core Principle

Calculations are deterministic consequences of validated assumptions.

Same input snapshot means same output result.

The calculation engine must not mutate input data.

## Required Calculation Domains

The MVP requires four calculation domains:

1. Liquidität
2. Beiträge
3. Cashflow
4. Schulden

These correspond to the visualization tabs.

## Calculation Pipeline

Use this flow:

```text
ProjectState
  ↓
validation and migration
  ↓
ProjectSnapshot
  ↓
calculateAll(snapshot)
  ↓
CalculationResult
  ↓
visualization tabs
```

The calculation engine receives `ProjectSnapshot`, not raw form state.

## Project Snapshot

The snapshot is the normalized calculation input.

Example:

```ts
type ProjectSnapshot = {
  ownership: OwnershipTemplate;
  legalForm: LegalFormTemplate;
  capex: CapexTemplate;
  property: PropertyTemplate;
  closingCosts: ClosingCostsTemplate;
  opex: OpexTemplate;
  metadata: {
    currency: "EUR";
    locale: "de-DE";
    timeHorizonMonths: number;
    calculatedAt: string;
  };
};
```

The snapshot should contain:

- validated templates
- normalized numeric values
- resolved defaults
- project metadata
- no React state
- no file handles
- no browser objects

## Main Entry Point

Use one main function.

```ts
export function calculateAll(snapshot: ProjectSnapshot): CalculationResult {
  const diagnostics = collectInputDiagnostics(snapshot);

  if (hasBlockingErrors(diagnostics)) {
    return emptyCalculationResult(diagnostics);
  }

  const contributions = calculateContributions(snapshot);
  const debt = calculateDebt(snapshot, contributions);
  const cashflow = calculateCashflow(snapshot, debt);
  const liquidity = calculateLiquidity(snapshot, contributions, cashflow, debt);

  return {
    liquidity,
    contributions,
    cashflow,
    debt,
    diagnostics: [
      ...diagnostics,
      ...contributions.diagnostics,
      ...debt.diagnostics,
      ...cashflow.diagnostics,
      ...liquidity.diagnostics,
    ],
  };
}
```

This order is intentional:

1. contributions determine available funding
2. debt depends on required external financing
3. cashflow depends on income, opex, and debt service
4. liquidity combines all inflows and outflows

## Calculation Result

Use a structured result.

```ts
type CalculationResult = {
  liquidity: LiquidityResult;
  contributions: ContributionResult;
  cashflow: CashflowResult;
  debt: DebtResult;
  diagnostics: DiagnosticMessage[];
};
```

Each sub-result may also contain its own diagnostics.

## Diagnostics

Calculations must expose problems instead of hiding them.

```ts
type DiagnosticMessage = {
  id: string;
  severity: "error" | "warning" | "info";
  domain:
    | "ownership"
    | "legalForm"
    | "capex"
    | "property"
    | "closingCosts"
    | "opex"
    | "contributions"
    | "liquidity"
    | "cashflow"
    | "debt"
    | "project";
  message: string;
  sourceRefs?: SourceRef[];
};
```

Example diagnostics:

- owner shares do not sum to 100%
- contribution rule references unknown owner
- capex occurs before available liquidity
- negative liquidity in month 8
- purchase price is zero
- no debt model defined
- high remaining debt at end of horizon
- missing rent assumption

Errors block calculations.

Warnings allow calculations but must be visible.

## Source References

Results should be traceable to inputs.

```ts
type SourceRef = {
  kind: TemplateKind;
  itemId?: string;
  field?: string;
};
```

Example:

```ts
{
  kind: "opex",
  itemId: "opex-001",
  field: "amount"
}
```

Traceability does not need to be perfect in the MVP, but data structures should support it.

## Time Model

Use monthly periods as the internal time base.

```ts
type MonthIndex = number;
```

Project month `0` is the acquisition/start month.

Default time horizon:

```ts
timeHorizonMonths = 360;
```

Equivalent to 30 years.

The UI may display monthly or yearly aggregation, but calculations should be monthly.

## Money Model

Use numbers for monetary values.

Currency:

```ts
"EUR"
```

Do not store formatted strings in calculations.

Use helper functions for rounding and formatting.

Recommended internal convention:

- calculate with full JavaScript number precision
- round only at display boundaries or result boundaries where explicitly needed
- do not repeatedly round intermediate monthly values unless the model requires it

## Percent Model

Persist percentages as percent values, not fractions.

Example:

```json
{
  "ownershipSharePct": 50,
  "interestRatePct": 4.2
}
```

Convert to fractions in calculations:

```ts
const rate = interestRatePct / 100;
```

## Rounding Rules

Use central helpers.

```ts
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function roundPct(value: number): number {
  return Math.round((value + Number.EPSILON) * 10000) / 10000;
}
```

Avoid different rounding behavior across modules.

## Liquidität Calculation

Purpose:

Show whether the project remains solvent.

Inputs:

- initial owner contributions
- recurring owner contributions
- capex timing
- closing costs
- operating cashflow
- debt service
- reserves
- one-time inflows/outflows

Output type:

```ts
type LiquidityResult = {
  monthly: LiquidityMonth[];
  minimumLiquidity: number;
  finalLiquidity: number;
  firstNegativeMonth?: number;
  diagnostics: DiagnosticMessage[];
};

type LiquidityMonth = {
  month: number;
  openingBalance: number;
  inflows: number;
  outflows: number;
  closingBalance: number;
  sourceRefs?: SourceRef[];
};
```

Required behavior:

- detect negative liquidity
- calculate monthly opening and closing balances
- include owner contributions as inflows
- include capex, closing costs, opex, and debt service as outflows
- expose first month with negative liquidity

## Beiträge Calculation

Purpose:

Show how much each owner must contribute.

Inputs:

- owner list
- ownership shares
- contribution rules
- required equity
- initial and recurring funding needs

Output type:

```ts
type ContributionResult = {
  initialContributions: OwnerContribution[];
  recurringContributions: OwnerContributionSchedule[];
  totalByOwner: Record<string, number>;
  diagnostics: DiagnosticMessage[];
};

type OwnerContribution = {
  ownerId: string;
  ownerName: string;
  amount: number;
  basis: "ownershipShare" | "equalSplit" | "custom";
  sharePct: number;
};

type OwnerContributionSchedule = {
  month: number;
  contributions: OwnerContribution[];
};
```

Required allocation bases:

- ownership share
- equal split
- custom split

Validation:

- unknown owner references are errors
- custom shares not summing to 100% should produce warning or error
- missing contribution rule should fall back to ownership share with warning

## Cashflow Calculation

Purpose:

Show the economic operating result over time.

Inputs:

- expected rent
- vacancy
- opex
- recoverable/non-recoverable costs
- debt service
- reserves
- inflation assumptions

Output type:

```ts
type CashflowResult = {
  monthly: CashflowMonth[];
  yearly: CashflowYear[];
  cumulativeCashflow: number;
  diagnostics: DiagnosticMessage[];
};

type CashflowMonth = {
  month: number;
  rentalIncome: number;
  vacancyLoss: number;
  effectiveIncome: number;
  recoverableOpex: number;
  nonRecoverableOpex: number;
  debtService: number;
  netCashflowBeforeContributions: number;
  netCashflowAfterDebtService: number;
};

type CashflowYear = {
  year: number;
  rentalIncome: number;
  vacancyLoss: number;
  effectiveIncome: number;
  recoverableOpex: number;
  nonRecoverableOpex: number;
  debtService: number;
  netCashflowBeforeContributions: number;
  netCashflowAfterDebtService: number;
};
```

Required behavior:

- convert opex periods to monthly values
- apply vacancy assumptions
- distinguish recoverable and non-recoverable costs
- aggregate monthly values into yearly values
- keep debt service separate from operating costs

## Schulden Calculation

Purpose:

Show debt structure and debt development.

The current input tab list has no dedicated financing tab.

Therefore the MVP may derive required debt from:

```text
purchase price
+ closing costs
+ capex
- owner equity contributions
- grants, if modeled
```

The data model must not assume only one loan forever.

Output type:

```ts
type DebtResult = {
  loans: LoanResult[];
  totalInitialDebt: number;
  totalRemainingDebt: number;
  totalInterestPaid: number;
  totalPrincipalPaid: number;
  monthlyDebtService: DebtServiceMonth[];
  diagnostics: DiagnosticMessage[];
};

type LoanResult = {
  id: string;
  name: string;
  principal: number;
  annualInterestRatePct: number;
  initialRepaymentRatePct?: number;
  fixedMonthlyPayment?: number;
  monthly: LoanMonth[];
};

type LoanMonth = {
  month: number;
  openingBalance: number;
  interest: number;
  principalRepayment: number;
  payment: number;
  closingBalance: number;
};

type DebtServiceMonth = {
  month: number;
  interest: number;
  principalRepayment: number;
  totalPayment: number;
  remainingDebt: number;
};
```

Required behavior:

- support zero debt
- avoid negative remaining debt
- separate interest and principal repayment
- calculate remaining debt over time
- expose total interest paid
- expose total principal repaid

If no explicit debt assumptions exist, emit a warning and use a simple derived default only if defined by product scope.

## Simple Loan Formula

For a basic annuity-style loan:

```text
annualPayment = principal * (annualInterestRate + initialRepaymentRate)
monthlyPayment = annualPayment / 12
```

Monthly calculation:

```text
interest = openingBalance * annualInterestRate / 12
principalRepayment = monthlyPayment - interest
closingBalance = openingBalance - principalRepayment
```

Clamp final repayment so remaining debt does not go below zero.

## Closing Costs Calculation

Closing costs are part of acquisition outflows.

Basic calculation:

```text
realEstateTransferTax = purchasePrice * realEstateTransferTaxPct / 100
notary = purchasePrice * notaryPct / 100
landRegistry = purchasePrice * landRegistryPct / 100
broker = purchasePrice * brokerPct / 100
other = sum(otherCosts)
totalClosingCosts = realEstateTransferTax + notary + landRegistry + broker + other
```

Closing costs should be traceable to `closingCosts` and `property.purchasePrice`.

## Capex Calculation

Capex items are one-time investment outflows.

Each item has:

- amount
- timing month
- financing assumption

Required behavior:

- include capex in liquidity
- include equity-funded capex in contribution needs
- include loan-funded capex in required debt if debt model supports it
- include grant-funded capex as external funding if grants are modeled

For MVP, if financing type is unsupported, emit warning.

## Opex Calculation

Opex items are recurring costs.

Convert to monthly:

```text
monthly amount = amount       if period = monthly
monthly amount = amount / 3   if period = quarterly
monthly amount = amount / 12  if period = yearly
```

Inflation:

```text
inflated amount at month m = baseMonthlyAmount * (1 + inflationPct / 100)^(m / 12)
```

Recoverable costs should be separated from non-recoverable costs.

If rent recovery logic is not implemented, recoverable costs should still be shown separately.

## Vacancy Calculation

Vacancy loss:

```text
vacancyLoss = expectedMonthlyRent * vacancyRatePct / 100
effectiveIncome = expectedMonthlyRent - vacancyLoss
```

If rent is missing, cashflow should still calculate with zero income and emit a warning.

## Contribution Allocation

For ownership-share allocation:

```text
ownerContribution = requiredAmount * ownershipSharePct / 100
```

For equal split:

```text
ownerContribution = requiredAmount / ownerCount
```

For custom split:

```text
ownerContribution = requiredAmount * customSharePct / 100
```

Contribution calculations must use owner IDs, not display names.

## Handling Missing Inputs

The calculation engine should distinguish between:

- missing but optional input
- missing input with safe default
- missing input that blocks calculation

Examples:

| Input | Behavior |
|---|---|
| missing notes | ignore |
| missing expected rent | use zero and warn |
| missing owner list | error |
| missing purchase price | error |
| missing contribution rule | fallback to ownership share and warn |
| missing debt assumptions | use defined default or warn |

## Empty Result

If blocking errors exist, return an empty result with diagnostics.

Example:

```ts
type EmptyCalculationResult = {
  liquidity: LiquidityResult;
  contributions: ContributionResult;
  cashflow: CashflowResult;
  debt: DebtResult;
  diagnostics: DiagnosticMessage[];
};
```

The UI should still render diagnostics instead of crashing.

## Aggregation

Monthly results are primary.

Yearly values should be derived by aggregation.

Year index:

```text
year = Math.floor(month / 12) + 1
```

Do not calculate yearly values independently from monthly values unless explicitly justified.

## Immutability

Calculation functions must not mutate the snapshot.

Recommended approach:

- treat snapshot as readonly
- create new result objects
- avoid in-place mutation of template objects
- use local mutable arrays only for result construction

## Testing Requirements

Add tests for:

- owner contribution allocation by ownership share
- owner contribution allocation by equal split
- owner contribution allocation by custom split
- invalid owner share diagnostics
- closing cost calculation
- capex timing
- opex monthly conversion
- vacancy calculation
- debt amortization
- zero-debt scenario
- negative liquidity detection
- yearly aggregation
- missing rent warning
- blocking validation errors

## Example Test Cases

### Equal Ownership

Input:

- two owners
- 50% / 50%
- required contribution: 100,000 EUR

Expected:

- owner A: 50,000 EUR
- owner B: 50,000 EUR

### Equal Split

Input:

- four owners
- required contribution: 100,000 EUR

Expected:

- each owner: 25,000 EUR

### Vacancy

Input:

- monthly rent: 5,000 EUR
- vacancy: 5%

Expected:

- vacancy loss: 250 EUR
- effective income: 4,750 EUR

### Opex Yearly Conversion

Input:

- yearly insurance: 1,200 EUR

Expected:

- monthly cost: 100 EUR

### Negative Liquidity

Input:

- starting liquidity: 10,000 EUR
- month 0 outflow: 20,000 EUR

Expected:

- first negative month: 0
- diagnostic warning or error depending on policy

## Anti-Patterns

Do not:

- calculate domain logic in React components
- read from IndexedDB in calculation functions
- write to files in calculation functions
- format money inside calculation functions
- mix UI labels into domain calculations
- use owner display names as identifiers
- hide invalid assumptions
- silently normalize shares to 100%
- mutate templates during calculation
- hard-code real-world legal or tax conclusions

## Implementation Principle

Calculations must be boring, traceable, and testable.

A user should be able to answer:

> Which input caused this number?