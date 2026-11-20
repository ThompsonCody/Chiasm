/** Historical translations from Ethiopic, kept separate from Coptic/Syriac substitutes. */
export async function importSinodos({source, clean, registerWork, writeBook}) {
  const horner = await source('horner-1904.txt','https://archive.org/download/statutesapostle00unkngoog/statutesapostle00unkngoog_djvu.txt');
  const normalized = horner.replace(/\s+/g,' ');
  if (!normalized.includes('TRANSLATION OF THE ETHIOPIC TEXT') || !normalized.includes('Statute 72. Concerning the Order of the Priesthood.')) throw Error('Horner source boundaries changed');
  const base='https://ertale.com/bible/ethiopiancanon/teezaz/';
  const index=await source('teezaz/index.html',base);
  const listed=[...index.matchAll(/href="(\d+)\/">Chapter \d+<\/a>/g)].map(m=>Number(m[1]));
  if (JSON.stringify(listed)!==JSON.stringify(Array.from({length:73},(_,i)=>i+1))) throw Error('Teezaz source index changed');
  const chapters=[];
  for(const number of listed){
    const html=await source(`teezaz/${number}.html`,`${base}${number}/`);
    const blocks=[...html.matchAll(/<span class="verse-text">([\s\S]*?)<\/span>/g)];
    if(!html.includes(`<h1>Chapter ${number}</h1>`) || blocks.length!==1) throw Error('Teezaz chapter layout changed');
    const text=clean(blocks[0][1]);
    if(text.length<20) throw Error('Empty Teezaz statute');
    chapters.push({number,verses:[{number:1,label:'§',text}]});
  }
  for(const [chapter, phrase] of [[1,'Said Yuhanes'],[40,'Concerning the ordinance of the gift'],[41,'Concerning the fruit'],[73,'Concerning the Order of the Priesthood']]){
    if(!chapters[chapter-1].verses[0].text.startsWith(phrase)) throw Error('Teezaz printed-section alignment changed');
  }
  registerWork({workId:'tizaz',title:'Tizaz',aliases:['Tizaz','Teezaz','Te’ezaz']});
  await writeBook({workId:'tizaz',editionId:'horner-1904',unversified:true,chapters},base,{
    expectedChapterCount:73,sourceChapterNumbers:listed,
    printedSections:listed.map(n=>({chapter:n,statute:n<=40?String(n):n===41?'40 (second)':String(n-1)})),
    check:'All73 source sections imported. Horner has statutes1–72 with two consecutive40s; browser41 is the second40, browser42–73 correspond to printed41–72. Complete numbered legislative text of the Ethiopic translation; appended unnumbered liturgical prayer cycle is outside this electronic edition. No Coptic/Arabic text substituted. OCR artefacts may remain.'
  });
  const schodde=await source('schodde-1885.txt','https://archive.org/download/jstor-3268629/3268629_djvu.txt');
  const heads=[...schodde.matchAll(/^Canon\s+([^\s.]+)\.?\s/gm)];
  if(heads.length!==57 || heads.at(-1)[1]!=='LVII') throw Error('Schodde canon coverage changed');
  const url='https://ertale.com/bible/ethiopiancanon/apostoliccanons/1/';
  const html=await source('schodde/canons.html',url);
  const blocks=[...html.matchAll(/<div class="verse" id="(\d+)">\s*<span class="verse-num">\d+<\/span><span class="verse-text">([\s\S]*?)<\/span>/g)];
  if(blocks.length!==57 || blocks.some((m,i)=>Number(m[1])!==i+1)) throw Error('Schodde transcription canon coverage changed');
  const canons=blocks.map((m,i)=>({number:i+1,verses:[{number:1,label:'§',text:clean(m[2])}]}));
  if(!canons[0].verses[0].text.startsWith('Concerning the number of bishops') || !canons[56].verses[0].text.includes('to all eternity, Amen')) throw Error('Schodde opening/closing boundaries changed');
  registerWork({workId:'gitsew',title:'Gitsew',aliases:['Gitsew','Gessew','Gitzew']});
  await writeBook({workId:'gitsew',editionId:'schodde-1885',unversified:true,chapters:canons},url,{
    expectedChapterCount:57,sourceChapterNumbers:canons.map(c=>c.number),
    check:'57 numbered canons, I–LVII, checked against the 1885 journal scan and the 57 source transcription blocks. Canon numbers become browser chapter numbers; each canon is unversified prose. This is the Ethiopic recension translated by Schodde from Fell, not the Greek85/Coptic81 recension. Introduction and translator apparatus excluded.'
  });
}

export const sinodosEditions=[{
  id:'horner-1904',shortName:'Horner 1904',title:'Te’ezaz · Ethiopic Statutes · George Horner 1904',
  credit:'George Horner, The Statutes of the Apostles (Williams & Norgate,1904), English translation from Ethiopic, pp.127–232. Ertale electronic transcription. Work identification: Ran HaCohen, Tel Aviv University, https://www.tau.ac.il/~hacohen/Tezaz/Information.html .',
  sourceUrl:'https://archive.org/details/statutesapostle00unkngoog',rights:'Public-domain historical1904 translation; transcription identifies the source as public domain. OCR-derived text may retain errors.',
  numbering:'73 browser sections: printed statutes1–72, including two40s. Browser41 = second40;42–73 = printed41–72. Chapter-only references. Appended unnumbered liturgical prayers are not included in this electronic edition.'
},{
  id:'schodde-1885',shortName:'Schodde 1885',title:'Gitsew · Ethiopic Apostolic Canons · George H. Schodde 1885',
  credit:'George H. Schodde, The Apostolic Canons, Translated from the Ethiopic, Journal of the Society of Biblical Literature and Exegesis5 (1885),61–72. Translation of Fell’s Ethiopic text; Ertale electronic transcription. Identity reference: Mikre-Sellassie1993, The Bible and its Canon in the Ethiopian Orthodox Church, notes47–48.',
  sourceUrl:'https://www.jstor.org/stable/3268629',rights:'Public-domain1885 historical translation, JSTOR Early Journal Content / Internet Archive scan jstor-3268629. OCR-derived transcription may retain errors.',
  numbering:'57 canons I–LVII become browser chapters1–57, each as unversified prose. Traditional56-canon enumeration differs in segmentation at the close; no automatic cross-edition numbering equivalence is asserted.'
}];
