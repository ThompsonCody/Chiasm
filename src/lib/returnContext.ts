import type { ReadingBookmark } from "./reader.ts";
import { formatReference, resolveBookEdition } from "./study.ts";

/** Label the immediate bookmark that Return will actually restore. */
export function returnContextLabel(bookmark: ReadingBookmark | undefined): string | undefined {
  if (!bookmark) return undefined;
  switch (bookmark.view) {
    case "reader": {
      if (!bookmark.reference) return "Return to reading";
      const edition = resolveBookEdition(
        bookmark.reference.workId,
        bookmark.readingEditionId ?? bookmark.preferredEditionId,
      );
      return `Return to ${formatReference(bookmark.reference)} · ${edition?.edition.shortName ?? "Edition unavailable"}`;
    }
    case "home": return "Return home";
    case "chiasm": return "Return to study";
    case "trace": return "Return to Across texts";
    case "library": return "Return to Library";
    case "structures": return "Return to Structures";
  }
}
