// Reviewed reference transcriptions. Labels/explanations are ChiFold paraphrases.
// Keep the author's proposal separate from every other author's proposal.
export const wenham = {
  id: 'wenham-flood', title: 'The Flood, folded.', author: 'Gordon J. Wenham',
  work: 'genesis', sourceId: 'wenham-1978', locator: 'p. 338; discussion pp. 337–340',
  reference: '6:10–9:19', kind: 'Concentric structure', defaultSelectionId: '150-days',
  note: 'Complete 31-element published outline. Subverse labels open full numbered verses for context. The proposal leaves some narrative material outside its pattern; see Wenham p. 340.',
  pairs: [
    ['A','noah','6:10a','9:19','Noah','Noah','The same person frames the account.'],
    ['B','sons','6:10b','9:18b','The sons named','The sons named','The three sons recur at both ends.'],
    ['C','ark','6:14–16','9:18a','Ark instructions','The ark recalled','The vessel returns as a framing detail.'],
    ['D','flood-announced','6:17','9:11–17','Flood announced','Future flood ruled out','Announcement is answered by a promise.'],
    ['E','covenant','6:18–20','9:8–10','Covenant with Noah','Covenant with all flesh','The covenant widens in scope.'],
    ['F','food','6:21','9:1–4','Food stored','Food permitted','Provision appears before and after survival.'],
    ['G','commands','7:1–3','8:15–17,22','Enter the ark','Leave the ark','Opposed commands frame the journey.'],
    ['H','seven-days-outer','7:4–5','8:12–13','Seven-day warning','Seven-day wait','The repeated interval contributes symmetry.'],
    ['I','seven-days-inner','7:7–10','8:10–11','Waiting before flood','Waiting for retreat','Another seven-day correspondence.'],
    ['J','departures','7:11–15','8:7–9','Entry into the ark','Birds leave the ark','Movement into the vessel meets outward movement.'],
    ['K','ark-window','7:16','8:6b','The ark is closed','The window opens','Closing and opening form a reversal.'],
    ['L','forty-days','7:17a','8:6a','Forty days of flood','Forty days of waiting','The duration is repeated.'],
    ['M','waters','7:17b–18','8:5','Waters rise','Waters diminish','Rising is answered by falling.'],
    ['N','mountains','7:19–20','8:4–5','Mountains disappear','Mountains reappear','Visibility reverses as water recedes.'],
    ['O','150-days','7:21–24','8:3','The waters prevail','The waters recede','The same 150-day duration frames a reversal: the waters prevail, then abate.'],
  ],
  center: ['P','god-remembers','8:1','God remembers Noah'],
};

export const domka = [
  {
    id: 'domka-watchers', title: 'The Watchers: crisis and resolution', author: 'Natalia Honorata Domka',
    work: '1-enoch', sourceId: 'domka-2019', locator: '§3.4, pp. 309–311',
    reference: '6:1–11:2', kind: 'Narrative symmetry',
    note: 'Domka proposes a narrative turning point, not a verse-by-verse chiasm. The two broad phases correspond; finer mirror pairs are not supplied. Charles is reading context, not the Greek textual witness analyzed in the article.',
    pairs: [['1','crisis-resolution','6:1–8:4','9:4–11:2','Crisis on earth','Response from heaven','Destruction and human distress are answered by intercession, judgment and restoration.']],
    center: ['2','domka-turn','9:1–3','Angels perceive human suffering'],
    details: [
      ['1','6:1–7:1a','Initial situation: rebellion'],
      ['2','7:1b–8:4','Actions and consequences'],
      ['2.1','7:1b','Teaching, first episode'],['2.2','7:2–5','Giants and destruction'],
      ['2.3','7:6','Human suffering, first episode'],['2.4','8:1–3','Teaching, second episode'],
      ['2.5','8:4','Human suffering, second episode'],
      ['Turn','9:1–3','Narrative transition'],['1′','9:4–11','Angelic intercession'],
      ['2′','10:1–22','Divine intervention'],['2.1′','10:1–16a','Angels commissioned'],
      ['2.2′','10:16b–19','Blessing, first episode'],['2.3′','10:20','Removal of evil'],
      ['2.4′','10:21–22','Blessing, second episode'],['3′','11:1–2','Final situation: peace and truth'],
    ],
  },
  {
    id: 'domka-enoch-9', title: 'Heaven, earth and the voices of distress', author: 'Natalia Honorata Domka',
    work: '1-enoch', sourceId: 'domka-2019', locator: 'Table 4, p. 301 (§2.4)',
    reference: '9:1–3', kind: 'Narrative outline',
    note: 'Source subdivisions refer to Greek witnesses GC-1, GS-1 and GS-2. Full Charles verses are shown only as reading context; the source’s lettered fragments and witness-only clauses are not mapped to exact Charles phrases. No unique center is claimed for this small outline.',
    sections: [
      ['1','9:1a–b','Situation in heaven'],['2','9:1c–d','Situation on earth'],
      ['3','9:2–3','Angelic speech and human appeal'],
    ],
    details: [
      ['1.1','9:1a','The angels'],['1.2','9:1b','Their location'],
      ['2.1','9:1c','Blood on earth'],['2.2','9:1d','Impiety and lawlessness (GS witnesses)'],
      ['3.1','9:2a','Speech introduced / sanctuary entry'],['3.2','9:2b–3a','Human speakers introduced'],
      ['3.3','9:3b–d','The human appeal'],['3.3.1','9:3b','Petition presented'],
      ['3.3.2','9:3c','Destruction (GS-1)'],['3.3.3','9:3d','Additional divine title (GS-1)'],
    ],
  },
];

