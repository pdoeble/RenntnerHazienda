import { migrateVersionedEnvelope } from "../../validation/migrationRunner";
import { CURRENT_TEMPLATE_VERSION } from "../common";
import { propertyTemplateSchema } from "./schema";
import type { PropertyTemplate } from "./types";

export function migrateProperty(input: unknown): PropertyTemplate {
  const migrated = migrateVersionedEnvelope(
    normalizeAustriaProperty(input),
    CURRENT_TEMPLATE_VERSION,
    {}
  );
  return propertyTemplateSchema.parse(migrated);
}

function normalizeAustriaProperty(input: unknown): unknown {
  if (!input || typeof input !== "object" || !("data" in input)) {
    return input;
  }

  const envelope = input as { data?: unknown };
  if (!envelope.data || typeof envelope.data !== "object") {
    return input;
  }

  const data = envelope.data as Record<string, unknown>;
  const nextData = { ...data };
  nextData.country = "AT";

  if (typeof nextData.federalState === "string" && isGermanFederalState(nextData.federalState)) {
    delete nextData.federalState;
  }

  return {
    ...input,
    data: nextData
  };
}

function isGermanFederalState(value: string): boolean {
  return [
    "BW",
    "BY",
    "BE",
    "BB",
    "HB",
    "HH",
    "HE",
    "MV",
    "NI",
    "NW",
    "RP",
    "SL",
    "SN",
    "ST",
    "SH",
    "TH"
  ].includes(value);
}
