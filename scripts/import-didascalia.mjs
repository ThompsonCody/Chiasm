/** Harden's unversified Ethiopic Didascalia, not the Syriac Didascalia. */
export async function importDidascalia({ source, clean, registerWork, writeBook }) {
  const base = 'https://ertale.com/bible/ethiopiancanon/didascalia/';
  const index = await source('didascalia/index.html', base);
  const listed = [...index.matchAll(/href="(\d+)\/">Chapter \d+<\/a>/g)].map(m => Number(m[1]));
  if (JSON.stringify(listed) !== JSON.stringify(Array.from({length:43}, (_,i)=>i+1))) throw Error('Didascalia index coverage changed');
  const scan = await source('harden-1920.txt', 'https://archive.org/download/cu31924096083336/cu31924096083336_djvu.txt');
  if ([...scan.matchAll(/^CHAPTER [IVXLivxl]+\.\s*$/gm)].length !== 43 || !scan.includes('CHAPTER XLIII.')) throw Error('Harden scan chapter coverage changed');
  const chapters = [];
  for (const number of listed) {
    const html = await source(`didascalia/${number}.html`, `${base}${number}/`);
    if (!html.includes(`<h1>Chapter ${number}</h1>`)) throw Error('Didascalia chapter mismatch');
    const blocks = [...html.matchAll(/<span class="verse-text">([\s\S]*?)<\/span>/g)];
    if (blocks.length !== 1) throw Error('Unversified Didascalia source layout changed');
    const text = clean(blocks[0][1]);
    if (text.length < 100 || /ADDITIONAL NOTES|class=|Harden.s Introduction/.test(text)) throw Error('Didascalia text boundary invalid');
    chapters.push({number, verses:[{number:1, label:'§', text}]});
  }
  if (!chapters[0].verses[0].text.startsWith('IN THE NAME OF GOD') || !chapters[42].verses[0].text.includes('Amen')) throw Error('Didascalia opening/closing mismatch');
  registerWork({workId:'didascalia-ethiopic',title:'Didascalia · Ethiopic',aliases:['Ethiopic Didascalia','Didascalia']});
  await writeBook({workId:'didascalia-ethiopic',editionId:'harden-1920',unversified:true,chapters}, base, {
    expectedChapterCount:43, sourceChapterNumbers:listed,
    check:'43 chapter pages match the source index and 43 chapter headings in the 1920 scan. Whole chapters stored as unversified reading blocks, not numbered biblical verses. Introduction, cross-reference apparatus, footnotes and Additional Notes excluded by the transcription. OCR-derived source may retain errors; not a critical edition.'
  });
}

export const didascaliaEdition = {
  id:'harden-1920', shortName:'Harden 1920', title:'The Ethiopic Didascalia · J. M. Harden 1920',
  credit:'J. M. Harden, translated from Ethiopic, SPCK / Macmillan, 1920. Ertale transcription from the Cornell / Internet Archive scan cu31924096083336, with OCR corrections.',
  sourceUrl:'https://archive.org/details/cu31924096083336',
  rights:'Public-domain 1920 translation. Scan identified as public domain by Wikimedia Commons: https://commons.wikimedia.org/wiki/File:The_Ethiopic_Didascalia_(IA_cu31924096083336).pdf . Transcription source identifies the text as public domain. OCR errors may remain.',
  numbering:'43 source chapters, no intrinsic verse divisions. Internal block 1 stores the whole chapter and is not a verse. Chapter-only references are supported; no cross-edition verse mapping is asserted.'
};
