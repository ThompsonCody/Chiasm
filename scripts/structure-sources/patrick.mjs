// Complete 41-element outline, visually verified against Appendix (9), p. 299.
// English references are primary in the source; its MT alternatives are notes.
export const patrickSource = {
  id: 'patrick-2016',
  author: 'James Earle Patrick',
  title: 'The Prophetic Structure of 1–2 Samuel · DPhil thesis, University of Oxford (2016)',
  url: 'https://ora.ox.ac.uk/objects/uuid:309e6831-242b-40c9-9271-360dd4bec2d0/files/mfacdd8ae2618d9d7e73689d30d355e12',
  license: 'Copyrighted thesis · factual passage outline and original ChiFold paraphrases only; thesis and figures not redistributed',
  credit: 'James Earle Patrick, The Prophetic Structure of 1–2 Samuel (DPhil thesis, Mansfield College, University of Oxford, Trinity Term 2016), Appendix (9), printed p. 299 (PDF p. 313), and Appendix (10), printed p. 300 (PDF p. 314), with analysis in chapter 3. The appendix calls its headings provisional signposts rather than substitutes for the biblical passages (p. 293). The full 41-element and author-simplified 11-element Song of the Ark renditions remain separate records with their own published boundaries.',
  verification: {
    cachedFile: 'scripts/cache/structures/patrick-2016.pdf',
    sha256: '83a86c3f7f834fec83f5ed69efc5953c487cbea4d28081ad312a220b22839445',
    figure: 'Appendix (9), printed p. 299; PDF page 313 (zero-based index 312)',
    checkedImage: 'scripts/cache/structures/patrick-2016-ark.png',
    additionalCheckedImage: 'scripts/cache/structures/patrick-2016-simplified.png',
  },
};

