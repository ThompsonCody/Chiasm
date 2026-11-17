// Download only the reviewed public source files; never weaken TLS validation.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const lock=JSON.parse(await fs.readFile(path.join(root,'scripts/structure-sources/source-lock.json'),'utf8'));
const cache=path.join(root,'scripts/cache/structures');
await fs.mkdir(cache,{recursive:true});
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
for(const input of lock.inputs) {
  if(path.basename(input.file)!==input.file) throw Error('Invalid locked filename');
  const target=path.join(cache,input.file);
  let existing;
  try { existing=await fs.readFile(target); } catch(error) { if(error.code!=='ENOENT')throw error; }
  if(existing) {
    if(hash(existing)!==input.sha256)throw Error('Cached source changed: '+input.file+'. Review it before updating the lock.');
    console.log('Verified cache: '+input.file);
    continue;
  }
  const response=await fetch(input.url);
  if(!response.ok)throw Error('Source download failed: '+input.file+' ('+response.status+')');
  const bytes=Buffer.from(await response.arrayBuffer());
  if(hash(bytes)!==input.sha256)throw Error('Upstream source changed: '+input.file+'. Nothing saved; review a new snapshot deliberately.');
  await fs.writeFile(target,bytes);
  console.log('Downloaded and verified: '+input.file);
}
