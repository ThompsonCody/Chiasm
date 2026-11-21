import { useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { StructureMap, StructureNode } from "../data/structureTypes";
import { getMapSelection } from "../lib/structures";
import { defaultFoldLayout, orderedFoldPairs, supportsFoldMap } from "../lib/foldLayout";
import type { FoldLayout } from "../lib/foldLayout";
import { FoldMap } from "./FoldMap";
import { TracedStroke } from "./TracedStroke";

type Props = {
  map: StructureMap;
  selectionId: string;
  onSelect: (id: string) => void;
  comparison: ReactNode;
  isNarrow: boolean;
};

function PassageRow({ node, selected, paired, onSelect }: {
  node: StructureNode; selected: boolean; paired: boolean; onSelect: () => void;
}) {
  const isCenter = node.role === "center";
  return <button type="button" className={`passage-row${isCenter ? " passage-row--center" : ""}`}
    data-passage={node.id} aria-pressed={selected} aria-controls="evidence-panel" onClick={onSelect}>
    <span className="pair-label">{node.label}</span>
    <span className="passage-content"><span className="passage-title">{node.title}</span><span className="passage-reference">{node.sourceRef}</span></span>
    {isCenter ? <span className="center-tag">Proposed center</span> : null}
    {selected ? <span className="row-selection-mark"><span aria-hidden="true">✓</span>
      <span className="sr-only">{isCenter ? "Selected center" : paired ? "Selected pair" : "Selected element"}</span>
    </span> : null}
  </button>;
}

function FoldHinge() {
  return <span className="fold-hinge" aria-hidden="true"><svg viewBox="0 0 32 32">
    <path d="M4 9h5l14 14h5M4 23h5L23 9h5M16 4v24" pathLength={1} />
  </svg></span>;
}

export function FoldSequence({ map, selectionId, onSelect, comparison, isNarrow }: Props) {
  const [requestedLayout, setLayout] = useState<FoldLayout>(() => defaultFoldLayout(map));
  const [availableWidth, setAvailableWidth] = useState(0);
  const [minimumGraphWidth, setMinimumGraphWidth] = useState((map.nodes.length * 2 + 2.5) * 16 + 2);
  const [lastSelectedNode, setLastSelectedNode] = useState<string>();
  const [browseOpen, setBrowseOpen] = useState(false);
  const mobileSelection = useRef<HTMLHeadingElement>(null);
  const sequenceRef = useRef<HTMLElement>(null);
  const pendingReveal = useRef<string | undefined>(undefined);
  const listRef = useRef<HTMLOListElement>(null);
  const [geometry, setGeometry] = useState({ height: map.nodes.length * 80, centers: map.nodes.map((_, index) => index * 80 + 40) });
  const pairs = orderedFoldPairs(map);
  const singletons = map.groups.filter(group => group.nodeIds.length === 1);
  const current = getMapSelection(map, selectionId);
  const inlineNode = current.nodes.find(node => node.id === lastSelectedNode) ?? current.nodes[0];
  const graphSupported = supportsFoldMap(map);
  const compactGraph = availableWidth < minimumGraphWidth;
  const layout = requestedLayout;
  const centers = singletons.map(group => map.nodes.find(node => node.id === group.nodeIds[0])!).filter(node => node.role === "center");
  const centerWithInnerPair = layout === "mirrored-pairs" && current.id === pairs.at(-1)?.group.id && centers.length === singletons.length;

  useLayoutEffect(() => {
    const section = sequenceRef.current;
    if (!section) return;
    const measure = () => {
      setAvailableWidth(section.getBoundingClientRect().width);
      const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
      setMinimumGraphWidth((map.nodes.length * 2 + 2.5) * rem + 2);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(section); measure();
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (layout !== "reading-order") return;
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const bounds = list.getBoundingClientRect();
      setGeometry({ height: bounds.height, centers: Array.from(list.children).map(item => {
        const rect = item.querySelector(".passage-row")!.getBoundingClientRect();
        return rect.top - bounds.top + rect.height / 2;
      }) });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(list); measure();
    return () => observer.disconnect();
  }, [layout, selectionId, comparison]);

  useLayoutEffect(() => {
    const id = pendingReveal.current;
    if (!id) return;
    pendingReveal.current = undefined;
    if (isNarrow && layout === "mirrored-pairs") {
      mobileSelection.current?.focus({ preventScroll: true });
      mobileSelection.current?.scrollIntoView({ block: "start", behavior: "instant" });
      return;
    }
    const selected = Array.from(sequenceRef.current?.querySelectorAll<HTMLElement>('[data-passage]') ?? []).find(element => element.dataset.passage === id);
    selected?.focus({ preventScroll: true });
    if (isNarrow) selected?.closest('li')?.scrollIntoView({ block: 'start', behavior: 'instant' });
  });

  function row(node: StructureNode) {
    const group = map.groups.find(group => group.nodeIds.includes(node.id))!;
    return <PassageRow node={node} selected={current.nodeIds.includes(node.id)} paired={group.nodeIds.length === 2}
      onSelect={() => { pendingReveal.current = node.id; setLastSelectedNode(node.id); if (isNarrow) setBrowseOpen(false); onSelect(group.id); }} />;
  }

  function comparisonPanel(inline = false) {
    return <div className={inline ? "inline-comparison" : "below-map-comparison"} id="evidence-panel">{comparison}</div>;
  }

  function pairedRows(showComparison: boolean) {
    return pairs.map(({ group, nodes }) => <li
      className={`mirrored-pair-row${current.id === group.id ? " is-selected" : ""}`}
      key={group.id} data-pair={group.id}>
      <div className="pair-row-passages">{row(nodes[0])}<FoldHinge />{row(nodes[1])}</div>
      {showComparison && current.id === group.id ? <>
        {centerWithInnerPair ? centers.map(node => <div className="inline-fold-center" key={node.id}>{row(node)}</div>) : null}
        {comparisonPanel(true)}
      </> : null}
    </li>);
  }

  return <section ref={sequenceRef} className={`sequence-panel fold-layout-${layout}`} aria-labelledby="sequence-title">
    <div className="panel-heading fold-heading">
      <h2 id="sequence-title">Read the fold</h2>
      <div className="fold-layout-switch" role="group" aria-label="Passage layout">
        {graphSupported ? <button type="button" aria-pressed={layout === "fold-map"}
          aria-controls="fold-passages"
          onClick={() => setLayout("fold-map")}>Fold map</button> : null}
        {map.compatiblePairs ? <button type="button" aria-pressed={layout === "mirrored-pairs"} aria-controls="fold-passages"
          onClick={() => setLayout("mirrored-pairs")}>Mirrored pairs</button> : null}
        <button type="button" aria-pressed={layout === "reading-order"} aria-controls="fold-passages"
          onClick={() => setLayout("reading-order")}>Reading order</button>
      </div>
    </div>
    <p className={layout === "fold-map" ? "sr-only" : "fold-layout-description"} id="fold-layout-hint">
      {layout === "fold-map" ? "Follow the passage from left to right. Each arc joins a published pair; the center marks the turn."
        : layout === "mirrored-pairs" ? `${pairs.length} pairs, earlier then later. Select either half to compare.`
        : "Follow the source sequence. Matching letters connect the two halves."}
    </p>

    <div id="fold-passages">
      {layout === "fold-map" ? <>
        <FoldMap map={map} selectionId={selectionId} onSelect={onSelect} compact={compactGraph} />
        {comparisonPanel()}
      </> : layout === "mirrored-pairs" && isNarrow ? <>
        <div className="mobile-pair-overview">
          <h3 className="mobile-selection-title" ref={mobileSelection} tabIndex={-1}>{current.isCenter ? "Proposed center" : "Selected pair"} · {current.nodes.map(node => node.label).join(" ↔ ")}</h3>
          {!current.isCenter && centers.map(node => <div className="inline-fold-center" key={node.id}>{row(node)}</div>)}
          {comparisonPanel(true)}
        </div>
        <details className="full-structure-browser" open={browseOpen} onToggle={event => setBrowseOpen(event.currentTarget.open)}>
          <summary>Browse the full structure · {map.nodes.length} passages</summary>
          <p>Pairs run from outermost to innermost. Select either half to compare.</p>
          <ol className="mirrored-pair-list">{pairedRows(false)}
          {singletons.filter(group => !centers.some(node => group.nodeIds.includes(node.id)) || current.isCenter).map(group => <li key={group.id} className="mirrored-turning-point">{row(map.nodes.find(node => node.id === group.nodeIds[0])!)}</li>)}
          </ol>
        </details>
      </> : layout === "mirrored-pairs" ? <>
        <div className="fold-column-headings" aria-hidden="true"><span>Earlier passage</span><span>Later passage</span></div>
        <ol className="mirrored-pair-list">
          {pairedRows(true)}
          {!centerWithInnerPair ? singletons.map(group => {
            const node = map.nodes.find(node => node.id === group.nodeIds[0])!;
            return <li key={group.id} className="mirrored-turning-point">{row(node)}{current.id === group.id ? comparisonPanel(true) : null}</li>;
          }) : null}
        </ol>
      </> : <div className="sequence-body">
        <ol className="passage-list" ref={listRef}>
          {map.nodes.map(node => <li key={node.id}>{row(node)}{node.id === inlineNode.id ? comparisonPanel(true) : null}</li>)}
        </ol>
        <svg className="fold-connectors" viewBox={`0 0 100 ${geometry.height}`} preserveAspectRatio="none" aria-hidden="true">
          {pairs.map(({ group, nodes }, index) => {
            const [start, end] = nodes.map(node => geometry.centers[map.nodes.indexOf(node)]);
            const x = 88 - index * (72 / Math.max(1, pairs.length - 1));
            const path = `M0 ${start} H${x - 8} Q${x} ${start} ${x} ${start + 8} V${end - 8} Q${x} ${end} ${x - 8} ${end} H0`;
            return <g key={`${group.id}-${current.id === group.id}`} className={`fold-connector${current.id === group.id ? " is-selected" : ""}`}>
              {current.id === group.id ? <TracedStroke d={path} /> : <path d={path} />}
            </g>;
          })}
        </svg>
      </div>}
    </div>
    <p className="fold-interpretation">A published literary interpretation. Full boundaries and qualifications are in Sources &amp; notes.</p>
  </section>;
}
