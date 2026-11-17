// Repeatable normalization of licensed structure data and reviewed transcriptions.
// This imports every source outline; unresolved records remain citation-only.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { corpusBooks } from '../src/data/corpus.ts';
import { works } from '../src/data/catalog.ts';
import { structureSources } from '../src/data/structureSources.ts';
import { wenham, domka, citationLeads } from './structure-sources/curated.mjs';

const root = path.resolve(import.meta.dirname, '..');
const input = JSON.parse(await fs.readFile(path.join(root,'scripts/structure-sources/murai.json'),'utf8'));
const sourceLock = JSON.parse(await fs.readFile(path.join(root,'scripts/structure-sources/source-lock.json'),'utf8'));
for (const source of input.inputs) {
  if (!sourceLock.inputs.some(locked => locked.file === source.file && locked.sha256 === source.sha256))
    throw Error('Unreviewed Murai input: '+source.file);
}
const byTitle = Object.fromEntries(works.map(w=>[w.title.replace(/\s/g,''),w.id]));
const sheetWorks = {...byTitle, SongofSolomon:'song-of-songs', Lamentation:'lamentations',
  Samuel:'1-samuel', Kings:'1-kings', Chronicles:'1-chronicles', 'Ezra-Nehemiah':'ezra'};
const prefixes = {'1S':'1-samuel','2S':'2-samuel','1K':'1-kings','2K':'2-kings',
  '1Ch':'1-chronicles','2Ch':'2-chronicles',Ezr:'ezra',Neh:'nehemiah'};
// These source book systems have known chapter/verse shifts, or witness-dependent
// subdivisions. Do not infer identity merely because a number fits the target.
const needsCrosswalk = new Set(['leviticus','psalms','daniel','hosea','joel','jonah','nahum',
  'malachi','jeremiah','1-chronicles','2-chronicles','1-john','exodus','numbers',
  'deuteronomy','1-samuel','2-samuel','1-kings','2-kings','nehemiah','job',
  'ecclesiastes','song-of-songs','isaiah','ezekiel','micah','zechariah']);
