import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import crypto from "node:crypto";
import { structureIndex } from "../src/data/structureIndex.ts";
import { corpusBooks } from "../src/data/corpus.ts";
import { works } from "../src/data/catalog.ts";
import { structureSources } from "../src/data/structureSources.ts";
import { getMapSelection, getStructureSummary, structureSelectionForReference, structuresForReference } from "../src/lib/structures.ts";
import { routeForState, stateFromParams } from "../src/lib/routes.ts";
import { initialReaderState, readerReducer } from "../src/lib/reader.ts";
import { floodTrace } from "../src/data/crossReferences.ts";
import type { StructureMap } from "../src/data/structureTypes.ts";

const readMap = (id:string):StructureMap => JSON.parse(fs.readFileSync(new URL(`../public/structures/maps/${id}.json`,import.meta.url),'utf8'));
test("the sourced Torah fold spans five works and is discoverable from each",()=>{
  const map=readMap('sacks-torah');
  assert.deepEqual(map.workIds,['genesis','exodus','leviticus','numbers','deuteronomy']);
  assert.deepEqual(map.nodes.map(node=>node.label),['A','B','C','B′','A′']);
  assert.equal(map.nodes.find(node=>node.role==='center')?.anchors[0].workId,'leviticus');
  assert.deepEqual(getMapSelection(map,'sacks-torah-g-B').nodes.map(node=>node.anchors[0].workId),['exodus','numbers']);
  for(const workId of map.workIds) assert.ok(structuresForReference({workId,chapter:1,verseStart:1},'kjv').some(item=>item.id===map.id));
  const state=readerReducer(initialReaderState,{type:'map',structureId:map.id,pairId:'sacks-torah-g-B'});
  const restored=stateFromParams(new URLSearchParams(routeForState(state)));
  assert.equal(restored.structureId,map.id);
  assert.equal(restored.selectionId,'sacks-torah-g-B');
});
test("every imported source entry is accounted for and only validated maps have files",()=>{
  const input=JSON.parse(fs.readFileSync(new URL('../scripts/structure-sources/murai.json',import.meta.url),'utf8'));
  const manifest=JSON.parse(fs.readFileSync(new URL('../public/structures/manifest.json',import.meta.url),'utf8'));
  const lock=JSON.parse(fs.readFileSync(new URL('../scripts/structure-sources/source-lock.json',import.meta.url),'utf8'));
  const normalized=fs.readFileSync(new URL('../scripts/structure-sources/murai.json',import.meta.url));
  assert.equal(crypto.createHash('sha256').update(normalized).digest('hex'),manifest.normalizedInputSha256);
  for(const source of manifest.sourceInputs) assert.ok(lock.inputs.some((locked:{file:string;sha256:string})=>locked.file===source.file&&locked.sha256===source.sha256));
  assert.equal(structureIndex.filter(map=>map.id.startsWith('murai-ot-')||map.id.startsWith('murai-nt-')).length,input.records.length);
  assert.equal(manifest.workingMaps,structureIndex.filter(map=>map.status==='mapped').length);
  assert.equal(manifest.citationOnly,structureIndex.filter(map=>map.status==='citation-only').length);
  assert.equal(new Set(structureIndex.map(map=>map.id)).size,structureIndex.length);
  const files=fs.readdirSync(new URL('../public/structures/maps/',import.meta.url)).sort();
  assert.deepEqual(files,manifest.mapFiles.map((item:{id:string})=>item.id+'.json').sort());
  for(const file of manifest.mapFiles) {
    const bytes=fs.readFileSync(new URL(`../public/structures/maps/${file.id}.json`,import.meta.url));
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),file.sha256,file.id);
  }
});