const arkPairs = [
  ['1', '1S4:1-4:22', '2S6:12-6:23', 'The ark leaves Shiloh', 'The ark enters David’s city', 'Patrick links the ark’s two public movements, the accompanying shouts and the reactions of a wife in each episode.'],
  ['2', '1S5:1-6:18', '2S6:3-6:11', 'Judgment accompanies the ark’s travels', 'Uzzah is judged beside the ark', 'The source connects disrespect for the ark, judgment during its transport on a cart and a lasting reminder marked by “until this day.”'],
  ['3', '1S6:19-7:1', '2S6:1-6:4', 'The ark reaches Abinadab’s house', 'The ark departs Abinadab’s house', 'The same household and hill setting recur; sons are charged with the ark’s care or movement. The later unit overlaps the following judgment unit in the source.'],
  ['4', '1S7:2-7:13', '2S5:17-5:25', 'Samuel and the Philistine attack', 'David and the Philistine attack', 'In both episodes the Philistines gather for war and their defeat follows divine guidance, under Samuel and then David.'],
  ['5', '1S7:14-8:3', '2S5:6-5:16', 'Samuel’s house and restored territory', 'David’s house and captured Jerusalem', 'Patrick relates restored or captured territory, a leader’s governing residence and notices about the leader’s sons.'],
  ['6', '1S8:4-10:25', '2S2:8-5:5', 'Saul’s kingship is recognized', 'David’s kingship is recognized', 'The source follows a movement from disputed leadership to recognition: Samuel and Israel recognize Saul; Abner and Israel recognize David.'],
  ['7', '1S10:26-12:25', '1S31:8-31:13; 2S1:1-2:7', 'Samuel addresses Israel after Jabesh-Gilead', 'David addresses Israel after Jabesh-Gilead', 'Patrick pairs the Jabesh-Gilead episodes with subsequent speeches and responses that establish Samuel’s or David’s authority. The returning unit crosses the modern book division.'],
  ['8', '1S13:1', '1S31:1-31:7', 'A notice begins Saul’s reign', 'A report ends Saul’s life', 'A regnal opening notice is placed opposite the report of Saul’s death and the deaths of his sons.'],
  ['9', '1S13:2-13:15', '1S28:1-30:31', 'Saul’s sacrifice and Samuel’s judgment', 'Saul’s consultation and Samuel’s judgment', 'Patrick associates Samuel’s judgment of Saul, departing Hebrews and a seventh-day timing motif. The later panel is much longer; the asymmetry belongs to the published proposal.'],
  ['10', '1S13:16-14:23', '1S27:1-27:12', 'Jonathan risks an attack', 'David risks life with Achish', 'The source compares risky military action by Jonathan and David and its descriptions of enemies in three groups.'],
  ['11', '1S14:24-14:46', '1S26:1-26:25', 'Saul curses Jonathan', 'Saul blesses David', 'Saul’s treatment of a person called his son reverses from curse to blessing; Patrick also relates the episodes’ language of guilt and atonement.'],
  ['12', '1S14:47-14:52', '1S25:2-25:44', 'Saul’s family and deliverance', 'David’s household grows', 'Family notices are linked to deliverance from plunderers or the threat of plunder, in the source’s reading.'],
  ['13', '1S15:1-15:35', '1S23:19-25:1', 'Saul spares an enemy and tears a robe', 'David spares Saul and cuts his robe', 'An enemy’s life is spared and a robe is damaged in each panel. Notices of Samuel’s death also contribute to Patrick’s comparison.'],
  ['14', '1S16:1-16:13', '1S23:14-23:18', 'David is anointed in secret', 'David’s future rule is affirmed in secret', 'Samuel’s private anointing is answered by Jonathan’s private recognition that David will reign.'],
  ['15', '1S16:14-16:23', '1S22:20-23:13', 'David relieves Saul’s terror with music', 'Abiathar helps David escape Saul', 'Patrick compares rescue from a terrifying affliction or ruler, associating the harp with David’s earlier role and the ephod with his later rescue.'],
  ['16', '1S17:1-17:54', '1S22:6-22:19', 'Saul sends David against Goliath', 'Saul sends Doeg against Ahimelech', 'The king uses a keeper of animals to kill an opponent: David kills Goliath; Doeg kills the priests. The contrast in victims is part of the proposed correspondence.'],
  ['17', '1S17:55-18:5', '1S22:1-22:5', 'David’s family and career prosper', 'David’s family and career enter exile', 'Notices of David’s parents and his growing company or military role appear on both sides, with prosperity turning to displacement.'],
  ['18', '1S18:6-18:9', '1S21:10-21:15', 'Israel’s women acclaim David', 'Philistine servants call David a king', 'Both panels compare David with Saul through words spoken by others; the later scene recalls the song sung in the earlier one.'],
  ['19', '1S18:10-18:30', '1S21:1-21:9', 'Saul’s Philistine trap for David', 'David’s holy-bread encounter at Nob', 'Patrick connects David’s sexual restraint or purity with dangerous missions associated with Saul. The source itself describes the later episode through the larger mission to Keilah; that interpretive connection is not a literal reference in the Nob verses.'],
  ['20', '1S19:1-19:17', '1S20:1-20:42', 'Jonathan defends David', 'Jonathan defends David again', 'Jonathan advocates for David with Saul and helps protect him through arrangements involving a field. Patrick also notes Michal’s intervention in the earlier panel.'],
];

