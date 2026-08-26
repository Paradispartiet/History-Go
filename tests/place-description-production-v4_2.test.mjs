import test from 'node:test';
import assert from 'node:assert/strict';
import {
  containsStrongClaim,
  containsTemporalClaim,
  descriptionFieldsChanged,
  isGeneratedPlaceIndex,
  sha256Text,
  splitSentences,
  validatePacket,
  validateSimilarity
} from '../scripts/validate-place-description-production-v4_2.mjs';

function makeReadyFixture() {
  const descSentences = [
    'Bygningen ble reist i tegl i 1912 etter tegninger av arkitekt Anna Berg, og åpnet samme høst som kommunalt bibliotek for bydelen.',
    'Lesesalen fikk store vinduer mot torget, mens kjelleren rommet magasin, fyrrom og et lite bokbinderverksted for den daglige driften.'
  ];
  const popupSentences = Array.from({ length: 12 }, (_, index) => {
    const number = index + 1;
    return `Dokumentert tidslag ${number} beskriver en navngitt aktivitet i bygningen, med presist årstall, ansvarlig institusjon, fysisk rom, brukt materiale og et kontrollert resultat som kan etterprøves i kilden.`;
  });
  const popupDesc = [
    popupSentences.slice(0, 4).join(' '),
    popupSentences.slice(4, 8).join(' '),
    popupSentences.slice(8, 12).join(' ')
  ].join('\n\n');
  const desc = descSentences.join(' ');
  const allSentences = [...descSentences, ...popupSentences];
  const claims = allSentences.map((sentence, index) => ({
    id: `claim_${String(index + 1).padStart(2, '0')}`,
    claim: sentence,
    sourceUrl: `https://example.org/source-${index + 1}`,
    sourceLocation: `avsnitt ${index + 1}`,
    sourceType: index === 0 ? 'official' : 'scholarly',
    verifiedAt: '2026-07-27',
    status: 'verified',
    claimKind: index === 0 ? 'identity' : 'ordinary',
    evidenceMode: 'direct',
    temporalStatus: 'historical'
  }));
  const packet = {
    schemaVersion: '4.2',
    validatorVersion: '4.2.1',
    placeId: 'teststed',
    placeFile: 'data/places/by/test/teststed.json',
    status: 'ready_v4_2',
    identity: {
      status: 'resolved',
      represents: 'Den stående biblioteksbygningen som åpnet i 1912.',
      period: '1912–nåtid',
      excludes: ['bibliotekinstitusjonens tidligere lokaler']
    },
    metadataSnapshot: {
      name: 'Teststed',
      category: 'by',
      year: 1912,
      period: '1900-tallet'
    },
    textHashes: {
      algorithm: 'sha256',
      desc: sha256Text(desc),
      popupDesc: sha256Text(popupDesc)
    },
    claims,
    sentenceCoverage: {
      desc: descSentences.map((_, index) => ({ sentence: index + 1, claimIds: [`claim_${String(index + 1).padStart(2, '0')}`] })),
      popupDesc: popupSentences.map((_, index) => ({ sentence: index + 1, claimIds: [`claim_${String(index + 3).padStart(2, '0')}`] }))
    },
    reviews: {
      factual: { status: 'passed', reviewedAt: '2026-07-27', reviewer: 'test' },
      editorial: { status: 'passed', reviewedAt: '2026-07-27', reviewer: 'test', introducedNewFacts: false }
    },
    quizReadiness: {
      questions: [
        ['Hvem tegnet bygningen?', 'Anna Berg', 'hvem', true, 'claim_01'],
        ['Når åpnet bygningen?', '1912', 'når', true, 'claim_01'],
        ['Hva var hovedfunksjonen?', 'Kommunalt bibliotek', 'hva', true, 'claim_01'],
        ['Hvor vendte lesesalen?', 'Mot torget', 'hvor', true, 'claim_02'],
        ['Hva rommet kjelleren?', 'Magasin, fyrrom og bokbinderverksted', 'hva', true, 'claim_02'],
        ['Hva ble dokumentert i tidslag tre?', 'En navngitt aktivitet', 'hva_skjedde', false, 'claim_05'],
        ['Hvilket fysisk rom nevnes?', 'Et kontrollert rom', 'hvilket_verk_eller_objekt', false, 'claim_06'],
        ['Hva ble endret i tidslag seks?', 'Den dokumenterte bruken', 'hva_ble_bygget_produsert_eller_endret', false, 'claim_08']
      ].map(([question, answer, type, normalKnowledgeQuestion, claimId]) => ({ question, answer, type, normalKnowledgeQuestion, claimIds: [claimId] }))
    },
    completion: {
      completedUnder: '4.2',
      currentStatus: 'current',
      sourceVerifiedAt: '2026-07-27',
      claimsVerified: { verified: claims.length, total: claims.length },
      factualReview: 'passed',
      editorialReview: 'passed',
      validatorVersion: '4.2.1'
    }
  };
  const place = {
    id: 'teststed',
    name: 'Teststed',
    category: 'by',
    year: 1912,
    period: '1900-tallet',
    desc,
    popupDesc
  };
  return { packet, place };
}