function numberingUnverified(workId,start,end) {
  return needsCrosswalk.has(workId) ||
    (workId==='genesis' && start[0]<=32 && end[0]>=31) ||
    (workId==='acts' && start[0]<=19 && end[0]>=19) ||
    (workId==='revelation' && start[0]<=13 && end[0]>=12) ||
    (workId==='2-corinthians' && end[0]>=13);
}
const normalize = text => String(text).replace(/[–—]/g,'-').trim();
const baseLabel = label => {
  const plain=label.replace(/[′']/g,'');
  return /^[A-Za-z]/.test(plain)?plain.replace(/\d+$/,''):plain;
};
const score = ([chapter,verse]) => chapter*1000+verse;
const book = (workId, editionId) => corpusBooks.find(b=>b.workId===workId&&b.editionId===editionId);
const editionsFor = anchor => ['kjv','web','charles-1917','charles-1913'].filter(id=>{
  const b=book(anchor.workId,id); if(!b||score(anchor.start)>score(anchor.end)) return false;
  for(let chapter=anchor.start[0];chapter<=anchor.end[0];chapter++) {
    const numbers=b.verseNumbers[b.chapterNumbers.indexOf(chapter)]; if(!numbers) return false;
    const start=chapter===anchor.start[0]?anchor.start[1]:numbers[0];
    const end=chapter===anchor.end[0]?anchor.end[1]:numbers.at(-1);
    for(let verse=start;verse<=end;verse++) if(!numbers.includes(verse)) return false;
  }
  return true;
});

function anchorsFor(raw, workId, sourceId) {
  let text=normalize(raw).replace(/\s+/g,' ');
  text=text.replace(/(\d+:\d+)([a-z])-([a-z])\b/g,'$1$2-$1$3');
  text=text.replace(/^[123]\s+[A-Za-z]+\s*/,'');
  // The combined-book workbooks explicitly use these prefixes.
  if(!/^(1S|2S|1K|2K|1Ch|2Ch|Ezr|Neh)\d/.test(text))
    text=text.replace(/^[1-3]?[A-Za-z]+\s*/, '');
  const token=/(1Ch|2Ch|1S|2S|1K|2K|Ezr|Neh)?\s*(\d+):(\d+)([a-z])?(?:-\s*(?:(\d+):)?(\d+)([a-z])?)?|(?:^|,)\s*(\d+)([a-z])?/g;
  const anchors=[]; let lastChapter; let consumed=''; let found;
  while((found=token.exec(text))) {
    let chapter,verse,endChapter,endVerse;
    if(found[8]) { if(!lastChapter) throw Error('Unresolved verse context'); chapter=lastChapter; verse=Number(found[8]); endChapter=chapter; endVerse=verse; }
    else { workId=prefixes[found[1]]??workId; chapter=Number(found[2]); verse=Number(found[3]); endChapter=Number(found[5]??chapter); endVerse=Number(found[6]??verse); }
    if(!workId) throw Error('Unresolved work identity');
    const anchor={workId,start:[chapter,verse],end:[endChapter,endVerse],editionIds:[]};
    if(found[4]||found[7]||found[9]) anchor.note='Source subverse letters are retained. Displayed text is full numbered-verse context; exact source phrase alignment is not asserted.';
    anchor.editionIds=editionsFor(anchor);
    const unverified=sourceId==='murai-2022'&&numberingUnverified(workId,anchor.start,anchor.end);
    if(unverified) anchor.editionIds=[];
    if(!anchor.editionIds.length) throw Error(unverified
      ? 'Source numbering needs a verified crosswalk for '+workId+'; no identity mapping assumed.'
      : 'Source range is unavailable or incompletely aligned in loaded editions: '+workId+' '+found[0]);
    anchors.push(anchor); lastChapter=endChapter; consumed+=found[0];
  }
  // Remove matched ranges then require only separators to remain.
  const residue=text.replace(token,'').replace(/[\s,;]+/g,'');
  if(!anchors.length||residue) throw Error('Unresolved reference syntax: '+raw);
  return anchors;
}

function finish(meta, rawNodes, descriptions={}, details=[]) {
  const errors=[];
  const nodes=rawNodes.map((n,i)=>{
    let anchors=[];
    try { anchors=anchorsFor(n.ref,meta.work,meta.sourceId); } catch(error) { errors.push(error.message); }
    return {id:n.id??`${meta.id}-n${i+1}`,label:n.label,title:n.title??descriptions[n.label.replace(/[′']/g,'')]??`Source element ${n.label}`,
      sourceRef:n.ref,anchors,...(n.note?{note:n.note}:{})};
  });
  const groups=[];
  for(const node of nodes) {
    const label=baseLabel(node.label);
    let group=groups.find(g=>g.label===label);
    if(!group) {
      const basis=descriptions[label]??`Source elements labeled ${label}`;
      const groupId=meta.groupIds?.[label]??`${meta.id}-g-${label}`;
      const familiarTitles={'150-days':'150 days','ark-window':'Shut in, then opened','forty-days':'Forty days','mountains':'Mountains hidden, then visible','god-remembers':'God remembers Noah'};
      group={id:groupId,label,nodeIds:[],title:familiarTitles[groupId]??basis,
        sourceClaim:basis,editorialExplanation:meta.sourceId==='murai-2022'
          ? `Murai links these source elements under “${basis}”. This is the proposal’s stated relationship; read the passages to assess it. Wording can differ by edition.`
          : basis};
      groups.push(group);
    }
    group.nodeIds.push(node.id);
  }
  // A sole unmatched middle element in a reversed source outline is its center.
  // No center is assigned to parallel or sequential outlines.
  const labels=nodes.map(n=>baseLabel(n.label));
  const odd=nodes.length%2===1;
  const reversed=labels.every((label,i)=>label===labels[labels.length-1-i]);
  let center=meta.centerLabel??(odd&&reversed&&nodes.length>2&&groups.every(g=>g.nodeIds.length<=2)?nodes[(nodes.length-1)/2].label:undefined);
  if(center) nodes.find(n=>n.label===center).role='center';
  for(const group of groups) if(meta.sourceId==='murai-2022'&&!descriptions[group.label]) {
    const elements=nodes.filter(node=>group.nodeIds.includes(node.id));
    group.sourceClaim=`The source assigns the label ${group.label} to these elements. No relationship note is supplied for this group.`;
    group.editorialExplanation=elements.length>1
      ? `These passages occupy matching ${group.label} positions in Murai’s outline. The downloadable source gives no further explanation for the match; assess it in the displayed reading context.`
      : elements[0]?.role==='center'
        ? 'This is the unmatched middle element of Murai’s reversed outline. The download gives no additional explanation for its central role.'
        : 'This is a separately labeled element in Murai’s outline. The download gives no additional relationship note.';
  }
  try {
    const boundary=anchorsFor(meta.reference,meta.work,meta.sourceId);
    for(const node of nodes) for(const anchor of node.anchors)
      if(!boundary.some(area=>area.workId===anchor.workId&&score(area.start)<=score(anchor.start)&&score(area.end)>=score(anchor.end)))
        errors.push('Source element lies outside the supplied outline boundary: '+node.sourceRef);
  } catch(error) { errors.push('Outline boundary not verified: '+error.message); }
  const source=structureSources.find(s=>s.id===meta.sourceId);
  const workIds=[...new Set(nodes.flatMap(n=>n.anchors.map(a=>a.workId)))];
  if(!workIds.length&&meta.work) workIds.push(meta.work);
  if(!nodes.length) errors.push('The downloadable entry has no structure elements; it is not counted as an opening map.');
  const mapped=nodes.length>0&&!errors.length&&!meta.issue;
  const compatiblePairs=groups.some(g=>g.nodeIds.length===2)&&groups.every(g=>g.nodeIds.length<=2);
  const kind=meta.kind??(reversed&&odd&&compatiblePairs?'Concentric structure':reversed&&compatiblePairs?'Chiasm':'Parallel / multi-part structure');
  const result={id:meta.id,title:meta.title,author:meta.author??source.author,workIds,sourceId:meta.sourceId,
    sourceUrl:meta.url??source.url,sourceLocator:meta.locator,boundaries:meta.boundaries??`${works.find(w=>w.id===meta.work)?.title??meta.work} ${meta.reference}`,
    kind,status:mapped?'mapped':'citation-only',...(mapped?{}:{reason:[...new Set([meta.issue,...errors].filter(Boolean))].join(' ')}),
    ...(center?{center:nodes.find(n=>n.label===center)?.sourceRef}:{}),
    defaultSelectionId:meta.defaultSelectionId??groups[0]?.id??'',selectionIds:groups.map(g=>g.id),compatiblePairs,
    coverage:mapped?groups.map(g=>({selectionId:g.id,anchors:nodes.filter(n=>g.nodeIds.includes(n.id)).flatMap(n=>n.anchors)})):[],
    ...(meta.note?{note:meta.note}:{}),nodes,groups};
  if(details.length) result.subdivisions=details.map(([label,sourceRef,title])=>{
    let anchors=[]; try {anchors=anchorsFor(sourceRef,meta.work,meta.sourceId);}catch{};
    return {label,sourceRef,title,anchors};
  });
  return result;
}

const maps=[];
for(const raw of input.records) {
  let work=sheetWorks[raw.sheet];
  const combined=/^([12])\s*(Sam|Kings|Chron|Chr|Ch)/i.exec(raw.reference);
  if(raw.sheet==='Samuel'&&combined) work=combined[1]+'-samuel';
  if(raw.sheet==='Kings'&&combined) work=combined[1]+'-kings';
  if(raw.sheet==='Chronicles'&&combined) work=combined[1]+'-chronicles';
  if(raw.sheet==='Ezra-Nehemiah'&&/^Neh/i.test(raw.reference)) work='nehemiah';
  const id=`murai-${raw.testament.toLowerCase()}-${raw.sheet.toLowerCase().replace(/[^a-z0-9]/g,'')}-r${raw.row}`;
  const descriptions={};
  for(const note of raw.relationships) {
    const pattern=/(?:^|\s)([A-Z][A-Za-z0-9]*):\s*([\s\S]*?)(?=\s+[A-Z][A-Za-z0-9]*:\s|$)/g;
    for(const match of note.matchAll(pattern)) descriptions[match[1]]=match[2].replace(/[.\s]+$/,'');
  }
  const nodes=[]; const issues=[...raw.issues];
  for(const position of raw.positions) {
    const parsed=/^([A-Za-z][A-Za-z0-9'′’]*):?\s*\(([^)]+)\)$/.exec(position.position);
    if(!parsed) {issues.push('Source position has missing/malformed reference at row '+position.row+': '+position.position);continue;}
    nodes.push({label:parsed[1].replace(/[’']/g,'′'),ref:parsed[2]});
  }
  maps.push(finish({id,work,title:raw.title,reference:raw.reference,boundaries:raw.reference,sourceId:'murai-2022',
    locator:`${raw.testament} PericopeStructure · ${raw.sheet} · rows ${raw.row}–${raw.positions.at(-1)?.row??raw.row} · pericope ${raw.pericope}`,
    issue:!work?'Unresolved source book identity.':issues.join(' '),
    note:'2022 downloadable source snapshot. Relationship labels are source data; explanation wording is ChiFold editorial. Source Bible quotations are excluded. Subverse elements show whole verses as context.'},nodes,descriptions));
}

for(const raw of [wenham,...domka]) {
  const first=[],last=[],descriptions={},groupIds={};
  for(const [label,id,a,b,ta,tb,basis]of raw.pairs??[]) {
    first.push({label,ref:a,title:ta});last.unshift({label:label+'′',ref:b,title:tb});
    descriptions[label]=basis;groupIds[label]=id;
  }
  const middle=raw.center?[{label:raw.center[0],id:raw.center[1]+'-node',ref:raw.center[2],title:raw.center[3]}]:[];
  if(raw.center) {descriptions[raw.center[0]]=raw.sourceId==='wenham-1978'?'God remembering Noah is Wenham’s proposed turn.':'Domka places the narrative transition at the angels’ response to human distress.';groupIds[raw.center[0]]=raw.center[1];}
  const sections=(raw.sections??[]).map(([label,ref,title])=>({label,ref,title}));
  for(const [label,,title]of raw.sections??[]) descriptions[label]=title;
  maps.unshift(finish({...raw,groupIds,centerLabel:raw.center?.[0]},[...first,...middle,...last,...sections],descriptions,raw.details));
}
for(const lead of citationLeads) {
  const source=structureSources.find(s=>s.id===lead.sourceId);
  maps.push({...lead,author:lead.author??source.author,sourceUrl:source.url,sourceLocator:'Source access / review lead',kind:'Citation lead',status:'citation-only',defaultSelectionId:'',selectionIds:[],compatiblePairs:false,coverage:[],nodes:[],groups:[]});
}
if(new Set(maps.map(m=>m.id)).size!==maps.length) throw Error('Duplicate structure IDs');
const out=path.join(root,'public/structures/maps'); await fs.mkdir(out,{recursive:true});
for(const map of maps.filter(m=>m.status==='mapped')) await fs.writeFile(path.join(out,map.id+'.json'),JSON.stringify(map));
const expectedFiles=new Set(maps.filter(m=>m.status==='mapped').map(m=>m.id+'.json'));
for(const file of await fs.readdir(out)) if(/^[a-z0-9-]+\.json$/.test(file)&&!expectedFiles.has(file)) {
  const target=path.join(out,file);
  if(path.dirname(target)!==out) throw Error('Generated file escaped map output directory');
  await fs.unlink(target);
}
const index=maps.map(({nodes,groups,subdivisions,...meta})=>meta);
// Repeated notes and anchor field names need not inflate the initial JS bundle.
// The public API remains a normal typed list; individual outlines load on demand.
const sharedText=[];
const textId=text=>{if(text===undefined)return undefined;let id=sharedText.indexOf(text);if(id<0){id=sharedText.length;sharedText.push(text);}return id;};
const compact=index.map(map=>{
  const source=structureSources.find(source=>source.id===map.sourceId);
  return {id:map.id,title:map.title,workIds:map.workIds,sourceId:map.sourceId,sourceLocator:map.sourceLocator,boundaries:map.boundaries,kind:map.kind,
    ...(map.author!==source.author?{author:map.author}:{}),...(map.sourceUrl!==source.url?{sourceUrl:map.sourceUrl}:{}),
    ...(map.reason?{reason:textId(map.reason)}:{}),...(map.center?{center:map.center}:{}),...(map.note?{note:textId(map.note)}:{}),
    ...(map.status==='mapped'?{defaultSelectionId:map.defaultSelectionId,compatiblePairs:map.compatiblePairs,
      coverage:map.coverage.map(part=>[part.selectionId,part.anchors.map(anchor=>[anchor.workId,...anchor.start,...anchor.end,anchor.editionIds,textId(anchor.note)])])}:{}),
  };
});
const generated=`// Generated by scripts/import-structures.mjs. Edit source inputs, not this file.
import type { StructureSummary } from "./structureTypes.ts";
import { structureSources } from "./structureSources.ts";
type CompactAnchor = [string, number, number, number, number, string[], number | null];
type CompactSummary = { id:string; title:string; workIds:string[]; sourceId:string; sourceLocator:string; boundaries:string; kind:string; author?:string; sourceUrl?:string; reason?:number; center?:string; note?:number; defaultSelectionId?:string; compatiblePairs?:boolean; coverage?:[string, CompactAnchor[]][] };
const sharedText: string[] = ${JSON.stringify(sharedText)};
const rows: CompactSummary[] = ${JSON.stringify(compact)};
export const structureIndex: readonly StructureSummary[] = rows.map(row => {
  const source = structureSources.find(source => source.id === row.sourceId)!;
  const coverage = (row.coverage ?? []).map(([selectionId, anchors]) => ({selectionId, anchors: anchors.map(([workId,c1,v1,c2,v2,editionIds,note]) => ({workId, start:[c1,v1] as [number,number], end:[c2,v2] as [number,number], editionIds, ...(note == null ? {} : {note:sharedText[note]})}))}));
  return {id:row.id, title:row.title, workIds:row.workIds, sourceId:row.sourceId, author:row.author ?? source.author, sourceUrl:row.sourceUrl ?? source.url, sourceLocator:row.sourceLocator, boundaries:row.boundaries, kind:row.kind, status:row.reason === undefined ? "mapped" : "citation-only", ...(row.reason === undefined ? {} : {reason:sharedText[row.reason]}), ...(row.note === undefined ? {} : {note:sharedText[row.note]}), ...(row.center ? {center:row.center} : {}), defaultSelectionId:row.defaultSelectionId ?? "", selectionIds:coverage.map(part => part.selectionId), compatiblePairs:row.compatiblePairs ?? false, coverage};
});
`;
await fs.writeFile(path.join(root,'src/data/structureIndex.ts'),generated);
const grouped={};
for(const m of index.filter(m=>m.status==='mapped')) for(const workId of m.workIds) {
  const key=workId+' / '+m.sourceId; grouped[key]=(grouped[key]??0)+1;
}
const mapFiles=[];
for(const file of [...expectedFiles].sort()) mapFiles.push({id:file.slice(0,-5),sha256:crypto.createHash('sha256').update(await fs.readFile(path.join(out,file))).digest('hex')});
const report={sourceOutlines:input.records.length,workingMaps:index.filter(m=>m.status==='mapped').length,mapFiles,
  citationOnly:index.filter(m=>m.status==='citation-only').length,byBookAndSource:grouped,
  sourceInputs:input.inputs,normalizedInputSha256:crypto.createHash('sha256').update(await fs.readFile(path.join(root,'scripts/structure-sources/murai.json'))).digest('hex')};
await fs.writeFile(path.join(root,'public/structures/manifest.json'),JSON.stringify(report,null,2));
const leads=index.filter(map=>map.status==='citation-only');
const csvCell=value=>'"'+String(value??'').replaceAll('"','""')+'"';
await fs.writeFile(path.join(root,'STRUCTURE_LEADS.csv'),[['id','title','author','books','boundaries','source','source_locator','reason'],...leads.map(map=>[map.id,map.title,map.author,map.workIds.join('; '),map.boundaries,map.sourceUrl,map.sourceLocator,map.reason])].map(row=>row.map(csvCell).join(',')).join('\n')+'\n');
const gaps=works.filter(work=>!index.some(map=>map.status==='mapped'&&map.workIds.includes(work.id)));
const pendingReasons={};
for(const map of leads.filter(map=>map.id.startsWith('murai-ot-')||map.id.startsWith('murai-nt-'))) {
  const category=map.reason.includes('crosswalk')?'Checked numbering crosswalk needed':map.reason.includes('no structure elements')?'No outline elements supplied':map.reason.includes('outside the supplied')?'Element outside source boundary':'Unresolved source syntax / range';
  pendingReasons[category]=(pendingReasons[category]??0)+1;
}
const lines=['# Structure coverage','',`Working maps: **${report.workingMaps}**. Citation-only records: **${report.citationOnly}**.`,
  '',`All **${input.records.length}** source entries extracted from the four downloaded Murai workbooks are accounted for, including entries with no outline supplied. The three manually reviewed maps are Wenham’s complete Flood outline and two Domka outlines.`,
  '', '| Book | Source | Maps that open |','| --- | --- | ---: |',
  ...Object.entries(grouped).sort().map(([key,count])=>{const [workId,sourceId]=key.split(' / ');return '| '+works.find(work=>work.id===workId).title+' | '+structureSources.find(source=>source.id===sourceId).author+' | '+count+' |';}),
  '', 'Counts are map records, not pair counts. A multi-work map would appear under each covered book; the total above counts unique IDs.',
  '', '## Citation-only records and gaps','',
  'Citation-only records have no Open map control. They retain source locators and reasons in the app catalogue. Known alternative-numbering books are held for checked crosswalks, even where numbers happen to fit. Malformed source ranges and unavailable verses are not repaired by guesswork.',
  '', `Full export: [STRUCTURE_LEADS.csv](STRUCTURE_LEADS.csv), all ${leads.length} records with individual reasons. Of these, ${leads.filter(map=>map.id.startsWith('murai-ot-')||map.id.startsWith('murai-nt-')).length} are source entries from the Murai download; the remaining ${citationLeads.length} research leads are listed below.`,
  '', '| Primary hold reason for Murai entries | Records |','| --- | ---: |',...Object.entries(pendingReasons).map(([reason,count])=>'| '+reason+' | '+count+' |'),
  '', 'Reasons can overlap within a record; the table assigns each to its first applicable category. The CSV retains every reported issue.',
  '', ...citationLeads.map(l=>'- **'+l.title+'**: '+l.reason),
  '', 'No catalogue map is a claim of settled authorial intent. No maps are generated to fill uncovered texts. Jubilees and the remaining broader Tewahedo-only works have no verified maps in these sources. The Church-list collection and work identities are unchanged.',
  '', '## Books with no opening map in this import', '', gaps.map(work=>work.title).join(', ')+'.',
  '', 'See STRUCTURE_SOURCES.md for provenance, licences, reproducible import steps and verification limits.'];
await fs.writeFile(path.join(root,'STRUCTURE_COVERAGE.md'),lines.join('\n')+'\n');
console.log(JSON.stringify({workingMaps:report.workingMaps,citationOnly:report.citationOnly,sourceOutlines:report.sourceOutlines}));
