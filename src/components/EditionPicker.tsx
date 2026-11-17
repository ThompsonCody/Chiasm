import { corpusEditions as editions } from "../data/corpus";

export function EditionPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <label className="edition-picker">
      <span id="preferred-edition-label">Preferred reading edition</span>
      <select
        aria-labelledby="preferred-edition-label"
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