test('sentence splitter preserves sentence order across paragraphs', () => {
  const sentences = splitSentences('En setning. En annen!\n\nEt spørsmål?');
  assert.deepEqual(sentences, ['En setning.', 'En annen!', 'Et spørsmål?']);
});

test('strong and temporal gates detect governed wording', () => {
  assert.equal(containsStrongClaim('Dette var den eldste bygningen i området.'), true);
  assert.equal(containsStrongClaim('Bygningen ble reist i 1912.'), false);
  assert.equal(containsTemporalClaim('Museet drives av kommunen i dag.'), true);
  assert.equal(containsTemporalClaim('Museet stengte i 1984.'), false);
});

test('generated place indexes are build output, not canonical description files', () => {
  assert.equal(isGeneratedPlaceIndex('data/places/places_index.json'), true);
  assert.equal(isGeneratedPlaceIndex('data/places/politikk/oslo/places_politikk/tinghuset.json'), false);
});

test('nested object descriptions do not count as place description changes', () => {
  const before = {
    id: 'teststed',
    desc: 'Uendret stedsbeskrivelse.',
    popupDesc: 'Uendret popupbeskrivelse.',
    objects: []
  };
  const after = {
    ...before,
    objects: [{ id: 'objekt_1', desc: 'Ny beskrivelse av et fysisk objekt.' }]
  };
  assert.equal(descriptionFieldsChanged(before, after), false);
  assert.equal(descriptionFieldsChanged(before, { ...after, desc: 'Endret stedsbeskrivelse.' }), true);
  assert.equal(descriptionFieldsChanged(before, { ...after, popupDesc: 'Endret popupbeskrivelse.' }), true);
});

test('a complete ready_v4_2 packet passes packet validation', () => {
  const fixture = makeReadyFixture();
  const result = validatePacket({ ...fixture, now: new Date('2026-07-27T12:00:00Z') });
  assert.deepEqual(result.issues, []);
});

test('timelineYear is an explicit historical anchor present in the claim', () => {
  const fixture = makeReadyFixture();
  fixture.packet.claims[0].timelineYear = 1912;
  assert.deepEqual(validatePacket({ ...fixture, now: new Date('2026-07-27T12:00:00Z') }).issues, []);

  fixture.packet.claims[0].timelineYear = 1942;
  let codes = new Set(validatePacket({ ...fixture, now: new Date('2026-07-27T12:00:00Z') }).issues.map((issue) => issue.code));
  assert.equal(codes.has('timeline_year_missing_from_claim'), true);

  fixture.packet.claims[0].timelineYear = 1912;
  fixture.packet.claims[0].temporalStatus = 'current';
  codes = new Set(validatePacket({ ...fixture, now: new Date('2026-07-27T12:00:00Z') }).issues.map((issue) => issue.code));
  assert.equal(codes.has('timeline_year_requires_historical_status'), true);
});

test('stale text and missing sentence claims are blocking errors', () => {
  const fixture = makeReadyFixture();
  fixture.place.desc = `${fixture.place.desc} Ny udokumentert setning.`;
  const result = validatePacket({ ...fixture, now: new Date('2026-07-27T12:00:00Z') });
  const codes = new Set(result.issues.map((issue) => issue.code));
  assert.equal(codes.has('stale_desc_hash'), true);
  assert.equal(codes.has('sentence_without_claim'), true);
});

test('similarity gate rejects repeated long sentences', () => {
  const sentence = 'Denne lange dokumenterte setningen inneholder flere enn åtte ord og skal derfor ikke kunne gjenbrukes mellom stedene.';
  const issues = validateSimilarity([
    { placeId: 'a', popupDesc: `${sentence} En unik avslutning for sted A.`, packet: {} },
    { placeId: 'b', popupDesc: `${sentence} En unik avslutning for sted B.`, packet: {} }
  ]);
  assert.equal(issues.some((issue) => issue.code === 'repeated_sentence'), true);
});
