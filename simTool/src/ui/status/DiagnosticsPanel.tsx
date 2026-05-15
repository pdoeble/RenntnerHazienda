import type { DiagnosticMessage } from "../../validation/diagnostics";

type DiagnosticsPanelProps = {
  diagnostics: readonly DiagnosticMessage[];
};

const severityLabels: Record<DiagnosticMessage["severity"], string> = {
  error: "Fehler",
  warning: "Warnung",
  info: "Info"
};

export function DiagnosticsPanel({ diagnostics }: DiagnosticsPanelProps) {
  if (diagnostics.length === 0) {
    return (
      <section className="diagnostics diagnostics-empty" aria-label="Diagnosen">
        <strong>Keine Diagnosen</strong>
        <span>Die aktuellen Annahmen erzeugen keine Meldungen.</span>
      </section>
    );
  }

  return (
    <section className="diagnostics" aria-label="Diagnosen">
      <div className="section-heading">
        <h2>Diagnosen</h2>
        <span>{diagnostics.length}</span>
      </div>
      <ul>
        {diagnostics.map((diagnostic) => (
          <li key={diagnostic.id} className={`diagnostic-${diagnostic.severity}`}>
            <span>{severityLabels[diagnostic.severity]}</span>
            <p>{diagnostic.message}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
