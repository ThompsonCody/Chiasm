import { useLayoutEffect, useRef } from "react";
import { followLocally } from "../lib/navigation";
import type { ReactNode } from "react";
import type { ReaderState, View } from "../lib/reader";
import { readerReducer } from "../lib/reader";
import { destinationForView, routeForState } from "../lib/routes";


export function AppHeader({ state, onNavigate, children }: {
  state: ReaderState;
  onNavigate: (view: View) => void;
  children?: ReactNode;
}) {
  const destination = destinationForView(state.view);
  const headerRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const measure = () => document.documentElement.style.setProperty(
      "--app-header-height", `${header.getBoundingClientRect().height}px`,
    );
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    measure();
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--app-header-height");
    };
  }, []);
  return (
    <header className="site-header app-header" ref={headerRef}>
      <div className="header-inner app-grid">
        <a className="brand" href="./" aria-label="ChiFold home"
          onClick={(event) => followLocally(event, () => onNavigate("home"))}>
          <span className="brand-mark" aria-hidden="true">Χ</span>
          <span>ChiFold</span>
        </a>
        <nav className="primary-nav" aria-label="Main navigation">
          {([
            ["library", "Library"], ["reader", "Read"], ["structures", "Structures"],
          ] as const).map(([view, label]) => (
            <a key={view}
              href={routeForState(readerReducer(state, { type: "view", value: view }))}
              aria-current={destination === view ? "page" : undefined}
              onClick={(event) => followLocally(event, () => onNavigate(view))}>
              {label}
            </a>
          ))}
        </nav>
        {children}
      </div>
    </header>
  );
}
