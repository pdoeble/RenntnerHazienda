import type { ReactNode } from "react";

type TwoColumnLayoutProps = {
  left: ReactNode;
  right: ReactNode;
};

export function TwoColumnLayout({ left, right }: TwoColumnLayoutProps) {
  return (
    <main className="workspace">
      <section className="workspace-column input-column" aria-label="Eingaben">
        {left}
      </section>
      <section
        className="workspace-column visualization-column"
        aria-label="Visualisierungen"
      >
        {right}
      </section>
    </main>
  );
}
