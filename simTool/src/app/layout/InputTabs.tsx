import { Download, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import type { TemplateEnvelope, TemplateKind } from "../../domain/templates";
import type { ExtractResult } from "../../listingAssist/extractListing";
import { extractListingFromText } from "../../listingAssist/extractListing";
import { extractListingFromUrl } from "../../listingAssist/extractListingFromUrl";
import { isListingUrl } from "../../listingAssist/fetchListingContent";
import type {
  LegalFormValue,
  LiabilityModel,
  TaxModel,
  VotingModel
} from "../../modules/legal-form/types";
import { visibleInputModules } from "../../modules/registry";
import type { OpexAnnualCostMode } from "../../modules/opex/types";
import type {
  AustrianFederalState,
  PropertyRenovationItem,
  PropertyUseType
} from "../../modules/property/types";
import type { GoNoGoStatus } from "../../modules/strategy/types";
import type { ProjectState } from "../../state/projectStore";
import { FileActionButton } from "../../ui/buttons/FileActionButton";
import { NumberSliderField } from "../../ui/forms/NumberSliderField";
import { formatMoney, formatPercent } from "../../utils/money";

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
  const validationErrors =
    validation?.diagnostics.filter((diagnostic) => diagnostic.severity === "error") ??
    [];

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
          <TemplateLoadSelect
            templateName={activeTemplate.name}
            onUpload={() => onLoadTemplate(selectedKind)}
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

function InputTabBody({
  kind,
  projectState,
  onTemplateChange
}: {
  kind: TemplateKind;
  projectState: ProjectState;
  onTemplateChange: (
    kind: TemplateKind,
    template: TemplateEnvelope<unknown>
  ) => void;
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
            label="Beteiligungsstufe"
            value={owner.participationTier}
            min={0}
            max={100}
            step={25}
            unit="Punkte"
            onChange={(participationTier) =>
              updateOwners(
                projectState.ownership.data.owners.map((candidate) =>
                  candidate.id === owner.id
                    ? { ...candidate, participationTier }
                    : candidate
                )
              )
            }
          />
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
              participationTier: 50,
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

  function applyExtract() {
    if (!extractResult) {
      return;
    }

    updatePropertyData({
      ...projectState.property.data,
      ...stripUndefined(extractResult.draft)
    });
    setStatus("Inseratdaten uebernommen.");
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
          <button className="icon-button" type="button" onClick={applyExtract}>
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
        <h3>Punktesystem</h3>
        <label className="text-field">
          <span>Anteilsmodus</span>
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
            <option value="blended">Tier und Eigenkapital</option>
            <option value="tier">Nur Beteiligungsstufe</option>
            <option value="equity">Nur Eigenkapital</option>
          </select>
        </label>
        <NumberSliderField
          label="Tier-Gewicht"
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
          label="EK-Gewicht"
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
      </div>
      <div className="form-section">
        <h3>Go/No-Go-Pruefpunkte</h3>
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
      <h3>Nutzungspunkte</h3>
      <NumberSliderField
        label="Punkte je Bett/Jahr"
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
        label="Basis je Bett/Nacht"
        value={rules.basePerBedPerNight}
        min={0}
        max={10}
        step={0.1}
        unit="Punkte"
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
        label="Wochenende-Faktor"
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
        <h3>Opex-Plausibilitaet</h3>
        <DataPreview
          rows={[
            ["Modelliert pro Jahr", formatMoney(opexSummary.annualTotal)],
            ["Modelliert pro Monat", formatMoney(opexSummary.monthlyTotal)],
            ["Ansatz je Wohnflaeche", opexSummary.perSqmLabel],
            ["Offene Kategorien", opexSummary.missingCategories]
          ]}
        />
        <p className="muted">
          Nur angelegte Kostenbloecke gehen in Cashflow und Beitraege ein.
          Fehlende Kategorien sind offene Annahmen.
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

const LEGAL_FORM_OPTIONS: { value: LegalFormValue; label: string }[] = [
  { value: "coOwnership", label: "Miteigentum" },
  { value: "kg", label: "KG" },
  { value: "gmbh", label: "GmbH" },
  { value: "gmbhCoKg", label: "GmbH & Co KG" },
  { value: "verein", label: "Verein" },
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

function stripUndefined<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined)
  ) as Partial<T>;
}
