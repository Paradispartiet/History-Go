#!/usr/bin/env node
// Civication — private fase-mailer skal projiseres fra History Go-profilen.
//
// Arbeidslivsmail kommer fra aktiv jobb/arbeidsdag (dekket av
// civication-private-phase-mailers.test.js). Private fase-mailer kommer fra
// CivicationProfileSignalBridge: hvem spilleren er UTENFOR jobben — steder
// samlet, badges, quiz-styrker, kapital, identitet, psyke og folk møtt.
//
// Dekker kravene:
//   - Bridgen normaliserer identity/capital/psyche/History Go-samlingen til
//     { identity, capital, psyche, historyGoCollection, profileTags,
//       privatePhaseWeights } uten å kaste når kilder mangler.
//   - To spillere med samme jobb, men ulik History Go-profil, får ulike
//     private fase-mailer.
//   - Samme History Go-profil med ulik jobb får de samme private fase-mailene.
//   - Kulturell profil gir kultur-/sted-/læringsmail i evening.
//   - Sport-profil gir trening/bane/aktivitet i afternoon/evening.
//   - Natur-profil gir gåtur/ro i lunch/evening.
//   - Politisk profil gir lokalmøte/sak i evening.
//   - Lav psyke gir hvile/søvn/ro, ikke mer press.
//   - Private fase-mailer har 0 role_scope/career_id/role_id/employer_id og
//     bærer profile_signal_source, og inneholder ingen arbeidslivsord.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');

function makeStorage() {
  const store = new Map();
  return {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(String(key), String(value)); },
    removeItem(key) { store.delete(key); },
    clear() { store.clear(); }
  };
}

function makeFetch(rootDir) {
  return async function fetchMock(url) {
    const clean = String(url || '').split('?')[0].replace(/^\/+/, '');
    const fullPath = path.resolve(rootDir, clean);
    if (!fullPath.startsWith(rootDir)) return { ok: false, status: 400, async json() { return null; } };
    try {
      const body = await fs.promises.readFile(fullPath, 'utf8');
      return { ok: true, status: 200, async json() { return JSON.parse(body); } };
    } catch {
      return { ok: false, status: 404, async json() { return null; } };
    }
  };
}

function loadScript(relPath) {
  vm.runInThisContext(fs.readFileSync(path.join(repoRoot, relPath), 'utf8'), { filename: relPath });
}

const PRIVATE_PHASES = ['morning', 'lunch', 'afternoon', 'dinner', 'evening', 'day_end'];
const FORBIDDEN_TERMS = [
  'lillebekk', 'plankart', 'plansjef', 'utbygger', 'varelevering',
  'rolleprogresjon', 'arbeidsleveranse', 'arbeidsgiveroppgave', 'arealplanlegger'
];

const DATE = '2026-07-06';

const JOB_A = { career_id: 'by', title: 'Arealplanlegger', role_id: 'by_radgiver_plan', role_key: 'by_radgiver_plan', brand_id: 'plan_og_bygningsetaten' };
const JOB_B = { career_id: 'naeringsliv', title: 'Ekspeditør', role_id: 'ekspeditor', role_key: 'ekspeditor', brand_id: 'norli' };

