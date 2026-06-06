import { useEffect, useMemo, useState } from "react";
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
  getStoredGithubToken,
  githubProjectConfig,
  loadGithubProject,
  saveGithubProject,
  setStoredGithubToken
} from "../persistence/githubProject";
import {
  beginGithubOAuthLogin,
  clearGithubOAuthCallbackParams,
  completeGithubOAuthCallback,
  githubOAuthConfig,
  hasGithubOAuthCallback,
  isGithubOAuthConfigured
} from "../persistence/githubOAuth";
import {
  defaultProjectState,
  initialDirtyState,
  type DirtyState,
  type ProjectState
} from "../state/projectStore";
import type { VisualizationTab } from "../state/uiStore";
import { DiagnosticsPanel } from "../ui/status/DiagnosticsPanel";
import { formatDateTime } from "../utils/dates";
import type { TemplateKind } from "../domain/templates";
import { InputTabs, type InputPanelTab } from "./layout/InputTabs";
import {
  TwoColumnLayout,
  type WorkspaceMode
} from "./layout/TwoColumnLayout";
import { VisualizationTabs } from "./layout/VisualizationTabs";
import "./App.css";

const COMPACT_WORKSPACE_QUERY = "(max-width: 980px)";

export function App() {
  const [compactWorkspace, setCompactWorkspace] = useState(() =>
    matchesCompactWorkspace()
  );
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>(() =>
    matchesCompactWorkspace() ? "input" : "both"
  );
  const [projectState, setProjectState] = useState<ProjectState>(() =>
    structuredClone(defaultProjectState)
  );
  const [dirtyState, setDirtyState] = useState<DirtyState>(initialDirtyState);
  const [persistenceMessage, setPersistenceMessage] = useState("");
  const [persistenceDiagnostics, setPersistenceDiagnostics] = useState<
    ReturnType<typeof calculateAll>["diagnostics"]
  >([]);
  const [selectedInput, setSelectedInput] = useState<InputPanelTab>("project");
  const [selectedVisualization, setSelectedVisualization] =
    useState<VisualizationTab>("dashboard");
  const [githubToken, setGithubToken] = useState(() => getStoredGithubToken() ?? "");
  const githubOAuth = useMemo(() => githubOAuthConfig(), []);
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

  useEffect(() => {
    if (!hasGithubOAuthCallback()) {
      return;
    }

    void completeGithubOAuthCallback(undefined, githubOAuth)
      .then((result) => {
        if (!result) {
          return;
        }
        setGithubToken(result.token);
        setStoredGithubToken(result.token);
        setPersistenceMessage("GitHub OAuth-Anmeldung erfolgreich");
      })
      .catch((error: unknown) => {
        setPersistenceMessage(githubErrorMessage(error, "GitHub OAuth fehlgeschlagen"));
      })
      .finally(() => {
        clearGithubOAuthCallbackParams();
      });
  }, [githubOAuth]);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia(COMPACT_WORKSPACE_QUERY);
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setCompactWorkspace(event.matches);
      if (event.matches) {
        setWorkspaceMode((current) => (current === "both" ? "input" : current));
      }
    };

    handleChange(mediaQuery);
    mediaQuery.addEventListener?.("change", handleChange);
    return () => mediaQuery.removeEventListener?.("change", handleChange);
  }, []);

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

  async function loadProjectFromGithub() {
    try {
      const githubFile = await loadGithubProject(githubToken || null);
      if (!githubFile) {
        setPersistenceMessage("Kein GitHub-Projekt gefunden; Demo bleibt aktiv");
        return;
      }

      const loaded = loadProjectFromJson(githubFile.content);
      setPersistenceDiagnostics(loaded.diagnostics);
      if (!loaded.ok) {
        setPersistenceMessage("GitHub-Projekt konnte nicht geladen werden");
        return;
      }

      setProjectState(loaded.value);
      setDirtyState(initialDirtyState);
      setPersistenceMessage("GitHub-Projekt geladen");
    } catch (error) {
      setPersistenceMessage(githubErrorMessage(error, "GitHub-Projekt laden fehlgeschlagen"));
    }
  }

  async function saveProjectToGithub() {
    try {
      if (!githubToken.trim()) {
        setPersistenceMessage("GitHub-Token fehlt");
        return;
      }

      setStoredGithubToken(githubToken);
      const currentManifest = createProjectManifest(
        projectState,
        new Date().toISOString()
      );
      await saveGithubProject(serializeJsonFile(currentManifest), githubToken);
      setDirtyState(initialDirtyState);
      setPersistenceDiagnostics([]);
      setPersistenceMessage("Projekt nach GitHub geschrieben");
    } catch (error) {
      setPersistenceMessage(githubErrorMessage(error, "GitHub-Speichern fehlgeschlagen"));
    }
  }

  function startGithubOAuth() {
    try {
      beginGithubOAuthLogin(githubOAuth);
    } catch (error) {
      setPersistenceMessage(githubErrorMessage(error, "GitHub OAuth starten fehlgeschlagen"));
    }
  }

  function disconnectGithub() {
    setGithubToken("");
    setStoredGithubToken(null);
    setPersistenceMessage("GitHub-Anmeldung entfernt");
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
          <h1>RenntnerHazienda</h1>
          <span>Berechnet: {formatDateTime(snapshot.metadata.calculatedAt)}</span>
        </div>
        <WorkspaceModeControl
          mode={workspaceMode}
          compact={compactWorkspace}
          onChange={setWorkspaceMode}
        />
      </header>

      <TwoColumnLayout
        mode={workspaceMode}
        compact={compactWorkspace}
        left={
          <InputTabs
            projectState={projectState}
            calculationResult={result}
            projectPanel={{
              projectName: manifest.name,
              calculatedAt: snapshot.metadata.calculatedAt,
              dirtyState,
              persistenceMessage,
              githubToken,
              githubConfigLabel: `${githubProjectConfig().owner}/${githubProjectConfig().repo}:${githubProjectConfig().path}`,
              githubOAuthConfigured: isGithubOAuthConfigured(githubOAuth),
              githubOAuthLabel: githubOAuth.clientId
                ? `OAuth App ${githubOAuth.clientId}, Scope ${githubOAuth.scope}`
                : "OAuth nicht konfiguriert",
              onGithubTokenChange: setGithubToken,
              onGithubTokenBlur: () => setStoredGithubToken(githubToken),
              onGithubOAuthLogin: startGithubOAuth,
              onGithubDisconnect: disconnectGithub,
              onLoadProject: () => void loadProject(),
              onSaveProject: () => saveProject("projekt"),
              onExportProject: () => saveProject("projekt-portable"),
              onLoadGithub: () => void loadProjectFromGithub(),
              onSaveGithub: () => void saveProjectToGithub()
            }}
            selectedKind={selectedInput}
            onSelectKind={setSelectedInput}
            onTemplateChange={replaceTemplate}
            onLoadTemplate={(kind) => void loadTemplate(kind)}
            onSaveTemplate={saveTemplate}
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

function WorkspaceModeControl({
  mode,
  compact,
  onChange
}: {
  mode: WorkspaceMode;
  compact: boolean;
  onChange: (mode: WorkspaceMode) => void;
}) {
  const options: { mode: WorkspaceMode; label: string }[] = [
    { mode: "input", label: "Eingabe" },
    { mode: "visualization", label: "Darstellung" },
    { mode: "both", label: "Beide" }
  ];

  return (
    <div
      className="workspace-mode-control"
      role="group"
      aria-label="Arbeitsbereich anzeigen"
    >
      {options.map((option) => {
        const disabled = compact && option.mode === "both";
        return (
          <button
            key={option.mode}
            type="button"
            aria-pressed={mode === option.mode}
            className={mode === option.mode ? "active" : ""}
            disabled={disabled}
            title={
              disabled ? "Auf schmalen Bildschirmen nicht verfügbar" : undefined
            }
            onClick={() => onChange(option.mode)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function matchesCompactWorkspace(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(COMPACT_WORKSPACE_QUERY).matches
  );
}

function githubErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && "status" in error) {
    const status = (error as Error & { status: number }).status;
    if (status === 401 || status === 403) {
      return "GitHub-Token hat keine Berechtigung oder ist ungueltig";
    }
    if (status === 409) {
      return "GitHub-Konflikt: Projekt wurde zwischenzeitlich geaendert";
    }
    return `${fallback}: HTTP ${status}`;
  }
  return error instanceof Error ? error.message : fallback;
}

function templateSuffix(kind: TemplateKind): string {
  const suffixes: Record<TemplateKind, string> = {
    ownership: ".ownership.json",
    legalForm: ".legal-form.json",
    capex: ".capex.json",
    property: ".property.json",
    closingCosts: ".closing-costs.json",
    opex: ".opex.json",
    financing: ".financing.json",
    strategy: ".strategy.json"
  };
  return suffixes[kind];
}
