# Persistence

## Purpose

This document defines how the app stores, loads, saves, imports, and exports data.

The app is hosted as a static GitHub Pages website. It must not assume server-side storage unless a separately deployed exchange or sync endpoint is explicitly configured.

All persistence must work in a browser-only environment.

## Core Principle

Persistence is explicit, local-first, and adapter-based.

The app must support:

- local autosave
- manual template load/save/save-as
- manual project load/save/save-as
- portable project export/import
- browser compatibility fallbacks

The app must not assume it can write back to its own GitHub repository without explicit authentication.

## Supported Storage Modes

The MVP supports these storage modes:

| Mode | Purpose | Required |
|---|---|---|
| IndexedDB | Autosave and local draft recovery | Yes |
| JSON upload/download | Universal import/export fallback | Yes |
| File System Access API | Better local file workflow where supported | Optional but recommended |
| ZIP import/export | Portable complete project package | Recommended |
| GitHub repository adapter | Explicit authenticated remote sync | Optional |

## Browser Storage Reality

A static website cannot silently write arbitrary files to the user's disk.

It also cannot write to its own GitHub repository without explicit authentication and write permissions.

Therefore, `Save` behavior depends on available capabilities:

- If a file handle exists, overwrite the selected file.
- If no file handle exists, perform `Save As`.
- If direct file writing is unsupported, trigger a JSON download.

## Storage Adapter Interface

The app must access persistence through an adapter interface.

Do not call browser file APIs directly from React form components.

```ts
export type StorageAdapter = {
  name: string;

  capabilities: {
    directSave: boolean;
    directoryAccess: boolean;
    projectPackage: boolean;
    remoteSync: boolean;
  };

  loadTemplate<T>(kind: TemplateKind): Promise<TemplateFile<T>>;
  saveTemplate<T>(file: TemplateFile<T>): Promise<void>;
  saveTemplateAs<T>(file: TemplateFile<T>): Promise<TemplateRef>;

  loadProject(): Promise<ProjectManifest>;
  saveProject(project: ProjectManifest): Promise<void>;
  saveProjectAs(project: ProjectManifest): Promise<ProjectRef>;
};
```

## Required Adapters

### IndexedDbAdapter

Purpose:

- autosave current project state
- recover last local draft
- store recent project metadata
- store recent template metadata
- optionally cache imported templates

This adapter is not the primary user-facing file format.

It is a safety net.

### DownloadUploadAdapter

Purpose:

- load files via file picker
- save files via browser download
- work in all modern browsers

This is the required universal fallback.

### FileSystemAccessAdapter

Purpose:

- provide native-feeling `Load`, `Save`, and `Save As`
- reuse file handles after user permission
- support project folder workflows where browser allows it

This adapter is optional but recommended.

### GitHubRepoAdapter

Purpose:

- store project/template files in a GitHub repository
- support explicit authenticated sync

This adapter exists for the project manifest. It uses the GitHub Contents API and keeps JSON upload/download as fallback.

Supported authentication modes:

- manual token in session storage
- GitHub OAuth web flow with a separately deployed exchange endpoint

GitHub Pages must not contain the OAuth client secret. The frontend only stores the returned access token for the current browser session.

## Autosave

Autosave must use IndexedDB.

Autosave should store the current working project state after edits.

Autosave should not replace explicit user saves.

Recommended autosave content:

```ts
type AutosaveRecord = {
  id: "current";
  projectName?: string;
  savedAt: string;
  projectState: ProjectState;
  validationState: ValidationSummary;
  loadedTemplateRefs?: Partial<Record<TemplateKind, TemplateRef>>;
};
```

Autosave should happen:

- after input changes
- after template load
- after project load
- after successful migration

Autosave should not happen:

- while a file is invalid
- while migration failed
- during incomplete import
- during user-cancelled file operations

## Startup Behavior

On app startup:

1. initialize storage adapters
2. check whether IndexedDB contains an autosave
3. if autosave exists, offer to restore it or restore automatically depending on UX choice
4. if no autosave exists, load default demo templates
5. build project snapshot
6. run calculations
7. show persistence status

The app must not block startup because File System Access API is unavailable.

## Template Actions

Each input tab supports:

- Load
- Save
- Save As

