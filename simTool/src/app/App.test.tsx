import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App shell", () => {
  it("switches input and visualization tabs", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("tab", { name: "Capex" }));
    expect(screen.getByText("Renovierung")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Beitraege" }));
    expect(screen.getByText("Initialbedarf")).toBeInTheDocument();
  });
});
