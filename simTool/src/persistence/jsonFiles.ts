import type { TemplateEnvelope, TemplateKind } from "../domain/templates";
import { TEMPLATE_KINDS, TEMPLATE_SCHEMA_IDS } from "../domain/templates";
import { getInputModule } from "../modules/registry";
import { defaultProjectState, type ProjectState } from "../state/projectStore";
import type { DiagnosticMessage } from "../validation/diagnostics";
import { diagnostic } from "../validation/diagnostics";
import { formatValidationError } from "../validation/validationErrors";
import { projectManifestSchema, type ProjectManifest } from "./ProjectManifest";

export type LoadResult<T> =
  | { ok: true; value: T; diagnostics: DiagnosticMessage[] }
  | { ok: false; diagnostics: DiagnosticMessage[] };

export function parseJson(raw: string): LoadResult<unknown> {
  try {
    return {
      ok: true,
      value: JSON.parse(raw) as unknown,
      diagnostics: []
    };
  } catch {
    return {
      ok: false,
      diagnostics: [
        diagnostic(
          "persistence.invalid-json",
          "error",
          "persistence",
          "Datei enthaelt kein gueltiges JSON."
        )
      ]
    };
  }
}

export function loadTemplateFromJson(
  kind: TemplateKind,
  raw: string
): LoadResult<TemplateEnvelope<unknown>> {
  const parsed = parseJson(raw);
  if (!parsed.ok) {
    return parsed;
  }

  const schema = readSchemaIdentifier(parsed.value);
  const expectedSchema = TEMPLATE_SCHEMA_IDS[kind];
  if (schema !== expectedSchema) {
    return {
      ok: false,
      diagnostics: [
        diagnostic(
          "persistence.wrong-template-kind",
          "error",
          "persistence",
          `Expected schema "${expectedSchema}", received "${schema ?? "unknown"}".`
        )
      ]
    };
  }

  const module = getInputModule(kind);
  try {
    const template = module.migrate(parsed.value);
    return {
      ok: true,
      value: template,
      diagnostics: module.validate(template).diagnostics
    };
  } catch (error) {
    return {
      ok: false,
      diagnostics: [
        diagnostic(
          "persistence.validation-failed",
          "error",
          "persistence",
          formatValidationError(error)
        )
      ]
    };
  }
}

export function loadProjectFromJson(raw: string): LoadResult<ProjectState> {
  const parsed = parseJson(raw);
  if (!parsed.ok) {
    return parsed;
  }

  let manifest: ProjectManifest;
  try {
    manifest = projectManifestSchema.parse(parsed.value) as ProjectManifest;
  } catch (error) {
    return {
      ok: false,
      diagnostics: [
        diagnostic(
          "persistence.project-validation-failed",
          "error",
          "persistence",
          formatValidationError(error)
        )
      ]
    };
  }

  const diagnostics: DiagnosticMessage[] = [];
  const nextProjectState = {} as ProjectState;

  for (const kind of TEMPLATE_KINDS) {
    const embeddedSnapshot = manifest.embeddedSnapshots?.[kind];
    const fallbackSnapshot =
      kind === "financing" ? defaultProjectState.financing : undefined;
    const input = embeddedSnapshot ?? fallbackSnapshot;

    if (!input) {
      return {
        ok: false,
        diagnostics: [
          diagnostic(
            `persistence.project-missing-${kind}`,
            "error",
            "persistence",
            `Project file does not contain an embedded "${kind}" template.`
          )
        ]
      };
    }

    if (!embeddedSnapshot && kind === "financing") {
      diagnostics.push(
        diagnostic(
          "persistence.default-financing-added",
          "info",
          "persistence",
          "Project file had no financing template; default financing was added."
        )
      );
    }

    try {
      const module = getInputModule(kind);
      const template = module.migrate(input);
      Object.assign(nextProjectState, { [kind]: template });
      diagnostics.push(...module.validate(template).diagnostics);
    } catch (error) {
      return {
        ok: false,
        diagnostics: [
          diagnostic(
            `persistence.project-${kind}-validation-failed`,
            "error",
            "persistence",
            formatValidationError(error)
          )
        ]
      };
    }
  }

  return {
    ok: true,
    value: nextProjectState,
    diagnostics
  };
}

export function serializeJsonFile(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function readSchemaIdentifier(value: unknown): string | undefined {
  if (!value || typeof value !== "object" || !("schema" in value)) {
    return undefined;
  }

  const schema = (value as { schema?: unknown }).schema;
  return typeof schema === "string" ? schema : undefined;
}