### Load Template

Flow:

```text
User clicks Load
  ↓
Adapter opens file picker or upload control
  ↓
JSON is read
  ↓
Schema identifier is checked
  ↓
Migration runs if needed
  ↓
Current schema validation runs
  ↓
Only this input module is replaced
  ↓
Autosave runs
  ↓
Calculations rerun
```

A loaded template must match the expected template kind.

Example:

- Ownership tab may load `.ownership.json`
- Ownership tab must reject `.opex.json`

### Save Template

Flow:

```text
User clicks Save
  ↓
If existing writable file handle exists:
    overwrite file
  Else:
    run Save As
  ↓
Update template metadata
  ↓
Update dirty flag
```

If save fails, the app must keep the user's current state.

### Save Template As

Flow:

```text
User clicks Save As
  ↓
Create current template JSON
  ↓
Validate generated JSON
  ↓
If direct file writing is available:
    ask user for target filename
    write file
  Else:
    download JSON file
  ↓
Store new template reference if available
```

Generated filenames should use readable kebab-case.

Example:

```text
standard-owners.ownership.json
```

## Project Actions

The overall project supports:

- Load Project
- Save Project
- Save Project As
- Export Portable Project
- Import Portable Project

### Load Project

Flow:

```text
User loads project manifest
  ↓
Parse JSON
  ↓
Validate project schema
  ↓
Migrate project manifest if needed
  ↓
Load referenced templates if possible
  ↓
Check template hashes if present
  ↓
Use embedded snapshots if referenced templates are unavailable
  ↓
Build project state
  ↓
Autosave
  ↓
Build snapshot
  ↓
Run calculations
```

If referenced templates cannot be loaded and no embedded snapshot exists, show a blocking error.

### Save Project

Flow:

```text
User clicks Save Project
  ↓
Create project manifest
  ↓
Calculate template hashes
  ↓
Optionally embed snapshots
  ↓
Validate generated manifest
  ↓
Overwrite existing file if possible
  ↓
Otherwise run Save Project As
```

### Save Project As

Flow:

```text
User clicks Save Project As
  ↓
Create new project manifest
  ↓
Generate new project file name
  ↓
Write or download file
  ↓
Update current project reference
```

### Export Portable Project

Portable export should create one package containing:

```text
project.immo-project.json
templates/
  ownership/
  legal-form/
  capex/
  property/
  closing-costs/
  opex/
```

Preferred file type:

```text
.immo-project.zip
```

A portable project must be loadable without access to the original file paths.

### Import Portable Project

Flow:

```text
User imports ZIP
  ↓
Read project manifest
  ↓
Read included templates
  ↓
Validate all files
  ↓
Check hashes
  ↓
Build project state
  ↓
Autosave
  ↓
Run calculations
```

Invalid files must be listed clearly.

## Project Manifest Robustness

A project file should not rely only on file paths.

It should include:

- template references
- template hashes
- optional embedded snapshots
- metadata

Recommended behavior:

| Case | Behavior |
|---|---|
| referenced template loads and hash matches | load normally |
| referenced template loads but hash differs | warn user |
| referenced template missing but embedded snapshot exists | load snapshot with warning |
| referenced template missing and no snapshot exists | block load |
| project schema unsupported | block load |
| project version old but migratable | migrate and warn/info |
| project version unsupported | block load |

## Hashing

Use SHA-256 hashes for templates.

Hash the canonical JSON representation, not arbitrary pretty-printed JSON.

Recommended canonicalization:

- stable key ordering
- no transient fields if intentionally excluded
- deterministic encoding

Do not include browser file handles in hashes.

## Dirty State

Track dirty state separately for:

- each input template
- overall project manifest
- autosave

Example:

```ts
type DirtyState = {
  ownership: boolean;
  legalForm: boolean;
  capex: boolean;
  property: boolean;
  closingCosts: boolean;
  opex: boolean;
  project: boolean;
};
```

A template becomes dirty when its input module changes after load/save.

The project becomes dirty when:

- a template reference changes
- project metadata changes
- template hashes change
- embedded snapshots change

## File Handles

File handles are runtime-only objects.

They must not be serialized into JSON.

They may be stored in memory.

If browser support allows persistent handles through IndexedDB, treat them as an enhancement only.

