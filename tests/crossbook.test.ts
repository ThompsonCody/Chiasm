import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { structureIndex } from '../src/data/structureIndex.ts';
import { structuresForReference, getMapSelection } from '../src/lib/structures.ts';
import { supportsFoldMap } from '../src/lib/foldLayout.ts';
import { sourceReferences } from '../scripts/normalize-source-maps.mjs';
import type { StructureMap } from '../src/data/structureTypes.ts';
const json=(file:string)=>JSON.parse(fs.readFileSync(new URL('../'+file,import.meta.url),'utf8'));
const map=(id:string):StructureMap=>json(`public/structures/maps/${id}.json`);

test('all hierarchy occurrences are imported or explicitly deduplicated',()=>{
  const input=json('scripts/structure-sources/murai-hierarchy.json');
  assert.equal(input.records.length,237);
  assert.equal(input.records.filter((r:{duplicateOf?:string})=>!r.duplicateOf).length,229);
  for(const raw of input.records) {
    const target=map(raw.duplicateOf??raw.id);
    if(!raw.duplicateOf)assert.deepEqual(target.nodes.map(n=>[n.label,n.sourceRef]),raw.nodes.map((n:{label:string;ref:string})=>[n.label,n.ref]));
    else assert.ok(target.note?.includes(raw.locator));
  }
});

test('complete inter-book tables preserve reverse and parallel organization separately',()=>{
  const input=json('scripts/structure-sources/crossbook-murai.json');
  for(const raw of input.maps) {
    const target=map(raw.id);
    assert.equal(target.nodes.length,raw.nodes.length);
    assert.deepEqual(target.nodes.map(n=>[n.label,n.sourceRef]),raw.nodes.map((n:{label:string;ref:string})=>[n.label,n.ref]));
  }
  const john=map('murai-john-revelation');
  assert.equal(john.nodes.length,162);
  assert.equal(john.groups.length,81);
  assert.ok(supportsFoldMap(john));
  assert.equal(map('murai-exodus-numbers').kind,'Parallel / multi-part structure');
  assert.equal(supportsFoldMap(map('murai-exodus-numbers')),false);
  const luke=map('murai-luke-acts');
  assert.equal(luke.nodes.length,194);
  assert.equal(luke.groups.filter(g=>g.nodeIds.length===1).length,96);
  assert.equal(supportsFoldMap(luke),false);
});

test('unverified source numbering never becomes a reading anchor or reader-discovery match',()=>{
  const source=map('murai-web-samuel-1-1');
  assert.ok(source.nodes.some(node=>node.unmappedReason));
  for(const node of source.nodes.filter(node=>node.unmappedReason))assert.equal(node.anchors.length,0);
  assert.ok(!structuresForReference({workId:'1-samuel',chapter:1,verseStart:1},'kjv').some(s=>s.id===source.id));
  assert.equal(source.status,'mapped'); // The source diagram is complete; edition alignment is independent.
});

test('checked source-numbering exceptions include complete reading context and variant notes',()=>{
  const john=map('murai-john-revelation');
  const shore=john.nodes.find(n=>n.sourceRef==='Revelation12:17-18')!;
  assert.deepEqual(shore.anchors[0].end,[13,1]);
  assert.match(shore.anchors[0].note!,/variant speaker/);
  const luke=map('murai-luke-acts');
  const assembly=luke.nodes.find(n=>n.sourceRef==='Acts19:21-40 20:1-2')!;
  assert.deepEqual(assembly.anchors.map(a=>[a.start,a.end]),[[[19,21],[19,41]],[[20,1],[20,2]]]);
  assert.match(assembly.anchors[0].note!,/usccb/);
});

test('competing Luke–Acts outlines retain distinct centers and source boundaries',()=>{
  const wolfe=map('wolfe-luke-acts'); const meyer=map('meyer-luke-acts');
  assert.equal(wolfe.nodes.length,7);assert.equal(meyer.nodes.length,10);
  assert.equal(wolfe.nodes.find(n=>n.role==='center')?.sourceRef,'Luke24:50-24:51');
  assert.ok(!meyer.nodes.some(n=>n.role==='center'));
  assert.ok(structuresForReference({workId:'luke',chapter:24,verseStart:50},'kjv').some(m=>m.id===wolfe.id));
  assert.ok(structuresForReference({workId:'acts',chapter:1,verseStart:12},'kjv').some(m=>m.id===meyer.id));
});

test('multi-part and overlapping source proposals are retained without invented two-way pairs',()=>{
  const hexateuch=map('pitkanen-hexateuch');
  assert.equal(hexateuch.nodes.length,17);
  assert.equal(getMapSelection(hexateuch,'pitkanen-hexateuch-g-B4').nodes.length,3);
  assert.equal(hexateuch.compatiblePairs,false);assert.equal(supportsFoldMap(hexateuch),false);
  const full=map('patrick-song-of-ark');
  assert.equal(full.nodes.length,41);
  assert.equal(full.nodes.find(n=>n.role==='center')?.label,'21');
  assert.ok(full.nodes.some(n=>n.anchors.length===2&&n.anchors[0].workId!==n.anchors[1].workId));
  const simplified=map('patrick-song-of-ark-simplified');
  assert.equal(simplified.nodes.length,11);
  assert.equal(simplified.nodes.find(n=>n.role==='center')?.label,'F');
});

test('the entire linked Twelve Prophets collection is retained, not just its global diagram',()=>{
  const input=json('scripts/structure-sources/murai-twelve.json');
  assert.equal(input.maps.length,113);
  for(const raw of input.maps) {
    const target=map(raw.id);
    assert.deepEqual(target.nodes.map(n=>[n.label,n.sourceRef]),raw.nodes.map((n:{label:string;ref:string})=>[n.label,n.ref]));
  }
  const twelve=map('murai-minorprophets-1-1');
  assert.equal(twelve.workIds.length,12);assert.equal(twelve.nodes.length,101);
  assert.equal(twelve.groups.filter(g=>g.nodeIds.length===2).length,50);
  assert.equal(twelve.nodes.find(n=>n.role==='center')?.sourceRef,'Mi7:14-20');
  assert.equal(twelve.readingAlignment,'partial');
});

test('source reference parsing retains compound ranges and repeated book prefixes',()=>{
  assert.deepEqual(sourceReferences('1S9:1-1S10:16_2S1:1-27').map(a=>a.workId),['1-samuel','2-samuel']);
  assert.equal(sourceReferences('Acts19:21-40 20:1-2').length,2);
  assert.throws(()=>sourceReferences('1S1:1-2S2:1'),/explicit split/);
  assert.throws(()=>sourceReferences('Unknown1:1-2'),/book not identified/);
  assert.ok(structureIndex.filter(m=>m.status==='mapped'&&m.workIds.length>1).length>40);
});
