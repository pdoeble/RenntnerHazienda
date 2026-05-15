import { describe, expect, it } from "vitest";
import { defaultOwnershipTemplate } from "./ownership/defaults";
import { ownershipTemplateSchema } from "./ownership/schema";
import { defaultOpexTemplate } from "./opex/defaults";
import { loadTemplateFromJson, serializeJsonFile } from "../persistence/jsonFiles";
import { migrateVersionedEnvelope } from "../validation/migrationRunner";
import { createDownloadUploadAdapter } from "../persistence/adapterStubs";
import { createProjectManifest, projectManifestSchema } from "../persistence/ProjectManifest";
import { defaultProjectState } from "../state/projectStore";

describe("module validation contracts", () => {
  it("validates a template envelope with schema, version, id, name, and data", () => {
    const parsed = ownershipTemplateSchema.parse(defaultOwnershipTemplate);

    expect(parsed.schema).toBe("immo-finance.ownership");
    expect(parsed.version).toBe(1);
    expect(parsed.id).toBeTruthy();
    expect(parsed.name).toBeTruthy();
    expect(parsed.data.owners).toHaveLength(2);
  });

  it("rejects loading the wrong template kind", () => {
    const result = loadTemplateFromJson(
      "ownership",
      serializeJsonFile(defaultOpexTemplate)
    );

    expect(result.ok).toBe(false);
    expect(result.diagnostics[0]?.id).toBe("persistence.wrong-template-kind");
  });

  it("runs migrations before current-version validation", () => {
    const migrated = migrateVersionedEnvelope(
      { schema: "example", version: 1, name: "old" },
      2,
      {
        1: (input) => ({
          ...(input as Record<string, unknown>),
          version: 2,
          migrated: true
        })
      }
    ) as Record<string, unknown>;

    expect(migrated.version).toBe(2);
    expect(migrated.migrated).toBe(true);
  });

  it("validates generated project manifests", () => {
    const manifest = createProjectManifest(defaultProjectState);
    const parsed = projectManifestSchema.parse(manifest);

    expect(parsed.schema).toBe("immo-finance.project");
    expect(parsed.templateRefs.ownership.kind).toBe("ownership");
  });

  it("marks download/upload storage as save fallback", () => {
    const adapter = createDownloadUploadAdapter();

    expect(adapter.capabilities.directSave).toBe(false);
    expect(adapter.capabilities.remoteSync).toBe(false);
  });
});
