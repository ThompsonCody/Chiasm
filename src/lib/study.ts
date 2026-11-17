import { corpusBooks, corpusEditions, corpusWorks } from "../data/corpus.ts";
import { works } from "../data/catalog.ts";
import { passageMappings } from "../data/mappings.ts";
import { passages } from "../data/passages.ts";
import { structuresForReference } from "./structures.ts";
import { floodTrace } from "../data/crossReferences.ts";

/** A reference belongs to a work; it does not imply an equivalent numbering in every edition. */
export interface Reference {
  workId: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
}

export function resolveBookEdition(workId: string, preferredId: string) {
  const available = corpusBooks.filter(
    (book) => book.workId === workId && book.status === "complete",
  );
  const book =
    available.find((item) => item.editionId === preferredId) ?? available[0];
  if (!book) return undefined;
  const edition = corpusEditions.find((item) => item.id === book.editionId);
  return edition
    ? { edition, book, isFallback: edition.id !== preferredId }
    : undefined;
}

const commonAliases: Record<string, string[]> = {
  genesis: ["Gen", "Ge", "Gn"],
  exodus: ["Ex", "Exod"],
  leviticus: ["Lev"],
  numbers: ["Num", "Nu"],
  deuteronomy: ["Deut", "Dt"],
  joshua: ["Josh"],
  judges: ["Judg"],
  psalms: ["Ps", "Psalm", "Psa"],
  proverbs: ["Prov"],
  ecclesiastes: ["Eccl"],
  isaiah: ["Isa"],
  jeremiah: ["Jer"],
  ezekiel: ["Ezek"],
  daniel: ["Dan"],
  matthew: ["Matt", "Mt"],
  mark: ["Mk"],
  luke: ["Lk"],
  john: ["Jn"],
  acts: ["Ac"],
  romans: ["Rom", "Ro"],
  revelation: ["Rev"],
  "1-enoch": ["Enoch", "1 Enoch", "First Enoch"],
  jubilees: ["Jub"],
};

