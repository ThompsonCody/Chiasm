import type { CrossReference } from './types.ts';

export const floodTrace: CrossReference = {
  id: 'flood-warning',
  title: 'Trace the Flood across texts',
  kind: 'Narrative parallel',
  claimOrigin: 'editorial',
  sourceClaim: 'Genesis presents God addressing Noah directly. In the Charles Enoch text, the Most High commissions Uriel to warn Noah.',
  basis: 'The shared story roles are warning, approaching destruction and Noah’s preservation. ChiFold compares these roles without asserting quotation or direct borrowing.',
  sourceIds: ['genesis-6-web', 'enoch-10-charles'],
  passageIds: ['gen-6-13-18', 'enoch-10-1-3'],
  explanation: 'Both accounts place a warning before the flood and preserve Noah’s future. Genesis presents God addressing Noah directly; 1 Enoch has the Most High send an angelic messenger. This is a narrative comparison, not a quotation or evidence by itself of direct borrowing.',
  accounts: [
    {
      passageId: 'gen-6-13-18',
      sender: 'God',
      messenger: null,
      recipient: 'Noah',
      summary: 'God announces the destruction to Noah himself, gives detailed instructions for the ark, and promises a covenant with Noah and his family.',
    },
    {
      passageId: 'enoch-10-1-3',
      sender: 'The Most High',
      messenger: 'Uriel',
      recipient: 'Noah',
      summary: 'The Most High commissions Uriel to warn Noah about the approaching deluge and instruct him so his descendants can be preserved. Uriel is the name used in the linked Charles translation.',
    },
  ],
};
