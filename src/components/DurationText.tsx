import { evidencePattern } from "../data/floodEmphasis";
/** Emphasis is editorial presentation; the underlying edition wording is unchanged. */
export function DurationText({
  text,
  emphasize = false,
  terms = [],
}: {
  text: string;
  emphasize?: boolean;
  terms?: readonly string[];
}) {
  const pattern = evidencePattern(terms.length ? terms : emphasize ? ["hundred and fifty days", "hundred fifty days", "150 days"] : []);
  if (!pattern) return <>{text}</>;
  return (
    <>
      {text
        .split(pattern)
        .map((part, index) =>
          index % 2 === 1 ? (
            <mark key={index}>{part}</mark>
          ) : (
            part
          ),
        )}
    </>
  );
}