function normalizeAlias(value: string) {
  return value.toLowerCase().replace(/[\s._’'\-]/g, "");
}

function workTitle(workId: string) {
  return (
    works.find((work) => work.id === workId)?.title ??
    corpusWorks.find((work) => work.workId === workId)?.title ??
    workId
  );
}

function identifyWork(name: string) {
  const normalized = normalizeAlias(name);
  return works.find((work) => {
    const imported = corpusWorks.find((item) => item.workId === work.id);
    const aliases = [
      work.id,
      work.title,
      ...(work.aliases ?? []),
      ...(commonAliases[work.id] ?? []),
      ...(imported?.aliases ?? []),
    ];
    return aliases.some((alias) => normalizeAlias(alias) === normalized);
  })?.id;
}

function validateReference(
  reference: Reference,
  editionId: string,
): string | undefined {
  const resolved = resolveBookEdition(reference.workId, editionId);
  if (!resolved)
    return `Text not yet available for ${workTitle(reference.workId)}.`;
  const { book } = resolved;
  const chapterIndex = book.chapterNumbers.indexOf(reference.chapter);
  if (!Number.isInteger(reference.chapter) || chapterIndex < 0) {
    return `That chapter is unavailable in ${workTitle(reference.workId)} (${resolved.edition.shortName}); use the chapter browser to see its source numbering.`;
  }
  const start = reference.verseStart;
  const end = reference.verseEnd ?? start;
  if (start === undefined)
    return reference.verseEnd === undefined
      ? undefined
      : "A verse range needs a starting verse.";
  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 1 ||
    end! < start
  ) {
    return "Use a positive verse number or an ascending range, such as 10:1–3.";
  }
  // Numbering may have gaps or joined verses; counts alone are not a passage mapping.
  const numbers = book.verseNumbers[chapterIndex];
  const valid = numbers?.includes(start) && numbers.includes(end!);
  return valid
    ? undefined
    : `That verse or range is unavailable in ${workTitle(reference.workId)} ${reference.chapter} (${resolved.edition.shortName}).`;
}

/** Accepts a chapter or a single-chapter verse range; never infers a cross-edition mapping. */
export function parseReference(
  input: string,
  preferredEditionId = "kjv",
): { reference: Reference } | { error: string } {
  const match = input
    .trim()
    .match(/^(.+?)\s*(\d+)(?:\s*:\s*(\d+)(?:\s*[-–—]\s*(\d+))?)?$/);
  if (!match)
    return {
      error:
        "Enter a book and chapter, such as Romans 8, or a verse range, such as 1 Enoch 10:1–3.",
    };
  const workId = identifyWork(match[1].trim());
  if (!workId)
    return {
      error: `Unknown work “${match[1].trim()}”. Choose a book from the library or use its full name.`,
    };
  const reference: Reference = {
    workId,
    chapter: Number(match[2]),
    ...(match[3] ? { verseStart: Number(match[3]) } : {}),
    ...(match[4] ? { verseEnd: Number(match[4]) } : {}),
  };
  const error = validateReference(reference, preferredEditionId);
  return error ? { error } : { reference };
}

export function formatReference(reference: Reference): string {
  const verse =
    reference.verseStart === undefined
      ? ""
      : `:${reference.verseStart}${reference.verseEnd !== undefined && reference.verseEnd !== reference.verseStart ? `–${reference.verseEnd}` : ""}`;
  return `${workTitle(reference.workId)} ${reference.chapter}${verse}`;
}

export function referenceToUrl(
  reference: Reference,
  editionId: string,
  pairId: string,
): string {
  const params = new URLSearchParams({
    view: "reader",
    work: reference.workId,
    chapter: String(reference.chapter),
    edition: editionId,
    pair: pairId,
  });
  if (reference.verseStart !== undefined)
    params.set("verse", String(reference.verseStart));
  if (reference.verseEnd !== undefined)
    params.set("end", String(reference.verseEnd));
  return `?${params}`;
}

/** Invalid or unverified URLs are rejected instead of clamped to a guessed passage. */
export function parseReferenceParams(
  params: URLSearchParams,
): Reference | undefined {
  const workId = params.get("work");
  const chapter = params.get("chapter");
  if (
    !workId ||
    !chapter ||
    !/^\d+$/.test(chapter) ||
    !works.some((work) => work.id === workId)
  )
    return undefined;
  const editionId = params.get("edition") ?? "kjv";
  if (!corpusEditions.some((edition) => edition.id === editionId))
    return undefined;
  const verse = params.get("verse");
  const end = params.get("end");
  if (
    (verse !== null && !/^\d+$/.test(verse)) ||
    (end !== null && !/^\d+$/.test(end))
  )
    return undefined;
  const reference: Reference = {
    workId,
    chapter: Number(chapter),
    ...(verse !== null ? { verseStart: Number(verse) } : {}),
    ...(end !== null ? { verseEnd: Number(end) } : {}),
  };
  return validateReference(reference, editionId) ? undefined : reference;
}

/** Map links use explicitly checked passage anchors. Partial-verse proposal labels open full-verse context. */
export function getReferenceForPassage(
  passageId: string,
  editionId?: string,
): Reference | undefined {
  const passage = passages.find((item) => item.id === passageId);
  const mapping = passageMappings.find(
    (item) =>
      item.passageId === passageId &&
      (!editionId || item.editionIds.includes(editionId)),
  );
  if (!passage || !mapping?.verseKeys.length) return undefined;
  const parsed = mapping.verseKeys.map((key) => key.split(":").map(Number));
  const chapter = parsed[0][0];
  if (parsed.some(([part]) => part !== chapter)) return undefined;
  const verseStart = parsed[0][1];
  const verseEnd = parsed[parsed.length - 1][1];
  return {
    workId: passage.workId,
    chapter,
    verseStart,
    ...(verseEnd === verseStart ? {} : { verseEnd }),
  };
}

function overlaps(
  reference: Reference,
  passageId: string,
  editionId?: string,
): boolean {
  const anchored = getReferenceForPassage(passageId, editionId);
  if (
    !anchored ||
    anchored.workId !== reference.workId ||
    anchored.chapter !== reference.chapter
  )
    return false;
  if (reference.verseStart === undefined) return true;
  return (
    reference.verseStart <= (anchored.verseEnd ?? anchored.verseStart!) &&
    (reference.verseEnd ?? reference.verseStart) >= anchored.verseStart!
  );
}

/** Only published local proposals and authored cross-references are surfaced. */
export function curatedForReference(reference: Reference, editionId?: string) {
  return {
    structures: structuresForReference(reference,editionId),
    crossReferences: [floodTrace].filter((crossReference) =>
      crossReference.passageIds.some((id) =>
        overlaps(reference, id, editionId),
      ),
    ),
  };
}