// Profiler bygget av ekte History Go-nøkler (delt localStorage).
const PROFILES = {
  culture: {
    hg_identity_v1: { focus: { economic: 0.22, cultural: 0.72, social: 0.51, symbolic: 0.3, subculture: 0.2, political: 0.2 }, volatility: 0.2 },
    hg_capital_v1: { economic: 22, cultural: 64, social: 41, symbolic: 55, political: 18, institutional: 5, subculture: 10 },
    visited_places: { nasjonalmuseet: true, munch_museet: true, astrup_fearnley: true, nasjonalbiblioteket: true },
    merits_by_category: { kunst: { points: 24 }, litteratur: { points: 12 } },
    hg_learning_log_v1: [
      { schema: 1, type: 'quiz_perfect', targetId: 'nasjonalmuseet', categoryId: 'kunst', date: '2026-07-01T18:00:00Z', correctCount: 3, total: 3 },
      { schema: 1, type: 'quiz_perfect', targetId: 'nasjonalbiblioteket', categoryId: 'litteratur', date: '2026-07-03T18:00:00Z', correctCount: 3, total: 3 }
    ],
    people_collected: { edvard_munch: true }
  },
  sport: {
    visited_places: { bislett_stadion: true, ullevaal_stadion: true, intility_arena: true },
    merits_by_category: { sport: { points: 20 } },
    hg_learning_log_v1: [
      { schema: 1, type: 'quiz_perfect', targetId: 'bislett_stadion', categoryId: 'sport', date: '2026-07-02T18:00:00Z', correctCount: 3, total: 3 }
    ]
  },
  nature: {
    visited_places: { alnaelva: true, alnaelvstien: true, loelva_historisk: true },
    merits_by_category: { natur: { points: 16 } }
  },
  politics: {
    hg_identity_v1: { focus: { economic: 0.2, cultural: 0.2, social: 0.3, symbolic: 0.2, subculture: 0.1, political: 0.7 }, volatility: 0.2 },
    hg_capital_v1: { economic: 15, cultural: 10, social: 30, symbolic: 20, political: 60, institutional: 25, subculture: 5 },
    visited_places: { stortinget: true, youngstorget: true, oslo_radhus: true },
    merits_by_category: { politikk: { points: 20 } }
  }
};

const LOW_PSYCHE = { integrity: 15, visibility: 70, economicRoom: 10 };

function setProfile(profile, extra = {}) {
  global.localStorage.clear();
  const data = { ...profile, ...extra };
  for (const [key, value] of Object.entries(data)) {
    global.localStorage.setItem(key, JSON.stringify(value));
  }
}

async function buildItems(active) {
  const items = await global.CivicationPrivatePhaseMailBuilder.buildPrivatePhaseItems(active, { date: DATE });
  const byPhase = {};
  for (const row of items) byPhase[row.phase] = row.event;
  return byPhase;
}

