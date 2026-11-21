import { useId, useState } from "react";
import type { CSSProperties } from "react";
import "./TracedStroke.css";

/** Animate a scaling mask, never dash the non-scaling visible stroke.
 * Firefox can otherwise leave a normalized dashed arc short of its endpoint. */
export function TracedStroke({ d, className, pairId, onSelect, horizontal = false, style }: {
  d: string;
  className?: string;
  pairId?: string;
  onSelect?: () => void;
  horizontal?: boolean;
  style?: CSSProperties;
}) {
  const maskId = useId();
  const [complete, setComplete] = useState(false);
  return <g className="traced-stroke" style={style}>
    <defs>
      {horizontal ? <clipPath id={maskId} clipPathUnits="objectBoundingBox">
        <rect className="fold-trace-sweep" x="-0.01" y="-0.1" width="1.02" height="1.2"
          onAnimationEnd={() => setComplete(true)} />
      </clipPath> : <mask id={maskId} x="-50%" y="-50%" width="200%" height="200%">
        <path className="fold-trace-mask" d={d} pathLength={1}
          onAnimationEnd={() => setComplete(true)} />
      </mask>}
    </defs>
    <path className={`${className ?? ""} fold-trace-baseline`} d={d} onClick={onSelect} />
    <path className={className} data-fold-pair={pairId} d={d}
      mask={!horizontal && !complete ? `url(#${maskId})` : undefined}
      clipPath={horizontal && !complete ? `url(#${maskId})` : undefined} onClick={onSelect} />
  </g>;
}
