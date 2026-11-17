import { useState } from "react";
import { parseReference } from "../lib/study";
import type { Reference } from "../lib/study";

export function GoToPassage({
  preferredEditionId,
  onOpen,
  readingContext,
  compact = false,
}: {
  preferredEditionId: string;
  onOpen: (reference: Reference) => void;
  readingContext?: string;
  compact?: boolean;
}) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  return (
    <form
      className={`passage-jump${compact ? " header-passage-jump" : ""}`}
      onSubmit={(event) => {
        event.preventDefault();
        const result = parseReference(input, preferredEditionId);
        if ("error" in result) setError(result.error);
        else {
          setError("");
          onOpen(result.reference);
        }
      }}
    >
      <label htmlFor="passage-query">Go to passage</label>
      {readingContext ? (
        <span className={compact ? "sr-only" : "current-reading"} title={readingContext}>
          {readingContext}
        </span>
      ) : null}
      <div className="passage-jump-input">
        <input
          id="passage-query"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={compact ? "e.g. Genesis 7:24" : "Gen 7:24 · Romans 8 · 1 Enoch 10:1–3"}
          aria-describedby={error ? "passage-error" : "passage-hint"}
          aria-invalid={!!error}
          autoComplete="off"
        />
        <button type="submit">
          Go <span aria-hidden="true">→</span>
        </button>
      </div>
      {error ? (
        <p id="passage-error" role="alert">
          {error}
        </p>
      ) : (
        <p id="passage-hint" className={compact ? "sr-only" : undefined}>
          Open a chapter, or jump straight to a verse or range.
        </p>
      )}
    </form>
  );
}
