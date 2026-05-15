import { Download, FolderOpen, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { calculateAll } from "../calculations/calculateAll";
import { buildProjectSnapshot } from "../calculations/buildProjectSnapshot";
import type { TemplateEnvelope } from "../domain/templates";
import { createProjectManifest } from "../persistence/ProjectManifest";
import { downloadJsonFile, pickTextFile } from "../persistence/browserFiles";
import {
  loadProjectFromJson,
  loadTemplateFromJson,
  serializeJsonFile
} from "../persistence/jsonFiles";
import {
  defaultProjectState,
  initialDirtyState,
  type DirtyState,
  type ProjectState
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
  const [projectState, setProjectState] = useState<ProjectState>(() =>
    structuredClone(defaultProjectState)
  );
  const [dirtyState, setDirtyState] = useState<DirtyState>(initialDirtyState);
  const [persistenceMessage, setPersistenceMessage] = useState(
    "JSON-Fallback bereit"
  );
  const [persistenceDiagnostics, setPersistenceDiagnostics] = useState<
    ReturnType<typeof calculateAll>["diagnostics"]
  >([]);
  const [selectedInput, setSelectedInput] = useState<TemplateKind>("ownership");
  const [selectedVisualization, setSelectedVisualization] =
    useState<VisualizationTab>("liquidity");
  const snapshot = useMemo(() => buildProjectSnapshot(projectState), [projectState]);
  const result = useMemo(() => calculateAll(snapshot), [snapshot]);
  const diagnostics = useMemo(
    () => [...persistenceDiagnostics, ...result.diagnostics],
    [persistenceDiagnostics, result.diagnostics]
  );
  const manifest = useMemo(
    () => createProjectManifest(projectState, snapshot.metadata.calculatedAt),
    [projectState, snapshot.metadata.calculatedAt]
  );

  function replaceTemplate(
    kind: TemplateKind,
    template: TemplateEnvelope<unknown>
  ) {
    setProjectState((current) => ({
      ...current,
      [kind]: template
    }) as ProjectState);
    setDirtyState((current) => ({
      ...current,
      [kind]: true,
      project: true
    }));
    setPersistenceMessage("Lokale Aenderung, noch nicht exportiert");
  }

  async function loadProject() {
    try {
      const raw = await pickTextFile(".immo-project.json,.json,application/json");
      const loaded = loadProjectFromJson(raw);
      setPersistenceDiagnostics(loaded.diagnostics);
      if (!loaded.ok) {
        setPersistenceMessage("Projekt konnte nicht geladen werden");
        return;
      }

      setProjectState(loaded.value);
      setDirtyState(initialDirtyState);
      setPersistenceMessage("Projekt geladen");
    } catch (error) {
      setPersistenceMessage(
        error instanceof Error ? error.message : "Projekt laden abgebrochen"
      );
    }
  }

  function saveProject(label = "projekt") {
    const currentManifest = createProjectManifest(
      projectState,
      new Date().toISOString()
    );
    downloadJsonFile(
      `${label}.immo-project.json`,
      serializeJsonFile(currentManifest)
    );
    setDirtyState(initialDirtyState);
    setPersistenceDiagnostics([]);
    setPersistenceMessage("Projekt als JSON heruntergeladen");
  }

  async function loadTemplate(kind: TemplateKind) {
    try {
      const raw = await pickTextFile(".json,application/json");
      const loaded = loadTemplateFromJson(kind, raw);
      setPersistenceDiagnostics(loaded.diagnostics);
      if (!loaded.ok) {
        setPersistenceMessage("Template konnte nicht geladen werden");
        return;
      }

      replaceTemplate(kind, loaded.value);
      setPersistenceMessage("Template geladen");
    } catch (error) {
      setPersistenceMessage(
        error instanceof Error ? error.message : "Template laden abgebrochen"
      );
    }
  }

  function saveTemplate(kind: TemplateKind) {
    const template = projectState[kind];
    downloadJsonFile(`${template.id}${templateSuffix(kind)}`, serializeJsonFile(template));
    setDirtyState((current) => ({
      ...current,
      [kind]: false
    }));
    setPersistenceDiagnostics([]);
    setPersistenceMessage("Template als JSON heruntergeladen");
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="project-title">
          <p className="eyebrow">simTool</p>
          <h1>{manifest.name}</h1>
          <span>Berechnet: {formatDateTime(snapshot.metadata.calculatedAt)}</span>
        </div>
        <div className="status-row">
          <DirtyStateIndicator dirtyState={dirtyState} />
          <AutosaveStatus />
          <span className="status-pill">{persistenceMessage}</span>
        </div>
        <div className="button-row">
          <FileActionButton
            label="Projekt laden"
            icon={FolderOpen}
            onClick={() => void loadProject()}
          />
          <FileActionButton
            label="Projekt speichern"
            icon={Save}
            onClick={() => saveProject("projekt")}
          />
          <FileActionButton
            label="Export"
            icon={Download}
            onClick={() => saveProject("projekt-portable")}
          />
        </div>
      </header>

      <TwoColumnLayout
        left={
          <InputTabs
            projectState={projectState}
            selectedKind={selectedInput}
            onSelectKind={setSelectedInput}
            onTemplateChange={replaceTemplate}
            onLoadTemplate={(kind) => void loadTemplate(kind)}
            onSaveTemplate={saveTemplate}
            onExportTemplate={saveTemplate}
          />
        }
        right={
          <>
            <VisualizationTabs
              result={result}
              selectedTab={selectedVisualization}
              onSelectTab={setSelectedVisualization}
            />
            <DiagnosticsPanel diagnostics={diagnostics} />
          </>
        }
      />
    </div>
  );
}

function templateSuffix(kind: TemplateKind): string {
  const suffixes: Record<TemplateKind, string> = {
    ownership: ".ownership.json",
    legalForm: ".legal-form.json",
    capex: ".capex.json",
    property: ".property.json",
    closingCosts: ".closing-costs.json",
    opex: ".opex.json",
    financing: ".financing.json"
  };
  return suffixes[kind];
}
