// Reviewed diagrams can be complete even when their source numbering is not yet
// aligned to a loaded edition. Only verified reading anchors enter discovery.
const prefixes = {
  '1S':'1-samuel','2S':'2-samuel','1K':'1-kings','2K':'2-kings',
  '1Ch':'1-chronicles','2Ch':'2-chronicles',Ezr:'ezra',Ne:'nehemiah',Neh:'nehemiah',
  Gen:'genesis',Ex:'exodus',Exodus:'exodus',Lev:'leviticus',Num:'numbers',Numbers:'numbers',
  Deut:'deuteronomy',Luke:'luke',Acts:'acts',John:'john',Revelation:'revelation',Rev:'revelation',Josh:'joshua',
  Ho:'hosea',Hos:'hosea',Jl:'joel',Am:'amos',Ob:'obadiah',Jon:'jonah',Mi:'micah',Na:'nahum',Hab:'habakkuk',Zp:'zephaniah',Hg:'haggai',Zc:'zechariah',Ml:'malachi',
};
const names=Object.keys(prefixes).sort((a,b)=>b.length-a.length).join('|');
const rangePattern=new RegExp(`(${names})?\\s*(\\d+):(\\d+)([a-z])?(?:-\\s*(${names})?(?:(\\d+):)?(\\d+)([a-z])?)?`,'g');
const score=point=>point[0]*1000+point[1];

export function sourceReferences(raw) {
  const text=raw.replace(/[–—]/g,'-').replace(/_/g,' ');
  const result=[];let workId;
  for(const match of text.matchAll(rangePattern)) {
    if(match[1]) workId=prefixes[match[1]];
    if(!workId) throw Error('Source book not identified: '+raw);
    if(match[5]&&prefixes[match[5]]!==workId) throw Error('Cross-book endpoint needs explicit split: '+raw);
    result.push({workId,start:[+match[2],+match[3]],end:[+(match[6]??match[2]),+(match[7]??match[3])],
      subverse:Boolean(match[4]||match[8])});
  }
  const remainder=text.replace(rangePattern,'').replace(/[\s,;]+/g,'');
  if(!result.length||remainder) throw Error('Unresolved source range: '+raw);
  return result;
}

const uncertainBooks=new Set(['1-samuel','2-samuel','1-kings','2-kings','1-chronicles','2-chronicles','nehemiah','exodus','numbers','hosea','joel','jonah','micah','nahum','zechariah','malachi']);

function readingAnchor(source, sourceId, books) {
  let {workId,start,end}=source; start=[...start];end=[...end];
  const notes=[];
  if(source.subverse) notes.push('Source subverse divisions are retained in the source boundary; complete numbered verses provide reading context, not exact phrase equivalence.');
  if(sourceId==='murai-web-2026') {
    let checkedOT=false;
    if(workId==='1-samuel'&&start[0]===24&&start[1]===1&&end[0]===24&&end[1]===23) {
      start=[23,29];end=[24,22];checkedOT=true;
      notes.push('Complete source 1 Samuel 24:1–23 corresponds to KJV/WEB 23:29–24:22; chapter boundary checked against https://bible.usccb.org/bible/1samuel/24 .');
    }
    if(workId==='1-kings'&&start[0]===5&&end[0]===5&&start[1]>=1&&end[1]<=32) {
      const point=v=>v<=14?[4,v+20]:[5,v-14];
      start=point(start[1]);end=point(end[1]);checkedOT=true;
      notes.push('Source 1 Kings 5:1–14 corresponds to KJV/WEB 4:21–34; source 5:15–32 to 5:1–18, checked against publisher note: https://bible.usccb.org/bible/1kings/5 .');
    }
    if(workId==='2-chronicles'&&start[0]===1&&start[1]===18&&end[0]===2&&end[1]===17) {
      start=[2,1];end=[2,18];checkedOT=true;
      notes.push('Source 2 Chronicles 1:18–2:17 corresponds to KJV/WEB 2:1–18; chapter boundary checked at https://bible.usccb.org/bible/2chronicles/1 and /2 .');
    }
    const samuelRanges={ '18:19-19:9':[[18,19],[19,8]], '19:9-19:15':[[19,8],[19,14]], '19:16-19:44':[[19,15],[19,43]] };
    const samuel=workId==='2-samuel'&&samuelRanges[`${start.join(':')}-${end.join(':')}`];
    if(samuel){[start,end]=samuel;checkedOT=true;notes.push('Source 2 Samuel 19 endpoint numbering checked against https://bible.usccb.org/bible/2samuel/19 . Lettered source fragments expand to complete KJV/WEB verses as context.');}
    if(uncertainBooks.has(workId)&&!checkedOT) return {reason:`Source numbering for ${workId} requires a checked edition crosswalk. No KJV/WEB identity mapping has been assumed.`};
    if(workId==='acts'&&start[0]<=19&&end[0]>=19) {
      if(start[0]===19&&start[1]>40 || end[0]===19&&end[1]>40) return {reason:'Acts 19 source numbering exceeds the checked NABRE range.'};
      if(end[0]===19&&end[1]===40) end=[19,41];
      notes.push('Acts 19 boundary checked against USCCB NABRE Acts 19:40: its final assembly-dismissal clause is KJV/WEB 19:41. The displayed range includes that complete verse as context. Source: https://bible.usccb.org/bible/acts/19');
    }
    if(workId==='revelation'&&start[0]<=12&&end[0]>=12) {
      if(start[0]===12&&start[1]===18) start=[13,1];
      if(end[0]===12&&end[1]===18) end=[13,1];
      notes.push('Revelation 12:18 in NABRE is included within KJV/WEB 13:1. USCCB notes the variant speaker (dragon versus first-person narrator); whole-verse reading context is expanded, not a claim of identical wording. Source: https://bible.usccb.org/bible/revelation/12');
    }
    if(workId==='revelation'&&start[0]===13&&start[1]===1) notes.push('The complete KJV/WEB 13:1 also includes a sea-shore clause assigned to NABRE 12:18; that reading context overlaps the preceding source element. No exact phrase equivalence is asserted.');
  }
  if(score(start)>score(end))return {reason:'Source range order needs review.'};
  const editionIds=['kjv','web'].filter(editionId=>{
    const book=books.find(book=>book.workId===workId&&book.editionId===editionId);
    if(!book)return false;
    for(let c=start[0];c<=end[0];c++) {
      const numbers=book.verseNumbers[book.chapterNumbers.indexOf(c)];if(!numbers)return false;
      for(let v=c===start[0]?start[1]:numbers[0];v<=(c===end[0]?end[1]:numbers.at(-1));v++)if(!numbers.includes(v))return false;
    }
    return true;
  });
  return editionIds.length?{anchor:{workId,start,end,editionIds,...(notes.length?{note:notes.join(' ')}:{})}}:
    {reason:'This source range is unavailable or lacks complete coverage in the loaded reading editions.'};
}

