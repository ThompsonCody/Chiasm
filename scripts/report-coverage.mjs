import fs from 'node:fs/promises';
import { works } from '../src/data/catalog.ts';

const manifest = JSON.parse(await fs.readFile(new URL('../public/texts/manifest.json', import.meta.url), 'utf8'));
const complete = works.filter(work => manifest.books.some(book => book.workId === work.id));
const missing = works.filter(work => !manifest.books.some(book => book.workId === work.id));
const rows = complete.map(work => {
  const coverage = manifest.books.filter(book => book.workId === work.id).map(book => `${manifest.editions.find(edition => edition.id === book.editionId).shortName}: ${book.chapterCount} source chapters`).join('; ');
  return `| ${work.title} | ${coverage} |`;
});
const report = [
  '# Imported coverage and remaining gaps', '',
  'Generated with `npm run report:coverage`. Completeness is measured against the particular electronic source edition, not an inferred canon or another translation’s numbering. See SOURCES.md, COLLECTIONS.md and the pinned import manifest for provenance.', '',
  `**${complete.length} complete works; ${manifest.books.length} edition-books; ${missing.length} unavailable catalog identities.**`, '',
  '## Complete imported works', '', '| Work | Verified edition coverage |', '| --- | --- |', ...rows, '',
  '## Text not yet available', '', ...missing.map(work => `- **${work.title}** — ${work.description}`), '',
].join('\n');
await fs.writeFile(new URL('../COVERAGE.md', import.meta.url), report);
console.log(`Reported ${complete.length} complete works and ${missing.length} gaps.`);