test("all opening maps have sources, selectable real elements and complete edition bounds",()=>{
  for(const summary of structureIndex.filter(map=>map.status==='mapped')) {
    const map=readMap(summary.id);
    assert.deepEqual(summary.selectionIds,map.selectionIds,map.id);
    assert.deepEqual(summary.coverage,map.coverage,map.id);
    assert.equal(summary.author,map.author,map.id);
    assert.equal(summary.sourceUrl,map.sourceUrl,map.id);
    assert.ok(structureSources.some(source=>source.id===map.sourceId),map.id);
    assert.ok(map.sourceLocator&&map.sourceUrl&&map.nodes.length&&map.groups.length,map.id);
    assert.ok(map.workIds.every(id=>works.some(work=>work.id===id)),map.id);
    assert.ok(map.selectionIds.includes(map.defaultSelectionId),map.id);
    assert.equal(new Set(map.nodes.map(node=>node.id)).size,map.nodes.length,map.id);
    assert.deepEqual(map.groups.flatMap(group=>group.nodeIds).sort(),map.nodes.map(node=>node.id).sort(),map.id);
    for(const group of map.groups) {
      assert.ok(group.sourceClaim&&group.editorialExplanation,map.id);
      assert.deepEqual(getMapSelection(map,group.id).nodeIds,group.nodeIds,map.id);
    }
    for(const node of map.nodes) for(const anchor of node.anchors) {
      assert.ok(anchor.editionIds.length,map.id);
      for(const editionId of anchor.editionIds) {
        const book=corpusBooks.find(book=>book.editionId===editionId&&book.workId===anchor.workId)!;
        assert.ok(book,map.id);
        for(let chapter=anchor.start[0];chapter<=anchor.end[0];chapter++) {
          const numbers=book.verseNumbers[book.chapterNumbers.indexOf(chapter)];
          assert.ok(numbers,map.id);
          const first=chapter===anchor.start[0]?anchor.start[1]:numbers[0];
          const last=chapter===anchor.end[0]?anchor.end[1]:numbers.at(-1)!;
          for(let verse=first;verse<=last;verse++) assert.ok(numbers.includes(verse),`${map.id}: ${chapter}:${verse}`);
        }
      }
    }
  }
});

test("Wenham's complete published outline and Domka's independent outlines stay distinct",()=>{
  const flood=readMap('wenham-flood');
  assert.equal(flood.nodes.length,31);
  assert.equal(flood.groups.filter(group=>group.nodeIds.length===2).length,15);
  assert.equal(flood.defaultSelectionId,'150-days');
  assert.equal(flood.center,'8:1');
  const watchers=readMap('domka-watchers');
  assert.equal(watchers.center,'9:1–3');
  assert.equal(watchers.kind,'Narrative symmetry');
  assert.ok(watchers.compatiblePairs);
  assert.equal(watchers.subdivisions?.length,15);
  const small=readMap('domka-enoch-9');
  assert.equal(small.kind,'Narrative outline');
  assert.equal(small.center,undefined);
  assert.equal(small.compatiblePairs,false);
  assert.equal(small.nodes.length,3);
  assert.ok(small.nodes[0].anchors[0].note?.includes('context'));
});

test("new structure URLs and passage returns preserve proposal as well as pair and edition",()=>{
  const map=structureIndex.find(map=>map.status==='mapped'&&map.sourceId==='murai-2022'&&map.workIds.includes('genesis'))!;
  let state=readerReducer(initialReaderState,{type:'map',structureId:map.id});
  state=readerReducer(state,{type:'pair',value:map.selectionIds.at(-1)!});
  const reloaded=stateFromParams(new URLSearchParams(routeForState(state)));
  assert.equal(reloaded.structureId,map.id);
  assert.equal(reloaded.selectionId,state.selectionId);
  state={...state,scrollY:732,preferredEditionId:'web'};
  const original=state;
  state=readerReducer(state,{type:'open',reference:{workId:'genesis',chapter:3,verseStart:1}});
  state=readerReducer(state,{type:'map',structureId:'domka-watchers'});
  state=readerReducer(state,{type:'back'});
  state=readerReducer(state,{type:'back'});
  assert.equal(state.structureId,original.structureId);
  assert.equal(state.selectionId,original.selectionId);
  assert.equal(state.preferredEditionId,'web');
  assert.equal(state.restoreScroll,732);
});

test("reader discovery separates competing maps, narrative connections and honest gaps",()=>{
  const genesis=structuresForReference({workId:'genesis',chapter:7,verseStart:24},'kjv');
  assert.ok(genesis.some(map=>map.id==='wenham-flood'));
  assert.ok(genesis.some(map=>map.sourceId==='murai-2022'));
  const enoch=structuresForReference({workId:'1-enoch',chapter:9,verseStart:1},'charles-1917');
  assert.deepEqual(new Set(enoch.map(map=>map.id)),new Set(['domka-watchers','domka-enoch-9']));
  assert.equal(floodTrace.kind,'Narrative parallel');
  assert.equal(floodTrace.claimOrigin,'editorial');
  assert.ok(floodTrace.basis.includes('without asserting quotation'));
  assert.equal(getStructureSummary('lead-nickelsburg'),undefined);
  assert.deepEqual(structuresForReference({workId:'jubilees',chapter:1}),[]);
  assert.deepEqual(structuresForReference({workId:'genesis',chapter:7},'unmapped-edition'),[]);
  assert.ok(genesis.every(map=>structureSelectionForReference(map,{workId:'genesis',chapter:7,verseStart:24},'kjv')));
});
