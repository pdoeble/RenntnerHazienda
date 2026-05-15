import { Download, FolderOpen, Save } from "lucide-react";
import type { TemplateKind } from "../../domain/templates";
import { inputModules } from "../../modules/registry";
import type { ProjectState } from "../../state/projectStore";
import { FileActionButton } from "../../ui/buttons/FileActionButton";
import { formatMoney, formatPercent } from "../../utils/money";

type InputTabsProps = {
  projectState: ProjectState;
  selectedKind: TemplateKind;
  onSelectKind: (kind: TemplateKind) => void;
};

export function InputTabs({
  projectState,
  selectedKind,
  onSelectKind
}: InputTabsProps) {
  const activeModule = inputModules.find((module) => module.kind === selectedKind);
  const activeTemplate = projectState[selectedKind];
  const validation = activeModule?.validate(activeTemplate);

  return (
    <div className="panel">
      <div className="tabs" role="tablist" aria-label="Eingabe-Tabs">
        {inputModules.map((module) => (
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
          <FileActionButton label="Laden" icon={FolderOpen} />
          <FileActionButton label="Speichern" icon={Save} />
          <FileActionButton label="Export" icon={Download} />
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

      <InputTabBody kind={selectedKind} projectState={projectState} />
    </div>
  );
}

function InputTabBody({
  kind,
  projectState
}: {
  kind: TemplateKind;
  projectState: ProjectState;
}) {
  switch (kind) {
    case "ownership":
      return (
        <div className="data-grid">
          {projectState.ownership.data.owners.map((owner) => (
            <div className="data-row" key={owner.id}>
              <span>{owner.displayName}</span>
              <strong>{formatPercent(owner.ownershipSharePct)}</strong>
              <small>{owner.type}</small>
            </div>
          ))}
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
        <div className="data-grid">
          {projectState.capex.data.items.map((item) => (
            <div className="data-row" key={item.id}>
              <span>{item.label}</span>
              <strong>{formatMoney(item.amount)}</strong>
              <small>Monat {item.timingMonth}</small>
            </div>
          ))}
        </div>
      );
    case "property":
      return (
        <dl className="definition-grid">
          <dt>Kaufpreis</dt>
          <dd>{formatMoney(projectState.property.data.purchasePrice)}</dd>
          <dt>Miete pro Monat</dt>
          <dd>
            {formatMoney(projectState.property.data.expectedMonthlyRent ?? 0)}
          </dd>
          <dt>Leerstand</dt>
          <dd>{formatPercent(projectState.property.data.vacancyRatePct ?? 0)}</dd>
          <dt>Flaeche</dt>
          <dd>{projectState.property.data.rentableAreaSqm ?? 0} qm</dd>
        </dl>
      );
    case "closingCosts":
      return (
        <dl className="definition-grid">
          <dt>Grunderwerbsteuer</dt>
          <dd>
            {formatPercent(
              projectState.closingCosts.data.realEstateTransferTaxPct
            )}
          </dd>
          <dt>Notar</dt>
          <dd>{formatPercent(projectState.closingCosts.data.notaryPct)}</dd>
          <dt>Grundbuch</dt>
          <dd>{formatPercent(projectState.closingCosts.data.landRegistryPct)}</dd>
          <dt>Makler</dt>
          <dd>{formatPercent(projectState.closingCosts.data.brokerPct)}</dd>
        </dl>
      );
    case "opex":
      return (
        <div className="data-grid">
          {projectState.opex.data.recurringItems.map((item) => (
            <div className="data-row" key={item.id}>
              <span>{item.label}</span>
              <strong>{formatMoney(item.amount)}</strong>
              <small>{item.period}</small>
            </div>
          ))}
        </div>
      );
  }
}
