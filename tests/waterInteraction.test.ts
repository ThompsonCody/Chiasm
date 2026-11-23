import test from "node:test";
import assert from "node:assert/strict";
import { createWaterInteraction, waterSurfacePoint, RIPPLE_LIMIT, WATER_HORIZON, WATER_DEPTH } from "../src/lib/waterInteraction.ts";

const near = (actual: number, expected: number) => assert.ok(Math.abs(actual-expected)<.001);

test("pointer impulses use the same perspective water plane as the shader at any viewport", () => {
  for (const [width,height] of [[1440,900],[390,844],[320,700]]) {
    for (const [x,y] of [[width*.25,height*.3],[width*.8,height*.9]]) {
      const effect=createWaterInteraction();
      effect.add(x,y,1,width,height,true);
      const frame=effect.sample(1);
      const depth=WATER_DEPTH/frame[1];
      near((frame[0]*depth/(width/height)+.5)*width,x);
      near((depth-WATER_HORIZON+1)*height,y);
      assert.deepEqual([...frame.slice(2,4)],[1,1]);
    }
  }
});

test("water projection compresses rings vertically and shrinks them toward the horizon", () => {
  const width=1440,height=900;
  const screenOffset=(screenY:number) => {
    const origin=waterSurfacePoint(width/2,screenY,width,height);
    const radius=.1;
    const x=radius*(WATER_DEPTH/origin.y)*height;
    const y=(WATER_DEPTH/(origin.y-radius)-WATER_HORIZON+1)*height-screenY;
    return {x,y};
  };
  const far=screenOffset(150), close=screenOffset(750);
  assert.ok(far.y<far.x*.4);
  assert.ok(close.y<close.x*.4);
  assert.ok(far.x<close.x && far.y<close.y);
});

test("stationary and high-frequency movement is throttled, while presses disturb the surface", () => {
  const effect=createWaterInteraction();
  effect.add(0,0,0,800,400);
  assert.equal(effect.add(0,0,.01,800,400),false);
  assert.equal(effect.add(30,0,.02,800,400),false);
  assert.equal(effect.add(30,0,.12,800,400),true);
  assert.equal(effect.add(30,0,.12,800,400,true),true);
});

test("long pointer sessions have bounded GPU input and surface impulses expire", () => {
  const effect=createWaterInteraction();
  for(let i=0;i<500;i++) effect.add(i,100,i*.001,800,400,true);
  const active=effect.sample(.5);
  assert.equal(active.length,RIPPLE_LIMIT*4);
  near(active[2],.492);
  assert.ok(effect.sample(4).every(value=>value===0));
});

test("pause retains impulse timing and clear prevents stale wakes after resize or resume", () => {
  const effect=createWaterInteraction();
  effect.add(100,100,1,800,400,true);
  const before=[...effect.sample(1.2)];
  assert.deepEqual([...effect.sample(1.2)],before);
  effect.clear();
  assert.ok(effect.sample(1.3).every(value=>value===0));
  assert.equal(effect.add(100,100,1.3,800,400),true);
  assert.equal(effect.add(100,100,1.4,0,400),false);
});


function movingEnergy(pixelsPerSecond: number, interval = .01, viewport = 900) {
  const effect = createWaterInteraction();
  for (let time=0; time<=.6; time+=interval) {
    effect.add(100+pixelsPerSecond*time,500,time,viewport*1.6,viewport);
  }
  const ripples = effect.sample(.6);
  return Math.max(...Array.from({length:RIPPLE_LIMIT},(_,i)=>ripples[i*4+3]));
}

test("actual cursor speed changes wake energy, rather than distance between emitted ripples", () => {
  const slow = movingEnergy(90), fast = movingEnergy(1200);
  assert.ok(slow < .3);
  assert.ok(fast > .75);
  assert.ok(fast > slow * 2.5);
  assert.ok(movingEnergy(100000) <= 1);
});

test("speed response is stable across pointer polling rates and proportional viewport sizes", () => {
  const slowPolling = movingEnergy(600,1/30), fastPolling = movingEnergy(600,1/240);
  assert.ok(Math.abs(slowPolling-fastPolling)<.025);
  near(movingEnergy(600,.01,900),movingEnergy(300,.01,450));
});

test("an idle cursor or re-entry from a control does not create a false fast sweep", () => {
  const effect = createWaterInteraction();
  effect.add(100,100,0,1440,900);
  effect.add(250,100,.06,1440,900);
  const energetic = effect.sample(.06)[7];
  assert.ok(energetic>.6);
  assert.equal(effect.add(700,100,1,1440,900),false);
  effect.add(705,100,1.1,1440,900);
  assert.ok(effect.sample(1.1)[11]<.25);
  effect.resetPointer();
  effect.add(1100,100,1.12,1440,900);
  near(effect.sample(1.12)[15],.15);
});

test("pointer timestamps measure speed independently from a capped or paused render clock", () => {
  const effect=createWaterInteraction();
  effect.add(100,100,1,1440,900,false,10);
  effect.add(250,100,1,1440,900,false,10.06);
  const ripples=effect.sample(1);
  assert.equal(ripples[6],1);
  assert.ok(ripples[7]>.6);
});