export const multiBook = [{
  id:'sacks-torah', sourceId:'sacks-2017', title:'The Torah: a five-book fold',
  boundaries:'Genesis–Deuteronomy', locator:'Introduction, printed p. 6 (PDF p. 14); discussion pp. 6–8',
  centerLabel:'C', defaultSelectionId:'sacks-torah-g-B', kind:'Concentric structure',
  note:'A whole-book proposal, not a verse-by-verse alignment. The five book units are Sacks’s published outline. Full-book verse ranges are ChiFold reading-context expansions using the displayed edition. Sacks describes the broader Sinai movement as extending beyond Leviticus into late Exodus and early Numbers; the diagram’s central unit is Leviticus.',
  sections:[
    ['A','Gen1:1-50:26','Genesis · Israel’s ancestral beginnings'],
    ['B','Ex1:1-40:38','Exodus · Toward Sinai'],
    ['C','Lev1:1-27:34','Leviticus · Life at Sinai'],
    ['B′','Num1:1-36:13','Numbers · Beyond Sinai'],
    ['A′','Deut1:1-34:12','Deuteronomy · Israel’s future'],
  ],
  relationships:{
    A:'Genesis looks toward Israel’s beginnings; Deuteronomy looks toward its life ahead, framing the central journey and covenant.',
    B:'Exodus carries Israel toward Sinai; Numbers carries it away toward the land. Sacks compares the journeys, recurring complaints and demands on Moses.',
    C:'Leviticus occupies the middle book position, focusing the five-book outline on Israel’s life with God at Sinai.',
  },
}];

export const citationLeads = [
  {id:'murai-hierarchy',sourceId:'murai-2022',workIds:[],title:'Murai’s remaining single-book hierarchy pages',boundaries:'Remaining Bible-wide website collection',reason:'The combined Samuel, Kings, Chronicles, Ezra–Nehemiah hierarchies and the full Twelve Prophets collection are now imported separately, together with all four inter-book source families. Hierarchy pages for the other individual books are outside this reviewed web import; no website-wide completeness is claimed.'},
  ...[1,2,3].map((verse)=>({id:`domka-witness-${verse}`,sourceId:'domka-2019',workIds:['1-enoch'],title:`Domka Table ${verse}: Greek witnesses of 1 Enoch 9:${verse}`,boundaries:`1 Enoch 9:${verse}`,reason:'A textual-witness comparison, not a separate chiastic map. Exact Greek-witness to Charles phrase alignment is unverified; not counted as an opening structure.'})),
  ...[
    ['nickelsburg','G. W. E. Nickelsburg','1 Enoch 1 (2001), 165–173'],
    ['drawnel','Henryk Drawnel','1 Enoch 6–11 Interpreted in the Light of Mesopotamian Incantation Literature (2016), 256, 258–275'],
    ['molenberg','C. Molenberg','A Study of the Roles of Shemihaza and Asael in I Enoch 6–11 (1984), 136–146'],
    ['hanson','P. D. Hanson','Rebellion in Heaven, Azazel, and Euhemeristic Heroes in 1 Enoch 6–11 (1977), 195–233'],
  ].map(([id,author,title])=>({id:`lead-${id}`,sourceId:'domka-2019',author,workIds:['1-enoch'],title,boundaries:'1 Enoch 6–11',reason:'Bibliographic lead reported in Domka §1, pp. 286–288. The primary outline has not been independently checked; competing proposals are not merged into Domka’s map.'})),
];
