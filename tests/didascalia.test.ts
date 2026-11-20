import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseReference, resolveBookEdition } from '../src/lib/study.ts';

test('Harden Didascalia has all43 source chapters, retained as unversified prose',()=>{
  const book=resolveBookEdition('didascalia-ethiopic','kjv');
  assert.equal(book?.edition.id,'harden-1920');
  assert.equal(book?.book.unversified,true);
  assert.equal(book?.book.chapterCount,43);
  const text=JSON.parse(fs.readFileSync(new URL('../public/texts/harden-1920/didascalia-ethiopic.json',import.meta.url),'utf8'));
  assert.deepEqual(text.chapters.map((c:{number:number})=>c.number),Array.from({length:43},(_,i)=>i+1));
  assert.ok(text.chapters.every((c:{verses:{text:string}[]})=>c.verses.length===1 && c.verses[0].text.length>100));
  assert.ok('reference' in parseReference('Didascalia 43','kjv'));
  assert.ok('error' in parseReference('Didascalia 44','kjv'));
  assert.ok('error' in parseReference('Didascalia 1:1','kjv'));
});
