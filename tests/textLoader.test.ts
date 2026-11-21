import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadBook } from '../src/lib/textLoader.ts';

const genesis = JSON.parse(fs.readFileSync(new URL('../public/texts/kjv/genesis.json', import.meta.url), 'utf8'));

test('chapter and excerpt requests share one validated book and cached request', async () => {
  const previous = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = async () => { requests++; return new Response(JSON.stringify(genesis)); };
  try {
    const chapter = loadBook('kjv', 'genesis', '/shared/');
    const excerpt = loadBook('kjv', 'genesis', '/shared/');
    assert.equal(chapter, excerpt);
    assert.equal(await chapter, await excerpt);
    assert.equal(await loadBook('kjv', 'genesis', '/shared/'), await chapter);
    assert.equal(requests, 1);
  } finally { globalThis.fetch = previous; }
});

test('wrong edition data is rejected and the next request can recover', async () => {
  const previous = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = async () => new Response(JSON.stringify(++requests === 1 ? {...genesis, editionId:'web'} : genesis));
  try {
    await assert.rejects(loadBook('kjv', 'genesis', '/identity/'), /does not match/);
    assert.equal((await loadBook('kjv', 'genesis', '/identity/')).editionId, 'kjv');
    assert.equal(requests, 2);
  } finally { globalThis.fetch = previous; }
});

test('a failed request is evicted rather than poisoning the shared cache', async () => {
  const previous = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = async () => ++requests === 1 ? new Response('', {status:503}) : new Response(JSON.stringify(genesis));
  try {
    await assert.rejects(loadBook('kjv', 'genesis', '/retry/'), /could not be loaded/);
    assert.equal((await loadBook('kjv', 'genesis', '/retry/')).workId, 'genesis');
    assert.equal(requests, 2);
  } finally { globalThis.fetch = previous; }
});
