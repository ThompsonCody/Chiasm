import type { MirrorPair, TurningPoint } from './types.ts';

// To add a pair: add both passages in passages.ts, add their IDs to readingOrder,
// then add one entry here. The UI derives labels, selection and connectors from it.
export const mirroredPairs: readonly MirrorPair[] = [
  {
    id: 'ark-window',
    label: 'K',
    title: 'Shut in, then opened',
    passageIds: ['gen-7-16', 'gen-8-6b'],
    explanation: 'The closing of the ark mirrors its opening. The agents differ: the LORD shuts Noah in; Noah later opens the window.',
  },
  {
    id: 'forty-days',
    label: 'L',
    title: 'Forty days',
    passageIds: ['gen-7-17a', 'gen-8-6a'],
    explanation: 'A repeated forty-day marker frames the flood’s rise and its later retreat. Wenham reads this numerical echo as part of the symmetry.',
  },
  {
    id: 'mountains',
    label: 'N',
    title: 'Mountains hidden, then visible',
    passageIds: ['gen-7-19-20', 'gen-8-4-5'],
    explanation: 'Mountains disappear under the rising flood, then reappear as it recedes. Their changing visibility makes the reversal concrete.',
  },
  {
    id: '150-days',
    label: 'O',
    title: '150 days',
    passageIds: ['gen-7-24', 'gen-8-3'],
    explanation: 'Both passages mark 150 days. Prevailing waters give way to receding waters, placing a numerical echo on either side of the proposed center.',
  },
];

export const turningPoint: TurningPoint = {
  id: 'god-remembers',
  label: 'P',
  title: 'God remembers Noah',
  passageId: 'gen-8-1',
  explanation: 'Wenham proposes this as the turning point: God’s attention to Noah accompanies the shift from rising waters toward their retreat.',
};

export const DEFAULT_SELECTION_ID = '150-days';
