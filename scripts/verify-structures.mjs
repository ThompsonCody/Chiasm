import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const root=new URL('../',import.meta.url);
const read=path=>fs.readFile(new URL(path,root));
const manifest=JSON.parse(await read('public/structures/manifest.json'));
const lock=JSON.parse(await read('scripts/structure-sources/source-lock.json'));
for(const input of lock.inputs)assert.equal(hash(await read('scripts/cache/structures/'+input.file)),input.sha256,input.file);
for(const input of manifest.sourceInputs)assert.ok(lock.inputs.some(p=>p.file===input.file&&p.sha256===input.sha256));
for(const collection of manifest.expandedCollections) {
  const bytes=await read('scripts/structure-sources/'+collection.file);
  assert.equal(hash(bytes),collection.sha256,collection.file);
  const raw=JSON.parse(bytes);const records=raw.records??raw.maps;
  assert.equal(records.length,collection.sourceOccurrences);
  for(const record of records) {
    const map=JSON.parse(await read('public/structures/maps/'+(record.duplicateOf??record.id)+'.json'));
    if(record.duplicateOf)continue;
    assert.deepEqual(map.nodes.map(n=>[n.label,n.sourceRef]),record.nodes.map(n=>[n.label,n.sourceRef??n.ref]));
  }
}
for(const file of manifest.mapFiles)assert.equal(hash(await read('public/structures/maps/'+file.id+'.json')),file.sha256,file.id);
console.log(`Verified ${lock.inputs.length} pinned raw sources, ${manifest.expandedCollections.length} complete normalized collections and ${manifest.mapFiles.length} opening map payloads.`);
