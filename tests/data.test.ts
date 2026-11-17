import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEFAULT_SELECTION_ID,
  floodTrace,
  mirroredPairs,
  passages,
  readingOrder,
  sources,
  turningPoint,
} from '../src/data/index.ts';
import {
  getPairForPassage,
  getPassage,
  getSelection,
  getSource,
} from '../src/lib/lookup.ts';

test('passages, pairs, and sources have unique identifiers and valid links', () => {
  for (const entries of [passages, mirroredPairs, sources]) {
    assert.equal(new Set(entries.map(({ id }) => id)).size, entries.length);
  }

  for (const passage of passages) {
    assert.ok(passage.title.trim());
    assert.ok(passage.summary.trim());
    assert.equal(getPassage(passage.id), passage);
    const source = getSource(passage.sourceId);
    assert.equal(new URL(source.url).protocol, 'https:');
    assert.ok(source.detail.trim());
  }
});

test('every reading row is a single pair half or the turning point', () => {
  assert.equal(new Set(readingOrder).size, readingOrder.length);
  const expected = [
    ...mirroredPairs.flatMap(({ passageIds }) => passageIds),
    turningPoint.passageId,
  ];
  assert.equal(new Set(expected).size, expected.length, 'A passage belongs to only one pair');
  assert.deepEqual([...readingOrder].sort(), expected.sort());
  readingOrder.forEach((id) => assert.ok(getPassage(id)));
});

test('paired halves occupy mirrored positions around the center', () => {
  const centerIndex = readingOrder.indexOf(turningPoint.passageId);
  assert.equal(centerIndex, Math.floor(readingOrder.length / 2));

  for (const pair of mirroredPairs) {
    const firstIndex = readingOrder.indexOf(pair.passageIds[0]);
    const secondIndex = readingOrder.indexOf(pair.passageIds[1]);
    assert.ok(firstIndex < centerIndex, `${pair.label} starts before the center`);
    assert.ok(secondIndex > centerIndex, `${pair.label} ends after the center`);
    assert.equal(firstIndex + secondIndex, readingOrder.length - 1);
  }
});

test('either half resolves to the same complete reading selection', () => {
  for (const pair of mirroredPairs) {
    const fromFirst = getPairForPassage(pair.passageIds[0]);
    const fromSecond = getPairForPassage(pair.passageIds[1]);
    assert.equal(fromFirst?.id, pair.id);
    assert.equal(fromSecond?.id, pair.id);
    assert.deepEqual(getSelection(fromFirst!.id), getSelection(fromSecond!.id));
    assert.deepEqual(
      getSelection(pair.id).passages.map(({ id }) => id),
      [...pair.passageIds],
    );
    assert.equal(getSelection(pair.id).isTurningPoint, false);
  }
});

test('the opening selection is exactly Genesis 7:24 and Genesis 8:3', () => {
  assert.deepEqual(
    getSelection(DEFAULT_SELECTION_ID).passages.map(({ reference }) => reference),
    ['Genesis 7:24', 'Genesis 8:3'],
  );
});

test('Genesis 8:1 is independently selectable as the proposed center', () => {
  const center = getSelection(turningPoint.id);
  assert.equal(center.isTurningPoint, true);
  assert.deepEqual(center.passages.map(({ reference }) => reference), ['Genesis 8:1']);
  assert.equal(getPairForPassage(turningPoint.passageId), undefined);
});

test('the trace distinguishes a direct warning from Uriel’s commission', () => {
  assert.equal(floodTrace.kind, 'Narrative parallel');
  assert.deepEqual(
    floodTrace.passageIds.map((id) => getPassage(id).reference),
    ['Genesis 6:13–18', '1 Enoch 10:1–3'],
  );
  assert.deepEqual(floodTrace.accounts.map(({ passageId }) => passageId), [...floodTrace.passageIds]);
  assert.deepEqual(
    floodTrace.accounts.map(({ sender, messenger, recipient }) => ({ sender, messenger, recipient })),
    [
      { sender: 'God', messenger: null, recipient: 'Noah' },
      { sender: 'The Most High', messenger: 'Uriel', recipient: 'Noah' },
    ],
  );
  for (const { passageId, summary } of floodTrace.accounts) {
    assert.ok(summary.trim());
    assert.ok(getSource(getPassage(passageId).sourceId));
  }
});

test('invalid lookups fail explicitly instead of selecting an unrelated passage', () => {
  assert.throws(() => getPassage('missing'), /Unknown passage: missing/);
  assert.throws(() => getSource('missing'), /Unknown source: missing/);
  assert.throws(() => getSelection('missing'), /Unknown selection: missing/);
  assert.equal(getPairForPassage('missing'), undefined);
});
