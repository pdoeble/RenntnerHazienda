import { z } from "zod";
import type { TemplateEnvelope, TemplateKind, TemplateRef } from "../domain/templates";
import { TEMPLATE_KINDS } from "../domain/templates";
import {
  idSchema,
  nonEmptyStringSchema
} from "../validation/commonSchemas";
import type { ProjectState } from "../state/projectStore";

export type ProjectMetadata = {
  appVersion?: string;
  currency?: "EUR";
  locale?: "de-DE";
  timeHorizonMonths?: number;
  notes?: string;
};

export type ProjectTemplateSnapshot = {
  [Kind in TemplateKind]: ProjectState[Kind];
};

export type ProjectManifest = {
  schema: "immo-finance.project";
  version: number;
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  templateRefs: Record<TemplateKind, TemplateRef>;
  templateHashes?: Partial<Record<TemplateKind, string>>;
  embeddedSnapshots?: Partial<ProjectTemplateSnapshot>;
  metadata?: ProjectMetadata;
};

export const templateRefSchema = z
  .object({
    kind: z.enum(TEMPLATE_KINDS),
    path: z.string().optional(),
    name: z.string().optional(),
    id: z.string().optional(),
    storageMode: z
      .enum(["file", "download", "indexeddb", "github", "embedded"])
      .optional()
  })
  .strict();

export const projectManifestSchema = z
  .object({
    schema: z.literal("immo-finance.project"),
    version: z.literal(1),
    id: idSchema,
    name: nonEmptyStringSchema,
    description: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    templateRefs: z.object({
      ownership: templateRefSchema.extend({ kind: z.literal("ownership") }),
      legalForm: templateRefSchema.extend({ kind: z.literal("legalForm") }),
      capex: templateRefSchema.extend({ kind: z.literal("capex") }),
      property: templateRefSchema.extend({ kind: z.literal("property") }),
      closingCosts: templateRefSchema.extend({
        kind: z.literal("closingCosts")
      }),
      opex: templateRefSchema.extend({ kind: z.literal("opex") }),
      financing: templateRefSchema
        .extend({ kind: z.literal("financing") })
        .optional(),
      strategy: templateRefSchema
        .extend({ kind: z.literal("strategy") })
        .optional()
    }),
    templateHashes: z.record(z.enum(TEMPLATE_KINDS), z.string()).optional(),
    embeddedSnapshots: z.record(z.enum(TEMPLATE_KINDS), z.unknown()).optional(),
    metadata: z
      .object({
        appVersion: z.string().optional(),
        currency: z.literal("EUR").optional(),
        locale: z.literal("de-DE").optional(),
        timeHorizonMonths: z.number().int().positive().optional(),
        notes: z.string().optional()
      })
      .strict()
      .optional()
  })
  .strict();

export function createProjectManifest(
  projectState: ProjectState,
  now = "2026-05-15T00:00:00.000Z"
): ProjectManifest {
  const templateRefs = Object.fromEntries(
    TEMPLATE_KINDS.map((kind) => [
      kind,
      {
        kind,
        id: projectState[kind].id,
        name: projectState[kind].name,
        storageMode: "embedded" as const
      }
    ])
  ) as Record<TemplateKind, TemplateRef>;

  const embeddedSnapshots = Object.fromEntries(
    TEMPLATE_KINDS.map((kind) => [kind, projectState[kind]])
  ) as Partial<Record<TemplateKind, TemplateEnvelope<unknown>>>;

  return {
    schema: "immo-finance.project",
    version: 1,
    id: "project-demo-vertical-core",
    name: "Demo Projekt",
    createdAt: now,
    updatedAt: now,
    templateRefs,
    embeddedSnapshots: embeddedSnapshots as Partial<ProjectTemplateSnapshot>,
    metadata: {
      appVersion: "0.1.0",
      currency: "EUR",
      locale: "de-DE",
      timeHorizonMonths: 360
    }
  };
}
