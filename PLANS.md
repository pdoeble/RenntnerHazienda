# ThermoExpress PLANS.md

This file defines how executable implementation plans (ExecPlans) are written and maintained.
## Purpose
- This file defines the planning process contract
- This file is plan-unspecific by design; never add content that belongs only to one concrete plan.
- This file MUST NOT contain active initiative scopes, file lists, or status logs.
- Ensure plans are executable, testable, and contract-safe.
- Keep project-specific contract gates visible before implementation.

## Canonical Planning Structure
- `AGENTS.md` defines when an ExecPlan is mandatory. If unsure, write a plan.
- `PLANS.md` (this file): generic planning rules and ExecPlan template.
- `plans/YYYY-MM-DD-HH-MM_<short-slug>.md`: one concrete ExecPlan per initiative.
- `plans/Archive/`: completed or superseded ExecPlans.
- `plans/qa/`: reports, inventories, audits, and non-plan documents.

## Non-Negotiable Quality Rules

### 1) Self-contained
- No dependency on chat context.
- Define terms and assumptions.
- Reference concrete files and functions with full paths.
- Include evidence for assumptions (for example `rg` hits, code references, existing tests).

### 2) Verifiable
- Each milestone must define exact checks.
- Include commands and expected outcomes.
- Include acceptance criteria that can be measured.

### 3) Incremental
- Split into independently verifiable milestones.
- Prefer additive steps before destructive steps.
- For risky migrations, preserve fallback behavior until target behavior is proven.

### 4) Living document
- Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` updated while working.
- Never leave silent decisions undocumented.
- If Progress is 100% complete, the last mandatory checklist step MUST move the file to `plans/Archive/`.

## ThermoExpress Contract Gates (Mandatory in Every ExecPlan)
Each ExecPlan MUST evaluate `CURRENT`, `TARGET`, and `OPEN DECISION` for:
- Copy-back scope and artifact policy.
- Stage-contract minimum artifacts.
- Manifest/hash minimum schema.
- Exit-codes (`CURRENT` vs `TARGET`).
- Also when affected: atomic writes, session/locking, reproducibility/determinism, write ownership.

Required additional fields in every ExecPlan:
- `Contract Mode`: `CURRENT-only` or `TARGET-migration` or `mixed`.
- `No-Behavior-Change Guard`: if a gate remains `OPEN DECISION`, state explicit fallback policy (`behavior unchanged`) unless decision is forced in plan.
- `Open Decision SLA`: each open decision gets `Owner`, `Deadline`, and `Fallback`.
- Record explicit follow-up decision task.
`

## Verification Matrix by Change Class
- `docs-only`: link check + grep-based consistency checks.
- `code-only (no contract impact)`: `pre-commit` + `pytest` in `TE_DEV`.
- `data-contract/io`: add schema/path/ownership checks and determinism/hash checks.
- `pipeline/cli`: add stage smoke or dry-run, artifact presence checks, exit-code validation.

## Minimal Blocking Decisions
These 4 MUST be clear before large implementation plans can execute:
1. Copy-back scope.
2. Stage-contract minimum artifacts.
3. Manifest/hash minimum schema.
4. Exit-code policy (`CURRENT` vs `TARGET`).

Fallback rule until resolved:
- If unresolved and behavior would change, keep behavior unchanged and log an explicit `OPEN DECISION` entry.

## Housekeeping Rules
- Do not append active initiative sections to `PLANS.md`.
- Keep `plans/` focused on executable plans only.
- Move reports/inventories to `plans/qa/`.
- Keep archive history in `plans/Archive/`.

## ExecPlan Template (copy to `plans/YYYY-MM-DD-HH-MM_<short-slug>.md`)
## ExecPlan Template (copy into `plans/...md`)
```md
# <Short action-oriented title>

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current.

## Purpose / Big Picture
- User/system value after change:
- Observable behavior proving success:

## Contract Mode
- `CURRENT-only` | `TARGET-migration` | `mixed`

## Progress
- [ ] (YYYY-MM-DD HH:MM) Step ...
- [ ] (YYYY-MM-DD HH:MM) Move this file to plans/Archive/<same-filename>.md as final completion step.

## Surprises & Discoveries
- Observation:
- Evidence:

## Decision Log
- Decision:
- Rationale:
- Date/Author:

## Outcomes & Retrospective
- Achieved:
- Open:
- Improve next time:

## Context and Orientation
- Relevant modules/files (full paths):
- Data-path model (workcopy vs original vs cluster):
- Term definitions (`run_id`, `workcopy`, `copy_back`, `stage`, `manifest`, `inputs_hash`):
- Current-state evidence (`rg`, file refs, function refs):

## Scope
- In scope:
- Out of scope:

## Affected Files
- `path/to/file_a`
- `path/to/file_b`

## Contract Gates (ThermoExpress)
### Gate Summary
| Topic | CURRENT (evidence) | TARGET (wiki) | Plan handling |
|---|---|---|---|
| Copy-back scope |  |  |  |
| Stage-contract minimum artifacts |  |  |  |
| Manifest/hash minimum schema |  |  |  |
| Exit-codes |  |  |  |
| Atomic writes/idempotency (if relevant) |  |  |  |
| Session/locking (if relevant) |  |  |  |

### Open Decision SLA
- OPEN DECISION:
- Owner:
- Deadline:
- Fallback:

### No-Behavior-Change Guard
- [ ] If required gate stays open and behavior would change, keep current behavior unchanged.
- [ ] Record explicit follow-up decision task.

## Minimal Blocking Decisions
1) Copy-back scope:
- Decision needed? yes/no
- Plan policy until decided:

2) Stage-contract minimum artifacts:
- Required per stage (`manifest.json`, `solver.log`, payload, `status/events` policy):

3) Manifest/hash minimum schema:
- Required fields (`run_id`, `stage`, `inputs_hash`, settings-hash, seed-policy, version/env, ...):

4) Exit-codes CURRENT vs TARGET:
- Codes for new CLIs:
- Deviation handling:

## Plan of Work

### Milestone 1 - <Name>
- Goal:
- Changes (files/modules):
- Verification:

### Milestone 2 - <Name>
- Goal:
- Changes:
- Verification:

## Concrete Steps

### Setup / Environment

### Checks

### Investigations (read-only)
- `rg -n "<pattern>" <path>`
  - Expected:

### Execution / Smoke (if relevant)
- Command:
- Expected artifacts (paths/files):

## Validation and Acceptance
- Criterion 1:
  - Check:
  - Expected result:
- Criterion 2:
  - Check:
  - Expected result:

## Risks / Rollback / Recovery
- Risks:
- Rollback:
- Recovery for partial outputs/crashes/stale locks:

## References
- Wiki sources:
- Code paths:
- Tests/fixtures:
```
