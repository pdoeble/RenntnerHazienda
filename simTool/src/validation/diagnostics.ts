import type { SourceRef, TemplateKind } from "../domain/templates";

export type DiagnosticSeverity = "error" | "warning" | "info";

export type DiagnosticDomain =
  | TemplateKind
  | "contributions"
  | "liquidity"
  | "cashflow"
  | "debt"
  | "project"
  | "persistence";

export type DiagnosticMessage = {
  id: string;
  severity: DiagnosticSeverity;
  domain: DiagnosticDomain;
  message: string;
  sourceRefs?: SourceRef[];
};

export function hasBlockingDiagnostics(
  diagnostics: readonly DiagnosticMessage[]
): boolean {
  return diagnostics.some((diagnostic) => diagnostic.severity === "error");
}

export function diagnostic(
  id: string,
  severity: DiagnosticSeverity,
  domain: DiagnosticDomain,
  message: string,
  sourceRefs?: SourceRef[]
): DiagnosticMessage {
  return {
    id,
    severity,
    domain,
    message,
    ...(sourceRefs ? { sourceRefs } : {})
  };
}
