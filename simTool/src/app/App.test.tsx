import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

describe("App shell", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("switches input and visualization tabs", async () => {
    render(<App />);

    expect(
      screen.queryByRole("tab", { name: "Nebenkosten" })
    ).not.toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Finanzierung" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Strategie" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Immobilie" }));
    expect(screen.getByText("Renovierungen")).toBeInTheDocument();
    expect(screen.getByText("Nebenkosten")).toBeInTheDocument();

    expect(screen.getByRole("tab", { name: "Dashboard" })).toHaveAttribute(
      "aria-selected",
      "true"
    );

    fireEvent.click(screen.getByRole("tab", { name: "Beitraege" }));
    expect(screen.getByText("Monatsbeitrag")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Cashflow" }));
    expect(screen.getByText("Bankrate Monat 1")).toBeInTheDocument();
    expect(screen.getByText("Bank Zins")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Darlehen" }));
    expect(screen.getByText("Rate Monat 1")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Punkte" }));
    expect(screen.getByText("Jahrespunkt-Pool")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Mein Anteil" }));
    expect(screen.getByText("Projektionsjahre")).toBeInTheDocument();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => "# Testwiki"
      })
    );
    fireEvent.click(screen.getByRole("tab", { name: "Wiki" }));
    await screen.findByRole("heading", { name: "Testwiki" });
  });

  it("updates calculations when direct numeric inputs change", () => {
    render(<App />);

    fireEvent.change(screen.getAllByLabelText("Eigenkapital")[0], {
      target: { value: "100000" }
    });

    fireEvent.click(screen.getByRole("tab", { name: "Beitraege" }));

    expect(screen.getAllByText(/245\.000/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Monatlich gesamt")).toBeInTheDocument();
  });

  it("updates strategy targets and shows the capital bridge", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("tab", { name: "Strategie" }));
    fireEvent.change(screen.getByLabelText("Zielliquiditaet"), {
      target: { value: "60000" }
    });

    fireEvent.click(screen.getByRole("tab", { name: "Kapitalbedarf" }));

    expect(screen.getByText("Gesamtbedarf")).toBeInTheDocument();
    expect(screen.getByText("USt bei Kauf")).toBeInTheDocument();
    expect(screen.getByText("Pfandrecht / Eintragung")).toBeInTheDocument();
  });

  it("adds and deletes owners, renovations, and opex blocks", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Eigner hinzufuegen" }));
    expect(screen.getByDisplayValue("Eigner 10")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Loeschen" }).at(-1)!);
    expect(screen.queryByDisplayValue("Eigner 10")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Immobilie" }));
    fireEvent.click(screen.getByRole("button", { name: "Hinzufuegen" }));
    expect(screen.getByDisplayValue("Renovierung 1")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Loeschen" }).at(-1)!);
    expect(screen.queryByDisplayValue("Renovierung 1")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Opex" }));
    expect(screen.getByText("Opex-Plausibilitaet")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Opex-Block hinzufuegen" })
    );
    expect(screen.getByDisplayValue("Kostenblock 3")).toBeInTheDocument();
  });

  it("imports listing text into property fields", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("tab", { name: "Immobilie" }));
    fireEvent.change(screen.getByLabelText("Inserat-Text"), {
      target: {
        value: [
          "Test Waldchalet Pfunds mit Bergpanorama",
          "Kaufpreis 670.000 EUR",
          "Wohnflaeche 280 m2",
          "Grundstuecksflaeche 1.940 m2",
          "Gartenflaeche 635 m2",
          "6 Zimmer",
          "2 Badezimmer",
          "6542 Pfunds Tirol",
          "Garage Provisionsfrei Holzbauweise"
        ].join("\n")
      }
    });
    fireEvent.click(screen.getByRole("button", { name: "Text auswerten" }));
    expect(screen.getByText("Text ausgewertet. Bitte Vorschau pruefen und uebernehmen.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Vorschau uebernehmen" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Objekttitel")).toHaveValue(
        "Test Waldchalet Pfunds mit Bergpanorama"
      );
    });
    expect(screen.getByLabelText("Gemeinde")).toHaveValue("Pfunds");
    expect(screen.getByLabelText("Kaufpreis")).toHaveValue(670000);
  });

  it("does not render the removed disclaimer text", () => {
    render(<App />);

    expect(
      screen.queryByText(/Dieses Tool dient nur der Szenariomodellierung/i)
    ).not.toBeInTheDocument();
  });

  it("uses load dropdowns and hides redundant success/status hints", () => {
    render(<App />);

    expect(screen.getByLabelText("Projekt laden")).toBeInTheDocument();
    expect(screen.getAllByLabelText("Laden")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Upload...").length).toBeGreaterThanOrEqual(2);
    expect(
      screen.queryByText("Schema und Moduldiagnosen sind gueltig.")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Autosave vorbereitet")).not.toBeInTheDocument();
    expect(screen.queryByText("JSON-Fallback bereit")).not.toBeInTheDocument();
  });
});
