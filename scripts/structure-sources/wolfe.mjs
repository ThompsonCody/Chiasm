// Checked against the original page image: printed p. 67, PDF spread 4.
// Unlike later adaptations, Wolfe's printed diagram has seven nodes and no D′.
export const wolfeSource = {
  id: 'wolfe-1980', author: 'Kenneth R. Wolfe',
  title: 'The Chiastic Structure of Luke-Acts and Some Implications for Worship · Southwestern Journal of Theology 22(2) (1980), 60–71',
  url: 'https://static1.squarespace.com/static/58cee45db8a79b2da1429210/t/59e8cd1bd0e6288d040b1da9/1508429086594/The%2BChiastic%2BStructure%2Bof%2BLuke-Acts.pdf',
  license: 'Copyrighted article · factual reference outline and original ChiFold paraphrases; PDF not redistributed',
  credit: 'Kenneth R. Wolfe, Southwestern Journal of Theology 22, no. 2 (Spring 1980), 60–71. Complete seven-panel outline checked against printed p. 67 (PDF spread 4); argument pp. 64–68. Original ChiFold descriptions preserve Wolfe’s diagram rather than later eight-panel adaptations. Book introductions are outside the published outline. Subverse a/b boundaries expand to whole verse context, explicitly noted.',
};

export const wolfeMaps = [{
  id: 'wolfe-luke-acts', sourceId: 'wolfe-1980', author: 'Kenneth R. Wolfe',
  title: 'Luke–Acts: toward Jerusalem and outward to the world',
  boundaries: 'Luke 4:14–24:51; Acts 1:12–28:31',
  locator: 'Complete diagram, printed p. 67 (PDF spread 4); argument pp. 64–68',
  centerLabel: 'D', defaultSelectionId: 'wolfe-luke-acts-g-B', kind: 'Concentric structure',
  note: 'The printed source has seven panels, ABCDC′B′A′, with Luke 24:50–51 alone in the center. Wolfe also discusses Acts 1:9–11 as the second narration of the ascension, but his diagram does not add an eighth D′ panel. Later adaptations that do add D′ are not silently substituted here. Luke 1:1–4:13 and Acts 1:1–11 are outside the diagram. Acts 8:1a/b denotes a source subdivision; the complete numbered verse is displayed as reading context for either side.',
  sections: [
    ['A', 'Luke4:14-9:50', 'Jesus’ ministry in Galilee'],
    ['B', 'Luke9:51-19:40', 'Jesus’ movement toward Jerusalem'],
    ['C', 'Luke19:41-24:49', 'Jesus and the disciples in Jerusalem'],
    ['D', 'Luke24:50-24:51', 'Jesus ascends'],
    ['C′', 'Acts1:12-8:1a', 'The church’s witness in Jerusalem'],
    ['B′', 'Acts8:1b-11:18', 'Witness in Judea and Samaria'],
    ['A′', 'Acts11:19-28:31', 'Witness reaches the wider world'],
  ],
  relationships: {
    A: 'Wolfe frames the movement from Jesus’ Galilean ministry to the church’s wider mission. The outer panels contrast a regional beginning with expanding witness.',
    B: 'The earlier movement travels toward Jerusalem through the intervening regions; the later movement carries witness outward through Judea and Samaria.',
    C: 'Jerusalem is the setting on both sides of the ascension: the closing events of Jesus’ ministry and the opening phase of the church’s witness.',
    D: 'Wolfe places the ascension at the heart of the ring. His argument also discusses its retelling in Acts, while the printed central panel cites Luke alone.',
  },
}];
