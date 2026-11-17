import type { Passage } from './types.ts';

export const passages: readonly Passage[] = [
  {
    id: 'gen-7-16', workId: 'genesis',
    reference: 'Genesis 7:16',
    title: 'The ark is closed',
    summary: 'The LORD shuts Noah into the ark.',
    sourceId: 'genesis-7-web',
  },
  {
    id: 'gen-7-17a', workId: 'genesis',
    reference: 'Genesis 7:17a',
    title: 'Forty days of flood',
    summary: 'The flood continues on the earth for forty days.',
    sourceId: 'genesis-7-web',
  },
  {
    id: 'gen-7-19-20', workId: 'genesis',
    reference: 'Genesis 7:19–20',
    title: 'Mountains disappear',
    summary: 'The rising waters cover even the high mountains.',
    sourceId: 'genesis-7-web',
  },
  {
    id: 'gen-7-24', workId: 'genesis',
    reference: 'Genesis 7:24',
    title: 'The waters prevail',
    summary: 'The waters prevail over the earth for 150 days.',
    sourceId: 'genesis-7-web',
  },
  {
    id: 'gen-8-1', workId: 'genesis',
    reference: 'Genesis 8:1',
    title: 'God remembers Noah',
    summary: 'God remembers Noah and the animals, sends a wind, and the waters begin to subside.',
    sourceId: 'genesis-8-web',
  },
  {
    id: 'gen-8-3', workId: 'genesis',
    reference: 'Genesis 8:3',
    title: 'The waters recede',
    summary: 'The waters recede; at the end of 150 days they have diminished.',
    sourceId: 'genesis-8-web',
  },
  {
    id: 'gen-8-4-5', workId: 'genesis',
    reference: 'Genesis 8:4–5',
    title: 'Mountains reappear',
    summary: 'The ark rests on Ararat; the mountain tops reappear.',
    sourceId: 'genesis-8-web',
  },
  {
    id: 'gen-8-6a', workId: 'genesis',
    reference: 'Genesis 8:6a',
    title: 'Forty days of waiting',
    summary: 'A forty-day wait comes to an end.',
    sourceId: 'genesis-8-web',
  },
  {
    id: 'gen-8-6b', workId: 'genesis',
    reference: 'Genesis 8:6b',
    title: 'The window opens',
    summary: 'Noah opens the window he made in the ark.',
    sourceId: 'genesis-8-web',
  },
  {
    id: 'gen-6-13-18', workId: 'genesis',
    reference: 'Genesis 6:13–18',
    title: 'God warns Noah directly',
    summary: 'God tells Noah that a flood will destroy life, directs him to build an ark, and promises a covenant with him.',
    sourceId: 'genesis-6-web',
  },
  {
    id: 'enoch-10-1-3', workId: '1-enoch',
    reference: '1 Enoch 10:1–3',
    title: 'Uriel carries the warning',
    summary: 'The Most High sends Uriel to warn Noah of the coming destruction and instruct him so that he and his descendants may survive.',
    sourceId: 'enoch-10-charles',
  },
];

// This curated excerpt omits Wenham's M/M′ and the outer pairs.
// O is narrowed to 7:24 here; Wenham's full O entry spans 7:21–24.
// Keep passage IDs in textual reading order when adding another pair.
export const readingOrder: readonly string[] = [
  'gen-7-16',
  'gen-7-17a',
  'gen-7-19-20',
  'gen-7-24',
  'gen-8-1',
  'gen-8-3',
  'gen-8-4-5',
  'gen-8-6a',
  'gen-8-6b',
];

