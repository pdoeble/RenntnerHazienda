import type { TemplateEnvelope, TemplateKind, TemplateRef } from "../domain/templates";
import type { ProjectManifest } from "./ProjectManifest";

export type TemplateFile<TData> = {
  kind: TemplateKind;
  ref?: TemplateRef;
  template: TemplateEnvelope<TData>;
};

export type ProjectRef = {
  id?: string;
  name?: string;
  path?: string;
  storageMode?: TemplateRef["storageMode"];
};

export type StorageCapabilities = {
  directSave: boolean;
  directoryAccess: boolean;
  projectPackage: boolean;
  remoteSync: boolean;
};

export type StorageAdapter = {
  name: string;
  capabilities: StorageCapabilities;
  loadTemplate<TData>(kind: TemplateKind): Promise<TemplateFile<TData>>;
  saveTemplate<TData>(file: TemplateFile<TData>): Promise<void>;
  saveTemplateAs<TData>(file: TemplateFile<TData>): Promise<TemplateRef>;
  loadProject(): Promise<ProjectManifest>;
  saveProject(project: ProjectManifest): Promise<void>;
  saveProjectAs(project: ProjectManifest): Promise<ProjectRef>;
};

export class PersistenceFeatureNotImplementedError extends Error {
  constructor(adapterName: string, methodName: string) {
    super(`${adapterName}.${methodName} is not implemented in the scaffold.`);
    this.name = "PersistenceFeatureNotImplementedError";
  }
}
