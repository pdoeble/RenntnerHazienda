# Financing Logic Blueprint for the Austrian Co-Ownership App

## Scope and grounding

This report is written for the implementation agent who has to clean up the current app draft and make its calculations legally and financially coherent. The project-grounded baseline available here is the uploaded synthesis from the other agent, which already frames the app as an object-based case calculator for prospective members and flags unresolved issues around ownership structure, private use versus rental use, taxes, banking viability, and Austrian legal forms. The original project files beginning with `00` were not retrievable in this chat, so the report below aligns to that synthesis plus current Austrian public sources rather than to the unretrieved files themselves. fileciteturn0file0

The most important public constraints that materially affect the app logic are these. In Austria, acquisition costs are not just purchase price: the official government guidance lists real estate transfer tax at 3.5% of purchase price, land-registry fee at 1.1%, mortgage-registry fee at 1.2% of the secured lien plus an €81 filing fee, broker commission caps under the brokerage rules plus 20% VAT, and legal/notary costs typically around 1% to 3% of purchase price. The same guidance was updated on January 1, 2026. citeturn43view0

For private residential lending, the Austrian FMA stated on June 26, 2025 that, after the end of the KIM-V, it still regards the former core underwriting rules as reference values for solid lending: maximum 90% loan-to-value, maximum 40% income burden, and maximum 35-year maturity. Banks may deviate, but the FMA still treats these as the benchmark for prudent credit origination. citeturn49view2turn49view3turn49view4

VAT treatment in Austria is also not uniform. The Ministry of Finance states that certain real-estate lettings are VAT-exempt and then do **not** entitle the landlord to deduct input VAT; residential lettings, hotel accommodation, and camping are stated at 10%; parking, garages, and certain short-term lettings of up to 14 days are stated at 20%; and small businesses can be VAT-exempt but may opt into VAT liability. citeturn46view2turn46view4turn46view5

Those three areas alone mean the app cannot be a simple “share price divided by member count” tool. It has to be a proper financing and accounting engine.

## Recommended financial model architecture

The app should be rebuilt around **four separate but reconcilable views**:

| View | What it answers | Must reconcile with |
|---|---|---|
| Object view | Is the property itself economically viable? | Entity view |
| Entity view | Can the legal wrapper carry debt, costs, reserves, and distributions? | Object view + member view |
| Member view | What does one person pay, use, earn, and risk? | Entity view |
| Lender view | Is the debt serviceable under base and stress cases? | Object view + entity view |

The key implementation mistake to avoid is mixing these layers. A member contribution is **equity funding**, not revenue. A private-use night is **consumption or foregone market income**, not occupancy. Mortgage amortization is **cash outflow**, not P&L expense in full. VAT-inclusive and VAT-exclusive values must never be stored in the same field.

The cleanest naming convention is to enforce four suffix families across the entire system:

- `_net` for ex-VAT amounts  
- `_vat` for VAT amount  
- `_gross` for VAT-inclusive amounts  
- `_annual`, `_monthly`, `_oneoff` for time basis  

Every record should also carry `scope` and `scenario` metadata:

```text
scope ∈ {object, entity, member, lender}
scenario_id
case_id
currency
tax_mode
legal_wrapper
period_start
period_end
assumption_source
```

The app should also distinguish three discrete identifiers:

```text
object_id   = the real asset being analyzed
case_id     = one legal-financial design for that object
scenario_id = one assumption set applied to that case
```

That separation is essential, because the same apartment building may be modeled as direct co-ownership, a GmbH/FlexCo vehicle, a Genossenschaft, or a Verein-based structure, with multiple financing and occupancy scenarios for each. That is exactly the kind of comparison the current project synthesis is moving toward. fileciteturn0file0

The entity cash waterfall should be hardcoded in this order:

```text
gross operating inflows
- channel and payment fees
- variable operating costs
- fixed operating costs
= NOI_pre_reserve

NOI_pre_reserve
- maintenance reserve / capex reserve
- admin / compliance / legal overhead
= underwriting_cash_flow

underwriting_cash_flow
- interest
- scheduled principal
= post_debt_cash_flow

post_debt_cash_flow
- tax cash effects
- liquidity top-up to minimum cash floor
= distributable_cash
```

This is the right order because it prevents the app from overstating “member yield” by distributing money that should first be reserved for maintenance, debt service, and minimum liquidity.

