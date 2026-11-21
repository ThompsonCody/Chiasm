import { useId } from "react";
import { corpusEditions as editions, corpusBooks } from "../data/corpus";

export function EditionPicker({
  value,
  onChange,
  label = "Preferred reading edition",
  workId,
  shortLabels = false,
  ariaLabel,
}: {
  value: string;
  onChange: (id: string) => void;
  label?: string;
  workId?: string;
  shortLabels?: boolean;
  ariaLabel?: string;
}) {
  const labelId = useId();
  return (
    <label className="edition-picker">
      <span id={labelId}>{label}</span>
      <select
        aria-labelledby={ariaLabel ? undefined : labelId}
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {editions.filter(edition => !workId || corpusBooks.some(book => book.workId === workId && book.editionId === edition.id)).map((edition) => (
          <option key={edition.id} value={edition.id}>
            {shortLabels ? edition.shortName : `${edition.shortName} · ${edition.title}`}
          </option>
        ))}
      </select>
    </label>
  );
}