The app must continue working without persistent file handles.

## Fallback Behavior

When File System Access API is unavailable:

- `Load` uses file upload
- `Save` behaves like `Save As`
- `Save As` downloads a JSON file
- project export downloads JSON or ZIP

The UI must clearly indicate that direct overwrite is unavailable.

## Conflict Handling

Conflicts can happen when:

- a template file changed outside the app
- project hash does not match referenced template
- two users edited different copies
- imported project references missing files

Conflict handling should be explicit.

Minimum MVP behavior:

- detect hash mismatch
- show warning
- allow user to continue with loaded template
- allow user to use embedded snapshot if available

Do not silently overwrite external changes.

## Error Categories

Use explicit persistence error categories:

```ts
type PersistenceErrorCode =
  | "USER_CANCELLED"
  | "INVALID_JSON"
  | "UNKNOWN_SCHEMA"
  | "WRONG_TEMPLATE_KIND"
  | "UNSUPPORTED_VERSION"
  | "MIGRATION_FAILED"
  | "VALIDATION_FAILED"
  | "MISSING_TEMPLATE"
  | "HASH_MISMATCH"
  | "WRITE_FAILED"
  | "READ_FAILED"
  | "UNSUPPORTED_BROWSER_FEATURE";
```

User-cancelled file operations should not be shown as fatal errors.

## Security and Privacy Rules

Project files may contain sensitive financial or ownership information.

Therefore:

- do not upload project data anywhere by default
- do not include analytics containing user-entered financial values
- do not include real project data in public demo files
- do not store access tokens in project files
- do not commit real user project files to the repository
- do not implement GitHub write-back without explicit authentication design

## GitHub Sync Policy

GitHub sync is an explicit optional mode.

Required design topics before implementation:

- OAuth exchange endpoint or manual token fallback
- token storage
- repository selection
- private repository warning
- branch strategy
- commit message strategy
- conflict detection
- pull before push
- overwrite protection
- clear user consent

Never hard-code a personal access token.

Never put repository credentials in frontend source code.

Never put a GitHub OAuth client secret into a `VITE_...` variable.

## UI Status Requirements

The UI should show persistence status.

Examples:

- `Autosaved locally`
- `Unsaved changes`
- `Saved to file`
- `Direct file save unavailable`
- `Template hash changed`
- `Loaded from embedded snapshot`
- `Export successful`
- `Import failed`

Status messages should be specific enough to guide the user.

## Testing Requirements

Add tests for:

- saving and loading template JSON
- rejecting wrong template kind
- project manifest validation
- hash mismatch detection
- embedded snapshot fallback
- autosave restore
- save fallback behavior
- migration before validation
- invalid JSON handling

Mock browser APIs where needed.

## Anti-Patterns

Do not:

- save domain data only in `localStorage`
- store large project files in `localStorage`
- put file reading logic in form components
- persist formatted currency strings
- persist React component state as domain data
- assume paths are always resolvable
- assume GitHub Pages can mutate repository files
- silently discard invalid imported data
- silently overwrite changed files
- treat autosave as a user-approved project save

## Implementation Principle

Persistence must protect the user from data loss.

When in doubt:

1. keep the current in-memory state
2. show a warning
3. offer export
4. avoid destructive overwrite

---

## Implementation Status: JSON Fallback And Legacy Migration

As of 2026-05-15:

- Project load/save/export and visible template load/save/export use browser JSON upload/download fallback.
- Failed JSON parsing, wrong template kind, and validation errors keep the current in-memory state unchanged and surface diagnostics.
- Project files without `financing` are loaded with the default financing template and an informational diagnostic.
- Project files without `strategy` are loaded with the default strategy template and an informational diagnostic.
- Legacy property snapshots without Austria fields are normalized to `country: "AT"`; old German federal-state codes are cleared and reported for review.
- Legacy project files that still store closing costs in `closingCosts` are migrated into `property.closingCosts` if the property snapshot has no embedded closing costs.
- Legacy project files that still store renovation capex in `capex.items` are migrated into `property.renovationItems` if the property snapshot has no embedded renovation items.
- `capex` and `closingCosts` remain embedded in project JSON for compatibility, even when not shown as separate UI tabs.
