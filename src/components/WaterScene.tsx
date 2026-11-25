import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { createWaterRenderer } from "../lib/waterRenderer";
import { createWaterInteraction } from "../lib/waterInteraction";
import { arcReflection } from "../lib/waterReflection";
import "./WaterScene.css";

/** Graph geometry, color and the shared stroke reveal drive the reflected light. */
export function WaterScene({ graphRef }: { graphRef: RefObject<HTMLElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const canvas=canvasRef.current;
    if (!canvas) return;
    let dirty=true;
    const renderer=createWaterRenderer(canvas,()=>{dirty=true;});
    if (!renderer) return; // The CSS photograph remains a full-screen fallback.
    const reduced=matchMedia("(prefers-reduced-motion: reduce)");
    const interaction=createWaterInteraction();
    let frame=0, lastFrame=0, waterTime=0;
    let light=[.5,.35,.3,0], color=[.47,.87,.91];
    let path: SVGPathElement | null = null, sweep: SVGRectElement | null = null;
    let bounds: DOMRect | undefined, tracing = false;
    const invalidate=()=>{dirty=true;};
    const resize=()=>{
      const scale=Math.min(devicePixelRatio || 1,1.5);
      canvas.width=Math.round(innerWidth*scale); canvas.height=Math.round(innerHeight*scale);
      interaction.clear();
      invalidate();
    };
    const observer=new MutationObserver(invalidate);
    if(graphRef.current) observer.observe(graphRef.current,{subtree:true,attributes:true,attributeFilter:["class","style","clip-path","d"],childList:true});
    function draw(now: number) {
      if(dirty){
        path=graphRef.current?.querySelector<SVGPathElement>(".fold-arc.is-active:not(.fold-trace-baseline)") ?? null;
        bounds=path?.getBoundingClientRect();
        sweep=path?.closest(".traced-stroke")?.querySelector<SVGRectElement>(".fold-trace-sweep") ?? null;
        if(path) color=(getComputedStyle(path).stroke.match(/[\d.]+/g)?.slice(0,3).map(Number) ?? [120,221,231]).map(channel=>channel/255);
        dirty=false;
      }
      // Sample the scaling clip itself: this includes CSS easing, duration overrides,
      // reduced motion and rapid re-selection, without duplicating an animation clock.
      const clipped=path?.hasAttribute("clip-path") && sweep;
      const transform=clipped ? getComputedStyle(clipped).transform : "none";
      const progress=transform === "none" ? 1 : new DOMMatrixReadOnly(transform).a;
      tracing=!!clipped && progress<1 && !reduced.matches;
      light=bounds ? arcReflection(bounds,{width:innerWidth,height:innerHeight},progress) : [0,0,0,0];
      if(!reduced.matches && !pausedRef.current) waterTime+=Math.min((now-lastFrame)/1000,.1);
      renderer!.draw(waterTime,light,color,interaction.sample(waterTime));
      lastFrame=now;
    }
    function tick(now: number){
      if(!document.hidden && (dirty || (!reduced.matches && (tracing || !pausedRef.current) && now-lastFrame>32))) draw(now);
      if((pausedRef.current && !tracing) || document.hidden) lastFrame=now;
      frame=requestAnimationFrame(tick);
    }
    resize(); frame=requestAnimationFrame(tick);
    function disturb(event: PointerEvent) {
      if(reduced.matches || pausedRef.current || document.hidden || !event.isPrimary) return;
      if(event.target instanceof Element && event.target.closest("a,button,input,select,textarea,summary,.preview-match")) {
        interaction.resetPointer(); return;
      }
      interaction.add(event.clientX,event.clientY,waterTime,innerWidth,innerHeight,event.type === "pointerdown",event.timeStamp/1000);
    }
    const clearInteraction=()=>{interaction.clear(); invalidate();};
    addEventListener("pointermove",disturb,{passive:true}); addEventListener("pointerdown",disturb,{passive:true});
    addEventListener("blur",clearInteraction);
    addEventListener("resize",resize); addEventListener("scroll",invalidate,{passive:true});
    document.addEventListener("visibilitychange",clearInteraction); reduced.addEventListener("change",clearInteraction);
    return ()=>{
      cancelAnimationFrame(frame); observer.disconnect(); renderer.dispose();
      removeEventListener("resize",resize); removeEventListener("scroll",invalidate);
      removeEventListener("pointermove",disturb); removeEventListener("pointerdown",disturb); removeEventListener("blur",clearInteraction);
      document.removeEventListener("visibilitychange",clearInteraction); reduced.removeEventListener("change",clearInteraction);
    };
  },[graphRef]);
  return <>
    <div className="water-scene" aria-hidden="true"><canvas ref={canvasRef} /></div>
    <button className="water-motion-control" type="button" aria-pressed={paused}
      onClick={()=>{pausedRef.current=!paused; setPaused(!paused);}}>{paused ? "Resume water" : "Pause water"}</button>
  </>;
}
