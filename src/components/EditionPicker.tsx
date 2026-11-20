import { useId } from "react";
import { corpusEditions as editions } from "../data/corpus";

export function EditionPicker({
  value,
  onChange,
  label = "Preferred reading edition",
}: {
  value: string;
  onChange: (id: string) => void;
  label?: string;
}) {
  const labelId = useId();
  return (
    <label className="edition-picker">
      <span id={labelId}>{label}</span>
      <select
        aria-labelledby={labelId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {editions.map((edition) => (
          <option key={edition.id} value={edition.id}>
            {edition.shortName} · {edition.title}
          </option>
        ))}
      </select>
    </label>
  );
}
