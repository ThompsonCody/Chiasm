import { useEffect, useState } from "react";

/** Match the workspace breakpoint so there is one evidence view, never a hidden duplicate. */
export function useInlineComparison() {
  const [inline, setInline] = useState(() => window.matchMedia("(max-width: 63.99rem)").matches);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 63.99rem)");
    const update = () => setInline(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return inline;
}
