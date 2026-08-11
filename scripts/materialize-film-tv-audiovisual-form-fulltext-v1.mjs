#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'audiovisuell-form-og-sansing';
const CHAPTER_DIR = `data/fagverk/film_tv/${CHAPTER_ID}`;
const P = Object.freeze({
  sourceBrief: 'data/fag/TV_og_Film/film_tv_audiovisual_form_source_claim_brief_v1.json',
  learningPlan: 'data/fag/TV_og_Film/film_tv_learning_order_plan_v1.json',
  chapter: `${CHAPTER_DIR}.json`,
  brief: `${CHAPTER_DIR}/brief.json`,
  claims: `${CHAPTER_DIR}/claims.json`,
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  sourceBriefReport: 'reports/fagverk/film-tv-audiovisual-form-source-brief-v1-audit.json'
});
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};
const assert = (ok, message) => { if (!ok) throw new Error(message); };

const section = (id, title, emneId, paragraphs, claimIds, keyPoints) => ({
  id, title, emne_ids: [emneId], paragraphs,
  paragraphClaimIds: claimIds.map((id) => [id]),
  keyPoints,
  keyPointClaimIds: keyPoints.map((_, index) => [claimIds[index % claimIds.length]])
});
const claim = (id, text, sourceIds, sectionId, resolution = 'verified_as_planned') => ({
  id, claim_plan_id: id, claim: text, source_ids: sourceIds, status: 'verified',
  plan_resolution: resolution, evidence_mode: 'source_fact_plus_bounded_form_analysis', used_in: [sectionId]
});

