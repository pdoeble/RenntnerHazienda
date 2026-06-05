import { Download, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import type { TemplateEnvelope, TemplateKind } from "../../domain/templates";
import type { ExtractResult } from "../../listingAssist/extractListing";
import { extractListingFromText } from "../../listingAssist/extractListing";
import { extractListingFromUrl } from "../../listingAssist/extractListingFromUrl";
import { isListingUrl } from "../../listingAssist/fetchListingContent";
import {
  enrichHouseWithGoogleMaps,
  hasGoogleMapsKey
} from "../../maps/googleMapsEnrichment";
import type { CalculationResult } from "../../calculations/types";
import type { LegalFormValue } from "../../modules/legal-form/types";
import { visibleInputModules } from "../../modules/registry";
import type { OpexAnnualCostMode } from "../../modules/opex/types";
import type {
  AustrianFederalState,
  CandidateHouse,
  PropertyRenovationItem,
  PropertyUseType
} from "../../modules/property/types";
import type { GoNoGoStatus } from "../../modules/strategy/types";
import type { DirtyState, ProjectState } from "../../state/projectStore";
import { FileActionButton } from "../../ui/buttons/FileActionButton";
import { NumberSliderField } from "../../ui/forms/NumberSliderField";
import { DirtyStateIndicator } from "../../ui/status/DirtyStateIndicator";
import { formatDateTime } from "../../utils/dates";
import { formatMoney, formatPercent } from "../../utils/money";
import { HouseComparisonEditor } from "./HouseComparisonEditor";

export type InputPanelTab = "project" | TemplateKind | "houseComparison";

export type ProjectPanelProps = {
  projectName: string;
  calculatedAt: string;
  dirtyState: DirtyState;
  persistenceMessage: string;
  githubToken: string;
  githubConfigLabel: string;
  onGithubTokenChange: (token: string) => void;
  onGithubTokenBlur: () => void;
  onLoadProject: () => void;
  onSaveProject: () => void;
  onExportProject: () => void;
  onLoadGithub: () => void;
  onSaveGithub: () => void;
};

type InputTabsProps = {
  projectState: ProjectState;
  calculationResult: CalculationResult;
  projectPanel: ProjectPanelProps;
  selectedKind: InputPanelTab;
  onSelectKind: (kind: InputPanelTab) => void;
  onTemplateChange: (
    kind: TemplateKind,
    template: TemplateEnvelope<unknown>
  ) => void;
  onLoadTemplate: (kind: TemplateKind) => void;
  onSaveTemplate: (kind: TemplateKind) => void;
  onExportTemplate: (kind: TemplateKind) => void;
};

export function InputTabs({
  projectState,
  calculationResult,
  projectPanel,
  selectedKind,
  onSelectKind,
  onTemplateChange,
  onLoadTemplate,
  onSaveTemplate,
  onExportTemplate
}: InputTabsProps) {
  const visibleTabs = [
    { kind: "project" as const, label: "Projekt" },
    ...visibleInputModules.map((module) => ({
      kind: module.kind as InputPanelTab,
      label: module.label
    })),
    { kind: "houseComparison" as const, label: "Hausvergleich" }
  ];
  const activeModule = visibleInputModules.find(
    (module) => module.kind === selectedKind
  );
  const templateKind: TemplateKind =
    selectedKind === "houseComparison" || selectedKind === "project"
      ? "property"
      : selectedKind;
  const activeTemplate = projectState[templateKind];
  const validation =
    selectedKind === "project" ? undefined : activeModule?.validate(activeTemplate);
  const validationErrors =
    validation?.diagnostics.filter((diagnostic) => diagnostic.severity === "error") ??
    [];

  return (
    <div className="panel">
      <div className="tabs" role="tablist" aria-label="Eingabe-Tabs">
        {visibleTabs.map((module) => (
          <button
            key={module.kind}
            type="button"
            role="tab"
            aria-selected={module.kind === selectedKind}
            className={module.kind === selectedKind ? "active" : ""}
            onClick={() => onSelectKind(module.kind)}
          >
            {module.label}
          </button>
        ))}
      </div>

      <div className="tab-header">
        <div>
          <p className="eyebrow">
            {selectedKind === "project"
              ? "Projekt"
              : selectedKind === "houseComparison"
                ? "Hausvergleich"
                : activeModule?.label}
          </p>
          <h2>
            {selectedKind === "project"
              ? projectPanel.projectName
              : selectedKind === "houseComparison"
                ? "Hausvergleich"
                : activeTemplate.name}
          </h2>
          <span className="muted">
            {selectedKind === "project"
              ? `Berechnet: ${formatDateTime(projectPanel.calculatedAt)}`
              : `Template: ${activeTemplate.id}`}
          </span>
        </div>
        {selectedKind === "project" ? null : (
          <div className="button-row">
            <TemplateLoadSelect
              templateName={activeTemplate.name}
              onUpload={() => onLoadTemplate(templateKind)}
            />
            <FileActionButton
              label="Speichern"
              icon={Save}
              onClick={() => onSaveTemplate(templateKind)}
            />
            <FileActionButton
              label="Export"
              icon={Download}
              onClick={() => onExportTemplate(templateKind)}
            />
          </div>
        )}
      </div>

      {validationErrors.length > 0 ? (
        <ul className="inline-diagnostics">
          {validationErrors.map((diagnostic) => (
            <li key={diagnostic.id}>{diagnostic.message}</li>
          ))}
        </ul>
      ) : null}

      <InputTabBody
        kind={selectedKind}
        projectState={projectState}
        calculationResult={calculationResult}
        projectPanel={projectPanel}
        onTemplateChange={onTemplateChange}
      />
    </div>
  );
}

function TemplateLoadSelect({
  templateName,
  onUpload
}: {
  templateName: string;
  onUpload: () => void;
}) {
  return (
    <label className="action-select">
      <span>Laden</span>
      <select
        aria-label="Laden"
        defaultValue=""
        onChange={(event) => {
          if (event.currentTarget.value === "upload") {
            onUpload();
          }
          event.currentTarget.value = "";
        }}
      >
        <option value="" disabled>
          Laden
        </option>
        <option value="current-template">{templateName}</option>
        <option value="upload">Upload...</option>
      </select>
    </label>
  );
}

function ProjectEditor({ projectPanel }: { projectPanel: ProjectPanelProps }) {
  return (
    <div className="form-grid">
      <div className="form-section">
        <h3>Projekt</h3>
        <DirtyStateIndicator dirtyState={projectPanel.dirtyState} />
        {projectPanel.persistenceMessage ? (
          <span className="status-pill">{projectPanel.persistenceMessage}</span>
        ) : null}
        <div className="button-row">
          <ProjectLoadSelect
            projectName={projectPanel.projectName}
            onUpload={projectPanel.onLoadProject}
          />
          <FileActionButton
            label="Projekt speichern"
            icon={Save}
            onClick={projectPanel.onSaveProject}
          />
          <FileActionButton
            label="Export"
            icon={Download}
            onClick={projectPanel.onExportProject}
          />
        </div>
      </div>
      <div className="form-section">
        <h3>GitHub Speicher</h3>
        <label className="text-field github-token-field">
          <span>GitHub Token</span>
          <input
            aria-label="GitHub Token"
            type="password"
            value={projectPanel.githubToken}
            placeholder="ghp_..."
            onChange={(event) =>
              projectPanel.onGithubTokenChange(event.currentTarget.value)
            }
            onBlur={projectPanel.onGithubTokenBlur}
          />
        </label>
        <div className="button-row">
          <button
            className="icon-button"
            type="button"
            onClick={projectPanel.onLoadGithub}
          >
            GitHub laden
          </button>
          <button
            className="icon-button"
            type="button"
            onClick={projectPanel.onSaveGithub}
          >
            GitHub speichern
          </button>
        </div>
        <span className="muted">{projectPanel.githubConfigLabel}</span>
      </div>
    </div>
  );
}

function ProjectLoadSelect({
  projectName,
  onUpload
}: {
  projectName: string;
  onUpload: () => void;
}) {
  return (
    <label className="action-select">
      <span>Projekt laden</span>
      <select
        aria-label="Projekt laden"
        defaultValue=""
        onChange={(event) => {
          if (event.currentTarget.value === "upload") {
            onUpload();
          }
          event.currentTarget.value = "";
        }}
      >
        <option value="" disabled>
          Laden
        </option>
        <option value="current-project">{projectName}</option>
        <option value="upload">Upload...</option>
      </select>
    </label>
  );
}

function InputTabBody({
  kind,
  projectState,
  calculationResult,
  projectPanel,
  onTemplateChange
}: {
  kind: InputPanelTab;
  projectState: ProjectState;
  calculationResult: CalculationResult;
  projectPanel: ProjectPanelProps;
  onTemplateChange: (
    kind: TemplateKind,
    template: TemplateEnvelope<unknown>
  ) => void;
}) {
  switch (kind) {
    case "project":
      return <ProjectEditor projectPanel={projectPanel} />;
    case "houseComparison":
      return (
        <HouseComparisonEditor
          projectState={projectState}
          updatePropertyData={(data) =>
            onTemplateChange("property", {
              ...projectState.property,
              data
            })
          }
        />
      );
    case "ownership":
      return (
        <OwnershipEditor
          projectState={projectState}
          calculationResult={calculationResult}
          onTemplateChange={onTemplateChange}
        />
      );
    case "legalForm":
      return (
        <LegalFormEditor
          projectState={projectState}
          onTemplateChange={onTemplateChange}
        />
      );
    case "property":
      return (
        <PropertyEditor
          projectState={projectState}
          onTemplateChange={onTemplateChange}
        />
      );
    case "financing":
      return (
        <FinancingEditor
          projectState={projectState}
          onTemplateChange={onTemplateChange}
        />
      );
    case "strategy":
      return (
        <StrategyEditor
          projectState={projectState}
          onTemplateChange={onTemplateChange}
        />
      );
    case "opex":
      return (
        <OpexEditor
          projectState={projectState}
          onTemplateChange={onTemplateChange}
        />
      );
    case "capex":
    case "closingCosts":
      return null;
  }
}

function OwnershipEditor({
  projectState,
  calculationResult,
  onTemplateChange
}: {
  projectState: ProjectState;
  calculationResult: CalculationResult;
  onTemplateChange: (
    kind: TemplateKind,
    template: TemplateEnvelope<unknown>
  ) => void;
}) {
  const totalEquity = projectState.ownership.data.owners.reduce(
    (total, owner) => total + owner.startEquityContribution,
    0
  );

  function updateOwners(
    owners: ProjectState["ownership"]["data"]["owners"]
  ) {
    onTemplateChange("ownership", {
      ...projectState.ownership,
      data: {
        ...projectState.ownership.data,
        owners: withDerivedShares(owners)
      }
    });
  }

  return (
    <div className="form-grid">
      {projectState.ownership.data.owners.map((owner) => {
        const capitalShare = calculationResult.capitalShares.owners.find(
          (candidate) => candidate.ownerId === owner.id
        );
        return (
        <div className="form-section owner-section" key={owner.id}>
          <div className="subsection-header">
            <label className="text-field">
              <span>Name</span>
              <input
                aria-label={`${owner.displayName} Name`}
                value={owner.displayName}
                onChange={(event) =>
                  updateOwners(
                    projectState.ownership.data.owners.map((candidate) =>
                      candidate.id === owner.id
                        ? { ...candidate, displayName: event.currentTarget.value }
                        : candidate
                    )
                  )
                }
              />
            </label>
            <button
              className="icon-button danger"
              type="button"
              title="Eigner loeschen"
              onClick={() =>
                updateOwners(
                  projectState.ownership.data.owners.filter(
                    (candidate) => candidate.id !== owner.id
                  )
                )
              }
              disabled={projectState.ownership.data.owners.length <= 1}
            >
              <Trash2 aria-hidden="true" size={16} />
              <span>Loeschen</span>
            </button>
          </div>
          <NumberSliderField
            label="Nutzungsentgelt mtl."
            value={owner.monthlyUsageContribution}
            min={0}
            max={1000}
            step={10}
            unit="EUR"
            onChange={(monthlyUsageContribution) =>
              updateOwners(
                projectState.ownership.data.owners.map((candidate) =>
                  candidate.id === owner.id
                    ? {
                        ...candidate,
                        monthlyUsageContribution,
                        usagePointBudget: monthlyUsageContribution,
                        participationTier: monthlyUsageContribution
                      }
                    : candidate
                )
              )
            }
          />
          <NumberSliderField
            label="Start-EK"
            value={owner.startEquityContribution}
            min={0}
            max={500000}
            step={1000}
            unit="EUR"
            onChange={(startEquityContribution) =>
              updateOwners(
                projectState.ownership.data.owners.map((candidate) =>
                  candidate.id === owner.id
                    ? {
                        ...candidate,
                        startEquityContribution,
                        equityContribution: startEquityContribution
                      }
                    : candidate
                )
              )
            }
          />
          <NumberSliderField
            label="Monatsnettoeinkommen"
            value={owner.monthlyNetIncomeAmount ?? 0}
            min={0}
            max={25000}
            step={100}
            unit="EUR"
            onChange={(monthlyNetIncomeAmount) =>
              updateOwners(
                projectState.ownership.data.owners.map((candidate) =>
                  candidate.id === owner.id
                    ? { ...candidate, monthlyNetIncomeAmount }
                    : candidate
                )
              )
            }
          />
          {projectState.strategy.data.capitalShareMode === "manualMonthly" ? (
            <NumberSliderField
              label="Kapitalruecklage / Anlage mtl."
              value={owner.monthlyCapitalContribution}
              min={0}
              max={5000}
              step={25}
              unit="EUR"
              onChange={(monthlyCapitalContribution) =>
                updateOwners(
                  projectState.ownership.data.owners.map((candidate) =>
                    candidate.id === owner.id
                      ? { ...candidate, monthlyCapitalContribution }
                      : candidate
                  )
                )
              }
            />
          ) : (
            <SummaryLine
              label="Kapitalruecklage / Anlage mtl."
              value={`${formatMoney(capitalShare?.monthlyCapitalContribution ?? 0)} berechnet`}
            />
          )}
          <SummaryLine
            label="Unternehmensanteil"
            value={formatPercent(capitalShare?.companySharePct ?? 0)}
          />
        </div>
        );
      })}
      <button
        className="icon-button"
        type="button"
        onClick={() =>
          updateOwners([
            ...projectState.ownership.data.owners,
            {
              id: `owner-${projectState.ownership.data.owners.length + 1}`,
              displayName: `Eigner ${projectState.ownership.data.owners.length + 1}`,
              type: "person",
              participationTier: 50,
              equityContribution: 0,
              startEquityContribution: 0,
              monthlyCapitalContribution: 0,
              monthlyUsageContribution: 50,
              monthlyNetIncomeAmount: 0,
              usagePointBudget: 50,
              ownershipSharePct: 0,
              companySharePct: 0
            }
          ])
        }
      >
        <Plus aria-hidden="true" size={16} />
        <span>Eigner hinzufuegen</span>
      </button>
      <SummaryLine label="Summe Eigenkapital" value={`${totalEquity.toLocaleString("de-DE")} EUR`} />
    </div>
  );
}

function LegalFormEditor({
  projectState,
  onTemplateChange
}: {
  projectState: ProjectState;
  onTemplateChange: (
    kind: TemplateKind,
    template: TemplateEnvelope<unknown>
  ) => void;
}) {
  function updateLegalFormData(data: ProjectState["legalForm"]["data"]) {
    onTemplateChange("legalForm", {
      ...projectState.legalForm,
      data
    });
  }
  const selectedProfile = legalFormProfile(projectState.legalForm.data.legalForm);

  return (
    <div className="form-grid">
      <div className="form-section">
        <h3>Rechtsform-Auswahl</h3>
        <label className="text-field">
          <span>Gesellschaftsform</span>
          <select
            aria-label="Gesellschaftsform"
            value={projectState.legalForm.data.legalForm}
            onChange={(event) =>
              {
                const legalForm = event.currentTarget.value as LegalFormValue;
                const profile = legalFormProfile(legalForm);
              updateLegalFormData({
                ...projectState.legalForm.data,
                legalForm,
                liabilityModel: profile.liabilityModel,
                taxModel: profile.taxModel,
                votingModel: profile.votingModel
              });
            }
            }
          >
            {LEGAL_FORM_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <DataPreview
          rows={[
            ["Haftung", selectedProfile.liability],
            ["Steuerlogik", selectedProfile.tax],
            ["Governance", selectedProfile.governance],
            ["Beteiligungstabelle", selectedProfile.beteiligungstabelle],
            ["Darlehenskonten", selectedProfile.darlehenskonten],
            ["Exit / Uebertragung", selectedProfile.exitUebertragung],
            ["Bankfaehigkeit", selectedProfile.bankfaehigkeit],
            ["Nutzungsrechte", selectedProfile.nutzungsrechte],
            ["USt-Komplexitaet", selectedProfile.umsatzsteuerKomplexitaet],
            ["Pruefgatter", selectedProfile.pruefgatter],
            ["Eignung", selectedProfile.fit],
            ["Quellenstatus", selectedProfile.sourceStatus]
          ]}
        />
      </div>
      <div className="form-section">
        <h3>Kostenannahmen</h3>
        <NumberSliderField
          label="Gruendungskosten"
          value={projectState.legalForm.data.foundingCostAmount}
          min={0}
          max={25000}
          step={250}
          unit="EUR"
          onChange={(foundingCostAmount) =>
            updateLegalFormData({
              ...projectState.legalForm.data,
              foundingCostAmount,
              costStatus:
                foundingCostAmount > 0
                  ? projectState.legalForm.data.costStatus
                  : "missing"
            })
          }
        />
        <NumberSliderField
          label="Buchhaltung mtl."
          value={projectState.legalForm.data.annualAccountingCostAmount / 12}
          min={0}
          max={2500}
          step={25}
          unit="EUR/Monat"
          onChange={(monthlyAccounting) =>
            updateLegalFormData({
              ...projectState.legalForm.data,
              annualAccountingCostAmount: monthlyAccounting * 12
            })
          }
        />
        <NumberSliderField
          label="Verwaltung mtl."
          value={projectState.legalForm.data.annualAdministrationCostAmount / 12}
          min={0}
          max={2500}
          step={25}
          unit="EUR/Monat"
          onChange={(monthlyAdministration) =>
            updateLegalFormData({
              ...projectState.legalForm.data,
              annualAdministrationCostAmount: monthlyAdministration * 12
            })
          }
        />
        <NumberSliderField
          label="Compliance mtl."
          value={projectState.legalForm.data.annualComplianceCostAmount / 12}
          min={0}
          max={2500}
          step={25}
          unit="EUR/Monat"
          onChange={(monthlyCompliance) =>
            updateLegalFormData({
              ...projectState.legalForm.data,
              annualComplianceCostAmount: monthlyCompliance * 12
            })
          }
        />
        <label className="text-field">
          <span>Kostenstatus</span>
          <select
            aria-label="Kostenstatus"
            value={projectState.legalForm.data.costStatus}
            onChange={(event) =>
              updateLegalFormData({
                ...projectState.legalForm.data,
                costStatus: event.currentTarget
                  .value as ProjectState["legalForm"]["data"]["costStatus"]
              })
            }
          >
            <option value="missing">fehlt / pruefen</option>
            <option value="planningEstimate">Planungsannahme</option>
            <option value="sourceBacked">quellenbasiert</option>
          </select>
        </label>
        <p className="muted">
          Gruendungskosten erhoehen den Kapitalbedarf. Laufende Rechtsform-,
          Buchhaltungs- und Compliancekosten laufen monatlich in
          Bankkonto-Zahlungsfluss, Liquiditaet und Beitraege.
        </p>
        <label className="text-field">
          <span>Notizen</span>
          <textarea
            aria-label="Notizen"
            rows={3}
            value={projectState.legalForm.data.notes ?? ""}
            onChange={(event) =>
              updateLegalFormData({
                ...projectState.legalForm.data,
                notes: event.currentTarget.value
              })
            }
          />
        </label>
      </div>
      <div className="form-section">
        <h3>Rechtsformvergleich</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Rechtsform</th>
                <th>Haftung</th>
                <th>Steuerlogik</th>
                <th>Aufwand</th>
                <th>Beteiligungstabelle</th>
                <th>Darlehenskonten</th>
                <th>Exit / Uebertragung</th>
                <th>Bankfaehigkeit</th>
                <th>Nutzungsrechte</th>
                <th>USt-Komplexitaet</th>
                <th>Eignung</th>
              </tr>
            </thead>
            <tbody>
              {LEGAL_FORM_PROFILES.map((profile) => (
                <tr key={profile.value}>
                  <td>{profile.label}</td>
                  <td>{profile.liability}</td>
                  <td>{profile.tax}</td>
                  <td>{profile.effort}</td>
                  <td>{profile.beteiligungstabelle}</td>
                  <td>{profile.darlehenskonten}</td>
                  <td>{profile.exitUebertragung}</td>
                  <td>{profile.bankfaehigkeit}</td>
                  <td>{profile.nutzungsrechte}</td>
                  <td>{profile.umsatzsteuerKomplexitaet}</td>
                  <td>{profile.fit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted">
          Vergleich ist eine Planungsuebersicht aus dem Wiki. Die konkrete
          Rechtsform muss vor Kauf mit Rechts- und Steuerberatung festgelegt
          werden.
        </p>
      </div>
    </div>
  );
}

function PropertyEditor({
  projectState,
  onTemplateChange
}: {
  projectState: ProjectState;
  onTemplateChange: (
    kind: TemplateKind,
    template: TemplateEnvelope<unknown>
  ) => void;
}) {
  function updatePropertyData(data: ProjectState["property"]["data"]) {
    onTemplateChange("property", {
      ...projectState.property,
      data
    });
  }

  return (
    <div className="form-grid">
      <ListingImportPanel
        projectState={projectState}
        updatePropertyData={updatePropertyData}
      />
      <div className="form-section">
        <h3>Immobilie</h3>
        <label className="text-field">
          <span>Objekttitel</span>
          <input
            aria-label="Objekttitel"
            value={projectState.property.data.title ?? ""}
            onChange={(event) =>
              updatePropertyData({
                ...projectState.property.data,
                title: event.currentTarget.value
              })
            }
          />
        </label>
        <label className="text-field">
          <span>Inserat-URL</span>
          <input
            aria-label="Inserat-URL"
            value={projectState.property.data.sourceUrl ?? ""}
            onChange={(event) =>
              updatePropertyData({
                ...projectState.property.data,
                sourceUrl: event.currentTarget.value
              })
            }
          />
        </label>
        <SummaryLine label="Land" value="Oesterreich" />
        <label className="text-field">
          <span>Bundesland</span>
          <select
            aria-label="Bundesland"
            value={projectState.property.data.federalState ?? ""}
            onChange={(event) =>
              updatePropertyData({
                ...projectState.property.data,
                federalState:
                  event.currentTarget.value === ""
                    ? undefined
                    : (event.currentTarget.value as AustrianFederalState)
              })
            }
          >
            <option value="">Offen</option>
            {AUSTRIAN_STATE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-field">
          <span>Gemeinde</span>
          <input
            aria-label="Gemeinde"
            value={projectState.property.data.municipality ?? ""}
            onChange={(event) =>
              updatePropertyData({
                ...projectState.property.data,
                municipality: event.currentTarget.value
              })
            }
          />
        </label>
        <label className="text-field">
          <span>Adresse / PLZ</span>
          <input
            aria-label="Adresse / PLZ"
            value={[
              projectState.property.data.addressData?.postalCode,
              projectState.property.data.addressData?.place
            ]
              .filter(Boolean)
              .join(" ")}
            onChange={(event) =>
              updatePropertyData({
                ...projectState.property.data,
                address: event.currentTarget.value
              })
            }
          />
        </label>
        <label className="text-field">
          <span>Nutzung</span>
          <select
            aria-label="Nutzung"
            value={projectState.property.data.useType}
            onChange={(event) =>
              updatePropertyData({
                ...projectState.property.data,
                useType: event.currentTarget.value as PropertyUseType
              })
            }
          >
            {PROPERTY_USE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <NumberSliderField
          label="Kaufpreis"
          value={projectState.property.data.purchasePrice}
          min={0}
          max={2000000}
          step={5000}
          unit="EUR"
          onChange={(purchasePrice) =>
            updatePropertyData({ ...projectState.property.data, purchasePrice })
          }
        />
        <NumberSliderField
          label="Miete pro Monat"
          value={projectState.property.data.expectedMonthlyRent ?? 0}
          min={0}
          max={20000}
          step={50}
          unit="EUR"
          onChange={(expectedMonthlyRent) =>
            updatePropertyData({
              ...projectState.property.data,
              expectedMonthlyRent
            })
          }
        />
        <NumberSliderField
          label="Leerstand"
          value={projectState.property.data.vacancyRatePct ?? 0}
          min={0}
          max={50}
          step={0.5}
          unit="%"
          onChange={(vacancyRatePct) =>
            updatePropertyData({ ...projectState.property.data, vacancyRatePct })
          }
        />
        <NumberSliderField
          label="Wohnflaeche"
          value={projectState.property.data.rentableAreaSqm ?? 0}
          min={0}
          max={2000}
          step={10}
          unit="qm"
          onChange={(rentableAreaSqm) =>
            updatePropertyData({ ...projectState.property.data, rentableAreaSqm })
          }
        />
        <NumberSliderField
          label="Betten"
          value={projectState.property.data.beds ?? 0}
          min={0}
          max={40}
          step={1}
          unit="Betten"
          onChange={(beds) =>
            updatePropertyData({ ...projectState.property.data, beds })
          }
        />
        <NumberSliderField
          label="Schlafzimmer"
          value={projectState.property.data.bedrooms ?? 0}
          min={0}
          max={30}
          step={1}
          unit="Schlafzimmer"
          onChange={(bedrooms) =>
            updatePropertyData({ ...projectState.property.data, bedrooms })
          }
        />
        <NumberSliderField
          label="Zimmer"
          value={projectState.property.data.rooms ?? 0}
          min={0}
          max={40}
          step={1}
          unit="Zimmer"
          onChange={(rooms) =>
            updatePropertyData({ ...projectState.property.data, rooms })
          }
        />
        <NumberSliderField
          label="Fremdgast-Zimmernaechte"
          value={projectState.property.data.guestNightsPerYear}
          min={0}
          max={365}
          step={5}
          unit="Zimmernaechte/Jahr"
          onChange={(guestNightsPerYear) =>
            updatePropertyData({
              ...projectState.property.data,
              guestNightsPerYear,
              candidateHouses: projectState.property.data.candidateHouses.map(
                (house) =>
                  house.id === projectState.property.data.activeHouseId
                    ? { ...house, guestNightsPerYear }
                    : house
              )
            })
          }
        />
        <NumberSliderField
          label="Grundstuecksflaeche"
          value={projectState.property.data.plotAreaSqm ?? 0}
          min={0}
          max={5000}
          step={10}
          unit="qm"
          onChange={(plotAreaSqm) =>
            updatePropertyData({ ...projectState.property.data, plotAreaSqm })
          }
        />
        <NumberSliderField
          label="Gartenflaeche"
          value={projectState.property.data.gardenAreaSqm ?? 0}
          min={0}
          max={5000}
          step={10}
          unit="qm"
          onChange={(gardenAreaSqm) =>
            updatePropertyData({ ...projectState.property.data, gardenAreaSqm })
          }
        />
        <NumberSliderField
          label="Aufenthaltsabgaben"
          value={projectState.property.data.tourismFeeAnnualAmount}
          min={0}
          max={25000}
          step={100}
          unit="EUR/Jahr"
          onChange={(tourismFeeAnnualAmount) =>
            updatePropertyData({
              ...projectState.property.data,
              tourismFeeAnnualAmount
            })
          }
        />
        <NumberSliderField
          label="USt-Zuschlag Kauf"
          value={projectState.property.data.vatRatePct}
          min={0}
          max={20}
          step={1}
          unit="%"
          onChange={(vatRatePct) =>
            updatePropertyData({ ...projectState.property.data, vatRatePct })
          }
        />
        <NumberSliderField
          label="Vorsteuer-Erstattung"
          value={projectState.property.data.vatRecoverablePct}
          min={0}
          max={100}
          step={5}
          unit="%"
          onChange={(vatRecoverablePct) =>
            updatePropertyData({
              ...projectState.property.data,
              vatRecoverablePct
            })
          }
        />
        <NumberSliderField
          label="Erstattungsmonat"
          value={projectState.property.data.vatRefundMonth}
          min={0}
          max={120}
          step={1}
          unit="Monat"
          onChange={(vatRefundMonth) =>
            updatePropertyData({ ...projectState.property.data, vatRefundMonth })
          }
        />
        <NumberSliderField
          label="Pfandrecht"
          value={projectState.property.data.mortgageRegistrationFeePct}
          min={0}
          max={5}
          step={0.05}
          unit="%"
          onChange={(mortgageRegistrationFeePct) =>
            updatePropertyData({
              ...projectState.property.data,
              mortgageRegistrationFeePct
            })
          }
        />
      </div>

      <ClosingCostsEditor
        projectState={projectState}
        updatePropertyData={updatePropertyData}
      />
      <RenovationEditor
        projectState={projectState}
        updatePropertyData={updatePropertyData}
      />
      <PointRulesEditor
        projectState={projectState}
        updatePropertyData={updatePropertyData}
      />
    </div>
  );
}

function ListingImportPanel({
  projectState,
  updatePropertyData
}: {
  projectState: ProjectState;
  updatePropertyData: (data: ProjectState["property"]["data"]) => void;
}) {
  const [url, setUrl] = useState(projectState.property.data.sourceUrl ?? "");
  const [paste, setPaste] = useState("");
  const [extractResult, setExtractResult] = useState<ExtractResult | null>(null);
  const [status, setStatus] = useState("");
  const [isFetching, setIsFetching] = useState(false);

  async function extractFromUrl() {
    if (!isListingUrl(url)) {
      setStatus("Bitte eine gueltige Inserat-URL eingeben.");
      return;
    }

    setIsFetching(true);
    setStatus("");
    try {
      const result = await extractListingFromUrl(url);
      setExtractResult(result);
      setPaste(result.rawText);
      setStatus("Inserat geladen. Bitte Vorschau pruefen und uebernehmen.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Inserat konnte nicht geladen werden.");
    } finally {
      setIsFetching(false);
    }
  }

  function extractFromPaste() {
    if (!paste.trim()) {
      setStatus("Bitte Inserat-Text einfuegen.");
      return;
    }
    setExtractResult(extractListingFromText(paste, url.trim() || undefined));
    setStatus("Text ausgewertet. Bitte Vorschau pruefen und uebernehmen.");
  }

  async function applyExtract() {
    if (!extractResult) {
      return;
    }

    const importedData = {
      ...projectState.property.data,
      ...stripUndefined(extractResult.draft)
    };
    const importedHouse = candidateFromPropertyData(importedData);
    let nextHouse = importedHouse;
    let importStatus = "Inseratdaten uebernommen und im Hausvergleich angelegt.";

    if (hasGoogleMapsKey()) {
      try {
        const enriched = await enrichHouseWithGoogleMaps(importedHouse);
        nextHouse = enriched.house;
        importStatus = `Inseratdaten uebernommen. ${enriched.message}`;
      } catch (error) {
        importStatus =
          error instanceof Error
            ? `Inseratdaten uebernommen. Google Maps fehlgeschlagen: ${error.message}`
            : "Inseratdaten uebernommen. Google Maps fehlgeschlagen.";
      }
    }

    updatePropertyData({
      ...importedData,
      activeHouseId: nextHouse.id,
      guestNightsPerYear: nextHouse.guestNightsPerYear,
      candidateHouses: [
        ...projectState.property.data.candidateHouses.filter(
          (house) => house.id !== nextHouse.id
        ),
        nextHouse
      ],
      mapEnrichment: {
        provider: hasGoogleMapsKey() ? "googleMaps" : "excel",
        status: hasGoogleMapsKey() ? "attempted" : "fallback",
        message: importStatus
      }
    });
    setStatus(importStatus);
  }

  return (
    <div className="form-section">
      <h3>Inserat importieren</h3>
      <label className="text-field">
        <span>Inserat-URL</span>
        <input
          aria-label="Inserat importieren URL"
          type="url"
          value={url}
          onChange={(event) => setUrl(event.currentTarget.value)}
          placeholder="https://www.immobilienscout24.at/expose/..."
        />
      </label>
      <div className="button-row">
        <button
          className="icon-button"
          type="button"
          onClick={() => void extractFromUrl()}
          disabled={isFetching}
        >
          {isFetching ? "Laedt..." : "URL laden"}
        </button>
        <button className="icon-button" type="button" onClick={extractFromPaste}>
          Text auswerten
        </button>
      </div>
      <label className="text-field">
        <span>Inserat-Text Fallback</span>
        <textarea
          aria-label="Inserat-Text"
          rows={4}
          value={paste}
          onChange={(event) => setPaste(event.currentTarget.value)}
        />
      </label>
      {extractResult ? (
        <>
          <DataPreview
            rows={[
              ["Titel", extractResult.draft.title ?? ""],
              ["Kaufpreis", numberPreview(extractResult.draft.purchasePrice, "EUR")],
              ["Wohnflaeche", numberPreview(extractResult.draft.rentableAreaSqm, "qm")],
              ["Grundstueck", numberPreview(extractResult.draft.plotAreaSqm, "qm")],
              ["Zimmer", numberPreview(extractResult.draft.rooms, "")],
              ["Betten", numberPreview(extractResult.draft.beds, "")],
              ["Gemeinde", extractResult.draft.municipality ?? ""]
            ]}
          />
          <button
            className="icon-button"
            type="button"
            onClick={() => void applyExtract()}
          >
            Vorschau uebernehmen
          </button>
        </>
      ) : null}
      {status ? <p className="muted">{status}</p> : null}
    </div>
  );
}

function ClosingCostsEditor({
  projectState,
  updatePropertyData
}: {
  projectState: ProjectState;
  updatePropertyData: (data: ProjectState["property"]["data"]) => void;
}) {
  const closingCosts = projectState.property.data.closingCosts;

  return (
    <div className="form-section">
      <h3>Nebenkosten</h3>
      <NumberSliderField
        label="Grunderwerbsteuer"
        value={closingCosts.realEstateTransferTaxPct}
        min={0}
        max={10}
        step={0.1}
        unit="%"
        onChange={(realEstateTransferTaxPct) =>
          updatePropertyData({
            ...projectState.property.data,
            closingCosts: { ...closingCosts, realEstateTransferTaxPct }
          })
        }
      />
      <NumberSliderField
        label="Notar"
        value={closingCosts.notaryPct}
        min={0}
        max={5}
        step={0.1}
        unit="%"
        onChange={(notaryPct) =>
          updatePropertyData({
            ...projectState.property.data,
            closingCosts: { ...closingCosts, notaryPct }
          })
        }
      />
      <NumberSliderField
        label="Grundbuch"
        value={closingCosts.landRegistryPct}
        min={0}
        max={5}
        step={0.1}
        unit="%"
        onChange={(landRegistryPct) =>
          updatePropertyData({
            ...projectState.property.data,
            closingCosts: { ...closingCosts, landRegistryPct }
          })
        }
      />
      <NumberSliderField
        label="Makler"
        value={closingCosts.brokerPct}
        min={0}
        max={8}
        step={0.1}
        unit="%"
        onChange={(brokerPct) =>
          updatePropertyData({
            ...projectState.property.data,
            closingCosts: { ...closingCosts, brokerPct }
          })
        }
      />
    </div>
  );
}

function FinancingEditor({
  projectState,
  onTemplateChange
}: {
  projectState: ProjectState;
  onTemplateChange: (
    kind: TemplateKind,
    template: TemplateEnvelope<unknown>
  ) => void;
}) {
  function updateFinancingData(data: ProjectState["financing"]["data"]) {
    onTemplateChange("financing", {
      ...projectState.financing,
      data
    });
  }

  return (
    <div className="form-grid">
      <div className="form-section">
        <h3>Finanzierung</h3>
        <label className="text-field">
          <span>Darlehensname</span>
          <input
            aria-label="Darlehensname"
            value={projectState.financing.data.loanName}
            onChange={(event) =>
              updateFinancingData({
                ...projectState.financing.data,
                loanName: event.currentTarget.value
              })
            }
          />
        </label>
        <NumberSliderField
          label="Sollzins"
          value={projectState.financing.data.annualInterestRatePct}
          min={0}
          max={10}
          step={0.05}
          unit="%"
          onChange={(annualInterestRatePct) =>
            updateFinancingData({
              ...projectState.financing.data,
              annualInterestRatePct
            })
          }
        />
        <NumberSliderField
          label="Laufzeit"
          value={projectState.financing.data.termYears}
          min={1}
          max={40}
          step={1}
          unit="Jahre"
          onChange={(termYears) =>
            updateFinancingData({ ...projectState.financing.data, termYears })
          }
        />
        <NumberSliderField
          label="Startmonat"
          value={projectState.financing.data.startMonth}
          min={0}
          max={120}
          step={1}
          unit="Monat"
          onChange={(startMonth) =>
            updateFinancingData({ ...projectState.financing.data, startMonth })
          }
        />
        <NumberSliderField
          label="Sondertilgung monatlich"
          value={projectState.financing.data.additionalMonthlyRepayment}
          min={0}
          max={5000}
          step={50}
          unit="EUR"
          onChange={(additionalMonthlyRepayment) =>
            updateFinancingData({
              ...projectState.financing.data,
              additionalMonthlyRepayment
            })
          }
        />
      </div>
    </div>
  );
}

function StrategyEditor({
  projectState,
  onTemplateChange
}: {
  projectState: ProjectState;
  onTemplateChange: (
    kind: TemplateKind,
    template: TemplateEnvelope<unknown>
  ) => void;
}) {
  function updateStrategyData(data: ProjectState["strategy"]["data"]) {
    onTemplateChange("strategy", {
      ...projectState.strategy,
      data
    });
  }

  return (
    <div className="form-grid">
      <div className="form-section">
        <h3>Liquiditaetsziele</h3>
        <NumberSliderField
          label="Reserve-Monate"
          value={projectState.strategy.data.reserveMonths}
          min={0}
          max={24}
          step={1}
          unit="Monate"
          onChange={(reserveMonths) =>
            updateStrategyData({ ...projectState.strategy.data, reserveMonths })
          }
        />
        <NumberSliderField
          label="Mindestliquiditaet"
          value={projectState.strategy.data.minimumLiquidityAmount}
          min={0}
          max={250000}
          step={1000}
          unit="EUR"
          onChange={(minimumLiquidityAmount) =>
            updateStrategyData({
              ...projectState.strategy.data,
              minimumLiquidityAmount
            })
          }
        />
        <NumberSliderField
          label="Zielliquiditaet"
          value={projectState.strategy.data.targetLiquidityAmount}
          min={0}
          max={500000}
          step={1000}
          unit="EUR"
          onChange={(targetLiquidityAmount) =>
            updateStrategyData({
              ...projectState.strategy.data,
              targetLiquidityAmount
            })
          }
        />
        <NumberSliderField
          label="Ziel-EK-Quote"
          value={projectState.strategy.data.targetEquityRatioPct}
          min={0}
          max={100}
          step={1}
          unit="%"
          onChange={(targetEquityRatioPct) =>
            updateStrategyData({
              ...projectState.strategy.data,
              targetEquityRatioPct
            })
          }
        />
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={projectState.strategy.data.rentOffsetsOwnerContributions}
            onChange={(event) =>
              updateStrategyData({
                ...projectState.strategy.data,
                rentOffsetsOwnerContributions: event.currentTarget.checked
              })
            }
          />
          <span>Mieteinnahmen reduzieren Eignerbeitraege</span>
        </label>
      </div>
      <div className="form-section">
        <h3>Kapital- und Nutzungssystem</h3>
        <label className="text-field">
          <span>Kapitalanteilsmodus</span>
          <select
            aria-label="Kapitalanteilsmodus"
            value={projectState.strategy.data.capitalShareMode}
            onChange={(event) =>
              updateStrategyData({
                ...projectState.strategy.data,
                capitalShareMode: event.currentTarget
                  .value as ProjectState["strategy"]["data"]["capitalShareMode"]
              })
            }
          >
            <option value="scheduledPrincipal">Tilgung nach Start-EK-Anteil</option>
            <option value="manualMonthly">Manuelle Kapitalruecklagen</option>
          </select>
        </label>
        <NumberSliderField
          label="Bewertungszins Anlage"
          value={projectState.strategy.data.capitalValuationInterestPct}
          min={-5}
          max={10}
          step={0.25}
          unit="%/Jahr"
          onChange={(capitalValuationInterestPct) =>
            updateStrategyData({
              ...projectState.strategy.data,
              capitalValuationInterestPct
            })
          }
        />
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={projectState.strategy.data.scheduledPrincipalAffectsCompanyShare}
            onChange={(event) =>
              updateStrategyData({
                ...projectState.strategy.data,
                scheduledPrincipalAffectsCompanyShare:
                  event.currentTarget.checked
              })
            }
          />
          <span>Tilgung veraendert Unternehmensanteile</span>
        </label>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={
              projectState.strategy.data
                .manualCapitalContributionsAffectCompanyShare
            }
            onChange={(event) =>
              updateStrategyData({
                ...projectState.strategy.data,
                manualCapitalContributionsAffectCompanyShare:
                  event.currentTarget.checked
              })
            }
          />
          <span>Kapitalruecklage / Anlage veraendert Unternehmensanteile</span>
        </label>
        <label className="text-field">
          <span>Nutzungsrechte</span>
          <select
            aria-label="Punkte Anteilsmodus"
            value={projectState.strategy.data.pointShareMode}
            onChange={(event) =>
              updateStrategyData({
                ...projectState.strategy.data,
                pointShareMode: event.currentTarget.value as ProjectState["strategy"]["data"]["pointShareMode"]
              })
            }
          >
            <option value="usage">Aus Nutzungsentgelt berechnen</option>
            <option value="blended">Altbestand: Mischanteil</option>
            <option value="tier">Altbestand: Nutzungsgewicht</option>
            <option value="equity">Altbestand: Unternehmensanteil</option>
          </select>
        </label>
        <NumberSliderField
          label="Altbestand Nutzungsgewicht"
          value={projectState.strategy.data.pointTierWeight}
          min={0}
          max={100}
          step={5}
          unit="%"
          onChange={(pointTierWeight) =>
            updateStrategyData({
              ...projectState.strategy.data,
              pointTierWeight
            })
          }
        />
        <NumberSliderField
          label="Altbestand Unternehmensgewicht"
          value={projectState.strategy.data.pointEquityWeight}
          min={0}
          max={100}
          step={5}
          unit="%"
          onChange={(pointEquityWeight) =>
            updateStrategyData({
              ...projectState.strategy.data,
              pointEquityWeight
            })
          }
        />
        <NumberSliderField
          label="Wertsteigerung"
          value={projectState.strategy.data.appreciationPercentPerYear}
          min={-5}
          max={10}
          step={0.25}
          unit="%/Jahr"
          onChange={(appreciationPercentPerYear) =>
            updateStrategyData({
              ...projectState.strategy.data,
              appreciationPercentPerYear
            })
          }
        />
        <NumberSliderField
          label="Eigennutzung Wochenende"
          value={projectState.strategy.data.ownerWeekendUsagePct}
          min={0}
          max={100}
          step={5}
          unit="%"
          onChange={(ownerWeekendUsagePct) =>
            updateStrategyData({
              ...projectState.strategy.data,
              ownerWeekendUsagePct
            })
          }
        />
        <NumberSliderField
          label="Fremdgaeste Wochenende"
          value={projectState.strategy.data.guestWeekendUsagePct}
          min={0}
          max={100}
          step={5}
          unit="%"
          onChange={(guestWeekendUsagePct) =>
            updateStrategyData({
              ...projectState.strategy.data,
              guestWeekendUsagePct
            })
          }
        />
        <NumberSliderField
          label="Externe Auslastung"
          value={projectState.strategy.data.externalOccupancyRatePct}
          min={0}
          max={100}
          step={5}
          unit="%"
          onChange={(externalOccupancyRatePct) =>
            updateStrategyData({
              ...projectState.strategy.data,
              externalOccupancyRatePct
            })
          }
        />
        <NumberSliderField
          label="Durchschnittspreis Fremdnacht"
          value={projectState.strategy.data.averageGrossPricePerExternalRoomNight}
          min={0}
          max={500}
          step={5}
          unit="EUR"
          onChange={(averageGrossPricePerExternalRoomNight) =>
            updateStrategyData({
              ...projectState.strategy.data,
              averageGrossPricePerExternalRoomNight
            })
          }
        />
        <NumberSliderField
          label="Verdraengungsfaktor Eigennutzung"
          value={projectState.strategy.data.ownerUseDisplacementFactorPct}
          min={0}
          max={100}
          step={5}
          unit="%"
          onChange={(ownerUseDisplacementFactorPct) =>
            updateStrategyData({
              ...projectState.strategy.data,
              ownerUseDisplacementFactorPct
            })
          }
        />
        <NumberSliderField
          label="Variable Kosten je Zimmernacht"
          value={projectState.strategy.data.variableCostPerRoomNightAmount}
          min={0}
          max={200}
          step={5}
          unit="EUR"
          onChange={(variableCostPerRoomNightAmount) =>
            updateStrategyData({
              ...projectState.strategy.data,
              variableCostPerRoomNightAmount
            })
          }
        />
        <NumberSliderField
          label="Ruecklage je Zimmernacht"
          value={projectState.strategy.data.reservePerRoomNightAmount}
          min={0}
          max={200}
          step={5}
          unit="EUR"
          onChange={(reservePerRoomNightAmount) =>
            updateStrategyData({
              ...projectState.strategy.data,
              reservePerRoomNightAmount
            })
          }
        />
      </div>
      <div className="form-section">
        <h3>Entscheidungs-Pruefpunkte</h3>
        {projectState.strategy.data.goNoGoChecks.map((check) => (
          <div className="nested-item" key={check.id}>
            <label className="text-field">
              <span>{check.label}</span>
              <select
                aria-label={`${check.label} Status`}
                value={check.status}
                onChange={(event) =>
                  updateStrategyData({
                    ...projectState.strategy.data,
                    goNoGoChecks: projectState.strategy.data.goNoGoChecks.map(
                      (candidate) =>
                        candidate.id === check.id
                          ? {
                              ...candidate,
                              status: event.currentTarget.value as GoNoGoStatus
                            }
                          : candidate
                    )
                  })
                }
              >
                <option value="open">Offen</option>
                <option value="clarified">Schriftlich geklaert</option>
                <option value="notApplicable">Nicht anwendbar</option>
                <option value="critical">Kritisch</option>
              </select>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

function PointRulesEditor({
  projectState,
  updatePropertyData
}: {
  projectState: ProjectState;
  updatePropertyData: (data: ProjectState["property"]["data"]) => void;
}) {
  const rules = projectState.property.data.pointRules;

  function updateRules(pointRules: ProjectState["property"]["data"]["pointRules"]) {
    updatePropertyData({
      ...projectState.property.data,
      pointRules
    });
  }

  return (
    <div className="form-section">
      <h3>Punktregeln fuer Zimmernaechte</h3>
      <NumberSliderField
        label="Theoretische Punkte je Zimmer/Jahr"
        value={rules.basePointsPerBedPerYear}
        min={0}
        max={1000}
        step={5}
        unit="Punkte"
        onChange={(basePointsPerBedPerYear) =>
          updateRules({ ...rules, basePointsPerBedPerYear })
        }
      />
      <NumberSliderField
        label="Basispreis je Zimmernacht"
        value={rules.basePerBedPerNight}
        min={0}
        max={200}
        step={0.1}
        unit="EUR-Punkte"
        onChange={(basePerBedPerNight) =>
          updateRules({ ...rules, basePerBedPerNight })
        }
      />
      <NumberSliderField
        label="Winter/Ski-Faktor"
        value={rules.seasonMultipliers.winterSki}
        min={0}
        max={5}
        step={0.1}
        unit="x"
        onChange={(winterSki) =>
          updateRules({
            ...rules,
            seasonMultipliers: { ...rules.seasonMultipliers, winterSki }
          })
        }
      />
      <NumberSliderField
        label="Sommer-Faktor"
        value={rules.seasonMultipliers.summer}
        min={0}
        max={5}
        step={0.1}
        unit="x"
        onChange={(summer) =>
          updateRules({
            ...rules,
            seasonMultipliers: { ...rules.seasonMultipliers, summer }
          })
        }
      />
      <NumberSliderField
        label="Sa/So-Faktor"
        value={rules.weekendMultipliers.satSun}
        min={0}
        max={5}
        step={0.1}
        unit="x"
        onChange={(satSun) =>
          updateRules({
            ...rules,
            weekendMultipliers: { ...rules.weekendMultipliers, satSun }
          })
        }
      />
      <NumberSliderField
        label="Freitag-Faktor"
        value={rules.weekendMultipliers.fri}
        min={0}
        max={5}
        step={0.1}
        unit="x"
        onChange={(fri) =>
          updateRules({
            ...rules,
            weekendMultipliers: { ...rules.weekendMultipliers, fri }
          })
        }
      />
      <NumberSliderField
        label="Mo-Do-Faktor"
        value={rules.weekendMultipliers.monThu}
        min={0}
        max={5}
        step={0.1}
        unit="x"
        onChange={(monThu) =>
          updateRules({
            ...rules,
            weekendMultipliers: { ...rules.weekendMultipliers, monThu }
          })
        }
      />
    </div>
  );
}

function RenovationEditor({
  projectState,
  updatePropertyData
}: {
  projectState: ProjectState;
  updatePropertyData: (data: ProjectState["property"]["data"]) => void;
}) {
  function updateRenovations(renovationItems: PropertyRenovationItem[]) {
    updatePropertyData({
      ...projectState.property.data,
      renovationItems
    });
  }

  return (
    <div className="form-section">
      <div className="subsection-header">
        <h3>Renovierungen</h3>
        <button
          className="icon-button"
          type="button"
          onClick={() =>
            updateRenovations([
              ...projectState.property.data.renovationItems,
              {
                id: `renovation-${projectState.property.data.renovationItems.length + 1}`,
                label: `Renovierung ${projectState.property.data.renovationItems.length + 1}`,
                category: "renovation",
                amount: 10000,
                timingMonth: 0
              }
            ])
          }
        >
          <Plus aria-hidden="true" size={16} />
          <span>Hinzufuegen</span>
        </button>
      </div>
      {projectState.property.data.renovationItems.map((item) => (
        <div className="nested-item" key={item.id}>
          <div className="subsection-header">
            <label className="text-field">
              <span>Bezeichnung</span>
              <input
                aria-label={`${item.label} Bezeichnung`}
                value={item.label}
                onChange={(event) =>
                  updateRenovations(
                    projectState.property.data.renovationItems.map((candidate) =>
                      candidate.id === item.id
                        ? { ...candidate, label: event.currentTarget.value }
                        : candidate
                    )
                  )
                }
              />
            </label>
            <button
              className="icon-button danger"
              type="button"
              onClick={() =>
                updateRenovations(
                  projectState.property.data.renovationItems.filter(
                    (candidate) => candidate.id !== item.id
                  )
                )
              }
            >
              <Trash2 aria-hidden="true" size={16} />
              <span>Loeschen</span>
            </button>
          </div>
          <NumberSliderField
            label="Betrag"
            value={item.amount}
            min={0}
            max={250000}
            step={1000}
            unit="EUR"
            onChange={(amount) =>
              updateRenovations(
                projectState.property.data.renovationItems.map((candidate) =>
                  candidate.id === item.id ? { ...candidate, amount } : candidate
                )
              )
            }
          />
          <NumberSliderField
            label="Zeitpunkt"
            value={item.timingMonth}
            min={0}
            max={120}
            step={1}
            unit="Monat"
            onChange={(timingMonth) =>
              updateRenovations(
                projectState.property.data.renovationItems.map((candidate) =>
                  candidate.id === item.id
                    ? { ...candidate, timingMonth }
                    : candidate
                )
              )
            }
          />
        </div>
      ))}
    </div>
  );
}

function OpexEditor({
  projectState,
  onTemplateChange
}: {
  projectState: ProjectState;
  onTemplateChange: (
    kind: TemplateKind,
    template: TemplateEnvelope<unknown>
  ) => void;
}) {
  function updateItems(items: ProjectState["opex"]["data"]["recurringItems"]) {
    onTemplateChange("opex", {
      ...projectState.opex,
      data: {
        ...projectState.opex.data,
        recurringItems: items
      }
    });
  }

  const opexSummary = summarizeOpex(projectState);

  return (
    <div className="form-grid">
      <div className="form-section">
        <h3>Betriebskosten-Plausibilitaet</h3>
        <DataPreview
          rows={[
            ["Modelliert pro Jahr", formatMoney(opexSummary.annualTotal)],
            ["Modelliert pro Monat", formatMoney(opexSummary.monthlyTotal)],
            ["Ansatz je Wohnflaeche", opexSummary.perSqmLabel],
            ["Offene Kategorien", opexSummary.missingCategories]
          ]}
        />
        <p className="muted">
          Nur angelegte Kostenbloecke gehen in Bankkonto-Zahlungsfluss und
          Beitraege ein. Fehlende Kategorien sind offene Annahmen.
        </p>
      </div>
      <button
        className="icon-button"
        type="button"
        onClick={() =>
          updateItems([
            ...projectState.opex.data.recurringItems,
            {
              id: `opex-${projectState.opex.data.recurringItems.length + 1}`,
              label: `Kostenblock ${projectState.opex.data.recurringItems.length + 1}`,
              amount: 1200,
              annualAmount: 1200,
              annualCostMode: "fixed",
              period: "yearly",
              recoverableFromTenants: false,
              inflationPct: 2,
              category: "other"
            }
          ])
        }
      >
        <Plus aria-hidden="true" size={16} />
        <span>Betriebskostenblock hinzufuegen</span>
      </button>
      {projectState.opex.data.recurringItems.map((item) => (
        <div className="form-section" key={item.id}>
          <div className="subsection-header">
            <label className="text-field">
              <span>Bezeichnung</span>
              <input
                aria-label={`${item.label} Bezeichnung`}
                value={item.label}
                onChange={(event) =>
                  updateItems(
                    projectState.opex.data.recurringItems.map((candidate) =>
                      candidate.id === item.id
                        ? { ...candidate, label: event.currentTarget.value }
                        : candidate
                    )
                  )
                }
              />
            </label>
            <button
              className="icon-button danger"
              type="button"
              onClick={() =>
                updateItems(
                  projectState.opex.data.recurringItems.filter(
                    (candidate) => candidate.id !== item.id
                  )
                )
              }
            >
              <Trash2 aria-hidden="true" size={16} />
              <span>Loeschen</span>
            </button>
          </div>
          <label className="text-field">
            <span>Kostenbasis</span>
            <select
              aria-label={`${item.label} Kostenbasis`}
              value={item.annualCostMode}
              onChange={(event) =>
                updateItems(
                  projectState.opex.data.recurringItems.map((candidate) =>
                    candidate.id === item.id
                      ? {
                          ...candidate,
                          annualCostMode: event.currentTarget
                            .value as OpexAnnualCostMode
                        }
                      : candidate
                  )
                )
              }
            >
              <option value="fixed">Fix pro Jahr</option>
              <option value="rentableArea">Pro Wohnflaeche</option>
              <option value="plotArea">Pro Grundstuecksflaeche</option>
              <option value="propertyValue">Prozent Immobilienwert</option>
            </select>
          </label>
          <NumberSliderField
            label="Jahreswert"
            value={item.annualAmount ?? item.amount}
            min={0}
            max={item.annualCostMode === "propertyValue" ? 10 : 50000}
            step={item.annualCostMode === "propertyValue" ? 0.05 : 50}
            unit={opexUnit(item.annualCostMode)}
            onChange={(annualAmount) =>
              updateItems(
                projectState.opex.data.recurringItems.map((candidate) =>
                  candidate.id === item.id
                    ? { ...candidate, annualAmount, amount: annualAmount }
                    : candidate
                )
              )
            }
          />
          <NumberSliderField
            label="Inflation"
            value={item.inflationPct ?? 0}
            min={-5}
            max={15}
            step={0.25}
            unit="%"
            onChange={(inflationPct) =>
              updateItems(
                projectState.opex.data.recurringItems.map((candidate) =>
                  candidate.id === item.id
                    ? { ...candidate, inflationPct }
                    : candidate
                )
              )
            }
          />
          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={item.recoverableFromTenants ?? false}
              onChange={(event) =>
                updateItems(
                  projectState.opex.data.recurringItems.map((candidate) =>
                    candidate.id === item.id
                      ? {
                          ...candidate,
                          recoverableFromTenants: event.currentTarget.checked
                        }
                      : candidate
                  )
                )
              }
            />
            <span>Auf Mieter umlegbar</span>
          </label>
        </div>
      ))}
    </div>
  );
}

function withDerivedShares(
  owners: ProjectState["ownership"]["data"]["owners"]
): ProjectState["ownership"]["data"]["owners"] {
  const totalEquity = owners.reduce(
    (total, owner) => total + owner.startEquityContribution,
    0
  );

  return owners.map((owner) => ({
    ...owner,
    equityContribution: owner.startEquityContribution,
    usagePointBudget: owner.monthlyUsageContribution,
    participationTier: owner.monthlyUsageContribution,
    ownershipSharePct:
      totalEquity > 0 ? (owner.startEquityContribution / totalEquity) * 100 : 0,
    companySharePct:
      totalEquity > 0 ? (owner.startEquityContribution / totalEquity) * 100 : 0
  }));
}

function opexUnit(mode: OpexAnnualCostMode | undefined): string {
  if (mode === "rentableArea" || mode === "plotArea") {
    return "EUR/qm/Jahr";
  }

  if (mode === "propertyValue") {
    return "%/Jahr";
  }

  return "EUR/Jahr";
}

function summarizeOpex(projectState: ProjectState): {
  annualTotal: number;
  monthlyTotal: number;
  perSqmLabel: string;
  missingCategories: string;
} {
  const annualTotal = projectState.opex.data.recurringItems.reduce(
    (total, item) => total + annualOpexPreview(projectState, item),
    0
  );
  const area = projectState.property.data.rentableAreaSqm ?? 0;
  const perSqm = area > 0 ? annualTotal / area : 0;
  const missingCategories = [
    ["utilities", "Energie/Wasser/Internet"],
    ["administration", "Verwaltung"],
    ["propertyManagement", "Hausbetreuung/Garten/Winterdienst"],
    ["accounting", "Buchhaltung/Steuer"]
  ]
    .filter(
      ([category]) =>
        !projectState.opex.data.recurringItems.some(
          (item) => item.category === category
        )
    )
    .map(([, label]) => label);

  return {
    annualTotal,
    monthlyTotal: annualTotal / 12,
    perSqmLabel: area > 0 ? `${perSqm.toFixed(2)} EUR/qm/Jahr` : "keine Flaeche",
    missingCategories: missingCategories.length > 0
      ? missingCategories.join(", ")
      : "keine markiert"
  };
}

function annualOpexPreview(
  projectState: ProjectState,
  item: ProjectState["opex"]["data"]["recurringItems"][number]
): number {
  const base = item.annualAmount ?? item.amount;

  if (item.annualCostMode === "rentableArea") {
    return base * (projectState.property.data.rentableAreaSqm ?? 0);
  }
  if (item.annualCostMode === "plotArea") {
    return base * (projectState.property.data.plotAreaSqm ?? 0);
  }
  if (item.annualCostMode === "propertyValue") {
    return (projectState.property.data.purchasePrice * base) / 100;
  }
  if (item.period === "monthly" && item.annualAmount === undefined) {
    return item.amount * 12;
  }
  if (item.period === "quarterly" && item.annualAmount === undefined) {
    return item.amount * 4;
  }
  return base;
}

type LegalFormProfile = {
  value: LegalFormValue;
  label: string;
  liabilityModel: ProjectState["legalForm"]["data"]["liabilityModel"];
  taxModel: ProjectState["legalForm"]["data"]["taxModel"];
  votingModel: NonNullable<ProjectState["legalForm"]["data"]["votingModel"]>;
  liability: string;
  tax: string;
  governance: string;
  effort: string;
  beteiligungstabelle: string;
  darlehenskonten: string;
  exitUebertragung: string;
  bankfaehigkeit: string;
  nutzungsrechte: string;
  umsatzsteuerKomplexitaet: string;
  pruefgatter: string;
  fit: string;
  sourceStatus: string;
};

const LEGAL_FORM_PROFILES: LegalFormProfile[] = [
  {
    value: "coOwnership",
    label: "Miteigentum",
    liabilityModel: "mixed",
    taxModel: "transparent",
    votingModel: "ownershipShare",
    liability: "persoenlich/vertraglich, keine eigene Haftungshuelle",
    tax: "transparent bei den Beteiligten",
    governance: "Benutzungs-, Kosten- und Exitvertrag zentral",
    effort: "niedrig bis mittel",
    beteiligungstabelle: "vertraglich, Grundbuchquoten separat",
    darlehenskonten: "privatrechtlich moeglich, aber konfliktanfaellig",
    exitUebertragung: "Miteigentumsanteile und Vorkaufsrechte regeln",
    bankfaehigkeit: "Einzel- oder Gesamthaftung stark bankabhaengig",
    nutzungsrechte: "nur ueber Benutzungsvereinbarung sauber",
    umsatzsteuerKomplexitaet: "mittel bis hoch bei Vermietung",
    pruefgatter: "Benutzungs-, Kosten-, Exit- und Haftungsvertrag vor Kauf",
    fit: "einfacher Start, aber konflikt- und haftungsintensiv",
    sourceStatus: "Wiki 04_ownership, vor Kauf pruefen"
  },
  {
    value: "gbr",
    label: "GesbR-Syndikat",
    liabilityModel: "unlimited",
    taxModel: "transparent",
    votingModel: "custom",
    liability: "Gesellschafterhaftung vertraglich und gesetzlich pruefen",
    tax: "transparent, keine eigene juristische Person",
    governance: "Gesellschaftsvertrag zentral",
    effort: "mittel",
    beteiligungstabelle: "vertraglich gut moeglich",
    darlehenskonten: "vertraglich moeglich, Rang und Rueckzahlung offen",
    exitUebertragung: "Abtretung, Eintritt und Ausscheiden regeln",
    bankfaehigkeit: "abh. von persoenlicher Haftung und Sicherheiten",
    nutzungsrechte: "vertraglich gut regelbar",
    umsatzsteuerKomplexitaet: "hoch bei gemischter Nutzung",
    pruefgatter: "Haftung, Innenausgleich und Vertretung klaeren",
    fit: "nur mit belastbarem Gesellschaftsvertrag pruefen",
    sourceStatus: "Wiki 04_ownership, Rechtsberatung pruefen"
  },
  {
    value: "verein",
    label: "Verein",
    liabilityModel: "limited",
    taxModel: "association",
    votingModel: "equalPerOwner",
    liability: "primaer Vereinsvermoegen, Zweck-/Gewerbefragen",
    tax: "nur bei stimmigem ideellem Zweck plausibel",
    governance: "Vereinsorgane, Mitgliederlogik",
    effort: "mittel",
    beteiligungstabelle: "schwach, Mitgliedschaft ersetzt keine Beteiligung",
    darlehenskonten: "moeglich, aber Zweck und Fremdueblichkeit pruefen",
    exitUebertragung: "Mitgliedschaft nicht wie Anteil handelbar",
    bankfaehigkeit: "offen, Zweck und Sicherheiten kritisch",
    nutzungsrechte: "mitgliedschaftlich moeglich, investorisch schwach",
    umsatzsteuerKomplexitaet: "hoch bei Entgelt und Drittvermietung",
    pruefgatter: "ideeller Zweck, Gewerbe, Gemeinnuetzigkeit, Nutzung",
    fit: "meist Negativvergleich fuer eigentumsnahe Nutzung",
    sourceStatus: "Wiki 04_ownership, BMI/WKO pruefen"
  },
  {
    value: "gmbh",
    label: "GmbH",
    liabilityModel: "limited",
    taxModel: "corporate",
    votingModel: "ownershipShare",
    liability: "grundsaetzlich Gesellschaftsvermoegen",
    tax: "Koerperschaftsteuer plus Ausschuettungsebene",
    governance: "Geschaeftsfuehrung, Gesellschafterbeschluesse",
    effort: "hoch",
    beteiligungstabelle: "stark ueber Geschaeftsanteile",
    darlehenskonten: "gut abbildbar, Fremdueblichkeit pruefen",
    exitUebertragung: "Anteilsuebertragung notariell/vertraglich regeln",
    bankfaehigkeit: "grundsaetzlich gut, Eigenmittel und Sicherheiten zentral",
    nutzungsrechte: "separater Nutzungsvertrag erforderlich",
    umsatzsteuerKomplexitaet: "hoch bei Eigennutzung und Vermietung",
    pruefgatter: "Kapital, Ausschuettung, verdeckte Vorteile, USt",
    fit: "professioneller Rechtstraeger, laufend teurer",
    sourceStatus: "Wiki 04_ownership, WKO/USP pruefen"
  },
  {
    value: "flexCo",
    label: "FlexCo",
    liabilityModel: "limited",
    taxModel: "corporate",
    votingModel: "ownershipShare",
    liability: "kapitalgesellschaftlich beschraenkt",
    tax: "Koerperschaftsteuer plus Ausschuettungsebene",
    governance: "aehnlich GmbH, flexiblere Beteiligung",
    effort: "hoch",
    beteiligungstabelle: "stark, auch fuer Beteiligungsinstrumente",
    darlehenskonten: "gut abbildbar, Fremdueblichkeit pruefen",
    exitUebertragung: "flexibler als GmbH, Details pruefen",
    bankfaehigkeit: "offen bis gut, Bankpraxis gesondert pruefen",
    nutzungsrechte: "separater Nutzungsvertrag erforderlich",
    umsatzsteuerKomplexitaet: "hoch bei Eigennutzung und Vermietung",
    pruefgatter: "FlexCo-Eignung fuer Immobilienvehikel klaeren",
    fit: "moeglich, aber fuer Immo-Gruppe gesondert pruefen",
    sourceStatus: "Wiki/Quellen ergaenzen"
  },
  {
    value: "kg",
    label: "KG",
    liabilityModel: "mixed",
    taxModel: "transparent",
    votingModel: "custom",
    liability: "Komplementaer unbeschraenkt, Kommanditisten beschraenkt",
    tax: "transparent, Gesellschaft fuer USt/Lohn relevant",
    governance: "Gesellschaftsvertrag kann Anteile gut abbilden",
    effort: "mittel",
    beteiligungstabelle: "stark ueber Kapitalkonten und Vertrag",
    darlehenskonten: "gut abbildbar",
    exitUebertragung: "Kommanditanteile und Zustimmung regeln",
    bankfaehigkeit: "mittel bis gut, Komplementaerhaftung zentral",
    nutzungsrechte: "separater Nutzungs- und Kostenvertrag",
    umsatzsteuerKomplexitaet: "hoch bei gemischter Nutzung",
    pruefgatter: "Komplementaerhaftung, Kapitalkonten, Steuertransparenz",
    fit: "guter Kompromiss bei klarer Haftungsbereitschaft",
    sourceStatus: "Wiki 04_ownership, WKO pruefen"
  },
  {
    value: "gmbhCoKg",
    label: "GmbH & Co KG",
    liabilityModel: "mixed",
    taxModel: "transparent",
    votingModel: "custom",
    liability: "Haftungsschirm ueber GmbH-Komplementaerin",
    tax: "KG-Transparenz plus GmbH-Ebene",
    governance: "zwei Ebenen, sauberer Gesellschaftsvertrag",
    effort: "hoch bis sehr hoch",
    beteiligungstabelle: "stark ueber KG-Kapitalkonten",
    darlehenskonten: "sehr gut abbildbar, Rang sauber regeln",
    exitUebertragung: "mehrstufig, aber gut vertraglich regelbar",
    bankfaehigkeit: "tendenziell gut, aber Strukturkosten hoeher",
    nutzungsrechte: "separater Nutzungs- und Kostenvertrag",
    umsatzsteuerKomplexitaet: "hoch bei gemischter Nutzung",
    pruefgatter: "Kosten, zwei Ebenen, Bankakzeptanz, USt",
    fit: "stark fuer gemischtes Modell, aber teuer/komplex",
    sourceStatus: "Wiki 04_ownership, WKO pruefen"
  },
  {
    value: "genossenschaft",
    label: "Genossenschaft",
    liabilityModel: "limited",
    taxModel: "corporate",
    votingModel: "equalPerOwner",
    liability: "je nach Satzung und Anteilsmodell zu pruefen",
    tax: "eigener Rechtstraeger, Details offen",
    governance: "mitgliederorientiert, formal",
    effort: "hoch",
    beteiligungstabelle: "mitglieder- und anteilsbezogen gesondert pruefen",
    darlehenskonten: "moeglich, aber Satzung und Pruefung relevant",
    exitUebertragung: "Austritt und Rueckverguetung satzungsabhaengig",
    bankfaehigkeit: "offen, Zweck und Pruefverband relevant",
    nutzungsrechte: "mitgliederorientiert plausibel, Details offen",
    umsatzsteuerKomplexitaet: "hoch bei Entgelt und Vermietung",
    pruefgatter: "Gruendungsaufwand, Pruefpflicht, Satzung, Zweck",
    fit: "nur als Sonderfall pruefen",
    sourceStatus: "Quellen im Wiki ergaenzen"
  },
  {
    value: "other",
    label: "Sonstige / individuell",
    liabilityModel: "unknown",
    taxModel: "unknown",
    votingModel: "unknown",
    liability: "offen",
    tax: "offen",
    governance: "offen",
    effort: "offen",
    beteiligungstabelle: "offen",
    darlehenskonten: "offen",
    exitUebertragung: "offen",
    bankfaehigkeit: "offen",
    nutzungsrechte: "offen",
    umsatzsteuerKomplexitaet: "offen",
    pruefgatter: "Einzelfallentscheidung",
    fit: "nur mit Einzelfallpruefung",
    sourceStatus: "fehlt"
  }
];

const LEGAL_FORM_OPTIONS = LEGAL_FORM_PROFILES.map(({ value, label }) => ({
  value,
  label
}));

function legalFormProfile(value: LegalFormValue): LegalFormProfile {
  return (
    LEGAL_FORM_PROFILES.find((profile) => profile.value === value) ??
    LEGAL_FORM_PROFILES.at(-1)!
  );
}

const AUSTRIAN_STATE_OPTIONS: {
  value: AustrianFederalState;
  label: string;
}[] = [
  { value: "BGLD", label: "Burgenland" },
  { value: "KTN", label: "Kaernten" },
  { value: "NOE", label: "Niederoesterreich" },
  { value: "OOE", label: "Oberoesterreich" },
  { value: "SBG", label: "Salzburg" },
  { value: "STMK", label: "Steiermark" },
  { value: "T", label: "Tirol" },
  { value: "VBG", label: "Vorarlberg" },
  { value: "W", label: "Wien" }
];

const PROPERTY_USE_OPTIONS: { value: PropertyUseType; label: string }[] = [
  { value: "holidayHome", label: "Ferienhaus / Eigennutzung" },
  { value: "touristicRental", label: "Touristische Vermietung" },
  { value: "mixedUse", label: "Gemischte Nutzung" },
  { value: "companyUse", label: "Firmennutzung" },
  { value: "privateUse", label: "Private Nutzung" },
  { value: "unknown", label: "Nutzung offen" }
];

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="summary-line">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function DataPreview({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="definition-grid">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value || "kein Wert"}</dd>
        </div>
      ))}
    </dl>
  );
}

function numberPreview(value: number | undefined, unit: string): string {
  if (value === undefined) {
    return "";
  }
  return `${value.toLocaleString("de-DE")}${unit ? ` ${unit}` : ""}`;
}

function candidateFromPropertyData(
  data: ProjectState["property"]["data"]
): CandidateHouse {
  const title = data.title?.trim() || "Importiertes Inserat";
  const place =
    data.municipality ??
    data.addressData?.place ??
    data.address ??
    "Ort offen";
  const id = data.sourceUrl
    ? `import-${slugId(data.sourceUrl)}`
    : `import-${slugId(title)}`;

  return {
    id,
    title,
    place,
    postalCode: data.addressData?.postalCode,
    federalState: data.federalState === "T" ? "Tirol" : data.addressData?.region,
    purchasePrice: data.purchasePrice,
    rentableAreaSqm: data.rentableAreaSqm,
    plotAreaSqm: data.plotAreaSqm,
    pricePerSqm: data.pricePerM2Eur,
    rooms: data.rooms,
    bedrooms: data.bedrooms,
    beds: data.beds,
    bathrooms: data.bathrooms,
    toilets: data.toilets,
    yearBuilt: data.yearBuilt,
    condition: data.condition,
    heating: data.heating.join(", "),
    brokerPct: data.closingCosts.brokerPct,
    closingCostsPctRough:
      data.closingCosts.realEstateTransferTaxPct +
      data.closingCosts.notaryPct +
      data.closingCosts.landRegistryPct +
      data.closingCosts.brokerPct,
    totalCostRough:
      data.purchasePrice *
      (1 +
        (data.closingCosts.realEstateTransferTaxPct +
          data.closingCosts.notaryPct +
          data.closingCosts.landRegistryPct +
          data.closingCosts.brokerPct) /
          100),
    sourceUrl: data.sourceUrl,
    guestNightsPerYear: data.guestNightsPerYear,
    travelTimes: [],
    skiAreas: [],
    tourismStatus: "Importiert; Nutzung rechtlich pruefen",
    highlights: data.features.join(", "),
    risks: "Nach Import pruefen: Widmung, Freizeitwohnsitz, Skigebiet, Fahrzeiten."
  };
}

function stripUndefined<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined)
  ) as Partial<T>;
}

function slugId(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || "listing";
}
