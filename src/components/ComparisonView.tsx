import { floodTrace } from "../data/crossReferences";
import { getPassage } from "../lib/lookup";
import { workName } from "../lib/structures";
import { ArrowLeft } from "./Icons";
import { SourceLink } from "./SourceLink";
import { PassageText, EditionNotes } from "./PassageText";
import "../reader.css";

export function ComparisonView({
  onReturn,
  preferredEditionId,
  onRead,
  returnHome = false,
}: {
  onReturn: () => void;
  preferredEditionId: string;
  onRead?: (passageId: string) => void;
  returnHome?: boolean;
}) {
  return (
    <section className="comparison-view" aria-labelledby="comparison-title">
      <div className="comparison-intro">
        <div>
          <span className="eyebrow">THE FLOOD BEYOND GENESIS</span>
          <h2 id="comparison-title" tabIndex={-1}>
            The warning takes another path.
          </h2>
          <p className="comparison-references">
            {floodTrace.passageIds.map(id => getPassage(id).reference).join(" ↔ ")}
          </p>
          <span className="parallel-badge">{floodTrace.kind}</span>
          <p>
            A narrative parallel to the wider Flood story, separate from the
            150-day pair.
          </p>
        </div>
      </div>
      <div className="comparison-accounts">
        {floodTrace.accounts.map((account, index) => {
          const passage = getPassage(account.passageId);
          const steps = [
            { role: "Initiates", name: account.sender },
            ...(account.messenger ? [{ role: "Delivers", name: account.messenger }] : []),
            { role: "Receives", name: account.recipient },
          ];
          return (
            <article className="account-card" key={account.passageId}>
              <div className="account-topline">
                <span className="eyebrow">
                  {index === 0 ? "THE BIBLICAL ACCOUNT" : "THE ENOCHIC ACCOUNT"}
                </span>
              </div>
              <h3>{workName(passage.workId)}</h3>
              <ol className="warning-path" aria-label="Warning delivery">
                {steps.map(step => <li key={step.role}>
                  <small>{step.role}</small><strong>{step.name}</strong>
                </li>)}
              </ol>
              <p className="account-description">
                {index === 0
                  ? "God speaks to Noah directly."
                  : "An angel carries the warning to Noah."}
              </p>
              <div className="account-summary">
                <PassageText
                  onRead={onRead}
                  passageId={passage.id}
                  preferredEditionId={preferredEditionId}
                  compact
                  showNotes={false}
                />
                <div className="account-editorial">
                  <span className="summary-label">EDITORIAL SUMMARY · NOT A QUOTATION</span>
                  <p>{account.summary}</p>
                </div>
                <details className="sources-notes">
                  <summary>Sources &amp; notes</summary>
                  <EditionNotes
                    workId={passage.workId}
                    preferredEditionId={preferredEditionId}
                  />
                  <SourceLink sourceId={passage.sourceId}>
                    Editorial summary source
                  </SourceLink>
                </details>
              </div>
            </article>
          );
        })}
      </div>
      <div className="comparison-note">
        <div>
          <span className="eyebrow">CHIFOLD EDITORIAL COMPARISON</span>
          <h3>A shared event. A changed delivery.</h3>
          <p>{floodTrace.explanation}</p>
          <details className="sources-notes">
            <summary>Connection basis</summary>
            <p><strong>Source observations:</strong> {floodTrace.sourceClaim}</p>
            <p><strong>Editorial basis:</strong> {floodTrace.basis}</p>
          </details>
        </div>
      </div>
      <div className="comparison-return">
        <button className="return-button" type="button" onClick={onReturn}>
          <ArrowLeft />
          {returnHome ? "Return home" : "Return to previous study"}
        </button>
        {!returnHome ? <span>Your place, edition and selected pair stay with you.</span> : null}
      </div>
    </section>
  );
}
