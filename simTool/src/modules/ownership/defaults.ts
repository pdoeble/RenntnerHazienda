import {
  DEFAULT_TEMPLATE_TIMESTAMP,
  CURRENT_TEMPLATE_VERSION
} from "../common";
import type { OwnershipTemplate } from "./types";

export const defaultOwnershipTemplate: OwnershipTemplate = {
  schema: "immo-finance.ownership",
  version: CURRENT_TEMPLATE_VERSION,
  id: "ownership-waldchalet-pfunds-demo",
  name: "Demo Eignerschaft Waldchalet Pfunds",
  description: "Demo-Szenario aus Jonas' Entwurf mit konkreten Beteiligten.",
  createdAt: DEFAULT_TEMPLATE_TIMESTAMP,
  updatedAt: DEFAULT_TEMPLATE_TIMESTAMP,
  data: {
    owners: [
      {
        id: "phil",
        displayName: "Phil",
        type: "person",
        participationTier: 100,
        equityContribution: 40000,
        startEquityContribution: 40000,
        monthlyCapitalContribution: 0,
        monthlyUsageContribution: 100,
        usagePointBudget: 100,
        ownershipSharePct: 17.77777777777778,
        companySharePct: 17.77777777777778,
        homeLocationId: "esslingen"
      },
      {
        id: "jonas",
        displayName: "Jonas",
        type: "person",
        participationTier: 100,
        equityContribution: 40000,
        startEquityContribution: 40000,
        monthlyCapitalContribution: 0,
        monthlyUsageContribution: 100,
        usagePointBudget: 100,
        ownershipSharePct: 17.77777777777778,
        companySharePct: 17.77777777777778,
        homeLocationId: "muenchen"
      },
      {
        id: "margarele",
        displayName: "Margerle",
        type: "person",
        participationTier: 50,
        equityContribution: 15000,
        startEquityContribution: 15000,
        monthlyCapitalContribution: 0,
        monthlyUsageContribution: 50,
        usagePointBudget: 50,
        ownershipSharePct: 6.666666666666667,
        companySharePct: 6.666666666666667,
        homeLocationId: "neuburg"
      },
      {
        id: "manu",
        displayName: "Manu",
        type: "person",
        participationTier: 50,
        equityContribution: 15000,
        startEquityContribution: 15000,
        monthlyCapitalContribution: 0,
        monthlyUsageContribution: 50,
        usagePointBudget: 50,
        ownershipSharePct: 6.666666666666667,
        companySharePct: 6.666666666666667,
        homeLocationId: "neuburg"
      },
      {
        id: "niels",
        displayName: "Niels",
        type: "person",
        participationTier: 50,
        equityContribution: 15000,
        startEquityContribution: 15000,
        monthlyCapitalContribution: 0,
        monthlyUsageContribution: 50,
        usagePointBudget: 50,
        ownershipSharePct: 6.666666666666667,
        companySharePct: 6.666666666666667,
        homeLocationId: "hinwil"
      },
      {
        id: "nils",
        displayName: "Nils",
        type: "person",
        participationTier: 50,
        equityContribution: 15000,
        startEquityContribution: 15000,
        monthlyCapitalContribution: 0,
        monthlyUsageContribution: 50,
        usagePointBudget: 50,
        ownershipSharePct: 6.666666666666667,
        companySharePct: 6.666666666666667,
        homeLocationId: "hinwil"
      },
      {
        id: "kai",
        displayName: "Kai",
        type: "person",
        participationTier: 50,
        equityContribution: 15000,
        startEquityContribution: 15000,
        monthlyCapitalContribution: 0,
        monthlyUsageContribution: 50,
        usagePointBudget: 50,
        ownershipSharePct: 6.666666666666667,
        companySharePct: 6.666666666666667,
        homeLocationId: "innsbruck"
      },
      {
        id: "stressi",
        displayName: "Stressi",
        type: "person",
        participationTier: 50,
        equityContribution: 15000,
        startEquityContribution: 15000,
        monthlyCapitalContribution: 0,
        monthlyUsageContribution: 50,
        usagePointBudget: 50,
        ownershipSharePct: 6.666666666666667,
        companySharePct: 6.666666666666667,
        homeLocationId: "esslingen"
      },
      {
        id: "jens",
        displayName: "Jens",
        type: "person",
        participationTier: 50,
        equityContribution: 15000,
        startEquityContribution: 15000,
        monthlyCapitalContribution: 0,
        monthlyUsageContribution: 50,
        usagePointBudget: 50,
        ownershipSharePct: 6.666666666666667,
        companySharePct: 6.666666666666667,
        homeLocationId: "muenchen"
      },
      {
        id: "michael",
        displayName: "Michael",
        type: "person",
        participationTier: 50,
        equityContribution: 20000,
        startEquityContribution: 20000,
        monthlyCapitalContribution: 0,
        monthlyUsageContribution: 50,
        usagePointBudget: 50,
        ownershipSharePct: 8.88888888888889,
        companySharePct: 8.88888888888889,
        homeLocationId: "muenchen"
      },
      {
        id: "rieke",
        displayName: "Rieke",
        type: "person",
        participationTier: 50,
        equityContribution: 20000,
        startEquityContribution: 20000,
        monthlyCapitalContribution: 0,
        monthlyUsageContribution: 50,
        usagePointBudget: 50,
        ownershipSharePct: 8.88888888888889,
        companySharePct: 8.88888888888889,
        homeLocationId: "esslingen"
      }
    ],
    contributionRules: [
      {
        id: "rule-ownership",
        name: "Nach Eigentumsanteil",
        basis: "ownershipShare"
      }
    ]
  }
};
