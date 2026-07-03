const assert = require('node:assert/strict');
const { mkdtempSync, mkdirSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');

(async () => {
  const { buildImport } = await import('../scripts/import-goodreads-literature-canon.mjs');
  const root = mkdtempSync(join(tmpdir(), 'goodreads-import-'));
  mkdirSync(join(root, 'data/people/litteratur/oslo'), { recursive: true });
  writeFileSync(join(root, 'data/people/litteratur/oslo/people_litteratur_oslo.json'), JSON.stringify([
    { id: 'person_dag_solstad', name: 'Dag Solstad' },
    { id: 'person_sigrid_undset', name: 'Sigrid Undset' }
  ]));

  const csv = [
    'Title,Author,My Rating,Exclusive Shelf,Bookshelves,Year Published,Original Publication Year,Publisher,Date Added,Date Read,Private Notes,My Review,Spoiler,Read Count,Owned Copies,ISBN,ISBN13',
    'Genanse og verdighet,Dag Solstad,5,read,adult,1994,1994,Oktober,secret,secret,note,review,no,1,1,123,456',
    'Roman 1987,Dag Solstad,4,read,adult,1987,1987,Oktober,,,,,,,,',
    'Low Rated,Sigrid Undset,3,read,adult,1920,1920,Publisher,,,,,,,,',
    'Unread High,Dag Solstad,5,to-read,adult,2000,2000,Publisher,,,,,,,,',
    'The Hobbit,J. R. R. Tolkien,5,read,middle-grade,1937,1937,Allen & Unwin,,,,,,,,',
    'Harry Potter and the Philosopher\'s Stone,J. K. Rowling,5,read,fantasy,1997,1997,Bloomsbury,,,,,,,,',
    'Kristin Lavransdatter,Sigrid Undset,4,read,adult,1920,1920,Aschehoug,,,,,,,,'
  ].join('\n');

  const { adult, children, summary } = buildImport(csv, { root });
  assert.equal(summary.totalRows, 7);
  assert.equal(summary.readRows, 6);
  assert.equal(summary.rating4PlusRows, 5);
  assert.equal(summary.importedAdultBooks, 3);
  assert.equal(summary.childrenOrYaRouted, 2);
  assert.equal(children.gameId, 'hgChildrenLiteratureGame');
  assert.equal(children.pendingChildrenLiteratureCandidates.length, 2);
  assert(children.pendingChildrenLiteratureCandidates.some((item) => item.title === 'The Hobbit' && item.confidence === 'high'));
  assert(children.pendingChildrenLiteratureCandidates.some((item) => item.title.startsWith('Harry Potter') && item.confidence === 'medium'));
  assert(!adult.personalGoodreadsCanon.some((author) => author.selectedBooks.some((title) => title.includes('Hobbit') || title.includes('Harry Potter'))));

  const dag = adult.personalGoodreadsCanon.find((author) => author.name === 'Dag Solstad');
  assert.deepEqual(dag.selectedBooks, ['Genanse og verdighet', 'Roman 1987']);
  assert.equal(dag.authorMatch.personId, 'person_dag_solstad');
  const undset = adult.personalGoodreadsCanon.find((author) => author.name === 'Sigrid Undset');
  assert.equal(undset.authorMatch.personId, 'person_sigrid_undset');

  const serialized = JSON.stringify(adult) + JSON.stringify(children);
  for (const forbidden of ['My Rating', 'Date Added', 'Date Read', 'Private Notes', 'My Review', 'Spoiler', 'Read Count', 'Owned Copies', 'ISBN', 'ISBN13', 'secret', '123', '456']) {
    assert(!serialized.includes(forbidden), `forbidden private field/value persisted: ${forbidden}`);
  }
  console.log('goodreads-literature-import ok');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