## Calculation rules and formulas

### Acquisition and sources-and-uses logic

The first non-negotiable formula is the all-in acquisition cost.

```text
purchase_cost_all_in_gross
= purchase_price_gross
+ real_estate_transfer_tax
+ land_registry_fee
+ mortgage_registry_fee
+ filing_fees
+ broker_fee_gross
+ legal_notary_fee_gross
+ signature_certification_fee
+ technical_due_diligence_gross
+ renovation_initial_gross
+ furniture_ffe_initial_gross
+ financing_fees_gross
+ contingency_gross
```

For Austrian default parameters, the app should initialize but not hardcode these values:

```text
real_estate_transfer_tax_default = 3.5% * purchase_price
land_registry_fee_default       = 1.1% * purchase_price
mortgage_registry_fee_default   = 1.2% * lien_value
filing_fee_default              = 81 EUR per filing
broker_fee_default              = statutory max schedule + 20% VAT
legal_notary_default            = 1% to 3% * purchase_price
```

These are the right default placeholders because they reflect current Austrian public guidance, but they must remain editable at object level, since family transfers, exempt cases, and bespoke fee arrangements can differ. citeturn43view0

The capital stack should then be expressed as:

```text
required_total_funding
= purchase_cost_all_in_gross
+ initial_working_capital
+ initial_reserve_funding
```

```text
required_total_funding
= member_equity_committed
+ external_bank_loan
+ subordinated_member_loans
+ seller_financing
+ grants_non_repayable
+ grants_repayable
```

And a hard validation rule should always pass:

```text
sources_total == uses_total
```

If that identity breaks, every downstream result is unreliable.

### Operations and occupancy logic

The app must model **availability**, **private use**, and **external rental** separately.

```text
calendar_nights_total
= rentable_units * days_in_period
```

```text
technically_available_nights
= calendar_nights_total
- maintenance_blocked_nights
- regulatory_blocked_nights
- owner_commitment_blocked_nights
```

```text
external_rentable_nights
= technically_available_nights
- owner_use_nights_reserved
```

```text
external_occupied_nights
= external_rentable_nights * occupancy_rate_external
```

```text
gross_external_revenue_gross
= external_occupied_nights * ADR_gross
```

```text
net_external_revenue_net
= gross_external_revenue_net
- channel_fees_net
- payment_fees_net
- refunds_and_bad_debt_net
```

The app should not treat owner use as “free” unless the case is explicitly philanthropic or purely non-economic. For any financing concept intended to be evaluated by a banker or tax adviser, owner use must be priced in one of three modes:

```text
owner_use_value_market_offset
= owner_use_nights * expected_net_market_rate * displacement_factor
```

```text
owner_use_value_cost_floor
= owner_use_nights * (variable_cost_per_night + reserve_per_night)
```

```text
owner_use_charge_default
= max(owner_use_value_cost_floor, owner_use_value_market_offset)
```

The safest default is the **hybrid floor/market-offset rule**, because it avoids the two main distortions: understating the economic cost of private use and overstating revenue at full public-market rates when actual displacement probability is less than 100%.

### Debt, banking view, and member affordability

For annuity loans, use the standard amortization formula:

```text
periodic_interest_rate = nominal_interest_rate / payments_per_year
n = loan_term_years * payments_per_year

periodic_debt_service
= principal
  * [periodic_interest_rate * (1 + periodic_interest_rate)^n]
  / [(1 + periodic_interest_rate)^n - 1]
```

```text
annual_debt_service
= periodic_debt_service * payments_per_year
```

Banker-facing metrics should be computed from **underwriting cash flow**, not from raw rent.

```text
DSCR
= underwriting_cash_flow / annual_debt_service
```

```text
LTV_initial
= external_bank_loan / value_basis_for_lender
```

```text
debt_burden_ratio_member
= annual_member_financing_cost / annual_member_net_income
```

The Austrian FMA’s current benchmark for prudent private housing finance is still 90% LTV, 40% income burden, and 35-year maturity, even though banks may justify deviations. The app should therefore implement these as the default “bank sanity check” thresholds, while labeling them clearly as **prudential benchmark values**, not as universal legal pass/fail rules for every corporate structure. citeturn49view2turn49view3turn49view4

### Tax and accounting mode logic

