/** ChiFold editorial emphasis, not additional claims by Wenham or altered edition text. */
export const floodEmphasis: Readonly<Record<string, readonly string[]>> = {
  noah: ["Noah"],
  sons: ["Shem", "Ham", "Japheth"],
  ark: ["ark", "ship"],
  "flood-announced": ["flood"],
  covenant: ["covenant"],
  food: ["food", "meat"],
  commands: ["Come", "Go forth", "Go into", "Go out"],
  "seven-days-outer": ["seven days"],
  "seven-days-inner": ["seven days"],
  departures: ["ark", "ship"],
  "ark-window": ["shut", "opened", "window"],
  "forty-days": ["forty days"],
  waters: ["waters", "water", "increased", "decreased", "abated"],
  mountains: ["mountains", "mountain"],
  "150-days": ["hundred and fifty days", "hundred fifty days", "150 days"],
  "god-remembers": ["remembered", "Noah"],
};

export function evidencePattern(terms: readonly string[]) {
  const escaped = [...terms].sort((a,b)=>b.length-a.length)
    .map(term=>term.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"));
  return escaped.length ? new RegExp(`\\b(${escaped.join("|")})\\b`, "gi") : undefined;
}