export const patrickMaps = [{
  id: 'patrick-song-of-ark',
  sourceId: 'patrick-2016',
  author: 'James Earle Patrick',
  title: 'The Song of the Ark: from Shiloh to Jerusalem',
  boundaries: '1 Samuel 4:1–2 Samuel 6:23',
  locator: 'Appendix (9), p. 299 (PDF p. 313); full 41-element outline; chapter 3 analysis',
  centerLabel: '21',
  defaultSelectionId: 'patrick-song-of-ark-g-1',
  kind: 'Concentric structure',
  note: 'Complete 41-element outline, not the author’s 11-element simplified rendition on p. 300. Source references use English chapter/verse numbering and explicitly give MT alternatives for 1 Samuel 21. All units retain the English references. Unit 7′ crosses the modern 1/2 Samuel division and is split into two book-specific anchors. Overlap between 2 Samuel 6:1–4 and 6:3–11 is present in the source and is retained. The author calls headings provisional signposts; the matching units are the passages themselves. The printed label for 19′ associates its stated 1 Samuel 21:1–9 boundary with a larger Keilah episode; ChiFold retains the stated boundary and flags the interpretive issue instead of altering the source range.',
  sections: [
    ...arkPairs.map(([label, ref, , title]) => [label, ref, title, { groupLabel: label }]),
    ['21', '1S19:18-19:24', 'God’s Spirit protects David from Saul', { groupLabel: '21' }],
    ...[...arkPairs].reverse().map(([label, , ref, , title]) => [label + '′', ref, title, { groupLabel: label }]),
  ],
  relationships: {
    ...Object.fromEntries(arkPairs.map(([label, , , , , basis]) => [label, basis])),
    '21': 'Patrick places Saul’s encounter with the prophesying group at the center: the Spirit’s action prevents Saul from carrying out his pursuit of David.',
  },
}, {
  id: 'patrick-song-of-ark-simplified',
  sourceId: 'patrick-2016',
  author: 'James Earle Patrick',
  title: 'The Song of the Ark · author’s simplified outline',
  boundaries: '1 Samuel 4:1–2 Samuel 6:23',
  locator: 'Appendix (10), p. 300 (PDF p. 314); author’s simplified 11-element rendering',
  centerLabel: 'F',
  defaultSelectionId: 'patrick-song-of-ark-simplified-g-A',
  kind: 'Concentric structure',
  note: 'This is the author’s separately printed 11-element simplified rendering of the same Song of the Ark proposal, not a second independent discovery. Keep it separate from the full 41-element outline: the source gives some different boundaries. In particular D ends at 1 Samuel 18:12 while E starts at 18:10; B′ ends at 2 Samuel 5:3 and A′ starts at 5:4, although the detailed outline places its corresponding division after 5:5. Those published overlaps and differences are preserved. Whole chapters are expanded to numbered-verse reading context using the loaded English edition. F is identified as the central episode in the thesis’s chapter 3 discussion, as well as occupying the unmatched middle position of this diagram.',
  sections: [
    ['A', '1S4:1-7:17', 'The ark is dishonored; Samuel leads Israel', { groupLabel: 'A', sourceRef: '1 Samuel 4–7' }],
    ['B', '1S8:1-12:25', 'Saul is acknowledged as king', { groupLabel: 'B', sourceRef: '1 Samuel 8–12' }],
    ['C', '1S13:1-15:35', 'The early reign of Saul', { groupLabel: 'C', sourceRef: '1 Samuel 13–15' }],
    ['D', '1S16:1-18:12', 'David is anointed and serves Saul', { groupLabel: 'D', sourceRef: '1 Samuel 16–18:12' }],
    ['E', '1S18:10-19:17', 'David faces Saul’s trap and receives protection', { groupLabel: 'E', sourceRef: '1 Samuel 18:10–19:17' }],
    ['F', '1S19:18-19:24', 'God’s Spirit protects David from Saul', { groupLabel: 'F', sourceRef: '1 Samuel 19:18–24' }],
    ['E′', '1S20:1-21:9', 'Jonathan protects David; David escapes', { groupLabel: 'E', sourceRef: '1 Samuel 20–21:9 [MT 21:10]' }],
    ['D′', '1S21:10-23:18', 'David flees Saul and receives affirmation', { groupLabel: 'D', sourceRef: '1 Samuel 21:10–23:18' }],
    ['C′', '1S23:19-31:7', 'The final period of Saul’s reign', { groupLabel: 'C', sourceRef: '1 Samuel 23:19–31:7' }],
    ['B′', '1S31:8-31:13; 2S1:1-5:3', 'Saul is commemorated; David is acknowledged', { groupLabel: 'B', sourceRef: '1 Samuel 31:8–2 Samuel 5:3' }],
    ['A′', '2S5:4-6:23', 'David rules in Jerusalem; the ark arrives', { groupLabel: 'A', sourceRef: '2 Samuel 5:4–6:23' }],
  ],
  relationships: {
    A: 'The ark’s earlier exile and dishonor are answered by its arrival in Jerusalem. Victories over Philistines and the governing homes of Samuel and David also frame the source’s simplified account.',
    B: 'Saul’s recognition through Samuel is set opposite David’s recognition through Abner and Israel. The later panel commemorates the earlier kingdom before acknowledging its successor.',
    C: 'Patrick links scenes at the start and end of Saul’s rule: family notices, treatment of a son, the sparing of an enemy and episodes associated with a week.',
    D: 'The source contrasts David’s early advancement in Saul’s service with his flight, protection through the priestly ephod and private affirmation of future kingship.',
    E: 'Jonathan’s defense and David’s escape frame the proposed center. Patrick also links these panels through his reading of David’s purity and Saul’s dangerous missions.',
    F: 'Patrick explicitly identifies this as the central episode: God’s Spirit intervenes in Saul’s pursuit and David remains protected in Samuel’s company.',
  },
}];

// All independent cross-book appendix outlines are represented above. The other
// appendix maps stay within one modern book, apart from parallel sub-units of
// the full Ark outline that do not constitute independent concentric structures.
export const patrickCitationLeads = [];
