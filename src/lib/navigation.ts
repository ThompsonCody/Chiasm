import type { MouseEvent } from "react";

/** Preserve normal links for modified clicks while handling local navigation in-app. */
export function followLocally(event: MouseEvent<HTMLAnchorElement>, navigate: () => void) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  navigate();
}
