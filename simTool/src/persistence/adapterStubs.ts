import type { TemplateKind, TemplateRef } from "../domain/templates";
import type { ProjectManifest } from "./ProjectManifest";
import {
  PersistenceFeatureNotImplementedError,
  type ProjectRef,
  type StorageAdapter,
  type TemplateFile
} from "./StorageAdapter";

function unavailable<T>(adapterName: string, methodName: string): Promise<T> {
  return Promise.reject(
    new PersistenceFeatureNotImplementedError(adapterName, methodName)
  );
}

export function createIndexedDbAdapter(): StorageAdapter {
  const name = "IndexedDbAdapter";
  return {
    name,
    capabilities: {
      directSave: false,
      directoryAccess: false,
      projectPackage: false,
      remoteSync: false
    },
    loadTemplate: <TData>(_kind: TemplateKind) =>
      unavailable<TemplateFile<TData>>(name, "loadTemplate"),
    saveTemplate: <TData>(_file: TemplateFile<TData>) =>
      unavailable<void>(name, "saveTemplate"),
    saveTemplateAs: <TData>(_file: TemplateFile<TData>) =>
      unavailable<TemplateRef>(name, "saveTemplateAs"),
    loadProject: () => unavailable<ProjectManifest>(name, "loadProject"),
    saveProject: (_project: ProjectManifest) =>
      unavailable<void>(name, "saveProject"),
    saveProjectAs: (_project: ProjectManifest) =>
      unavailable<ProjectRef>(name, "saveProjectAs")
  };
}

export function createDownloadUploadAdapter(): StorageAdapter {
  const name = "DownloadUploadAdapter";
  return {
    name,
    capabilities: {
      directSave: false,
      directoryAccess: false,
      projectPackage: false,
      remoteSync: false
    },
    loadTemplate: <TData>(_kind: TemplateKind) =>
      unavailable<TemplateFile<TData>>(name, "loadTemplate"),
    saveTemplate: <TData>(_file: TemplateFile<TData>) =>
      unavailable<void>(name, "saveTemplate"),
    saveTemplateAs: <TData>(_file: TemplateFile<TData>) =>
      unavailable<TemplateRef>(name, "saveTemplateAs"),
    loadProject: () => unavailable<ProjectManifest>(name, "loadProject"),
    saveProject: (_project: ProjectManifest) =>
      unavailable<void>(name, "saveProject"),
    saveProjectAs: (_project: ProjectManifest) =>
      unavailable<ProjectRef>(name, "saveProjectAs")
  };
}

export function createFileSystemAccessAdapter(): StorageAdapter {
  const name = "FileSystemAccessAdapter";
  const fileSystemGlobal = globalThis as typeof globalThis & {
    showSaveFilePicker?: unknown;
    showDirectoryPicker?: unknown;
  };

  return {
    name,
    capabilities: {
      directSave: typeof fileSystemGlobal.showSaveFilePicker === "function",
      directoryAccess: typeof fileSystemGlobal.showDirectoryPicker === "function",
      projectPackage: false,
      remoteSync: false
    },
    loadTemplate: <TData>(_kind: TemplateKind) =>
      unavailable<TemplateFile<TData>>(name, "loadTemplate"),
    saveTemplate: <TData>(_file: TemplateFile<TData>) =>
      unavailable<void>(name, "saveTemplate"),
    saveTemplateAs: <TData>(_file: TemplateFile<TData>) =>
      unavailable<TemplateRef>(name, "saveTemplateAs"),
    loadProject: () => unavailable<ProjectManifest>(name, "loadProject"),
    saveProject: (_project: ProjectManifest) =>
      unavailable<void>(name, "saveProject"),
    saveProjectAs: (_project: ProjectManifest) =>
      unavailable<ProjectRef>(name, "saveProjectAs")
  };
}