export function buildFilmTvAudiovisualFormFulltextV1() {
  const sourceBrief = structuredClone(read(P.sourceBrief));
  const learningPlan = read(P.learningPlan);
  const unit = learningPlan.planned_units.find((row) => row.id === CHAPTER_ID);
  assert(unit, 'Læringsplanen mangler Audiovisuell form og sansing');
  const emneIds = unit.emne_ids;
  const methodIds = [...new Set(sourceBrief.topic_briefs.flatMap((row) => row.method_ids))].sort();
  const workCases = sourceBrief.case_candidates.map((row) => ({
    id: row.id, title: row.work, year: row.year, role: row.purpose, source_ids: row.source_ids
  }));
  const sources = sourceBrief.sources.map((row) => ({ ...row, label: `${row.publisher} – ${row.title}` }));

  const modules = {
    '01-bilde-rom-og-bevegelse.json': {
      id: 'bilde-rom-og-bevegelse', title: 'Bilde, rom og bevegelse',
      sections: [
        section('ftv-af-bilde-1', 'Mise-en-scène er relasjoner i bildet', 'em_film_tv_mise_en_scene_og_bildekomposisjon', [
          'Begynn formanalyse med det som kan pekes ut: dekor, lys, dybde, størrelse, avstand og plassering. Yale-guiden viser at disse variablene organiserer relasjoner i det diegetiske rommet. Tolkningen kommer etter observasjonen: lavt lys er ikke automatisk «uhyggelig», og stor avstand er ikke automatisk «ensomhet»; virkningen må prøves mot kombinasjonen i den konkrete scenen.',
          'BFIs gjennomgang av Citizen Kane viser hvordan dybdefokus, lys og blokkering kan holde Kane, Leland og Bernstein lesbare i ulike bildeplan samtidig. Det dokumenterte formgrepet er lagdelingen i ett shot. En faglig tolkning kan deretter undersøke hvordan avstandene gjør lojalitet og konflikt synlige, uten å late som kilden beviser én eneste riktig mening.'
          ,'Avgrensningen mot produksjonsdesign er avgjørende: formanalyse undersøker organiseringen som framtrer i det ferdige bildet, mens produksjonsanalyse undersøker hvem som tegnet, bygde, lyste og planla rommet. De to kunnskapsformene kan kobles, men den ene kan ikke erstatte den andre.'
        ], ['ftv-af-pc-13', 'ftv-af-pc-14', 'ftv-af-pc-13'], [
          'Navngi dekor, lys, dybde og plassering før du tolker forholdet mellom dem.',
          'Skill dokumentert formgrep fra den analysen du selv argumenterer for.'
        ]),
        section('ftv-af-bilde-2', 'Utsnitt, linse, kamerabane og blokkering er ulike variabler', 'em_film_tv_utsnitt_linse_kamerabevegelse_og_blokkering', [
          'Et shot kan endres på minst fire forskjellige måter: rammen kan velge et utsnitt, linsen kan endre perspektiv og dybde, kameraet kan flyttes, og figurer kan beveges eller blokkeres foran kameraet. Yale skiller blant annet bildevinkel, sideforhold, fokus, linsevirkning og følgende kamerabevegelse. Analysen blir presis først når den sier hvilken variabel som faktisk endres.',
          'Citizen Kane lar en kamerabevegelse se ut til å passere gjennom et tak ved å skjule en overgang i et lysglimt. Gravity fordeler bevegelse mellom animert rom, skuespiller og et kamera tenkt som en tredje figur, mens The Matrix bruker digitalt forbedret variabel hastighet til å kontrollere tid og bevegelse i bildet. Likheten er kontrollert bevegelse; hvordan kontrollen fordeles, er forskjellig.'
        ], ['ftv-af-pc-19', 'ftv-af-pc-20'], [
          'Beskriv utsnitt, optikk, kamerabevegelse og blokkering hver for seg.',
          'Sammenlign hvem eller hva som beveges: kamera, kropp, bildeelement eller syntetisk rom.'
        ]),
        section('ftv-af-bilde-3', 'Bildeformatet er en aktiv komposisjonsgrense', 'em_film_tv_bildeformat_skjermflate_og_audiovisuell_materialitet', [
          'Sideforholdet er forholdet mellom bildets bredde og høyde. Yale viser at omramming eller beskjæring kan endre avstanden mellom elementer og hvor trangt rommet virker. Derfor må analysen registrere den faktisk viste rammen før den omtaler balanse, tomrom eller plassering ved billedkanten.',
          'BFI dokumenterer at Citizen Kane bruker dybdefokus til å lagdele flere figurer og romplan i samme bilde. Dette er ikke et argument for at ett format alltid er best, men et kontrollspørsmål: Hvis presentasjonen beskjærer eller endrer rammen, må man undersøke hvilke romlige relasjoner som fortsatt er synlige før den nye versjonen analyseres som identisk komposisjon.'
        ], ['ftv-af-pc-07', 'ftv-af-pc-08'], [
          'Oppgi sideforhold og faktisk presentert ramme før komposisjonen vurderes.',
          'Bruk ikke verkets tittel som garanti for at alle presentasjoner viser samme bildeinformasjon.'
        ]),
        section('ftv-af-bilde-4', 'Animasjon konstruerer bevegelse og tid', 'em_film_tv_animasjon_bevegelse_design_og_tidsdannelse', [
          'Yale beskriver bildehastighet som et forhold mellom registrerte bilder og avspillingshastighet, og stop-motion som enkeltbilder tatt mellom endringer i motivet. I animasjon er bevegelse derfor ikke bare noe kameraet finner foran seg; mellomrom, gjentakelser, deformasjoner og hastighet kan bygges bilde for bilde og gjøre tidsdannelse til et synlig formvalg.',
          'BFI beskriver The Night Is Short, Walk on Girl gjennom skiftende farge, ekspressiv mise-en-scène og kropper som vugger, forvandles og blir silhuetter. Academy-kilden viser på sin side hvordan Gravity-animasjonen måtte modellere vektløs bevegelse og samordnes med live action. Begge konstruerer bevegelse, men den ene fremhever stilskifte og elastisk kropp, den andre sømløs fysisk troverdighet.'
        ], ['ftv-af-pc-01', 'ftv-af-pc-02'], [
          'Undersøk hvordan mellomrom, hastighet og design produserer bevegelse.',
          'Skill ekspressiv transformasjon fra animasjon som skal gli inn i et realistisk helhetsinntrykk.'
        ])
      ],
      concepts: [
        { id: 'mise-en-scene', term: 'Mise-en-scène', definition: 'Relasjonene mellom rom, dekor, lys, figur, kostyme, bevegelse og plassering slik de framtrer i bildet.' },
        { id: 'blokkering', term: 'Blokkering', definition: 'Planleggingen av hvor og hvordan figurer og objekter står eller beveger seg i forhold til kamera og hverandre.' },
        { id: 'dybdefokus', term: 'Dybdefokus', definition: 'Stor dybdeskarphet som holder flere av bildets avstandsplan skarpe samtidig.' },
        { id: 'sideforhold', term: 'Sideforhold', definition: 'Forholdet mellom bildets horisontale og vertikale mål.' },
        { id: 'offscreen-rom', term: 'Rom utenfor bildet', definition: 'Diegetisk rom som ikke er synlig innenfor rammen, men kan gjøres relevant gjennom lyd, blikk eller handling.' },
        { id: 'tidsdannelse', term: 'Tidsdannelse', definition: 'Hvordan opptak, animasjon, varighet, overgang og avspilling organiserer erfart tid.' }
      ]
    },
    '02-tid-lyd-og-atmosfaere.json': {
      id: 'tid-lyd-og-atmosfaere', title: 'Tid, lyd og atmosfære',
      sections: [
        section('ftv-af-tid-1', 'Rytme finnes i flere samtidige lag', 'em_film_tv_audiovisuell_rytme', [
          'Rytme er ikke bare antall klipp per minutt. Yale viser at shotvarighet kan akselerere eller bremse en scene, mens bevegelse i bildet og lyd kan følge andre mønstre. En rytmeanalyse registrerer derfor shotlengde, overgang, kamerabevegelse, kroppsbevegelse, tale, musikk og stillhet hver for seg før den beskriver deres samspill.',
          'I Yi Yi lar en lydbro pianomusikk begynne før sceneskiftet er forklart visuelt, slik at overgangen først skaper en forventning og deretter avslører lydkilden. Citizen Kanes frokostmontasje organiserer på sin side et langt forhold gjennom gjentatte komposisjoner, raske tidshopp og voksende avstand. Det ene caset binder scener med lyd; det andre komprimerer tid med visuell montasje.'
        ], ['ftv-af-pc-05', 'ftv-af-pc-06'], [
          'Mål klipp, bevegelse, tale og lyd som separate rytmelag.',
          'Skill en overgang som forbinder scener fra en montasje som komprimerer et lengre forløp.'
        ]),
        section('ftv-af-tid-2', 'Lydens kilde og plassering må identifiseres', 'em_film_tv_lydform_dialog_musikk_effekt_og_stillhet', [
          'Yale skiller lyd som kommer fra verkets verden fra lyd som legges utenfor den, og skiller også synlig lydkilde, lyd utenfor utsnittet og lyd i en figurs indre. Dialog, musikk, effekt, romlyd og stillhet bør derfor ikke bare navngis; analysen må spørre hvem som kan høre lyden, hvor den plasseres, og om den fortsetter over en overgang.',
          'Yi Yi bruker pianomusikken som lydbro og utsetter opplysningen om hvor musikken kommer fra. Library of Congress beskriver The Thing med lange suspensefulle shot, praktiske effekter, truende atmosfære og Ennio Morricones musikk. Sammenligningen viser to ulike forventningsmekanismer: en lydkilde som blir avklart, og et lyd- og musikkmiljø som holder mistanken åpen.'
          ,'Stillhet må også beskrives relasjonelt: Hva har opphørt, hvilket romspor eller kroppsspor står igjen, og hvor lenge varer fraværet? «Ingen lyd» er sjelden en presis observasjon; analysen må skille faktisk stillhet fra lav romlyd, pause i dialog eller fravær av musikk.'
        ], ['ftv-af-pc-11', 'ftv-af-pc-12', 'ftv-af-pc-11'], [
          'Plasser lyden i eller utenfor verkets verden, rammen og figurens kunnskap.',
          'Beskriv hvordan lyd endrer forventning uten å redusere all lydbruk til «stemning».'
        ]),
        section('ftv-af-tid-3', 'Atmosfære er en sammensatt virkning', 'em_film_tv_audiovisuell_atmosfare', [
          'Atmosfære oppstår ikke i én farge eller ett instrument alene. Lysretning og kontrast, dekor og romdybde, lydkilde, bevegelsesmønster og varighet kan trekke sammen eller mot hverandre. En etterprøvbar atmosfæreanalyse lager først en liste over slike observerbare forhold og argumenterer deretter for hvordan kombinasjonen blir sanselig truende, leken, tett eller åpen.',
          'The Night Is Short, Walk on Girl skifter ifølge BFI mellom sterke farger, forvandlete kropper og ekspressiv mise-en-scène for å bygge en leken, drømmeaktig verden. The Thing knytter lange forløp, praktiske effekter og musikk til mistanke og kulde, mens Citizen Kane bruker chiaroscuro, silhuett og romlig lagdeling rundt journalistene. Tre atmosfærer bygges av tre ulike kombinasjoner, ikke av en universell stemningskode.'
        ], ['ftv-af-pc-03', 'ftv-af-pc-04'], [
          'Registrer minst to formnivåer før atmosfæren navngis.',
          'Unngå å gjøre én farge, lyd eller sjangeretikett til automatisk betydning.'
        ]),
        section('ftv-af-tid-4', 'Suspense fordeler synlighet, tid og kunnskap', 'em_film_tv_suspense_som_audiovisuell_teknikk', [
          'Suspense er ikke det samme som thrillersjanger. Yale viser at rom utenfor bildet og lyd uten synlig kilde kan gjøre en mulig hendelse nærværende, mens fokus, utsnitt og shotvarighet styrer hva tilskueren rekker å undersøke. Formanalysen spør derfor hva figuren vet, hva tilskueren vet, og når et syns- eller lydspor blir tilgjengelig.',
          'Library of Congress fremhever The Things lange suspenseforløp, paranoia, praktiske effekter og musikk. Yale bruker Touch of Evil til å vise høy lyskontrast og low-key-bilder med sterke skygger. The Thing lar varighet og usikker identitet forlenge mistanken; Touch of Evil kan holde rom og ansikt delvis skjult. Begge styrer kunnskap, men gjennom ulike synlighets- og tidsformer.'
        ], ['ftv-af-pc-17', 'ftv-af-pc-18'], [
          'Kartlegg forskjellen mellom figurens og tilskuerens informasjon.',
          'Forklar om spenningen skapes av varighet, skjult rom, lyd, fokus eller en kombinasjon.'
        ])
      ],
      workedExamples: [
        { id: 'ftv-af-ex-1', title: 'Lydbroen i Yi Yi', situation: 'Musikk starter over ett bilde og får synlig kilde først etter klippet.', analysis: ['Registrer når lyden begynner, når bildet skifter, og når kilden avsløres.', 'Konkluder først da: Lyd kan både binde scener sammen og midlertidig styre en feil forventning.'] },
        { id: 'ftv-af-ex-2', title: 'Dybdelag i Citizen Kane', situation: 'Flere figurer holdes lesbare i forskjellige avstandsplan.', analysis: ['Tegn bildeplanene, registrer fokus, lys, blikk og blokkering, og skill dette fra tolkningen av makt og lojalitet.', 'Konkluder først da: Mening kan organiseres i relasjoner innenfor ett shot, ikke bare mellom klipp.'] },
        { id: 'ftv-af-ex-3', title: 'Syntetisk bevegelse i Gravity', situation: 'Live action, animasjon og skjulte klipp oppleves som lange sammenhengende bevegelser.', analysis: ['Skill dokumentert produksjonskunnskap fra det ferdige bildets bevegelses-, lys- og perspektivspor.', 'Konkluder først da: Sømløshet er et produsert formresultat som kan analyseres uten at verktøyhistorien overtar kapitlet.'] }
      ],
      commonMisconceptions: [
        { claim: 'Rytme er det samme som rask klipping.', correction: 'Rytme kan ligge i shotvarighet, bevegelse, tale, musikk, stillhet og overgang samtidig.' },
        { claim: 'All musikk som høres, ligger utenfor filmens verden.', correction: 'Musikk kan være diegetisk, ikke-diegetisk, intern, synlig eller plassert utenfor utsnittet.' },
        { claim: 'Mørkt lys betyr alltid fare.', correction: 'Lyskontrast må analyseres sammen med rom, handling, lyd og varighet i den konkrete scenen.' },
        { claim: 'Suspense er bare en sjangerregel.', correction: 'Suspense kan analyseres som fordeling av tid, rom, synlighet og kunnskap på tvers av sjangre.' },
        { claim: 'En kilde som beskriver et verk, beviser også enhver tolkning av verket.', correction: 'Kilden dokumenterer bestemte formgrep eller produksjonsforhold; tolkningen må argumenteres fram og avgrenses.' }
      ]
    },
    '03-kropp-syntese-og-troverdighet.json': {
      id: 'kropp-syntese-og-troverdighet', title: 'Kropp, syntese og troverdighet',
      sections: [
        section('ftv-af-kropp-1', 'Framføring formes av kropp, stemme, rom og kamera', 'em_film_tv_skuespillerprestasjon_kropp_stemme_og_blikk', [
          'Yale understreker at filmisk framføringsstil varierer historisk og kulturelt, fra teatralske og stiliserte uttrykk til naturalisme, improvisasjon og deadpan. En prestasjonsanalyse beskriver kroppsholdning, ansikt, blikk, stemme, tempo og samspill, men også utsnittet og rommet som gjør enkelte detaljer synlige og andre utilgjengelige.',
          'The Night Is Short, Walk on Girl lar animerte kropper vugge og forvandles med stemningen. Gravity måtte samordne Sandra Bullocks bevegelse med rigg, animert vektløshet, kamera og skiftende lys. Citizen Kane bruker ensembleblokkering og dybde til å plassere kropper i maktrelasjoner. Casene krever ulike kriterier, men alle viser at prestasjon alltid formidles gjennom audiovisuell form.'
        ], ['ftv-af-pc-15', 'ftv-af-pc-16'], [
          'Beskriv kropp, stemme, blikk og timing før prestasjonen vurderes.',
          'Analyser også hvordan utsnitt, rom, animasjon eller effektarbeid formidler kroppen.'
        ]),
        section('ftv-af-kropp-2', 'Syntetisk realisme bygges av samstemte spor', 'em_film_tv_digitale_bilder_vfx_og_syntetisk_realisme', [
          'Academy-kilden dokumenterer at Gravity kombinerer live action, animasjon, skjulte klipp og dataskapte omgivelser, og at lys på skuespilleren måtte samsvare med lys i det syntetiske rommet. Troverdigheten ligger dermed ikke i at bildet er «ekte» eller «digitalt», men i at bevegelse, perspektiv, lys, tekstur og overgang oppleves som innbyrdes konsistente.',
          'Gravity bruker lange, sammensatte shot og dokumentarlik kameraføring for å gjøre et umulig opptaksrom sanselig sammenhengende. Library of Congress beskriver The Matrix som digital kontroll over variabel hastighet, tid og bevegelse i actionbildet. Begge bruker syntese, men Gravity skjuler sammenføyningen for kontinuitet, mens The Matrix synliggjør tidsmanipulasjonen som stilgrep.'
          ,'En streng VFX-analyse arbeider i tre ledd: Kilden dokumenterer hva som ble kombinert, shotloggen registrerer synlige lys-, perspektiv-, bevegelses- og overgangsspor, og tolkningen argumenterer for hvordan samsvaret eller bruddet skaper troverdighet. En generell verkregistrering kan ikke alene bevise detaljene i et bestemt shot.'
        ], ['ftv-af-pc-09', 'ftv-af-pc-10', 'ftv-af-pc-09'], [
          'Vurder samsvar mellom lys, bevegelse, perspektiv, tekstur og overgang.',
          'Skill sømløs syntese fra synlig digital tids- og bevegelsesmanipulasjon.'
        ])
      ],
      applicationTasks: [
        { id: 'ftv-af-task-1', title: 'Shotprotokollen', task: 'Velg ett shot og skriv en observasjonsprotokoll før du tolker.', prompts: ['Hva er utsnitt, sideforhold, fokus og dybde?', 'Hva beveges: kamera, figur eller bildeelement?', 'Hvilke slutninger er observasjon, kildefaktum og egen tolkning?'] },
        { id: 'ftv-af-task-2', title: 'Lydkartet', task: 'Kartlegg ett minutts lydspor.', prompts: ['Hvilke stemmer, musikk, effekter, romlyder og stillheter finnes?', 'Er kilden synlig, utenfor bildet, intern eller utenfor verkets verden?', 'Hvordan endres lyden over klipp?'] },
        { id: 'ftv-af-task-3', title: 'Rytmelagene', task: 'Sammenlign to korte sekvenser med ulik rytme.', prompts: ['Mål shotvarighet og overgangstyper.', 'Registrer bevegelses-, tale- og lydmønstre separat.', 'Hvilket lag styrer forventningen sterkest, og hva er evidensen?'] },
        { id: 'ftv-af-task-4', title: 'Atmosfærematrisen', task: 'Test en stemningsetikett mot observerbar form.', prompts: ['Hvilke konkrete lys-, rom-, lyd- og tidsvalg støtter etiketten?', 'Finnes motstridende spor?', 'Kan en annen tolkning forklare de samme observasjonene?'] },
        { id: 'ftv-af-task-5', title: 'Syntese og kropp', task: 'Analyser en scene der kropp og syntetisk bilde samvirker.', prompts: ['Hva er dokumentert om produksjonen?', 'Hva kan observeres uten produksjonskilden?', 'Hvor samsvarer eller bryter lys, bevegelse og perspektiv?'] }
      ],
      selfCheck: [
        { question: 'Hva kommer før tolkningen i en formanalyse?', answer: 'En presis beskrivelse av observerbare bilde-, lyd-, tids-, rom- og framføringsforhold.' },
        { question: 'Hva skiller mise-en-scène fra kameraarbeid?', answer: 'Mise-en-scène organiserer det framstilte rommet og elementene i det; kameraarbeid bestemmer hvordan dette rommet registreres og rammes.' },
        { question: 'Hvorfor må sideforhold registreres?', answer: 'Fordi rammen avgjør hvilke romlige relasjoner og billedkanter som faktisk er synlige i presentasjonen.' },
        { question: 'Hva er en lydbro?', answer: 'Lyd som begynner før eller fortsetter etter et bildeskift og dermed forbinder to scener eller shot.' },
        { question: 'Hvorfor er atmosfære ikke én teknikk?', answer: 'Fordi atmosfære oppstår i samspill mellom blant annet lys, rom, lyd, bevegelse og varighet.' },
        { question: 'Hvordan analyseres suspense uten sjangeretikett?', answer: 'Ved å undersøke hvordan tid, synlighet, rom og kunnskap fordeles mellom figur og tilskuer.' },
        { question: 'Hva gjør syntetisk realisme troverdig?', answer: 'At flere spor som lys, perspektiv, bevegelse, tekstur og overgang oppleves som konsistente, ikke at bildet mangler digitale elementer.' }
      ]
    }
  };

  const claims = [
    claim('ftv-af-pc-01', 'Bildehastighet og bilde-for-bilde-opptak gjør erfart bevegelse og tid til formvariabler; stop-motion registrerer enkeltbilder mellom endringer i motivet.', ['ftvaf02-yale-cinematography'], 'ftv-af-bilde-4'),
    claim('ftv-af-pc-02', 'The Night Is Short, Walk on Girl bruker skiftende farge, mise-en-scène og forvandlete kropper, mens Gravity samordner animert vektløshet med live action for sømløs fysisk troverdighet.', ['ftvaf06-academy-gravity', 'ftvaf07-bfi-anime'], 'ftv-af-bilde-4'),
    claim('ftv-af-pc-03', 'Atmosfære må analyseres som en kombinasjon av observerbare lys-, rom-, lyd-, bevegelses- og varighetsforhold før den gis en stemningsetikett.', ['ftvaf01-yale-mise', 'ftvaf03-yale-editing', 'ftvaf04-yale-sound'], 'ftv-af-tid-3'),
    claim('ftv-af-pc-04', 'The Night Is Short, Walk on Girl, The Thing og Citizen Kane dokumenterer ulike kombinasjoner av farge og deformasjon, lang varighet og musikk, samt chiaroscuro og romlig lagdeling som grunnlag for forskjellige atmosfærer.', ['ftvaf05-bfi-citizen-kane', 'ftvaf07-bfi-anime', 'ftvaf08-loc-film-registry'], 'ftv-af-tid-3'),
    claim('ftv-af-pc-05', 'Audiovisuell rytme kan ligge samtidig i shotvarighet, overgang, kamera- og kroppsbevegelse, tale, musikk og stillhet.', ['ftvaf03-yale-editing', 'ftvaf04-yale-sound'], 'ftv-af-tid-1'),
    claim('ftv-af-pc-06', 'Yi Yi bruker en lydbro til å styre og revidere forventning over et sceneskift, mens Citizen Kane bruker gjentatt komposisjon og montasje til å komprimere tid og endre relasjonen mellom figurer.', ['ftvaf03-yale-editing', 'ftvaf04-yale-sound', 'ftvaf05-bfi-citizen-kane'], 'ftv-af-tid-1'),
    claim('ftv-af-pc-07', 'Sideforhold og beskjæring endrer hvilke romlige relasjoner og deler av komposisjonen som er synlige i en presentert bildeflate.', ['ftvaf02-yale-cinematography'], 'ftv-af-bilde-3'),
    claim('ftv-af-pc-08', 'Citizen Kane lagdeler figurer og rom gjennom dybdefokus; formanalyse av en presentasjon må derfor kontrollere den faktisk viste rammen før komposisjonen behandles som uendret.', ['ftvaf02-yale-cinematography', 'ftvaf05-bfi-citizen-kane'], 'ftv-af-bilde-3', 'verified_after_scope_rewrite'),
    claim('ftv-af-pc-09', 'Gravity kombinerer live action, animasjon, skjulte klipp og dataskapte omgivelser, med lys på skuespilleren matchet mot lys i det syntetiske rommet.', ['ftvaf06-academy-gravity'], 'ftv-af-kropp-2'),
    claim('ftv-af-pc-10', 'Gravity bruker sømløse sammensatte shot for romlig kontinuitet, mens The Matrix synliggjør digital kontroll over variabel hastighet, tid og bevegelse som stilgrep.', ['ftvaf06-academy-gravity', 'ftvaf08-loc-film-registry'], 'ftv-af-kropp-2'),
    claim('ftv-af-pc-11', 'Lydanalyse må skille lyd innenfor og utenfor verkets verden, synlig og usynlig kilde, intern og ekstern lyd samt lydens forhold til klipp og bilde.', ['ftvaf04-yale-sound'], 'ftv-af-tid-2'),
    claim('ftv-af-pc-12', 'Yi Yi bruker en lydbro som gradvis avklarer lydkilden, mens The Thing kombinerer lange suspenseforløp med musikk og et truende lydmiljø som holder mistanken åpen.', ['ftvaf04-yale-sound', 'ftvaf08-loc-film-registry'], 'ftv-af-tid-2'),
    claim('ftv-af-pc-13', 'Dekor, lys, dybde, størrelse, avstand og plassering organiserer relasjoner mellom elementer i det diegetiske rommet.', ['ftvaf01-yale-mise', 'ftvaf02-yale-cinematography'], 'ftv-af-bilde-1'),
    claim('ftv-af-pc-14', 'Citizen Kane bruker dybdefokus, lys og blokkering til å holde Kane, Leland og Bernstein lesbare i ulike romplan i samme shot.', ['ftvaf05-bfi-citizen-kane'], 'ftv-af-bilde-1', 'verified_after_case_narrowing'),
    claim('ftv-af-pc-15', 'Filmisk framføringsstil varierer historisk og kulturelt og må beskrives gjennom kropp, ansikt, blikk, stemme, timing, rom og utsnitt.', ['ftvaf01-yale-mise'], 'ftv-af-kropp-1'),
    claim('ftv-af-pc-16', 'Animert transformasjon i The Night Is Short, Walk on Girl, rigg- og effektmediert vektløshet i Gravity og dybdeblokkert ensemble i Citizen Kane gjør kroppen synlig gjennom ulike formidlingssystemer.', ['ftvaf01-yale-mise', 'ftvaf05-bfi-citizen-kane', 'ftvaf06-academy-gravity', 'ftvaf07-bfi-anime'], 'ftv-af-kropp-1'),
    claim('ftv-af-pc-17', 'Rom og lyd utenfor bildet, fokus, utsnitt og shotvarighet kan fordele kunnskap ulikt mellom figur og tilskuer og dermed produsere suspense.', ['ftvaf01-yale-mise', 'ftvaf02-yale-cinematography', 'ftvaf03-yale-editing', 'ftvaf04-yale-sound'], 'ftv-af-tid-4'),
    claim('ftv-af-pc-18', 'The Thing bruker lange forløp, usikker identitet, praktiske effekter og musikk, mens Touch of Evil bruker høy kontrast og low-key-lys til å begrense synlighet; begge kan bygge suspense uten samme formkombinasjon.', ['ftvaf01-yale-mise', 'ftvaf02-yale-cinematography', 'ftvaf08-loc-film-registry'], 'ftv-af-tid-4'),
    claim('ftv-af-pc-19', 'Utsnitt, sideforhold, linse, fokus, bildevinkel, kamerabane og blokkering er forskjellige variabler som kan kombineres i ett shot.', ['ftvaf01-yale-mise', 'ftvaf02-yale-cinematography'], 'ftv-af-bilde-2'),
    claim('ftv-af-pc-20', 'Citizen Kane, Gravity og The Matrix fordeler bevegelse ulikt mellom kamera, kropp, skjult overgang og syntetisk rom.', ['ftvaf05-bfi-citizen-kane', 'ftvaf06-academy-gravity', 'ftvaf08-loc-film-registry'], 'ftv-af-bilde-2')
  ];

  const chapter = {
    schema: 'history_go_fagverk_chapter_v1', version: '1.0.0', subject: 'film_tv', subject_id: 'film_tv',
    id: CHAPTER_ID, chapter_id: CHAPTER_ID, primary_domain_id: 'audiovisuell_form_stil_analyse',
    editorialStatus: 'chapter_ready', claimTraceRequired: true, sourceFirst: true,
    emne_ids: emneIds, method_ids: methodIds,
    title: 'Audiovisuell form og sansing: hvordan bilde og lyd skaper mening',
    subtitle: 'Fra mise-en-scène, utsnitt og animert bevegelse til rytme, lydrom, suspense, framføring og syntetisk realisme',
    lead: 'Formanalyse begynner ikke med hva et verk «egentlig betyr», men med hva som kan sees og høres: ramme, lys, dybde, bevegelse, varighet, overgang, lydkilde, stemme og kropp. Kapittelet lærer brukeren å skille observasjon, dokumentert produksjons- eller verkfaktum og begrunnet tolkning, og å analysere samspillet mellom flere formnivåer uten å redusere dem til utstyr, sjangeretiketter eller én fasit.',
    learningObjectives: [
      'beskrive observerbar audiovisuell form før tolkningen formuleres',
      'skille mise-en-scène, utsnitt, optikk, kamerabevegelse og blokkering',
      'analysere sideforhold, dybde, animasjon og tidsdannelse som formvalg',
      'undersøke rytme gjennom klipp, bevegelse, tale, musikk og stillhet',
      'plassere lyd i forhold til bildet, verkets verden og figurens kunnskap',
      'forklare atmosfære og suspense som kombinasjoner av flere observerbare spor',
      'analysere kropp, stemme og blikk som audiovisuelle prestasjoner',
      'vurdere syntetisk realisme gjennom samsvar mellom lys, perspektiv, bevegelse, tekstur og overgang'
    ],
    diagnosticQuestions: [
      { question: 'Er en tolkning det samme som en observasjon?', answer: 'Nei. Observasjonen beskriver et kontrollerbart formspor; tolkningen argumenterer for hva sporet gjør i sammenheng.' },
      { question: 'Er rask klipping det samme som rask rytme?', answer: 'Ikke nødvendigvis. Bevegelse, tale, musikk, stillhet og shotvarighet kan danne andre rytmer enn klippefrekvensen.' },
      { question: 'Er et digitalt bilde mindre virkelig enn et fotografisk opptak?', answer: 'Spørsmålet må presiseres. Troverdighet kan produseres gjennom konsistente lys-, perspektiv-, bevegelses- og teksturspor i både fotografiske og syntetiske bilder.' },
      { question: 'Betyr mørkt bilde automatisk suspense?', answer: 'Nei. Suspense avhenger av hvordan synlighet, tid, rom, lyd og kunnskap organiseres i den konkrete sekvensen.' }
    ],
    relatedPlaces: [
      { id: 'cinemateket_oslo', name: 'Cinemateket i Oslo', role: 'Bruk en dokumentert visning til å registrere bildeformat, komposisjon, lydrom, rytme og framføring før tolkning; noter også kopi- og presentasjonsformat.' },
      { id: 'lisbon_cinemateca_portuguesa', name: 'Cinemateca Portuguesa', role: 'Sammenlign hvordan et verk presenteres i et filmhistorisk visnings- og arkivmiljø, og hold verkets form atskilt fra kopien og visningsbetingelsene.' }
    ], workCases,
    moduleFiles: Object.keys(modules).map((file) => `${CHAPTER_DIR}/${file}`),
    briefFile: P.brief, claimsFile: P.claims,
    sourceBriefFile: P.sourceBrief, learningPlanFile: P.learningPlan
  };

  const chapterBrief = {
    schema: 'history_go_fagverk_chapter_brief_v1', version: '1.0.0', subject_id: 'film_tv',
    chapter_id: CHAPTER_ID, primary_domain_id: chapter.primary_domain_id,
    relatedPlaceIds: chapter.relatedPlaces.map((row) => row.id),
    purpose: 'Lære formanalytisk nærlesning av bilde, lyd, rytme, rom, bevegelse, framføring og syntese gjennom dokumenterte verkcase og avsnittsnivå claimtrace.',
    audience: 'Brukere som skal kunne beskrive audiovisuelle spor presist, skille kildefaktum fra observasjon og argumentere for tolkning uten å bruke canonicalnavn eller smak som evidens.',
    requiredEmneIds: emneIds, requiredMethodIds: methodIds,
    requiredCriticalDistinctions: [
      'observasjon vs tolkning', 'kildedokumentert faktum vs egen nærlesning',
      'mise-en-scène vs kameraarbeid', 'kamerabevegelse vs bevegelse i bildet',
      'sideforhold vs visningsrom', 'klipperytme vs øvrige rytmelag',
      'diegetisk vs ikke-diegetisk lyd', 'atmosfære vs løs stemningsetikett',
      'suspense som teknikk vs thrillersjanger', 'framføring vs casting og stjernepersona',
      'syntetisk realisme vs fravær av digitale elementer'
    ],
    sourceStrategy: {
      sourceBriefFile: P.sourceBrief, externalSourceCount: sources.length,
      paragraphLevelClaimTrace: true, sourceLocationsRequired: true,
      observationSourceFactInterpretationSeparated: true, everyPlannedClaimResolved: true
    },
    workCaseIds: workCases.map((row) => row.id),
    scope: { included: emneIds, excluded: [
      'produksjonsroller og arbeidsflyt som eget hovedtema',
      'narrativ organisering og sjangerhistorie som eget hovedtema',
      'smak, popularitet eller teknologinavn brukt som bevis på formvirkning',
      'verkbeskrivelse presentert som om den beviser én uttømmende tolkning'
    ] },
    qa: { sectionCountDerivedFromEmneOwnership: true, actualFulltextSections: 10, paragraphCountsAreNotQuota: true, paragraphClaimTraceRequired: true, exactCanonicalCoverage: '10/10', plannedClaimResolution: '20/20' }
  };
  const claimsDoc = {
    schema: 'history_go_fagverk_chapter_claims_v1', version: '1.0.0', subject_id: 'film_tv',
    chapter_id: CHAPTER_ID, sourceBriefFile: P.sourceBrief, sources, claims
  };

  sourceBrief.version = '1.1.0';
  sourceBrief.status = 'source_claim_brief_consumed_by_verified_chapter';
  sourceBrief.runtime_registration = { registered: true, chapter_id: CHAPTER_ID, registration_after_full_chapter_gate: true };
  sourceBrief.topic_briefs = sourceBrief.topic_briefs.map((topic) => ({
    ...topic,
    planned_claims: topic.planned_claims.map((planned) => ({
      ...planned,
      status: 'resolved_to_verified_claim',
      final_claim_id: planned.id,
      resolution: claims.find((row) => row.id === planned.id)?.plan_resolution
    }))
  }));
  delete sourceBrief.production_requirements.minimum_fulltext_sections;
  sourceBrief.production_requirements = { ...sourceBrief.production_requirements, section_scope_is_derived_from_emne_ownership: true, expected_current_section_owner_count: emneIds.length, completed: true };
  sourceBrief.next_gate = 'produce_source_and_claim_brief_for_fortelling_synsvinkel_og_sjanger';

  const registry = structuredClone(read(P.registry));
  registry.version = '2.76.0';
  registry.updatedAt = '2026-08-11';
  const registryChapter = {
    id: CHAPTER_ID, title: chapter.title, subtitle: chapter.subtitle, file: P.chapter,
    primary_domain_id: chapter.primary_domain_id, emne_ids: emneIds,
    claimsFile: P.claims, briefFile: P.brief
  };
  const chapters = registry.subjects.film_tv.chapters;
  const chapterIndex = chapters.findIndex((row) => row.id === CHAPTER_ID);
  if (chapterIndex === -1) chapters.push(registryChapter); else chapters[chapterIndex] = registryChapter;
  registry.subjects.film_tv.canonicalModel.note = 'Film & TVs variable canon har 192 emner. Audiovisuell form og sansing er nå registrert etter fulltekst- og evidensport med 10 canonicale emner, 10 faglig avgrensede seksjoner, 23 claimsporede avsnitt, 20 verifiserte claims, 8 inspectable institusjonskilder, 7 verkcase og 2 canonicale anvendelsessteder. Neste port er kilde- og claimbrief for Fortelling, synsvinkel og sjanger; antall kapitler, seksjoner og avsnitt følger stoffets problemgrenser, ikke en kvote.';
  registry.subjects.film_tv.canonicalModel.firstSourceClaimBrief = P.sourceBrief;

  const status = structuredClone(read(P.status));
  status.version = '1.64.0';
  status.updatedAt = '2026-08-11';
  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  filmStatus.editorialStatus = 'chapters_in_progress';
  filmStatus.nextGate = 'audiovisual_form_full_chapter_complete_next_unit_source_brief';
  filmStatus.note = 'Audiovisuell form og sansing er registrert etter full fulltekst- og evidensaudit: 10/10 canonicale emner, 3 ulikt store moduler, 10 naturlig avgrensede seksjoner, 23 avsnitt med claimtrace, 20/20 løste claimplaner, 8 brukte inspectable kilder, 7 dokumenterte verkcase og 2 canonicale anvendelsessteder. Neste port er kilde- og claimbrief for Fortelling, synsvinkel og sjanger; dette er læringsrekkefølge, ikke kapittelkvote.';

  const sourceBriefReport = structuredClone(read(P.sourceBriefReport));
  sourceBriefReport.version = '1.1.0';
  sourceBriefReport.status = 'source_claim_brief_consumed_by_verified_chapter';
  sourceBriefReport.summary = { ...sourceBriefReport.summary, registered_chapter_count_delta: 1, resolved_claim_count: claims.length };
  const {
    chapter_remains_unregistered: _chapterRemainedUnregistered,
    registration_waits_for_fulltext_claim_source_audit: _registrationWaited,
    chapter_was_unregistered_at_source_brief_gate: _chapterWasUnregistered,
    registration_waited_for_fulltext_claim_source_audit: _registrationHadWaited,
    ...preservedSourceBriefGates
  } = sourceBriefReport.gates;
  sourceBriefReport.gates = {
    ...preservedSourceBriefGates,
    // The fulltext materializer is reachable only after the committed source-brief gate.
    // Keep those pre-registration facts true on every later idempotent rerun.
    chapter_was_unregistered_at_source_brief_gate: true,
    registration_waited_for_fulltext_claim_source_audit: true,
    chapter_registered_only_after_fulltext_gate: true,
    every_planned_claim_resolved_to_verified_claim: claims.length === 20
  };
  sourceBriefReport.next_gate = sourceBrief.next_gate;

  return { chapter, chapterBrief, claimsDoc, modules, sourceBrief, registry, status, sourceBriefReport, unit, workCases };
}

