export interface PassageMapping {
  passageId: string;
  editionIds: readonly string[];
  reference: string;
  verseKeys: readonly string[];
  note?: string;
}
const genesisEditions = ["kjv", "web"];
// Manually checked against the specific source chapters. No arithmetic versification conversion.
export const passageMappings: readonly PassageMapping[] = [
  {
    passageId: "gen-7-16",
    editionIds: genesisEditions,
    reference: "Genesis 7:16",
    verseKeys: ["7:16"],
  },
  {
    passageId: "gen-7-17a",
    editionIds: genesisEditions,
    reference: "Genesis 7:17",
    verseKeys: ["7:17"],
    note: "The proposal selects 7:17a. The complete numbered verse 7:17 is shown for context; “a” is an editorial subdivision, not an edition verse number.",
  },
  {
    passageId: "gen-7-19-20",
    editionIds: genesisEditions,
    reference: "Genesis 7:19–20",
    verseKeys: ["7:19", "7:20"],
  },
  {
    passageId: "gen-7-24",
    editionIds: genesisEditions,
    reference: "Genesis 7:24",
    verseKeys: ["7:24"],
  },
  {
    passageId: "gen-8-1",
    editionIds: genesisEditions,
    reference: "Genesis 8:1",
    verseKeys: ["8:1"],
  },
  {
    passageId: "gen-8-3",
    editionIds: genesisEditions,
    reference: "Genesis 8:3",
    verseKeys: ["8:3"],
  },
  {
    passageId: "gen-8-4-5",
    editionIds: genesisEditions,
    reference: "Genesis 8:4–5",
    verseKeys: ["8:4", "8:5"],
  },
  ...["a", "b"].map((part) => ({
    passageId: `gen-8-6${part}`,
    editionIds: genesisEditions,
    reference: "Genesis 8:6",
    verseKeys: ["8:6"],
    note: `The proposal selects 8:6${part}. The complete numbered verse 8:6 is shown for context; “${part}” is an editorial subdivision, not an edition verse number.`,
  })),
  {
    passageId: "gen-6-13-18",
    editionIds: genesisEditions,
    reference: "Genesis 6:13–18",
    verseKeys: ["6:13", "6:14", "6:15", "6:16", "6:17", "6:18"],
  },
  {
    passageId: "enoch-10-1-3",
    editionIds: ["charles-1917"],
    reference: "1 Enoch 10:1–3",
    verseKeys: ["10:1", "10:2", "10:3"],
  },
];