Tax logic should be **parameterized**, not hardcoded into one universal formula. The app should offer at least these VAT modes:

```text
vat_mode ∈ {
  exempt_real_estate_lease,
  residential_10pct,
  hotel_or_camping_10pct,
  short_term_14d_or_less_20pct,
  parking_or_garage_20pct,
  kleinunternehmer_exempt,
  opt_in_to_vat
}
```

This is the minimum because Austrian VAT treatment differs materially by use category, and input VAT deductibility differs accordingly. Exempt real-estate letting generally means no output VAT and no input VAT deduction; certain short-term uses and parking are taxable at 20%; residential and hospitality categories cited by the Ministry are at 10%; and Kleinunternehmen may be exempt unless they opt in. citeturn46view2turn46view4turn46view5

For bookkeeping, the app should output **both cash and accrual views**:

```text
cash_view:
opening_cash
+ cash_in
- cash_out
= closing_cash
```

```text
accrual_pnl:
revenue_earned
- operating_expenses
- depreciation
- interest_expense
= pre_tax_profit
```

```text
balance_sheet:
assets
= liabilities + equity
```

That sounds obvious, but it is where rudimentary ownership apps usually fail. A banker wants debt service and reserves. A tax adviser wants accrual logic and tax classification. A member wants cash paid in, nights used, and cash paid out. One screen cannot substitute for all three views.

## Austrian legal wrapper comparison for the calculator

The app should support at least four wrapper families, but it should not present them as equivalent.

### Direct private co-ownership

Use this only as a bespoke mode for a small, stable, trust-based group. From an implementation standpoint it is the simplest to describe but the hardest to govern cleanly once shares, exits, deadlocks, unequal use, or refinancing need to be modeled. The app should therefore treat direct co-ownership as a **special case** rather than the default.

### Verein

Under the Austrian Vereinsgesetz 2002, a Verein is a voluntary, durable association of at least two persons, organized by statutes, pursuing a common **ideational** purpose; the law explicitly states that a Verein may not be “calculated for profit,” and its assets may only be used in accordance with its purpose. It has legal personality. The BMI’s official guidance also confirms that an Austrian Verein consists of at least two persons, is created through statutes plus the association procedure, and that registration in the Vereinsregister is not what constitutes legal personality in the way a German e.V. works. For accounting, the Vereinsgesetz requires receipts-and-payments accounting with asset overview as the base regime, and if ordinary revenues or expenses exceed €1 million in each of two consecutive financial years, the association must prepare annual financial statements instead of a pure Einnahmen-Ausgaben-Rechnung. citeturn29view0turn30view2turn30view3turn31view1turn31view2

That makes the Verein a poor default wrapper for a member-ownership app **if the central promise is private economic participation in a property plus exitable capital interests**. It is suitable if the real purpose is community, common mission, or shared use with strongly limited private return expectations. In the app, a Verein case should therefore default to:

- no private equity value per member by default  
- restricted or no profit distribution by default  
- strong purpose lock  
- mandatory statute fields for governance and dispute resolution  

### GmbH and FlexCo

The Austrian GmbH may be formed for any lawful purpose by one or more persons. Under the GmbHG, the minimum share capital is €10,000 and each capital contribution must be at least €70. The articles require notarial form. The law also allows additional contributions beyond the nominal capital if the articles provide for them, which is useful for capital calls in later renovation or refinancing rounds. citeturn20view0turn20view3turn20view4turn20view5

That makes the GmbH the best default wrapper for a **closed member group with a fixed cap table**, especially when bankability, limited liability, clean capital accounts, and transfer restrictions matter more than open membership. The app should model a GmbH case with:

```text
member_equity_account_i
member_share_percent_i
optional_additional_contribution_commitment_i
distribution_right_i
transfer_restriction_rule
```

For FlexCo, the official USP states that single-member GmbH and single-member FlexCo can be formed online via e-start-up and that simplified formation without a notary is available in that workflow. citeturn45view0turn45view1turn45view4

Because the detailed FlexCo feature set was not fully retrievable here, the safest implementation rule is:

```text
model FlexCo as GmbH-like in v1,
but expose a separate legal_wrapper = FlexCo flag
for counsel-specific governance extensions later
```

That is the right engineering compromise.

### Genossenschaft

