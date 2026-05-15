import { Download, FolderOpen, Plus, Save, Trash2 } from "lucide-react";
import type { TemplateEnvelope, TemplateKind } from "../../domain/templates";
import type {
  LegalFormValue,
  LiabilityModel,
  TaxModel,
  VotingModel
} from "../../modules/legal-form/types";
import { visibleInputModules } from "../../modules/registry";
import type { OpexAnnualCostMode } from "../../modules/opex/types";
import type { PropertyRenovationItem } from "../../modules/property/types";
import type { ProjectState } from "../../state/projectStore";
import { FileActionButton } from "../../ui/buttons/FileActionButton";
import { NumberSliderField } from "../../ui/forms/NumberSliderField";
import { formatPercent } from "../../utils/money";

type InputTabsProps = {
  projectState: ProjectState;
  selectedKind: TemplateKind;
  onSelectKind: (kind: TemplateKind) => void;
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
  selectedKind,
  onSelectKind,
  onTemplateChange,
  onLoadTemplate,
  onSaveTemplate,
  onExportTemplate
}: InputTabsProps) {
  const activeModule = visibleInputModules.find(
    (module) => module.kind === selectedKind
  );
  const activeTemplate = projectState[selectedKind];
  const validation = activeModule?.validate(activeTemplate);

  return (
    <div className="panel">
      <div className="tabs" role="tablist" aria-label="Eingabe-Tabs">
        {visibleInputModules.map((module) => (
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
          <p className="eyebrow">{activeModule?.label}</p>
          <h2>{activeTemplate.name}</h2>
          <span className="muted">Template: {activeTemplate.id}</span>
        </div>
        <div className="button-row">
          <FileActionButton
            label="Laden"
            icon={FolderOpen}
            onClick={() => onLoadTemplate(selectedKind)}
          />
          <FileActionButton
            label="Speichern"
            icon={Save}
            onClick={() => onSaveTemplate(selectedKind)}
          />
          <FileActionButton
            label="Export"
            icon={Download}
            onClick={() => onExportTemplate(selectedKind)}
          />
        </div>
      </div>

      {validation && validation.diagnostics.length > 0 ? (
        <ul className="inline-diagnostics">
          {validation.diagnostics.map((diagnostic) => (
            <li key={diagnostic.id}>{diagnostic.message}</li>
          ))}
        </ul>
      ) : (
        <p className="success-note">Schema und Moduldiagnosen sind gueltig.</p>
      )}

      <InputTabBody
        kind={selectedKind}
        projectState={projectState}
        onTemplateChange={onTemplateChange}
        onLoadTemplate={onLoadTemplate}
        onSaveTemplate={onSaveTemplate}
        onExportTemplate={onExportTemplate}
      />
    </div>
  );
}

function InputTabBody({
  kind,
  projectState,
  onTemplateChange,
  onLoadTemplate,
  onSaveTemplate,
  onExportTemplate
}: {
  kind: TemplateKind;
  projectState: ProjectState;
  onTemplateChange: (
    kind: TemplateKind,
    template: TemplateEnvelope<unknown>
  ) => void;
  onLoadTemplate: (kind: TemplateKind) => void;
  onSaveTemplate: (kind: TemplateKind) => void;
  onExportTemplate: (kind: TemplateKind) => void;
}) {
  switch (kind) {
    case "ownership":
      return (
        <OwnershipEditor
          projectState={projectState}
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
          onLoadTemplate={onLoadTemplate}
          onSaveTemplate={onSaveTemplate}
          onExportTemplate={onExportTemplate}
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
    case "financing":
      return null;
  }
}

function OwnershipEditor({
  projectState,
  onTemplateChange
}: {
  projectState: ProjectState;
  onTemplateChange: (
    kind: TemplateKind,
    template: TemplateEnvelope<unknown>
  ) => void;
}) {
  const totalEquity = projectState.ownership.data.owners.reduce(
    (total, owner) => total + owner.equityContribution,
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
      {projectState.ownership.data.owners.map((owner) => (
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
            label="Eigenkapital"
            value={owner.equityContribution}
            min={0}
            max={500000}
            step={1000}
            unit="EUR"
            onChange={(equityContribution) =>
              updateOwners(
                projectState.ownership.data.owners.map((candidate) =>
                  candidate.id === owner.id
                    ? { ...candidate, equityContribution }
                    : candidate
                )
              )
            }
          />
          <SummaryLine
            label="Abgeleiteter Anteil"
            value={formatPercent(
              totalEquity > 0 ? (owner.equityContribution / totalEquity) * 100 : 0
            )}
          />
        </div>
      ))}
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
              equityContribution: 0,
              ownershipSharePct: 0
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

  return (
    <div className="form-grid">
      <div className="form-section">
        <h3>Gesellschaftsform</h3>
        <label className="text-field">
          <span>Gesellschaftsform</span>
          <select
            aria-label="Gesellschaftsform"
            value={projectState.legalForm.data.legalForm}
            onChange={(event) =>
              updateLegalFormData({
                ...projectState.legalForm.data,
                legalForm: event.currentTarget.value as LegalFormValue
              })
            }
          >
            {LEGAL_FORM_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-field">
          <span>Haftungsmodell</span>
          <select
            aria-label="Haftungsmodell"
            value={projectState.legalForm.data.liabilityModel}
            onChange={(event) =>
              updateLegalFormData({
                ...projectState.legalForm.data,
                liabilityModel: event.currentTarget.value as LiabilityModel
              })
            }
          >
            {LIABILITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-field">
          <span>Steuermodell</span>
          <select
            aria-label="Steuermodell"
            value={projectState.legalForm.data.taxModel}
            onChange={(event) =>
              updateLegalFormData({
                ...projectState.legalForm.data,
                taxModel: event.currentTarget.value as TaxModel
              })
            }
          >
            {TAX_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-field">
          <span>Stimmrechte</span>
          <select
            aria-label="Stimmrechte"
            value={projectState.legalForm.data.votingModel ?? "unknown"}
            onChange={(event) =>
              updateLegalFormData({
                ...projectState.legalForm.data,
                votingModel: event.currentTarget.value as VotingModel
              })
            }
          >
            {VOTING_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
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
    </div>
  );
}

function PropertyEditor({
  projectState,
  onTemplateChange,
  onLoadTemplate,
  onSaveTemplate,
  onExportTemplate
}: {
  projectState: ProjectState;
  onTemplateChange: (
    kind: TemplateKind,
    template: TemplateEnvelope<unknown>
  ) => void;
  onLoadTemplate: (kind: TemplateKind) => void;
  onSaveTemplate: (kind: TemplateKind) => void;
  onExportTemplate: (kind: TemplateKind) => void;
}) {
  function updatePropertyData(data: ProjectState["property"]["data"]) {
    onTemplateChange("property", {
      ...projectState.property,
      data
    });
  }

  function updateFinancingData(data: ProjectState["financing"]["data"]) {
    onTemplateChange("financing", {
      ...projectState.financing,
      data
    });
  }

  return (
    <div className="form-grid">
      <div className="form-section">
        <h3>Immobilie</h3>
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
          label="Reserve"
          value={projectState.property.data.reserveMonths}
          min={0}
          max={24}
          step={1}
          unit="Monate"
          onChange={(reserveMonths) =>
            updatePropertyData({ ...projectState.property.data, reserveMonths })
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

      <div className="form-section">
        <div className="subsection-header">
          <h3>Finanzierung</h3>
          <div className="button-row">
            <FileActionButton
              label="Laden"
              icon={FolderOpen}
              onClick={() => onLoadTemplate("financing")}
            />
            <FileActionButton
              label="Speichern"
              icon={Save}
              onClick={() => onSaveTemplate("financing")}
            />
            <FileActionButton
              label="Export"
              icon={Download}
              onClick={() => onExportTemplate("financing")}
            />
          </div>
        </div>
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

  return (
    <div className="form-grid">
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
        <span>Opex-Block hinzufuegen</span>
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
    (total, owner) => total + owner.equityContribution,
    0
  );

  return owners.map((owner) => ({
    ...owner,
    ownershipSharePct:
      totalEquity > 0 ? (owner.equityContribution / totalEquity) * 100 : 0
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

const LEGAL_FORM_OPTIONS: { value: LegalFormValue; label: string }[] = [
  { value: "gbr", label: "GbR" },
  { value: "gmbh", label: "GmbH" },
  { value: "ug", label: "UG" },
  { value: "verein", label: "Verein" },
  { value: "eg", label: "eG" },
  { value: "kg", label: "KG" },
  { value: "other", label: "Andere" }
];

const LIABILITY_OPTIONS: { value: LiabilityModel; label: string }[] = [
  { value: "unlimited", label: "Unbeschraenkt" },
  { value: "limited", label: "Beschraenkt" },
  { value: "mixed", label: "Gemischt" },
  { value: "unknown", label: "Unklar" }
];

const TAX_OPTIONS: { value: TaxModel; label: string }[] = [
  { value: "transparent", label: "Transparent" },
  { value: "corporate", label: "Koerperschaft" },
  { value: "association", label: "Verein" },
  { value: "unknown", label: "Unklar" }
];

const VOTING_OPTIONS: { value: VotingModel; label: string }[] = [
  { value: "ownershipShare", label: "Nach Anteil" },
  { value: "equalPerOwner", label: "Gleich je Eigner" },
  { value: "custom", label: "Individuell" },
  { value: "unknown", label: "Unklar" }
];

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="summary-line">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