export function normalizeSourceMap(raw, sources, books, sourceId=raw.sourceId) {
  const source=sources.find(source=>source.id===sourceId);if(!source)throw Error('Missing source '+sourceId);
  const workIds=[];
  const nodes=raw.nodes.map((node,index)=>{
    const parsed=sourceReferences(node.ref);
    for(const part of parsed)if(!workIds.includes(part.workId))workIds.push(part.workId);
    const aligned=parsed.map(part=>readingAnchor(part,sourceId,books));
    const reasons=[...new Set(aligned.flatMap(part=>part.reason?[part.reason]:[]))];
    return {id:`${raw.id}-n${index+1}`,label:node.label,title:node.title,sourceRef:node.sourceRef??node.ref,
      // Don't silently omit a missing part of a compound source range.
      anchors:reasons.length?[]:aligned.map(part=>part.anchor),
      ...(node.label===raw.centerLabel?{role:'center'}:{}),
      ...(reasons.length?{unmappedReason:reasons.join(' ')}:{}),
    };
  });
  const groups=[];
  nodes.forEach((node,index)=>{
    const label=raw.nodes[index].groupLabel??node.label.replace(/[′'″]/g,'');
    let group=groups.find(group=>group.label===label);
    if(!group){
      const basis=raw.relationships?.[label];
      const id=`${raw.id}-g-${label}`;
      group={id,label,nodeIds:[],title:basis||node.title,
        sourceClaim:basis||'The source assigns this position but supplies no separate relationship note.',
        editorialExplanation:basis?(sourceId==='murai-web-2026'?`Murai’s stated correspondence: ${basis}. Assess this proposed match in its source context.`:basis):
          node.role==='center'?'This is the source diagram’s unmatched central position. No further match explanation is supplied.':
          'This is an independently retained source element. No counterpart has been invented.'};
      groups.push(group);
    }
    group.nodeIds.push(node.id);
  });
  if(!nodes.length||!groups.length)throw Error('Empty reviewed diagram '+raw.id);
  const unmappedNodeCount=nodes.filter(node=>!node.anchors.length).length;
  const readingAlignment=unmappedNodeCount===0?'verified':unmappedNodeCount===nodes.length?'unavailable':'partial';
  const defaultGroup=groups.find(group=>group.id===raw.defaultSelectionId)??groups.find(group=>group.nodeIds.length===2)??groups[0];
  const duplicateNotes=(raw.additionalSourceLocators??[]).map(item=>typeof item==='string'?item:JSON.stringify(item));
  return {id:raw.id,title:raw.title,author:raw.author??source.author,sourceId,sourceUrl:raw.sourceUrl??source.url,
    sourceLocator:raw.locator??'Complete published diagram',workIds,boundaries:raw.boundaries,
    kind:raw.kind,status:'mapped',defaultSelectionId:defaultGroup.id,selectionIds:groups.map(g=>g.id),
    compatiblePairs:groups.some(g=>g.nodeIds.length===2)&&groups.every(g=>g.nodeIds.length<=2),
    coverage:groups.map(group=>({selectionId:group.id,anchors:nodes.filter(node=>group.nodeIds.includes(node.id)).flatMap(node=>node.anchors)})),
    ...(raw.centerLabel?{center:nodes.find(n=>n.label===raw.centerLabel)?.sourceRef}:{}),
    readingAlignment,unmappedNodeCount,
    note:[raw.note,`Complete source outline. Reading alignment: ${readingAlignment}; ${unmappedNodeCount} of ${nodes.length} elements currently lack a verified complete reading-edition mapping. Unmapped source coordinates never enter reader discovery.`,...duplicateNotes.map(n=>'Additional occurrence of the same source outline: '+n)].filter(Boolean).join(' '),nodes,groups};
}