Under the Austrian Genossenschaftsgesetz, a Genossenschaft is a legal-person association with a **non-closed membership base** whose essential purpose is to promote the acquisition or economic interests of its members. Members do not generally owe the cooperative’s creditors directly, though the law provides for unpaid contributions and certain supplementary payments in insolvency or liquidation contexts. The law also provides for a Vorstand, Generalversammlung, and an Aufsichtsrat once the cooperative permanently employs at least forty employees. citeturn40view0turn40view1turn41view0turn41view1turn41view2turn42view0

This makes the Genossenschaft the strongest default wrapper when the project goal is **member promotion and use**, not just capital return. If members are supposed to enter and leave over time, obtain usage rights, and participate under a purpose of mutual economic benefit, this is often the most conceptually coherent legal family in Austrian law. In the app, a Genossenschaft case should therefore support:

```text
member_business_purpose
admission_rule
withdrawal_rule
member_use_rights
board_governance
general_assembly_logic
revision_and_compliance_overhead
```

### Practical recommendation

For the app’s first serious Austrian version, the default ranking should be:

- **GmbH / FlexCo** for a closed investor-user group with clear equity economics
- **Genossenschaft** for an open or semi-open member-promotion model
- **Verein** for an ideational or community-purpose model with limited private return logic
- **Direct co-ownership** only as a narrow bespoke mode

That ranking is an implementation inference from the legal features above, not a substitute for formal legal advice. citeturn29view0turn30view2turn20view3turn20view5turn40view0turn41view0

## KPI set that the app must expose

The app should publish **one shared KPI dictionary** and then show filtered subsets for members, lenders, and advisers. The following set is the minimum serious core.

| KPI | Formula | Why it matters |
|---|---|---|
| All-in acquisition cost | `purchase_cost_all_in / purchase_price` | Shows how much the deal is burdened by taxes, fees, and setup costs |
| Equity ratio | `equity_total / total_funding` | Tells banker and members how much real risk capital is in the structure |
| Initial LTV | `bank_loan / lender_value_basis` | Banking viability and covenant headroom |
| Weighted funding cost | `sum(source_amount * source_cost) / total_interest_bearing_funding` | Shows capital stack quality |
| External occupancy | `external_occupied_nights / external_rentable_nights` | Core commercial demand signal |
| ADR | `gross_external_revenue / external_occupied_nights` | Revenue quality per sold night |
| Revenue per available rentable night | `net_external_revenue / external_rentable_nights` | Better than ADR alone because it captures both price and volume |
| NOI pre reserve | `net_revenue - opex` | Pure operating strength before capital protection |
| Underwriting cash flow | `NOI_pre_reserve - reserve - admin_overhead` | Better denominator for debt serviceability |
| DSCR | `underwriting_cash_flow / annual_debt_service` | Primary lender metric |
| Break-even occupancy | `(fixed_opex + reserve + debt_service) / contribution_margin_per_night / external_rentable_nights` | How much occupancy is needed not to burn cash |
| Break-even ADR | `(fixed_opex + reserve + debt_service) / occupied_nights + variable_cost_per_night` | Price threshold for viability |
| Liquidity runway | `closing_cash / average_monthly_cash_outflow` | Detects near-term distress |
| Reserve adequacy | `actual_reserve / target_reserve` | Shows whether maintenance is underfunded |
| Member all-in ticket | `initial_paid_in + financed_member_costs + fees` | Real entry requirement per person |
| Effective owner-use cost per night | `member_cash_out + opportunity_cost_of_use / owner_nights_used` | Prevents the illusion of “cheap free nights” |
| Cash-on-cash yield | `annual_member_cash_distribution / member_equity_paid_in` | Simple annual member return |
| Member IRR | IRR of member cash flow stream | Best comparable long-term metric |
| Exit multiple | `net_exit_payout / cumulative_member_cash_in` | Helps non-finance users understand terminal outcome |
| Downside cash gap | `min(0, stressed_closing_cash)` | Shows whether rescue capital is needed in stress |

Two KPI families should be anchored explicitly to Austrian public guidance rather than invented ad hoc. The acquisition-cost metrics must reflect Austrian ancillary transaction costs, and the lender benchmark metrics should compare against the FMA’s current 90% / 40% / 35-year reference rules. citeturn43view0turn49view2turn49view3

The app should also display **red-flag diagnostics**, not just numeric KPIs:

