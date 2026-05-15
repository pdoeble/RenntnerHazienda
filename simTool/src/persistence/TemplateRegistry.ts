import type { TemplateKind } from "../domain/templates";
import { TEMPLATE_FILE_SUFFIXES, TEMPLATE_SCHEMA_IDS } from "../domain/templates";
import { getInputModule, inputModules } from "../modules/registry";

export function getTemplateLabel(kind: TemplateKind): string {
  return getInputModule(kind).label;
}

export function getTemplateFileSuffix(kind: TemplateKind): string {
  return TEMPLATE_FILE_SUFFIXES[kind];
}

export function getTemplateSchemaId(kind: TemplateKind): string {
  return TEMPLATE_SCHEMA_IDS[kind];
}

export const registeredTemplateKinds = inputModules.map((module) => module.kind);
