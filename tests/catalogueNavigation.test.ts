import test from 'node:test';
import assert from 'node:assert/strict';
import { initialReaderState, readerReducer } from '../src/lib/reader.ts';
import { routeForState, stateFromParams } from '../src/lib/routes.ts';
import { defaultCatalogue, catalogueFromParams } from '../src/lib/structureCatalogue.ts';

test('filtered catalogue survives a study detour, return and URL reload', () => {
  const filters = {...defaultCatalogue, search:'Chronicles', work:'1-chronicles',
    source:'murai-web-2026', scope:'multiple', pattern:'chiastic', page:1};
  const catalogue = readerReducer({...initialReaderState, view:'structures', scrollY:1240},
    {type:'catalogue', value:filters});
  const study = readerReducer(catalogue, {type:'map', structureId:'wenham-flood'});
  const returned = readerReducer(study, {type:'back'});
  assert.equal(returned.view,'structures');
  assert.deepEqual(returned.catalogue,filters);
  assert.equal(returned.restoreScroll,1240);
  assert.deepEqual(stateFromParams(new URLSearchParams(routeForState(returned))).catalogue,filters);
  assert.deepEqual(catalogue.catalogue,filters); // Browser history keeps its own entry.
});

test('catalogue URLs preserve citation-only browsing and reject invalid pages', () => {
  const state = {...initialReaderState,view:'structures' as const,
    catalogue:{...defaultCatalogue,status:'citation-only' as const,search:'Enoch',page:2}};
  assert.deepEqual(stateFromParams(new URLSearchParams(routeForState(state))).catalogue,state.catalogue);
  for (const value of ['-1','NaN','1.5','Infinity'])
    assert.equal(catalogueFromParams(new URLSearchParams(`results-page=${value}`)).page,0);
});
