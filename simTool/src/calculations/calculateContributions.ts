import { diagnostic } from "../validation/diagnostics";
import { isApproximately, sum } from "../validation/commonSchemas";
import { calculateInitialFundingNeed } from "./financialInputs";
import { roundMoney, roundPct } from "./rounding";
import type {
  ContributionResult,
  OwnerContribution,
  ProjectSnapshot
} from "./types";

export function calculateContributions(
  snapshot: ProjectSnapshot
): ContributionResult {
  const diagnostics = [];
  const owners = snapshot.ownership.data.owners;
  const requiredInitialContribution = roundMoney(
    calculateInitialFundingNeed(snapshot)
  );

  if (owners.length === 0) {
    return {
      initialContributions: [],
      recurringContributions: [],
      totalByOwner: {},
      requiredInitialContribution,
      diagnostics: [
        diagnostic(
          "contributions.no-owners",
          "error",
          "contributions",
          "No owners are defined; contributions cannot be allocated."
        )
      ]
    };
  }

  const selectedRule = snapshot.ownership.data.contributionRules[0];
  if (!selectedRule) {
    diagnostics.push(
      diagnostic(
        "contributions.fallback-ownership-rule",
        "warning",
        "contributions",
        "No contribution rule is defined; using ownership shares as fallback."
      )
    );
  }

  const basis = selectedRule?.basis ?? "ownershipShare";
  const initialContributions = owners.map((owner) => {
    const sharePct = resolveOwnerSharePct(snapshot, owner.id, basis);
    return {
      ownerId: owner.id,
      ownerName: owner.displayName,
      amount: roundMoney((requiredInitialContribution * sharePct) / 100),
      basis,
      sharePct: roundPct(sharePct)
    } satisfies OwnerContribution;
  });

  if (basis === "custom" && selectedRule?.customShares) {
    const unknownOwnerIds = Object.keys(selectedRule.customShares).filter(
      (ownerId) => !owners.some((owner) => owner.id === ownerId)
    );
    for (const ownerId of unknownOwnerIds) {
      diagnostics.push(
        diagnostic(
          `contributions.unknown-custom-owner.${ownerId}`,
          "error",
          "contributions",
          `Custom contribution rule references unknown owner "${ownerId}".`
        )
      );
    }

    const shareTotal = sum(Object.values(selectedRule.customShares));
    if (!isApproximately(shareTotal, 100)) {
      diagnostics.push(
        diagnostic(
          "contributions.custom-share-total",
          "warning",
          "contributions",
          `Custom contribution shares sum to ${shareTotal.toFixed(2)}% instead of 100%.`
        )
      );
    }
  }

  return {
    initialContributions,
    recurringContributions: [],
    totalByOwner: Object.fromEntries(
      initialContributions.map((contribution) => [
        contribution.ownerId,
        contribution.amount
      ])
    ),
    requiredInitialContribution,
    diagnostics
  };
}

function resolveOwnerSharePct(
  snapshot: ProjectSnapshot,
  ownerId: string,
  basis: OwnerContribution["basis"]
): number {
  const owners = snapshot.ownership.data.owners;
  const owner = owners.find((candidate) => candidate.id === ownerId);

  if (!owner) {
    return 0;
  }

  if (basis === "equalSplit") {
    return 100 / owners.length;
  }

  if (basis === "custom") {
    const selectedRule = snapshot.ownership.data.contributionRules[0];
    return selectedRule?.customShares?.[ownerId] ?? 0;
  }

  return owner.ownershipSharePct;
}
