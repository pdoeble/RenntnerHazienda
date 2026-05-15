import type { TemplateEnvelope, TemplateKind } from "../domain/templates";
import { TEMPLATE_SCHEMA_IDS } from "../domain/templates";
import { getInputModule } from "../modules/registry";
import type { DiagnosticMessage } from "../validation/diagnostics";
import { diagnostic } from "../validation/diagnostics";
import { formatValidationError } from "../validation/validationErrors";

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
