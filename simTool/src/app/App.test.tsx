import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App shell", () => {
  it("switches input and visualization tabs", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("tab", { name: "Capex" }));
    expect(screen.getByText("Renovierung")).toBeInTheDocument();
    expect(screen.getByText("Finanzierung")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Beitraege" }));
    expect(screen.getByText("Initialbedarf")).toBeInTheDocument();
  });

  it("updates calculations when direct numeric inputs change", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("tab", { name: "Immobilie" }));
    fireEvent.change(screen.getByLabelText("Kaufpreis"), {
      target: { value: "1000000" }
    });

    fireEvent.click(screen.getByRole("tab", { name: "Beitraege" }));

    expect(screen.getByText(/231\.640/)).toBeInTheDocument();
  });

  it("does not render the removed disclaimer text", () => {
    render(<App />);

    expect(
      screen.queryByText(/Dieses Tool dient nur der Szenariomodellierung/i)
    ).not.toBeInTheDocument();
  });
});
