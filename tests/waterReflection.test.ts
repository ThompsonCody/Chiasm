import test from "node:test";
import assert from "node:assert/strict";
import { arcReflection } from "../src/lib/waterReflection.ts";

const bounds = { left: 200, width: 800, top: 300, bottom: 600 };
const viewport = { width: 1440, height: 900 };
const near = (actual: number, expected: number) => assert.ok(Math.abs(actual - expected) < .000001);

test("an unrevealed arc casts no flash before its left-to-right trace begins", () => {
  const light = arcReflection(bounds, viewport, 0);
  near(light[0], bounds.left / viewport.width);
  near(light[1], 1 - bounds.bottom / viewport.height);
  assert.equal(light[2], 0);
  assert.equal(light[3], 0);
  near(arcReflection(bounds, viewport, .05)[3], .5);
});

test("the reflected footprint grows from the same fixed left endpoint as the arc reveal", () => {
  let previousRight = bounds.left;
  for (const reveal of [.05, .25, .5, .75, 1]) {
    const [center, , width, intensity] = arcReflection(bounds, viewport, reveal);
    const left = (center - width / 2) * viewport.width;
    const right = (center + width / 2) * viewport.width;
    near(left, bounds.left);
    near(right, bounds.left + bounds.width * reveal);
    assert.ok(right > previousRight);
    assert.ok(intensity > 0 && intensity <= 1);
    previousRight = right;
  }
});

test("a finished or nonanimated arc retains the existing full reflection footprint", () => {
  const expected = [600 / 1440, 1 - 600 / 900, 800 / 1440, 1];
  assert.deepEqual(arcReflection(bounds, viewport), expected);
  assert.deepEqual(arcReflection(bounds, viewport, 1), expected);
});

test("offscreen arcs cast no light while partially visible arcs remain eligible", () => {
  assert.equal(arcReflection({ ...bounds, top: -300, bottom: 0 }, viewport)[3], 0);
  assert.equal(arcReflection({ ...bounds, top: 900, bottom: 1100 }, viewport)[3], 0);
  assert.equal(arcReflection({ ...bounds, top: -100, bottom: 50 }, viewport)[3], 1);
  assert.equal(arcReflection({ ...bounds, top: 850, bottom: 1000 }, viewport)[3], 1);
});

test("reveal values are clamped before calculating footprint or intensity", () => {
  assert.deepEqual(arcReflection(bounds, viewport, -2), arcReflection(bounds, viewport, 0));
  assert.deepEqual(arcReflection(bounds, viewport, 2), arcReflection(bounds, viewport, 1));
});

test("reflection normalization follows desktop and narrow viewport geometry", () => {
  for (const [width, height] of [[1440, 900], [390, 844], [320, 700]]) {
    const responsiveBounds = { left: width * .1, width: width * .8, top: height * .3, bottom: height * .7 };
    const [center, y, span, intensity] = arcReflection(responsiveBounds, { width, height }, .5);
    near(center, .3);
    near(y, .3);
    near(span, .4);
    assert.equal(intensity, 1);
  }
});

test("zero or negative viewport dimensions produce a safe unlit frame", () => {
  for (const [width, height] of [[0, 900], [1440, 0], [-1, 900], [1440, -1]]) {
    assert.deepEqual(arcReflection(bounds, { width, height }, .5), [0, 0, 0, 0]);
  }
});