```text
flag_ltv_high
flag_dscr_below_threshold
flag_negative_distributable_cash
flag_reserve_underfunded
flag_member_shares_not_100pct
flag_owner_use_exceeds_policy
flag_vat_mode_inconsistent
flag_balance_sheet_not_balanced
flag_sources_uses_not_balanced
```

That is the minimum needed for a meaningful review by a banker or tax adviser.

## Visualizations and implementation controls

The current draft should be rebuilt around a small number of high-value visualizations rather than lots of decorative charts.

### Visualizations that are genuinely necessary

A **sources-and-uses waterfall** should show purchase price, taxes, fees, renovation, reserves, debt, and member equity. This immediately exposes whether the project is really a property purchase or a fee-heavy structure. Austrian acquisition costs are large enough that this chart is not cosmetic; it is decision-critical. citeturn43view0

An **operating cash waterfall** should show revenue, fees, variable costs, fixed costs, reserve, debt service, and distributable cash. This is the single best chart for explaining to a non-specialist why “high rent” does not automatically mean “high payout.”

An **occupancy and use mix chart** should split the calendar into external rental nights, owner-use nights, maintenance blocks, and vacancy. Without this, users will constantly overestimate achievable revenue.

A **debt profile chart** should plot annual debt service, outstanding principal, and DSCR over time. This is the banker chart.

A **sensitivity heatmap** should show at least two axes at once. The best default pairs are:

```text
occupancy_rate_external × ADR
interest_rate × LTV
owner_use_nights × occupancy_rate_external
renovation_overrun × exit_value
```

A **member cash-flow timeline** should show cash in, usage charges, annual distributions, and exit payout. This is the member chart.

A **case comparison matrix** should put legal wrappers side by side on the same object: capital required, recurring overhead, reserve need, debt headroom, and member cash yield. That is how a decision-maker will actually compare a GmbH/FlexCo case against a cooperative or association case.

### QA and acceptance tests that must be built into the engine

The implementation agent should not ship the revised app unless these identities and tests are enforced automatically:

```text
sources_total == uses_total
assets == liabilities + equity
opening_cash + cash_in - cash_out == closing_cash
sum(member_share_percent) == 100%
external_occupied_nights <= external_rentable_nights
owner_use_nights + external_rentable_nights <= technically_available_nights
distributable_cash == 0 if liquidity_floor_not_met and lockup_enabled
```

VAT logic also needs explicit consistency checks. If a scenario is marked VAT-exempt, then the model must not deduct input VAT from related exempt costs. If a scenario is marked as a taxable short-term letting or parking model, input VAT deduction rules need to switch accordingly. That requirement follows directly from the Ministry of Finance guidance. citeturn46view2turn46view4turn46view5

The legal-wrapper layer also needs hard logic gates:

```text
if legal_wrapper == Verein:
    disable default equity-valuation language
    require purpose field
    require statute-governance fields
    warn if payout logic is primary feature

if legal_wrapper in {GmbH, FlexCo}:
    require share capital
    require cap table
    enable optional additional contributions
    require transfer rule

if legal_wrapper == Genossenschaft:
    require member-promotion purpose
    require admission/withdrawal logic
    require board/general assembly governance
```

That prevents the UI from promising economics the legal wrapper does not naturally support.

## Open questions and limitations

The largest limitation is simple: the `00*` project files that the user referenced were not actually retrievable in this conversation, so this report is grounded in the uploaded cross-agent synthesis rather than a line-by-line reading of those files. Some wording or field names in the original project may therefore still need reconciliation. fileciteturn0file0

The app should also **not** pretend that it can finalize Austrian legal and tax treatment object-independently. Local tourism taxes, zoning rules, second-home restrictions, accommodation rules, and some VAT and transfer-tax edge cases remain location- and fact-specific. The uploaded synthesis already flags those legal/regulatory uncertainties, and the public Austrian tax guidance confirms that VAT treatment changes materially with use pattern. fileciteturn0file0 citeturn46view2turn46view4turn46view5

The most robust implementation path is therefore this:

1. separate object economics from wrapper economics,  
2. use Austrian public-law defaults only as editable parameters,  
3. default to GmbH/FlexCo or Genossenschaft rather than Verein for economic member-ownership cases, and  
4. show project, lender, and member views separately.

That is the minimum needed to turn the current rudimentary app into something a prospective co-owner, banker, or tax adviser can actually trust.