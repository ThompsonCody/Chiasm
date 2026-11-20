import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {resolveBookEdition,parseReference} from '../src/lib/study.ts';

test('the two historical Sinodos editions have their full source section coverage',()=>{
  for(const [work,edition,count] of [['tizaz','horner-1904',73],['gitsew','schodde-1885',57]] as const){
    const resolved=resolveBookEdition(work,'kjv');
    assert.equal(resolved?.edition.id,edition);
    assert.equal(resolved?.book.unversified,true);
    const text=JSON.parse(fs.readFileSync(new URL(`../public/texts/${edition}/${work}.json`,import.meta.url),'utf8'));
    assert.deepEqual(text.chapters.map((c:{number:number})=>c.number),Array.from({length:count},(_,i)=>i+1));
    assert.ok(text.chapters.every((c:{verses:{text:string}[]})=>c.verses.length===1 && c.verses[0].text.length>20));
    assert.ok('reference' in parseReference(`${work} ${count}`,'kjv'));
    assert.ok('error' in parseReference(`${work} ${count+1}`,'kjv'));
    assert.ok('error' in parseReference(`${work} 1:1`,'kjv'));
  }
});

test('Horner duplicated statute40 retains both source sections and the final statute72',()=>{
  const text=JSON.parse(fs.readFileSync(new URL('../public/texts/horner-1904/tizaz.json',import.meta.url),'utf8'));
  assert.match(text.chapters[39].verses[0].text,/^Concerning the ordinance of the gift/);
  assert.match(text.chapters[40].verses[0].text,/^Concerning the fruit/);
  assert.match(text.chapters[72].verses[0].text,/^Concerning the Order of the Priesthood/);
  assert.ok('reference' in parseReference('Gessew 57'));
  assert.ok('reference' in parseReference('Teezaz 73'));
});
