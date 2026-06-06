import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

describe("App shell", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_GITHUB_OAUTH_CLIENT_ID", "");
    vi.stubEnv("VITE_GITHUB_OAUTH_EXCHANGE_URL", "");
    vi.stubEnv("VITE_ROUTE_PROXY_URL", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("switches input and visualization tabs", async () => {
    render(<App />);

    expect(
      screen.queryByRole("tab", { name: "Nebenkosten" })
    ).not.toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Finanzierung" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Regeln" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Strategie" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Hausvergleich" })).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Zeitachse" })).not.toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Projekt" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByText("GitHub OAuth")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Mit GitHub anmelden" })
    ).toBeDisabled();
    expect(screen.getByPlaceholderText("ghp_...")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Immobilie" }));
    expect(screen.getByText("Renovierungen")).toBeInTheDocument();
    expect(screen.getByText("Nebenkosten")).toBeInTheDocument();
    expect(
      screen.queryByText("Punktregeln fuer Zimmernaechte")
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Regeln" }));
    expect(screen.getByText("Punktregeln fuer Zimmernaechte")).toBeInTheDocument();
    expect(screen.getByLabelText("Basispreis je Zimmernacht")).toHaveValue(6);
    expect(
      screen.getByText("Tilgung veraendert Unternehmensanteile")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Gesellschaftsform" }));
    expect(screen.getByRole("button", { name: "Kostenprofil uebernehmen" })).toBeInTheDocument();
    expect(
      screen.getByText("Miteigentum bedeutet, dass die Beteiligten direkt am Objekt beteiligt sind.")
    ).toBeInTheDocument();
    expect(screen.getAllByText("Planungsspanne").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Beteiligungstabelle").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Darlehenskonten").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Exit / Uebertragung").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Bankfaehigkeit").length).toBeGreaterThanOrEqual(1);

    expect(screen.getByRole("tab", { name: "Uebersicht" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByText("Kennzahlenregister")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Beitraege / Nutzung" }));
    expect(screen.getByText("Monatszahlung gesamt")).toBeInTheDocument();
    expect(screen.getByText("Uebersicht")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Bankkonto-Zahlungsfluss" }));
    expect(screen.getByText("Bankrate Monat 1")).toBeInTheDocument();
    expect(screen.getByText("Bank Zins")).toBeInTheDocument();
    expect(screen.getByText("Bankkonto nach Jahren")).toBeInTheDocument();
    expect(screen.getByText("Monat 1: Zahlungswirksame Kosten")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Darlehen / Banksicht" }));
    expect(screen.getByText("Rate Monat 1")).toBeInTheDocument();
    expect(screen.getByText("Persoenliche Belastungsquote")).toBeInTheDocument();
    expect(screen.getByText("Zins +2 Prozentpunkte")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Punkte" }));
    expect(screen.getByText("Theoretischer Zimmernacht-Pool")).toBeInTheDocument();
    expect(screen.getAllByText("Nutzungsanteil").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Unternehmensanteil").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Phil").length).toBeGreaterThanOrEqual(1);

    fireEvent.click(screen.getByRole("tab", { name: "Mein Anteil" }));
    expect(screen.getByText("Projektionsjahre")).toBeInTheDocument();
    expect(screen.getByText("Wert nach 25 Jahren")).toBeInTheDocument();
    expect(screen.getByText("Persoenliche Wertentwicklung")).toBeInTheDocument();
    expect(screen.getByText("Vermoegenswirksam eingezahlt")).toBeInTheDocument();
    expect(screen.getByText("Insgesamt gezahlt")).toBeInTheDocument();
    expect(screen.getByText(/Eigener Nettovermoegenswert/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Belegung" }));
    expect(screen.getByText("Belegungsdruck")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Hausvergleich" }));
    expect(screen.getByText("Punktplot")).toBeInTheDocument();
    expect(screen.getByText("Interaktive Strassenkarte")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Interaktive Karte mit Wohnorten und Kandidatenhaeusern")
    ).toBeInTheDocument();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => "| A | B |\n|---|---|\n| 1 | 2 |"
      })
    );
    fireEvent.click(screen.getByRole("tab", { name: "Wiki" }));
    await screen.findByRole("table");
  });

  it("switches between input, visualization and both on wide screens", () => {
    mockMatchMedia(false);
    render(<App />);

    const inputButton = screen.getByRole("button", { name: "Eingabe" });
    const visualizationButton = screen.getByRole("button", {
      name: "Darstellung"
    });
    const bothButton = screen.getByRole("button", { name: "Beide" });

    expect(bothButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("region", { name: "Eingaben" })).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Visualisierungen" })
    ).toBeInTheDocument();

    fireEvent.click(inputButton);
    expect(inputButton).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.queryByRole("region", { name: "Visualisierungen" })
    ).not.toBeInTheDocument();

    fireEvent.click(visualizationButton);
    expect(visualizationButton).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.queryByRole("region", { name: "Eingaben" })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Visualisierungen" })
    ).toBeInTheDocument();

    fireEvent.click(bothButton);
    expect(screen.getByRole("region", { name: "Eingaben" })).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Visualisierungen" })
    ).toBeInTheDocument();
  });

  it("starts with input only and disables both on compact screens", () => {
    mockMatchMedia(true);
    render(<App />);

    const inputButton = screen.getByRole("button", { name: "Eingabe" });
    const visualizationButton = screen.getByRole("button", {
      name: "Darstellung"
    });
    const bothButton = screen.getByRole("button", { name: "Beide" });

    expect(inputButton).toHaveAttribute("aria-pressed", "true");
    expect(bothButton).toBeDisabled();
    expect(bothButton).toHaveAttribute(
      "title",
      "Auf schmalen Bildschirmen nicht verfügbar"
    );
    expect(screen.getByRole("region", { name: "Eingaben" })).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "Visualisierungen" })
    ).not.toBeInTheDocument();

    fireEvent.click(visualizationButton);
    expect(visualizationButton).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.queryByRole("region", { name: "Eingaben" })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Visualisierungen" })
    ).toBeInTheDocument();
  });

  it("leaves both mode when the viewport becomes compact", () => {
    const media = mockMatchMedia(false);
    render(<App />);

    expect(screen.getByRole("button", { name: "Beide" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );

    act(() => media.setMatches(true));

    expect(screen.getByRole("button", { name: "Eingabe" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "Beide" })).toBeDisabled();
    expect(
      screen.queryByRole("region", { name: "Visualisierungen" })
    ).not.toBeInTheDocument();

    act(() => media.setMatches(false));

    expect(screen.getByRole("button", { name: "Beide" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Eingabe" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("updates calculations when direct numeric inputs change", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("tab", { name: "Eignerschaft" }));
    fireEvent.change(screen.getAllByLabelText("Start-EK")[0], {
      target: { value: "100000" }
    });

    fireEvent.click(screen.getByRole("tab", { name: "Beitraege / Nutzung" }));

    expect(screen.getAllByText(/285\.000/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Monatlich gesamt")).toBeInTheDocument();
  });

  it("updates strategy targets and shows the capital bridge", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("tab", { name: "Regeln" }));
    fireEvent.click(screen.getByRole("tab", { name: "Strategie" }));
    fireEvent.change(screen.getByLabelText("Zielliquiditaet"), {
      target: { value: "60000" }
    });

    fireEvent.click(screen.getByRole("tab", { name: "Mittelherkunft / Mittelverwendung" }));

    expect(screen.getAllByText("Mittelverwendung").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("USt bei Kauf")).toBeInTheDocument();
    expect(screen.getAllByText("Pfandrecht / Eintragung").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Buchungslogik")).toBeInTheDocument();
    expect(screen.getByText("Umsatzsteuer-Matrix")).toBeInTheDocument();
    expect(screen.getByText("Nutzungsentgelt Beteiligte")).toBeInTheDocument();
  });

  it("adds and deletes owners, renovations, and opex blocks", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("tab", { name: "Eignerschaft" }));
    fireEvent.click(screen.getByRole("button", { name: "Eigner hinzufuegen" }));
    expect(screen.getByDisplayValue("Eigner 12")).toBeInTheDocument();
    expect(screen.getAllByLabelText("Monatsnettoeinkommen").at(-1)).toHaveValue(
      2900
    );
    fireEvent.click(screen.getAllByRole("button", { name: "Loeschen" }).at(-1)!);
    expect(screen.queryByDisplayValue("Eigner 12")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Immobilie" }));
    fireEvent.click(screen.getByRole("button", { name: "Hinzufuegen" }));
    expect(screen.getByDisplayValue("Renovierung 1")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Loeschen" }).at(-1)!);
    expect(screen.queryByDisplayValue("Renovierung 1")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Betriebskosten" }));
    expect(screen.getByText("Betriebskosten-Plausibilitaet")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Betriebskostenblock hinzufuegen" })
    );
    expect(screen.getByDisplayValue("Kostenblock 3")).toBeInTheDocument();
  });

  it("imports listing text into property fields", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("tab", { name: "Immobilie" }));
    fireEvent.click(screen.getByRole("button", { name: "Inserat importieren" }));
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
    expect(screen.getByText("Einzeltab exportieren")).toBeInTheDocument();
    expect(screen.getByLabelText("Einzeltab Kapitel")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Laden" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Speichern" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Immobilie" }));
    expect(screen.queryByLabelText("Laden")).not.toBeInTheDocument();
    expect(screen.queryByText("Upload...")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Schema und Moduldiagnosen sind gueltig.")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Autosave vorbereitet")).not.toBeInTheDocument();
    expect(screen.queryByText("JSON-Fallback bereit")).not.toBeInTheDocument();
  });
});

function mockMatchMedia(initialMatches: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  let matches = initialMatches;
  const mediaQuery = {
    get matches() {
      return matches;
    },
    media: "(max-width: 980px)",
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(
      (_type: string, listener: (event: MediaQueryListEvent) => void) => {
        listeners.add(listener);
      }
    ),
    removeEventListener: vi.fn(
      (_type: string, listener: (event: MediaQueryListEvent) => void) => {
        listeners.delete(listener);
      }
    ),
    dispatchEvent: vi.fn(() => true)
  } as unknown as MediaQueryList;

  vi.stubGlobal("matchMedia", vi.fn(() => mediaQuery));

  return {
    setMatches(nextMatches: boolean) {
      matches = nextMatches;
      const event = {
        matches: nextMatches,
        media: mediaQuery.media
      } as MediaQueryListEvent;
      listeners.forEach((listener) => listener(event));
    }
  };
}
