import { Download, FolderOpen, Save } from "lucide-react";
import type { TemplateEnvelope, TemplateKind } from "../../domain/templates";
import { visibleInputModules } from "../../modules/registry";
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
        <div className="form-grid">
          {projectState.ownership.data.owners.map((owner) => (
            <NumberSliderField
              key={owner.id}
              label={`${owner.displayName} Anteil`}
              value={owner.ownershipSharePct}
              min={0}
              max={100}
              step={0.5}
              unit="%"
              onChange={(ownershipSharePct) =>
                onTemplateChange("ownership", {
                  ...projectState.ownership,
                  data: {
                    ...projectState.ownership.data,
                    owners: projectState.ownership.data.owners.map((candidate) =>
                      candidate.id === owner.id
                        ? { ...candidate, ownershipSharePct }
                        : candidate
                    )
                  }
                })
              }
            />
          ))}
          <SummaryLine
            label="Summe Anteile"
            value={formatPercent(
              projectState.ownership.data.owners.reduce(
                (total, owner) => total + owner.ownershipSharePct,
                0
              )
            )}
          />
        </div>
      );
    case "legalForm":
      return (
        <dl className="definition-grid">
          <dt>Gesellschaftsform</dt>
          <dd>{projectState.legalForm.data.legalForm}</dd>
          <dt>Haftungsmodell</dt>
          <dd>{projectState.legalForm.data.liabilityModel}</dd>
          <dt>Steuermodell</dt>
          <dd>{projectState.legalForm.data.taxModel}</dd>
        </dl>
      );
    case "capex":
      return (
        <div className="form-grid">
          {projectState.capex.data.items.map((item) => (
            <div className="form-section" key={item.id}>
              <h3>{item.label}</h3>
              <NumberSliderField
                label="Betrag"
                value={item.amount}
                min={0}
                max={250000}
                step={1000}
                unit="EUR"
                onChange={(amount) =>
                  onTemplateChange("capex", {
                    ...projectState.capex,
                    data: {
                      ...projectState.capex.data,
                      items: projectState.capex.data.items.map((candidate) =>
                        candidate.id === item.id ? { ...candidate, amount } : candidate
                      )
                    }
                  })
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
                  onTemplateChange("capex", {
                    ...projectState.capex,
                    data: {
                      ...projectState.capex.data,
                      items: projectState.capex.data.items.map((candidate) =>
                        candidate.id === item.id
                          ? { ...candidate, timingMonth }
                          : candidate
                      )
                    }
                  })
                }
              />
            </div>
          ))}
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
            <NumberSliderField
              label="Eigenkapital"
              value={projectState.financing.data.equitySharePct}
              min={0}
              max={100}
              step={1}
              unit="%"
              onChange={(equitySharePct) =>
                onTemplateChange("financing", {
                  ...projectState.financing,
                  data: { ...projectState.financing.data, equitySharePct }
                })
              }
            />
            <NumberSliderField
              label="Sollzins"
              value={projectState.financing.data.annualInterestRatePct}
              min={0}
              max={10}
              step={0.05}
              unit="%"
              onChange={(annualInterestRatePct) =>
                onTemplateChange("financing", {
                  ...projectState.financing,
                  data: {
                    ...projectState.financing.data,
                    annualInterestRatePct
                  }
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
                onTemplateChange("financing", {
                  ...projectState.financing,
                  data: { ...projectState.financing.data, termYears }
                })
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
                onTemplateChange("financing", {
                  ...projectState.financing,
                  data: { ...projectState.financing.data, startMonth }
                })
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
                onTemplateChange("financing", {
                  ...projectState.financing,
                  data: {
                    ...projectState.financing.data,
                    additionalMonthlyRepayment
                  }
                })
              }
            />
          </div>
        </div>
      );
    case "property":
      return (
        <div className="form-grid">
          <NumberSliderField
            label="Kaufpreis"
            value={projectState.property.data.purchasePrice}
            min={0}
            max={2000000}
            step={5000}
            unit="EUR"
            onChange={(purchasePrice) =>
              onTemplateChange("property", {
                ...projectState.property,
                data: { ...projectState.property.data, purchasePrice }
              })
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
              onTemplateChange("property", {
                ...projectState.property,
                data: { ...projectState.property.data, expectedMonthlyRent }
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
              onTemplateChange("property", {
                ...projectState.property,
                data: { ...projectState.property.data, vacancyRatePct }
              })
            }
          />
          <NumberSliderField
            label="Flaeche"
            value={projectState.property.data.rentableAreaSqm ?? 0}
            min={0}
            max={2000}
            step={10}
            unit="qm"
            onChange={(rentableAreaSqm) =>
              onTemplateChange("property", {
                ...projectState.property,
                data: { ...projectState.property.data, rentableAreaSqm }
              })
            }
          />
          <NumberSliderField
            label="Einheiten"
            value={projectState.property.data.units ?? 1}
            min={1}
            max={50}
            step={1}
            onChange={(units) =>
              onTemplateChange("property", {
                ...projectState.property,
                data: { ...projectState.property.data, units }
              })
            }
          />
        </div>
      );
    case "closingCosts":
      return (
        <div className="form-grid">
          <NumberSliderField
            label="Grunderwerbsteuer"
            value={projectState.closingCosts.data.realEstateTransferTaxPct}
            min={0}
            max={10}
            step={0.1}
            unit="%"
            onChange={(realEstateTransferTaxPct) =>
              onTemplateChange("closingCosts", {
                ...projectState.closingCosts,
                data: {
                  ...projectState.closingCosts.data,
                  realEstateTransferTaxPct
                }
              })
            }
          />
          <NumberSliderField
            label="Notar"
            value={projectState.closingCosts.data.notaryPct}
            min={0}
            max={5}
            step={0.1}
            unit="%"
            onChange={(notaryPct) =>
              onTemplateChange("closingCosts", {
                ...projectState.closingCosts,
                data: { ...projectState.closingCosts.data, notaryPct }
              })
            }
          />
          <NumberSliderField
            label="Grundbuch"
            value={projectState.closingCosts.data.landRegistryPct}
            min={0}
            max={5}
            step={0.1}
            unit="%"
            onChange={(landRegistryPct) =>
              onTemplateChange("closingCosts", {
                ...projectState.closingCosts,
                data: { ...projectState.closingCosts.data, landRegistryPct }
              })
            }
          />
          <NumberSliderField
            label="Makler"
            value={projectState.closingCosts.data.brokerPct}
            min={0}
            max={8}
            step={0.1}
            unit="%"
            onChange={(brokerPct) =>
              onTemplateChange("closingCosts", {
                ...projectState.closingCosts,
                data: { ...projectState.closingCosts.data, brokerPct }
              })
            }
          />
          {projectState.closingCosts.data.otherCosts.map((item) => (
            <NumberSliderField
              key={item.id}
              label={item.label}
              value={item.amount}
              min={0}
              max={25000}
              step={100}
              unit="EUR"
              onChange={(amount) =>
                onTemplateChange("closingCosts", {
                  ...projectState.closingCosts,
                  data: {
                    ...projectState.closingCosts.data,
                    otherCosts: projectState.closingCosts.data.otherCosts.map(
                      (candidate) =>
                        candidate.id === item.id ? { ...candidate, amount } : candidate
                    )
                  }
                })
              }
            />
          ))}
        </div>
      );
    case "opex":
      return (
        <div className="form-grid">
          {projectState.opex.data.recurringItems.map((item) => (
            <div className="form-section" key={item.id}>
              <h3>{item.label}</h3>
              <NumberSliderField
                label="Betrag"
                value={item.amount}
                min={0}
                max={50000}
                step={100}
                unit="EUR"
                onChange={(amount) =>
                  onTemplateChange("opex", {
                    ...projectState.opex,
                    data: {
                      ...projectState.opex.data,
                      recurringItems: projectState.opex.data.recurringItems.map(
                        (candidate) =>
                          candidate.id === item.id ? { ...candidate, amount } : candidate
                      )
                    }
                  })
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
                  onTemplateChange("opex", {
                    ...projectState.opex,
                    data: {
                      ...projectState.opex.data,
                      recurringItems: projectState.opex.data.recurringItems.map(
                        (candidate) =>
                          candidate.id === item.id
                            ? { ...candidate, inflationPct }
                            : candidate
                      )
                    }
                  })
                }
              />
            </div>
          ))}
        </div>
      );
    case "financing":
      return null;
  }
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="summary-line">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
