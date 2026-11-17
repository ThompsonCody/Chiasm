import { floodTrace } from "../data";
import { getPassage } from "../lib/lookup";
import { ArrowLeft, ArrowRight } from "./Icons";
import { SourceLink } from "./SourceLink";
import { PassageText, EditionNotes } from "./PassageText";

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
          <p>
            A narrative parallel to the wider Flood story, separate from the
            150-day pair.
          </p>
        </div>
        <span className="parallel-badge">{floodTrace.kind}</span>
      </div>
      <div className="comparison-accounts">
        {floodTrace.accounts.map((account, index) => {
          const passage = getPassage(account.passageId);
          return (
            <article className="account-card" key={account.passageId}>
              <div className="account-topline">
                <span className="eyebrow">
                  {index === 0 ? "THE BIBLICAL ACCOUNT" : "THE ENOCHIC ACCOUNT"}
                </span>
                <span className="account-number">0{index + 1}</span>
              </div>
              <h3>{passage.reference}</h3>
              <p className="account-description">
                {index === 0
                  ? "God speaks to Noah directly."
                  : "An angel carries the warning to Noah."}
              </p>
              <div
                className="warning-path"
                role="group"
                aria-label={`Warning delivery: ${account.sender}${account.messenger ? ` to ${account.messenger}` : " directly"} to ${account.recipient}`}
              >
                <span>
                  <small>INITIATES</small>
                  <strong>{account.sender}</strong>
                </span>
                <ArrowRight />
                {account.messenger ? (
                  <>
                    <span>
                      <small>DELIVERS</small>
                      <strong>{account.messenger}</strong>
                    </span>
                    <ArrowRight />
                  </>
                ) : null}
                <span>
                  <small>RECEIVES</small>
                  <strong>{account.recipient}</strong>
                </span>
              </div>
              <div className="account-summary">
                <PassageText
                  onRead={onRead}
                  passageId={passage.id}
                  preferredEditionId={preferredEditionId}
                  compact
                  showNotes={false}
                />
                <details className="sources-notes">
                  <summary>Sources &amp; notes</summary>
                  <span className="summary-label">
                    EDITORIAL SUMMARY · NOT A QUOTATION
                  </span>
                  <p>{account.summary}</p>
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
        <span className="note-symbol" aria-hidden="true">
          ≈
        </span>
        <div>
          <span className="eyebrow">A PARALLEL, WITH A DIFFERENCE</span>
          <h3>A shared event. A changed delivery.</h3>
          <p>{floodTrace.explanation}</p>
          <p className="connection-caveat">
            This connection describes a narrative parallel. It is not a
            quotation or a claim of direct borrowing.
          </p>
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
