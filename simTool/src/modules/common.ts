import type {
  TemplateEnvelope,
  TemplateKind,
  TemplateSchemaId
} from "../domain/templates";
import type { DiagnosticMessage } from "../validation/diagnostics";
import { hasBlockingDiagnostics } from "../validation/diagnostics";

export const CURRENT_TEMPLATE_VERSION = 1;
export const DEFAULT_TEMPLATE_TIMESTAMP = "2026-05-15T00:00:00.000Z";

export type ValidationResult = {
  hasErrors: boolean;
  diagnostics: DiagnosticMessage[];
};

export function validationResult(
  diagnostics: DiagnosticMessage[]
): ValidationResult {
  return {
    hasErrors: hasBlockingDiagnostics(diagnostics),
    diagnostics
  };
}

export type InputModule<TTemplate extends TemplateEnvelope<unknown>> = {
  kind: TemplateKind;
  label: string;
  schemaId: TemplateSchemaId;
  fileSuffix: string;
  defaultTemplate: TTemplate;
  migrate(input: unknown): TTemplate;
  validate(template: TTemplate): ValidationResult;
};

export type RegisteredInputModule = {
  kind: TemplateKind;
  label: string;
  schemaId: TemplateSchemaId;
  fileSuffix: string;
  defaultTemplate: TemplateEnvelope<unknown>;
  migrate(input: unknown): TemplateEnvelope<unknown>;
  validate(template: TemplateEnvelope<unknown>): ValidationResult;
};

export function registerInputModule<TTemplate extends TemplateEnvelope<unknown>>(
  module: InputModule<TTemplate>
): RegisteredInputModule {
  return {
    kind: module.kind,
    label: module.label,
    schemaId: module.schemaId,
    fileSuffix: module.fileSuffix,
    defaultTemplate: module.defaultTemplate,
    migrate: module.migrate,
    validate: (template) => module.validate(template as TTemplate)
  };
}
