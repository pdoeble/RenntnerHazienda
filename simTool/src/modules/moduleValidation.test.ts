import { describe, expect, it, vi } from "vitest";
import { defaultOwnershipTemplate } from "./ownership/defaults";
import { ownershipTemplateSchema } from "./ownership/schema";
import { defaultOpexTemplate } from "./opex/defaults";
import { defaultFinancingTemplate } from "./financing/defaults";
import { financingTemplateSchema } from "./financing/schema";
import {
  loadProjectFromJson,
  loadTemplateFromJson,
  serializeJsonFile
} from "../persistence/jsonFiles";
import { migrateVersionedEnvelope } from "../validation/migrationRunner";
import { createDownloadUploadAdapter } from "../persistence/adapterStubs";
import { createProjectManifest, projectManifestSchema } from "../persistence/ProjectManifest";
import { defaultProjectState } from "../state/projectStore";
import { downloadJsonFile } from "../persistence/browserFiles";

describe("module validation contracts", () => {
  it("validates a template envelope with schema, version, id, name, and data", () => {
    const parsed = ownershipTemplateSchema.parse(defaultOwnershipTemplate);

    expect(parsed.schema).toBe("immo-finance.ownership");
    expect(parsed.version).toBe(1);
    expect(parsed.id).toBeTruthy();
    expect(parsed.name).toBeTruthy();
    expect(parsed.data.owners).toHaveLength(6);
  });

  it("validates the financing template envelope", () => {
    const parsed = financingTemplateSchema.parse(defaultFinancingTemplate);

    expect(parsed.schema).toBe("immo-finance.financing");
    expect(parsed.data.equitySharePct).toBe(20);
    expect(parsed.data.termYears).toBe(25);
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
    expect(parsed.templateRefs.financing?.kind).toBe("financing");
  });

  it("loads old embedded project manifests without financing by adding defaults", () => {
    const manifest = createProjectManifest(defaultProjectState);
    const legacyProperty = structuredClone(
      manifest.embeddedSnapshots?.property
    ) as { data: Record<string, unknown> };
    delete legacyProperty.data.closingCosts;
    delete legacyProperty.data.renovationItems;

    const oldManifest = {
      ...manifest,
      templateRefs: {
        ownership: manifest.templateRefs.ownership,
        legalForm: manifest.templateRefs.legalForm,
        capex: manifest.templateRefs.capex,
        property: manifest.templateRefs.property,
        closingCosts: manifest.templateRefs.closingCosts,
        opex: manifest.templateRefs.opex
      },
      embeddedSnapshots: {
        ownership: manifest.embeddedSnapshots?.ownership,
        legalForm: manifest.embeddedSnapshots?.legalForm,
        capex: manifest.embeddedSnapshots?.capex,
        property: legacyProperty,
        closingCosts: manifest.embeddedSnapshots?.closingCosts,
        opex: manifest.embeddedSnapshots?.opex
      }
    };

    const loaded = loadProjectFromJson(serializeJsonFile(oldManifest));

    expect(loaded.ok).toBe(true);
    if (loaded.ok) {
      expect(loaded.value.financing.data.equitySharePct).toBe(20);
      expect(loaded.value.property.data.closingCosts.realEstateTransferTaxPct).toBe(
        5
      );
      expect(loaded.value.property.data.renovationItems[0]?.amount).toBe(50000);
    }
    expect(
      loaded.diagnostics.some(
        (diagnostic) => diagnostic.id === "persistence.default-financing-added"
      )
    ).toBe(true);
    expect(
      loaded.diagnostics.some(
        (diagnostic) =>
          diagnostic.id === "persistence.legacy-closing-costs-migrated"
      )
    ).toBe(true);
    expect(
      loaded.diagnostics.some(
        (diagnostic) =>
          diagnostic.id === "persistence.legacy-renovations-migrated"
      )
    ).toBe(true);
  });

  it("marks download/upload storage as save fallback", () => {
    const adapter = createDownloadUploadAdapter();

    expect(adapter.capabilities.directSave).toBe(false);
    expect(adapter.capabilities.remoteSync).toBe(false);
  });

  it("downloads serialized JSON files", () => {
    const createObjectUrl = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:mock");
    const revokeObjectUrl = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => undefined);
    const click = vi.fn();
    const createElement = vi
      .spyOn(document, "createElement")
      .mockReturnValue({
        click,
        set href(_value: string) {
          return;
        },
        set download(_value: string) {
          return;
        }
      } as unknown as HTMLAnchorElement);

    downloadJsonFile("project.immo-project.json", "{}");

    expect(createObjectUrl).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:mock");

    createObjectUrl.mockRestore();
    revokeObjectUrl.mockRestore();
    createElement.mockRestore();
  });
});
