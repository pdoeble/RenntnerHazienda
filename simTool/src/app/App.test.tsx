import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App shell", () => {
  it("switches input and visualization tabs", () => {
    render(<App />);

    expect(
      screen.queryByRole("tab", { name: "Nebenkosten" })
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Immobilie" }));
    expect(screen.getByText("Renovierungen")).toBeInTheDocument();
    expect(screen.getByText("Nebenkosten")).toBeInTheDocument();
    expect(screen.getByText("Finanzierung")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Beitraege" }));
    expect(screen.getByText("Initialbedarf")).toBeInTheDocument();
  });

  it("updates calculations when direct numeric inputs change", () => {
    render(<App />);

    fireEvent.change(screen.getAllByLabelText("Eigenkapital")[0], {
      target: { value: "100000" }
    });

    fireEvent.click(screen.getByRole("tab", { name: "Beitraege" }));

    expect(screen.getAllByText(/250\.000/)).toHaveLength(2);
  });

  it("adds and deletes owners, renovations, and opex blocks", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Eigner hinzufuegen" }));
    expect(screen.getByDisplayValue("Eigner 7")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Loeschen" }).at(-1)!);
    expect(screen.queryByDisplayValue("Eigner 7")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Immobilie" }));
    fireEvent.click(screen.getByRole("button", { name: "Hinzufuegen" }));
    expect(screen.getByDisplayValue("Renovierung 2")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Loeschen" }).at(-1)!);
    expect(screen.queryByDisplayValue("Renovierung 2")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Opex" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Opex-Block hinzufuegen" })
    );
    expect(screen.getByDisplayValue("Kostenblock 3")).toBeInTheDocument();
  });

  it("does not render the removed disclaimer text", () => {
    render(<App />);

    expect(
      screen.queryByText(/Dieses Tool dient nur der Szenariomodellierung/i)
    ).not.toBeInTheDocument();
  });
});
