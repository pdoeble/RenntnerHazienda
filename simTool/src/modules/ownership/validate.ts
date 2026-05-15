import { diagnostic } from "../../validation/diagnostics";
import {
  findDuplicateIds,
  isApproximately,
  sum
} from "../../validation/commonSchemas";
import { validationResult, type ValidationResult } from "../common";
import type { OwnershipTemplate } from "./types";

export function validateOwnership(
  template: OwnershipTemplate
): ValidationResult {
  const diagnostics = [];
  const duplicateOwnerIds = findDuplicateIds(template.data.owners);
  const ownerIds = new Set(template.data.owners.map((owner) => owner.id));
  const totalEquity = sum(
    template.data.owners.map((owner) => owner.equityContribution)
  );

  for (const duplicateId of duplicateOwnerIds) {
    diagnostics.push(
      diagnostic(
        `ownership.duplicate-owner.${duplicateId}`,
        "error",
        "ownership",
        `Owner id "${duplicateId}" is used more than once.`
      )
    );
  }

  if (totalEquity <= 0) {
    diagnostics.push(
      diagnostic(
        "ownership.no-equity",
        "error",
        "ownership",
        "Total owner equity must be greater than zero."
      )
    );
  }

  const ownershipTotal = sum(
    template.data.owners.map((owner) => owner.ownershipSharePct)
  );
  if (totalEquity > 0 && !isApproximately(ownershipTotal, 100)) {
    diagnostics.push(
      diagnostic(
        "ownership.share-total",
        "warning",
        "ownership",
        `Ownership shares sum to ${ownershipTotal.toFixed(2)}% instead of 100%.`,
        [{ kind: "ownership", field: "owners.ownershipSharePct" }]
      )
    );
  }

  const votingShares = template.data.owners
    .map((owner) => owner.votingSharePct)
    .filter((share): share is number => share !== undefined);
  if (
    votingShares.length > 0 &&
    !isApproximately(sum(votingShares), 100)
  ) {
    diagnostics.push(
      diagnostic(
        "ownership.voting-share-total",
        "warning",
        "ownership",
        `Voting shares sum to ${sum(votingShares).toFixed(2)}% instead of 100%.`
      )
    );
  }

  const duplicateRuleIds = findDuplicateIds(template.data.contributionRules);
  for (const duplicateId of duplicateRuleIds) {
    diagnostics.push(
      diagnostic(
        `ownership.duplicate-rule.${duplicateId}`,
        "error",
        "ownership",
        `Contribution rule id "${duplicateId}" is used more than once.`
      )
    );
  }

  for (const rule of template.data.contributionRules) {
    if (rule.basis !== "custom" || !rule.customShares) {
      continue;
    }

    const unknownOwnerIds = Object.keys(rule.customShares).filter(
      (ownerId) => !ownerIds.has(ownerId)
    );
    for (const ownerId of unknownOwnerIds) {
      diagnostics.push(
        diagnostic(
          `ownership.custom-rule.unknown-owner.${rule.id}.${ownerId}`,
          "error",
          "ownership",
          `Contribution rule "${rule.name}" references unknown owner "${ownerId}".`
        )
      );
    }

    const customShareTotal = sum(Object.values(rule.customShares));
    if (!isApproximately(customShareTotal, 100)) {
      diagnostics.push(
        diagnostic(
          `ownership.custom-rule.share-total.${rule.id}`,
          "warning",
          "ownership",
          `Custom contribution shares for "${rule.name}" sum to ${customShareTotal.toFixed(2)}% instead of 100%.`
        )
      );
    }
  }

  return validationResult(diagnostics);
}