export function materializeFilmTvAudiovisualFormFulltextV1() {
  const currentGate = read(P.status).subjects.find((row) => row.id === 'film_tv')?.nextGate;
  assert(['audiovisual_form_source_brief_complete_full_chapter_production', 'audiovisual_form_chapter_complete_next_unit_source_brief', 'audiovisual_form_full_chapter_complete_next_unit_source_brief', 'narrative_viewpoint_genre_source_brief_complete_full_chapter_production', 'narrative_viewpoint_genre_full_chapter_complete_next_unit_source_brief'].includes(currentGate), `Uventet Film & TV-port: ${currentGate}`);
  if (['narrative_viewpoint_genre_source_brief_complete_full_chapter_production', 'narrative_viewpoint_genre_full_chapter_complete_next_unit_source_brief'].includes(currentGate)) {
    console.log('Audiovisuell form er allerede materialisert; bevarer den senere narrative kildebriefporten.');
    return null;
  }
  const built = buildFilmTvAudiovisualFormFulltextV1();
  write(P.chapter, built.chapter);
  write(P.brief, built.chapterBrief);
  for (const [file, value] of Object.entries(built.modules)) write(`${CHAPTER_DIR}/${file}`, value);
  write(P.claims, built.claimsDoc);
  write(P.sourceBrief, built.sourceBrief);
  write(P.registry, built.registry);
  write(P.status, built.status);
  write(P.sourceBriefReport, built.sourceBriefReport);
  console.log(`Materialiserte Film & TV/${CHAPTER_ID}: ${built.chapter.emne_ids.length} emner, ${Object.values(built.modules).flatMap((row) => row.sections).length} seksjoner, ${built.claimsDoc.claims.length} claims og ${built.claimsDoc.sources.length} kilder.`);
  return built;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { materializeFilmTvAudiovisualFormFulltextV1(); }
  catch (error) { console.error(`Film & TV Audiovisuell form FEIL: ${error.message}`); process.exitCode = 1; }
}
