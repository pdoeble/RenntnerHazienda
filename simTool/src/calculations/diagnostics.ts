import { inputModules } from "../modules/registry";
import type { ProjectSnapshot } from "./types";
import type { DiagnosticMessage } from "../validation/diagnostics";

export function collectInputDiagnostics(
  snapshot: ProjectSnapshot
): DiagnosticMessage[] {
  return inputModules.flatMap((module) => {
    const template = snapshot[module.kind];
    return module.validate(template).diagnostics;
  });
}
