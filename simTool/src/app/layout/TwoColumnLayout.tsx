import type { ReactNode } from "react";

export type WorkspaceMode = "input" | "visualization" | "both";

type TwoColumnLayoutProps = {
  left: ReactNode;
  right: ReactNode;
  mode: WorkspaceMode;
  compact: boolean;
};

export function TwoColumnLayout({
  left,
  right,
  mode,
  compact
}: TwoColumnLayoutProps) {
  const effectiveMode = compact && mode === "both" ? "input" : mode;
  const showInput = effectiveMode === "input" || effectiveMode === "both";
  const showVisualization =
    effectiveMode === "visualization" || effectiveMode === "both";

  return (
    <main className={`workspace workspace-${effectiveMode}`}>
      <section
        className="workspace-column input-column"
        aria-label="Eingaben"
        hidden={!showInput}
      >
        {left}
      </section>
      <section
        className="workspace-column visualization-column"
        aria-label="Visualisierungen"
        hidden={!showVisualization}
      >
        {right}
      </section>
    </main>
  );
}
