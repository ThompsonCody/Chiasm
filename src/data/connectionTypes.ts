/** Relationship type describes the claim, not a numeric certainty score. */
export const connectionTypes = [
  {label:'Quotation',strength:'Explicit verbal reuse',basis:'A source identifies a quotation or the later text explicitly attributes quoted words. Wording and textual variants still need checking.'},
  {label:'Explicit reference',strength:'Overt reference',basis:'The text names the earlier person, event or passage. Naming it does not by itself establish a quotation.'},
  {label:'Allusion',strength:'Proposed literary echo',basis:'A scholar proposes indirect verbal or contextual reuse; attribution and the argument must be supplied.'},
  {label:'Proposed typology',strength:'Interpretive correspondence',basis:'An interpreter reads a person or event as a pattern for another; this is not direct textual borrowing.'},
  {label:'Thematic parallel',strength:'Shared topic',basis:'Texts share a theme. Similar subject matter alone does not show dependence.'},
  {label:'Narrative parallel',strength:'Comparative story relationship',basis:'Similar events or roles invite comparison. This is not a quotation or proof of direct borrowing.'},
] as const;
export type ConnectionKind = typeof connectionTypes[number]["label"];
