import { Download, FolderOpen, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { calculateAll } from "../calculations/calculateAll";
import { buildProjectSnapshot } from "../calculations/buildProjectSnapshot";
import { createProjectManifest } from "../persistence/ProjectManifest";
import {
  defaultProjectState,
  initialDirtyState
} from "../state/projectStore";
import type { VisualizationTab } from "../state/uiStore";
import { AutosaveStatus } from "../ui/status/AutosaveStatus";
import { DiagnosticsPanel } from "../ui/status/DiagnosticsPanel";
import { DirtyStateIndicator } from "../ui/status/DirtyStateIndicator";
import { FileActionButton } from "../ui/buttons/FileActionButton";
import { formatDateTime } from "../utils/dates";
import type { TemplateKind } from "../domain/templates";
import { InputTabs } from "./layout/InputTabs";
import { TwoColumnLayout } from "./layout/TwoColumnLayout";
import { VisualizationTabs } from "./layout/VisualizationTabs";
import "./App.css";

export function App() {
  const projectState = useMemo(() => defaultProjectState, []);
  const [selectedInput, setSelectedInput] = useState<TemplateKind>("ownership");
  const [selectedVisualization, setSelectedVisualization] =
    useState<VisualizationTab>("liquidity");
  const snapshot = useMemo(() => buildProjectSnapshot(projectState), [projectState]);
  const result = useMemo(() => calculateAll(snapshot), [snapshot]);
  const manifest = useMemo(
    () => createProjectManifest(projectState, snapshot.metadata.calculatedAt),
    [projectState, snapshot.metadata.calculatedAt]
  );

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="project-title">
          <p className="eyebrow">simTool</p>
          <h1>{manifest.name}</h1>
          <span>Berechnet: {formatDateTime(snapshot.metadata.calculatedAt)}</span>
        </div>
        <div className="status-row">
          <DirtyStateIndicator dirtyState={initialDirtyState} />
          <AutosaveStatus />
        </div>
        <div className="button-row">
          <FileActionButton label="Projekt laden" icon={FolderOpen} />
          <FileActionButton label="Projekt speichern" icon={Save} />
          <FileActionButton label="Export" icon={Download} />
        </div>
      </header>

      <aside className="disclaimer">
        Dieses Tool dient nur der Szenariomodellierung. Es stellt keine Rechts-,
        Steuer-, Finanzierungs- oder Anlageberatung dar. Alle Annahmen, Kosten,
        Zinssaetze, Gesellschaftsformen und steuerlichen Effekte muessen vor
        Entscheidungen extern geprueft werden.
      </aside>

      <TwoColumnLayout
        left={
          <InputTabs
            projectState={projectState}
            selectedKind={selectedInput}
            onSelectKind={setSelectedInput}
          />
        }
        right={
          <>
            <VisualizationTabs
              result={result}
              selectedTab={selectedVisualization}
              onSelectTab={setSelectedVisualization}
            />
            <DiagnosticsPanel diagnostics={result.diagnostics} />
          </>
        }
      />
    </div>
  );
}
