export interface Edition {
  id: string;
  workId: string;
  shortName: string;
  title: string;
  credit: string;
  sourceUrl: string;
  chapterUrl: string;
  rights: string;
  numbering: string;
}
export const editions: readonly Edition[] = [
  {
    id: "kjv",
    workId: "genesis",
    shortName: "KJV",
    title: "King James Version · standardized 1769 text",
    credit:
      "KJV translators; electronic text courtesy of CrossWire Bible Society and eBible.org, eng-kjv (with Apocrypha). Complete imported books are available in the chapter reader.",
    sourceUrl: "https://ebible.org/Bible/details.php?id=eng-kjv",
    chapterUrl: "https://ebible.org/eng-kjv/GEN{chapter}.htm#V{verse}",
    rights:
      "Public domain outside the UK. The source notes UK Crown letters-patent restrictions on printing and importing printed copies.",
    numbering: "eBible.org eng-kjv Genesis chapter/verse numbering",
  },
  {
    id: "web",
    workId: "genesis",
    shortName: "WEB",
    title: "World English Bible · Updated, American English (engwebp)",
    credit:
      "World English Bible contributors / eBible.org. The engwebp source omits the Deuterocanon; its book set does not control ChiFold’s library.",
    sourceUrl: "https://www.ebible.org/find/details.php?id=engwebp",
    chapterUrl: "https://ebible.org/engwebp/GEN{chapter}.htm#V{verse}",
    rights:
      "Public domain. “World English Bible” is a trademark; quoted wording is preserved.",
    numbering: "eBible.org engwebp Genesis chapter/verse numbering",
  },
  {
    id: "charles-1917",
    workId: "1-enoch",
    shortName: "Charles 1917",
    title: "The Book of Enoch · R. H. Charles (1917)",
    credit:
      "Translated by R. H. Charles, S.P.C.K., 1917; electronic transcription at the Internet Sacred Text Archive. English translation, not a Geʿez edition or an official Tewahedo edition.",
    sourceUrl: "https://sacred-texts.com/bib/boe/index.htm",
    chapterUrl: "https://sacred-texts.com/book/the-book-of-enoch/chapter-x",
    rights:
      "Public-domain 1917 translation. Translator’s angle brackets are retained; modern website navigation is excluded.",
    numbering: "Charles 1917, chapter X, verses 1–3",
  },
];

// Exact verse wording. References, verse boundaries and punctuation follow the cited pages.
// Paragraph marks, footnote markers and formatting are not verse text.
export const verseTexts: Record<string, Record<string, string>> = {
  kjv: {
    "6:13":
      "And God said unto Noah, The end of all flesh is come before me; for the earth is filled with violence through them; and, behold, I will destroy them with the earth.",
    "6:14":
      "Make thee an ark of gopher wood; rooms shalt thou make in the ark, and shalt pitch it within and without with pitch.",
    "6:15":
      "And this is the fashion which thou shalt make it of: The length of the ark shall be three hundred cubits, the breadth of it fifty cubits, and the height of it thirty cubits.",
    "6:16":
      "A window shalt thou make to the ark, and in a cubit shalt thou finish it above; and the door of the ark shalt thou set in the side thereof; with lower, second, and third stories shalt thou make it.",
    "6:17":
      "And, behold, I, even I, do bring a flood of waters upon the earth, to destroy all flesh, wherein is the breath of life, from under heaven; and every thing that is in the earth shall die.",
    "6:18":
      "But with thee will I establish my covenant; and thou shalt come into the ark, thou, and thy sons, and thy wife, and thy sons’ wives with thee.",
    "7:16":
      "And they that went in, went in male and female of all flesh, as God had commanded him: and the LORD shut him in.",
    "7:17":
      "And the flood was forty days upon the earth; and the waters increased, and bare up the ark, and it was lift up above the earth.",
    "7:19":
      "And the waters prevailed exceedingly upon the earth; and all the high hills, that were under the whole heaven, were covered.",
    "7:20":
      "Fifteen cubits upward did the waters prevail; and the mountains were covered.",
    "7:24":
      "And the waters prevailed upon the earth an hundred and fifty days.",
    "8:1":
      "And God remembered Noah, and every living thing, and all the cattle that was with him in the ark: and God made a wind to pass over the earth, and the waters asswaged;",
    "8:3":
      "And the waters returned from off the earth continually: and after the end of the hundred and fifty days the waters were abated.",
    "8:4":
      "And the ark rested in the seventh month, on the seventeenth day of the month, upon the mountains of Ararat.",
    "8:5":
      "And the waters decreased continually until the tenth month: in the tenth month, on the first day of the month, were the tops of the mountains seen.",
    "8:6":
      "And it came to pass at the end of forty days, that Noah opened the window of the ark which he had made:",
  },
  web: {
    "6:13":
      "God said to Noah, “I will bring an end to all flesh, for the earth is filled with violence through them. Behold, I will destroy them and the earth.",
    "6:14":
      "Make a ship of gopher wood. You shall make rooms in the ship, and shall seal it inside and outside with pitch.",
    "6:15":
      "This is how you shall make it. The length of the ship shall be three hundred cubits, its width fifty cubits, and its height thirty cubits.",
    "6:16":
      "You shall make a roof in the ship, and you shall finish it to a cubit upward. You shall set the door of the ship in its side. You shall make it with lower, second, and third levels.",
    "6:17":
      "I, even I, will bring the flood of waters on this earth, to destroy all flesh having the breath of life from under the sky. Everything that is on the earth will die.",
    "6:18":
      "But I will establish my covenant with you. You shall come into the ship, you, your sons, your wife, and your sons’ wives with you.",
    "7:16":
      "Those who went in, went in male and female of all flesh, as God commanded him; then the LORD shut him in.",
    "7:17":
      "The flood was forty days on the earth. The waters increased, and lifted up the ship, and it was lifted up above the earth.",
    "7:19":
      "The waters rose very high on the earth. All the high mountains that were under the whole sky were covered.",
    "7:20":
      "The waters rose fifteen cubits higher, and the mountains were covered.",
    "7:24": "The waters flooded the earth one hundred fifty days.",
    "8:1":
      "God remembered Noah, all the animals, and all the livestock that were with him in the ship; and God made a wind to pass over the earth. The waters subsided.",
    "8:3":
      "The waters continually receded from the earth. After the end of one hundred fifty days the waters receded.",
    "8:4":
      "The ship rested in the seventh month, on the seventeenth day of the month, on Ararat’s mountains.",
    "8:5":
      "The waters receded continually until the tenth month. In the tenth month, on the first day of the month, the tops of the mountains were visible.",
    "8:6":
      "At the end of forty days, Noah opened the window of the ship which he had made,",
  },
  "charles-1917": {
    "10:1":
      "Then said the Most High, the Holy and Great One spake, and sent Uriel to the son of Lamech, and said to him:",
    "10:2":
      '\'〈Go to Noah〉 and tell him in my name "Hide thyself!" and reveal to him the end that is approaching: that the whole earth will be destroyed, and a deluge is about to come upon the whole earth, and will destroy all that is on it.',
    "10:3":
      "And now instruct him that he may escape and his seed may be preserved for all the generations of the world.'",
  },
};

