import { CURRENT_TEMPLATE_VERSION } from "../common";
import { migrateVersionedEnvelope } from "../../validation/migrationRunner";
import { ownershipTemplateSchema } from "./schema";
import type { OwnershipTemplate } from "./types";

export function migrateOwnership(input: unknown): OwnershipTemplate {
  const migrated = migrateVersionedEnvelope(
    normalizeOwnership(input),
    CURRENT_TEMPLATE_VERSION,
    {}
  );
  return ownershipTemplateSchema.parse(migrated);
}

function normalizeOwnership(input: unknown): unknown {
  if (!input || typeof input !== "object" || !("data" in input)) {
    return input;
  }

  const envelope = input as { data?: unknown };
  if (!envelope.data || typeof envelope.data !== "object") {
    return input;
  }

  const data = envelope.data as Record<string, unknown>;
  if (!Array.isArray(data.owners)) {
    return input;
  }

  const owners = data.owners.map((owner) => {
    if (!owner || typeof owner !== "object") {
      return owner;
    }

    const record = owner as Record<string, unknown>;
    const startEquityContribution = numberOrZero(
      record.startEquityContribution ?? record.equityContribution
    );
    const usagePointBudget = numberOrZero(
      record.usagePointBudget ?? record.participationTier
    );

    return {
      ...record,
      startEquityContribution,
      equityContribution: startEquityContribution,
      usagePointBudget,
      participationTier: usagePointBudget,
      monthlyCapitalContribution: numberOrZero(
        record.monthlyCapitalContribution
      )
    };
  });

  const totalStartEquity = owners.reduce((total, owner) => {
    if (!owner || typeof owner !== "object") {
      return total;
    }
    return (
      total +
      numberOrZero((owner as Record<string, unknown>).startEquityContribution)
    );
  }, 0);

  return {
    ...input,
    data: {
      ...data,
      owners: owners.map((owner) => {
        if (!owner || typeof owner !== "object") {
          return owner;
        }

        const record = owner as Record<string, unknown>;
        const startEquityContribution = numberOrZero(
          record.startEquityContribution
        );
        const ownershipSharePct =
          totalStartEquity > 0
            ? (startEquityContribution / totalStartEquity) * 100
            : numberOrZero(record.ownershipSharePct);

        return {
          ...record,
          ownershipSharePct,
          companySharePct:
            typeof record.companySharePct === "number"
              ? record.companySharePct
              : ownershipSharePct
        };
      })
    }
  };
}

function numberOrZero(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