async function run() {
  global.window = global;
  global.localStorage = makeStorage();
  global.location = { href: 'http://localhost/Civication.html' };
  global.Event = class Event { constructor(type) { this.type = type; } };
  global.document = { readyState: 'complete', addEventListener() {} };
  global.addEventListener = () => {};
  global.dispatchEvent = () => {};
  global.fetch = makeFetch(repoRoot);

  loadScript('js/Civication/identityCore.js');
  loadScript('js/Civication/systems/civicationProfileSignalBridge.js');
  loadScript('js/Civication/systems/civicationPrivatePhaseMailBuilder.js');

  const bridge = global.CivicationProfileSignalBridge;
  const builder = global.CivicationPrivatePhaseMailBuilder;
  assert(bridge, 'CivicationProfileSignalBridge skal finnes');
  assert(builder, 'CivicationPrivatePhaseMailBuilder skal finnes');

  // ============================================================
  // A) Bridgen: rent signalobjekt, trygg ved tomme kilder
  // ============================================================
  global.localStorage.clear();
  const emptySignals = await bridge.getSignals();
  assert(emptySignals.identity && typeof emptySignals.identity.focus === 'object', 'identity.focus skal alltid finnes');
  assert.deepStrictEqual(emptySignals.historyGoCollection.placesVisited, [], 'tom profil skal gi tom placesVisited');
  assert.deepStrictEqual(emptySignals.historyGoCollection.peopleMet, [], 'tom profil skal gi tom peopleMet');
  assert(Array.isArray(emptySignals.profileTags), 'profileTags skal være array');
  for (const key of ['culture', 'sport', 'nature', 'politics', 'social', 'learning', 'economy', 'rest', 'family', 'subculture']) {
    assert(Number.isFinite(emptySignals.privatePhaseWeights[key]), `privatePhaseWeights.${key} skal være tall`);
  }

  setProfile(PROFILES.culture);
  const cultureSignals = await bridge.getSignals();
  assert.strictEqual(cultureSignals.identity.dominant, 'cultural', 'kulturprofilen skal ha dominant=cultural');
  assert.strictEqual(cultureSignals.capital.cultural, 64, 'capital.cultural skal leses fra hg_capital_v1');
  assert(cultureSignals.historyGoCollection.placesVisited.includes('nasjonalmuseet'), 'placesVisited skal inneholde besøkte steder');
  assert(cultureSignals.historyGoCollection.placeCategories.includes('kunst'), 'placeCategories skal utledes fra places-indeksen');
  assert(cultureSignals.historyGoCollection.quizStrengths.includes('kunst'), 'quizStrengths skal reflektere merits + læringslogg');
  assert(cultureSignals.historyGoCollection.recentPlaces.includes('nasjonalbiblioteket'), 'recentPlaces skal utledes fra læringsloggen');
  assert(cultureSignals.profileTags.includes('culture'), 'kulturprofilen skal ha profile-tag culture');
  assert(cultureSignals.privatePhaseWeights.culture > 0.6, 'kulturprofilen skal ha høy kulturvekt');
  assert(cultureSignals.privatePhaseWeights.sport < 0.45, 'kulturprofilen skal ha lav sportsvekt');

  // ============================================================
  // B) Profil → fase-mail: kultur, sport, natur, politikk
  // ============================================================
  setProfile(PROFILES.culture);
  const cultureMails = await buildItems(JOB_A);
  assert.strictEqual(cultureMails.evening.source_mail_id, 'evening_culture_place_return_001',
    `kulturprofil skal få kultur-/sted-mail i evening (fikk «${cultureMails.evening.source_mail_id}»)`);
  assert.strictEqual(cultureMails.afternoon.source_mail_id, 'private_afternoon_kultur_profile_002',
    'kulturprofil skal få kulturell omvei i afternoon');

  setProfile(PROFILES.sport);
  const sportMails = await buildItems(JOB_A);
  assert.strictEqual(sportMails.afternoon.source_mail_id, 'private_afternoon_sport_profile_001',
    `sportsprofil skal få bane/trening i afternoon (fikk «${sportMails.afternoon.source_mail_id}»)`);
  assert.strictEqual(sportMails.evening.source_mail_id, 'private_evening_sport_profile_003',
    'sportsprofil skal få trening/aktivitet i evening');

  setProfile(PROFILES.nature);
  const natureMails = await buildItems(JOB_A);
  assert.strictEqual(natureMails.lunch.source_mail_id, 'private_lunch_natur_profile_001',
    `naturprofil skal få grønn pause i lunch (fikk «${natureMails.lunch.source_mail_id}»)`);
  assert.strictEqual(natureMails.evening.source_mail_id, 'private_evening_natur_profile_004',
    'naturprofil skal få gåtur/ro i evening');

  setProfile(PROFILES.politics);
  const politicsMails = await buildItems(JOB_A);
  assert.strictEqual(politicsMails.evening.source_mail_id, 'private_evening_politikk_profile_002',
    `politisk profil skal få lokalmøte/sak i evening (fikk «${politicsMails.evening.source_mail_id}»)`);

  // ============================================================
  // C) Samme jobb, ulik profil → ulike private fase-mailer
  // ============================================================
  assert.notStrictEqual(cultureMails.evening.source_mail_id, sportMails.evening.source_mail_id,
    'to spillere med samme jobb men ulik profil skal få ulik evening-mail');
  assert.notStrictEqual(cultureMails.afternoon.source_mail_id, sportMails.afternoon.source_mail_id,
    'to spillere med samme jobb men ulik profil skal få ulik afternoon-mail');

  // ============================================================
  // D) Samme profil, ulik jobb → samme private fase-mailer
  // ============================================================
  setProfile(PROFILES.culture);
  const cultureJobA = await buildItems(JOB_A);
  setProfile(PROFILES.culture);
  const cultureJobB = await buildItems(JOB_B);
  for (const phase of PRIVATE_PHASES) {
    assert.strictEqual(cultureJobA[phase]?.source_mail_id, cultureJobB[phase]?.source_mail_id,
      `samme History Go-profil skal gi samme private «${phase}»-mail uansett jobb`);
  }

  // ============================================================
  // E) Lav psyke → hvile/søvn/ro, ikke mer press
  // ============================================================
  setProfile(PROFILES.culture, { hg_psyche_v1: LOW_PSYCHE });
  const lowSignals = await bridge.getSignals();
  assert(lowSignals.profileTags.includes('low_energy'), 'lav psyke skal gi profile-tag low_energy');
  assert(lowSignals.privatePhaseWeights.rest >= 0.6, 'lav psyke skal gi høy hvilevekt');

  const lowMails = await buildItems(JOB_A);
  assert.strictEqual(lowMails.evening.source_mail_id, 'private_evening_lavenergi_profile_007',
    `lav psyke skal gi hvile i evening, ikke mer press (fikk «${lowMails.evening.source_mail_id}»)`);
  assert.strictEqual(lowMails.day_end.source_mail_id, 'private_day_end_lavenergi_profile_001',
    'lav psyke skal gi søvn/ro i day_end');
  assert.strictEqual(lowMails.evening.topic, 'hvile', 'lavenergi-mailen skal handle om hvile');

  // ============================================================
  // F) Kontrakt: felter og forbudte arbeidslivsord
  // ============================================================
  const allEvents = [cultureMails, sportMails, natureMails, politicsMails, lowMails]
    .flatMap((byPhase) => Object.values(byPhase));
  assert(allEvents.length >= 25, 'alle profiler skal få mail i alle private faser');

  for (const ev of allEvents) {
    assert.strictEqual(ev.source_type, 'daily_private_phase', `${ev.id} skal ha source_type daily_private_phase`);
    assert.strictEqual(ev.channel, 'private', `${ev.id} skal ha channel private`);
    assert.strictEqual(ev.messageChannel, 'private', `${ev.id} skal ha messageChannel private`);
    assert.strictEqual(ev.mail_class, 'daily_private', `${ev.id} skal ha mail_class daily_private`);
    assert.strictEqual(ev.role_scope, '', `${ev.id} skal ha tom role_scope`);
    assert.strictEqual(ev.career_id, '', `${ev.id} skal ha tom career_id`);
    assert.strictEqual(ev.role_id, '', `${ev.id} skal ha tom role_id`);
    assert.strictEqual(ev.employer_id, '', `${ev.id} skal ha tom employer_id`);
    assert.strictEqual(ev.workday_related, false, `${ev.id} skal ha workday_related=false`);
    assert.strictEqual(ev.profile_signal_source, true, `${ev.id} skal ha profile_signal_source=true`);

    const text = JSON.stringify(ev).toLowerCase();
    for (const term of FORBIDDEN_TERMS) {
      assert(!text.includes(term), `privat mail ${ev.id} må ikke inneholde jobbordet «${term}»`);
    }
    assert(!text.includes('arbeidsdagen'), `privat mail ${ev.id} må ikke referere til «arbeidsdagen»`);
    assert(!text.includes('som {rolle}'), `privat mail ${ev.id} må ikke si «som {rolle}»`);
  }

  // Profil-metadata følger med valgt mail.
  assert.strictEqual(cultureMails.evening.daily_mail_meta.profile_matched, true, 'profilvalgt mail skal merkes profile_matched');
  assert(cultureMails.evening.daily_mail_meta.profile_tags_matched.includes('culture'), 'matchede tags skal ligge i daily_mail_meta');

  // Generisk fallback uten profil: fortsatt privat og trygg.
  global.localStorage.clear();
  const fallbackMails = await buildItems(JOB_A);
  for (const phase of PRIVATE_PHASES) {
    const ev = fallbackMails[phase];
    assert(ev, `fallback skal fortsatt gi privat mail i «${phase}»`);
    assert.strictEqual(ev.daily_mail_meta.profile_matched, false, `fallback i «${phase}» skal ikke merkes profile_matched`);
    const text = JSON.stringify(ev).toLowerCase();
    assert(!text.includes('arbeidsdagen'), `fallback i «${phase}» må ikke referere til «arbeidsdagen»`);
    for (const term of FORBIDDEN_TERMS) {
      assert(!text.includes(term), `fallback i «${phase}» må ikke inneholde jobbordet «${term}»`);
    }
  }

  console.log('civication-private-phase-profile-bridge.test.js passed');
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
