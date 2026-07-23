import { promises as fs } from 'node:fs';
import { pathToFileURL } from 'node:url';

const templateUrl = 'https://raw.githubusercontent.com/Paradispartiet/History-Go/c7180a72cc3a279088b7ba4434ce0ff25645abbf/scripts/coordinate-branch-job.mjs';
const response = await fetch(templateUrl);
if (!response.ok) throw new Error(`Could not fetch Etne nature runner template: HTTP ${response.status}`);
const template = await response.text();
const marker = 'const coordinate = {};';
const markerIndex = template.indexOf(marker);
if (markerIndex < 0) throw new Error('Could not locate coordinate body marker in Etne nature runner template');
const prefix = template.slice(0, markerIndex).replaceAll("'etne-natur-batch-2'", "'etne-natur-batch-3'");

const body = String.raw`
const nveVaulaUrl = 'https://www.nve.no/vann-og-vassdrag/vassdragsforvaltning/verneplan-for-vassdrag/vestland/042-1-vaulaelva-m-langfossen/';
const nveSaltanaUrl = 'https://www.nve.no/vann-og-vassdrag/vassdragsforvaltning/verneplan-for-vassdrag/vestland/?page=3';
const kringomKrokavatnetUrl = 'https://kringom.no/nb/sunnhordland/etne/krokavatnet';
const kringomSkanevikMoreneUrl = 'https://kringom.no/nb/sunnhordland/etne/skanevik-morene';

const coordinate = {};
coordinate.vaulaelva_vassdraget = await resolveNamedArea('Vaulaelva', ['Vaulaelva', 'Vaula', 'Vaulo', 'Vaulavatnet'], { allowSemanticFallback: true });
if (!coordinate.vaulaelva_vassdraget) {
  coordinate.vaulaelva_vassdraget = await resolveNamedArea('Langfossen', ['Langfossen']);
  coordinate.vaulaelva_vassdraget.exact = false;
}
coordinate.saltana_etne = await resolveNamedArea('Saltåna', ['Saltåna', 'Saltåno', 'Saltaana'], { allowSemanticFallback: true });
if (!coordinate.saltana_etne) throw new Error('Could not resolve Saltåna/Saltåno in Etne');
coordinate.krokavatnet_etneforkastningen = await resolveNamedArea('Krokavatnet', ['Krokavatnet'], { allowSemanticFallback: true });
if (!coordinate.krokavatnet_etneforkastningen) throw new Error('Could not resolve Krokavatnet in Etne');
coordinate.moreneryggen_skanevik = await resolveNamedArea('Skånevikmorenen', ['Tjedla', 'Miljaelva', 'Valdraelva'], { allowSemanticFallback: true });
if (!coordinate.moreneryggen_skanevik) throw new Error('Could not resolve a documented anchor for the Skånevik moraine ridge');
coordinate.moreneryggen_skanevik.exact = false;
coordinate.sandvikevatnet_etne = await resolveNamedArea('Sandvikevatnet', ['Sandvikevatnet', 'Sandvikvatnet'], { allowSemanticFallback: true });
if (!coordinate.sandvikevatnet_etne) throw new Error('Could not resolve Sandvikevatnet in Etne');
coordinate.taraldsoy = await resolveNamedArea('Taraldsøy', ['Taraldsøy', 'Taraldsøya'], { allowSemanticFallback: true });
if (!coordinate.taraldsoy) throw new Error('Could not resolve Taraldsøy in Etne');
coordinate.osnes_honsvikjo = await resolveNamedArea('Honsvikjo og Osnes', ['Honsvikjo', 'Honsvika', 'Osnes'], { allowSemanticFallback: true });
if (!coordinate.osnes_honsvikjo) throw new Error('Could not resolve an anchor for Osnes–Honsvikjo');
coordinate.osnes_honsvikjo.exact = false;

await writeJson(path.join(reportDir, 'resolved-coordinates.json'), coordinate);

function coordFields(id, options = {}) {
  const item = coordinate[id];
  if (!item) throw new Error(`Missing coordinate resolution for ${id}`);
  const exact = options.exact ?? item.exact ?? true;
  const linear = options.linear ?? false;
  const status = exact ? (linear ? 'verified_geometry' : 'verified') : 'needs_manual_visual_qa';
  const providerLabel = item.sourceProvider === 'kartverket' ? 'Kartverket SSR' : item.sourceProvider === 'osm' ? 'OpenStreetMap/Nominatim' : 'Kildebelagt semantisk anker';
  return {
    lat: item.lat,
    lon: item.lon,
    r: options.r,
    coordType: linear ? 'route_anchor' : 'area_center',
    coordStatus: status,
    coordSource: options.coordSource || `${providerLabel} – ${options.sourceDescription}`,
    coordVerifiedAt: verifiedAt,
    coordNote: options.coordNote,
    locatorType: linear ? 'linear_area' : 'natural_area',
    sourceProvider: item.sourceProvider,
    sourceObjectId: item.sourceObjectId,
    geocodeAccuracy: exact ? 'geometric_center' : 'semantic_anchor',
    coordRole: linear ? 'line_anchor' : 'area_anchor'
  };
}

const places = [
  {
    id: 'vaulaelva_vassdraget',
    name: 'Vaulaelva og Vaulovassdraget',
    ...coordFields('vaulaelva_vassdraget', {
      r: 1400,
      linear: true,
      exact: coordinate.vaulaelva_vassdraget.exact,
      sourceDescription: 'navngitt anker for Vaulaelva/Vaulovassdraget i Etne',
      coordNote: 'Representativt linjeanker for det vernede Vaulovassdraget fra Vaulavatnet gjennom høyfjellsplatået og ned mot Åkrafjorden via Langfossen. Punktet er ikke et geometrisk midtpunkt for hele nedbørfeltet eller en anbefalt turstart; radiusen representerer et stort vassdragslandskap.'
    }),
    category: 'natur', fylke: 'vestland', kommune: 'Etne', year: 1980,
    period: 'Vernet vassdrag fra høyfjell til Langfossen',
    tags: ['vaulaelva', 'vaulovassdraget', 'vaulavatnet', 'langfoss', 'vernet_vassdrag', 'hoyfjell'],
    desc: 'Vernet vassdrag som binder Vaulavatnet og høyfjellsplatået sammen med Langfossen og Åkrafjorden. NVE framhever urørthet, fjellandskap og friluftsliv som sentrale verneverdier.',
    popupDesc: 'Vaulovassdraget er større enn selve Langfossen. Vaulaelva kommer fra Vaulavatnet og renner gjennom et høytliggende fjellandskap før vannet styrter ned mot Åkrafjorden i Langfossen. Vassdraget ble vernet for å ta vare på et lite berørt restfelt i et område sterkt preget av kraftutbygging. History Go-stedet representerer hele sammenhengen mellom vann, elv, høyfjell og foss, mens Langfoss fortsatt er et eget natursted for selve fossen.',
    nature_profile: { type: 'vernet høyfjellsvassdrag / innsjø / fossesystem', title: 'Vassdraget bak Langfossen', summary: 'Vaulaelva viser hvordan ett nedbørfelt kan romme rolige fjellvann, elveløp over platå og et dramatisk fall mot fjorden. Natur-rundingen handler om helheten som gjør Langfossen mulig.', themes: ['vernet vassdrag', 'høyfjell', 'Vaulavatnet', 'Langfossen', 'nedbørfelt'], nearby_place_ids: ['langfoss_etne', 'etnefjella', 'akrafjorden'] },
    quiz_profile: { place_type: 'vernet_vassdrag', subtype: 'hoyfjellsvassdrag_med_markert_fossefall', signature_features: ['kommer fra Vaulavatnet', 'går gjennom høyfjellslandskap før Langfossen', 'vernet som lite berørt restfelt'], primary_angles: ['vassdrag', 'nedbørfelt', 'naturvern', 'landskap'], question_families: ['fra_vatn_til_foss', 'vernegrunnlag', 'hoyfjellsvassdrag', 'nedborfelt'], avoid_angles: ['duplisere_langfoss_som_eneste_tema', 'påstå_at_markoren_er_turstart'], must_include: ['forskjellen mellom vassdraget og selve Langfossen', 'forbindelsen til Vaulavatnet'], contrast_targets: ['langfoss_etne', 'mosneselva_etne'], notes: 'Skal spørres som vassdragssystem, ikke som ekstra Langfoss-markør. Feltoppgaver må knyttes til trygg, etablert ferdsel.' },
    externalLinks: [{ type: 'official', label: 'NVE – 042/1 Vaulaelva med Langfossen', url: nveVaulaUrl, lang: 'nb', verifiedAt }],
    emne_ids: ['em_natur_elver_bekker_vassdrag', 'em_natur_vern_forvaltning_politikk'],
    underbadge_ids: ['vann_og_vassdrag', 'elv', 'innsjo', 'foss_og_stryk', 'naturvern', 'friluftsliv']
  },
  {
    id: 'saltana_etne',
    name: 'Saltåna',
    ...coordFields('saltana_etne', {
      r: 900,
      linear: true,
      sourceDescription: 'offisielt/navngitt anker for Saltåna i Etne',
      coordNote: 'Representativt linjeanker for det vernede Saltåna-vassdraget i fjellandskapet. Punktet er ikke et geometrisk midtpunkt for hele nedbørfeltet eller et bestemt tilgangspunkt; radiusen dekker et større vassdragsområde.'
    }),
    category: 'natur', fylke: 'vestland', kommune: 'Etne', year: null,
    period: 'Vernet fjellvassdrag knyttet til Vaulaelva',
    tags: ['saltana', 'saltaano', 'vernet_vassdrag', 'fjellvassdrag', 'vaulaelva', 'friluftsliv'],
    desc: 'Vernet fjellvassdrag i Etne som NVE vurderer i sammenheng med Vaulaelva. Beliggenheten i et attraktivt fjellandskap og verdien for friluftsliv er sentrale deler av vernegrunnlaget.',
    popupDesc: 'Saltåna er et eget vernet vassdrag i Etnefjellene. NVE framhever plasseringen i fjellandskapet og at vernet må sees i sammenheng med Vaulaelva. Sammen representerer de to vassdragene viktige restfelt i en region der mange andre vannsystemer er påvirket av kraftutbygging. History Go-stedet gjør Saltåna synlig som et eget vassdrag, ikke bare som en del av et generelt Etnefjell-område.',
    nature_profile: { type: 'vernet fjellvassdrag / restfelt / friluftsliv', title: 'Nabovassdraget til Vaulaelva', summary: 'Saltåna viser hvordan flere små fjellvassdrag sammen kan bevare et større landskapsmønster. Natur-rundingen kobler vannløpet til fjellandskapet og til Vaulaelva som nabovassdrag.', themes: ['fjellvassdrag', 'vernet restfelt', 'friluftsliv', 'landskapssammenheng', 'Vaulaelva'], nearby_place_ids: ['vaulaelva_vassdraget', 'etnefjella', 'langfoss_etne'] },
    quiz_profile: { place_type: 'vernet_vassdrag', subtype: 'fjellvassdrag_som_utfyller_vaulaelva', signature_features: ['ligger i fjellandskapet i Etne', 'vernet må sees i sammenheng med Vaulaelva', 'viktig for friluftsliv'], primary_angles: ['vassdrag', 'naturvern', 'landskap', 'restfelt'], question_families: ['vernegrunnlag', 'nabovassdrag', 'fjellandskap', 'restfelt'], avoid_angles: ['blande_saltana_med_vaulaelva', 'generisk_kraftverkshistorie'], must_include: ['at Saltåna er et eget vernet vassdrag', 'sammenhengen med Vaulaelva'], contrast_targets: ['vaulaelva_vassdraget', 'mosneselva_etne'], notes: 'Kartmarkøren representerer et langt vassdrag og skal ikke behandles som et presist bade- eller tilgangspunkt.' },
    externalLinks: [{ type: 'official', label: 'NVE – Verneplan for vassdrag i Vestland, 042/3 Saltåna', url: nveSaltanaUrl, lang: 'nb', verifiedAt }],
    emne_ids: ['em_natur_elver_bekker_vassdrag', 'em_natur_vern_forvaltning_politikk'],
    underbadge_ids: ['vann_og_vassdrag', 'elv', 'naturvern', 'friluftsliv', 'berg_og_knaus']
  },
  {
    id: 'krokavatnet_etneforkastningen',
    name: 'Krokavatnet og Etneforkastningen',
    ...coordFields('krokavatnet_etneforkastningen', {
      r: 750,
      sourceDescription: 'offisielt stedsnavnspunkt for Krokavatnet i Etnefjella',
      coordNote: 'Representativt områdeanker ved Krokavatnet for landskapsdraget som følger Etneforkastningen sørover mot Bjørndalsvida. Punktet markerer innsjøen og den synlige landskapslinjen, ikke jordskjelvets underjordiske hyposenter eller en eksakt kartlagt forkastningsflate.'
    }),
    category: 'natur', fylke: 'vestland', kommune: 'Etne', year: 1989,
    period: 'Forkastningslandskap og Etnejordskjelvet',
    tags: ['krokavatnet', 'etneforkastningen', 'jordskjelv', 'geologi', 'berggrunn', 'etnefjella'],
    desc: 'Krokavatnet ligger i et markert landskapsdrag som følger Etneforkastningen. Området er et konkret sted for å forstå berggrunn, forkastninger og Etnejordskjelvet i 1989.',
    popupDesc: 'Landskapsdraget sørover langs Krokavatnet og Bjørndalsvida følger Etneforkastningen. Da Etne ble rammet av et jordskjelv i januar 1989, ble skjelvet knyttet til bevegelse langs denne forkastningssonen på flere kilometers dyp. Stedet gjør en ellers usynlig geologisk struktur lesbar gjennom retningen i landskapet, samtidig som det er viktig å skille den synlige terrengformen fra det dype jordskjelvsenteret.',
    nature_profile: { type: 'innsjø / forkastningssone / berggrunnsgeologi', title: 'Landskapet langs en gammel svakhetssone', summary: 'Krokavatnet ligger langs et landskapsdrag som følger Etneforkastningen. Natur-rundingen kobler innsjøens retning og fjellformene rundt til spenninger, brudd og jordskjelvet i 1989.', themes: ['forkastning', 'jordskjelv', 'berggrunn', 'landskapslinje', 'Krokavatnet'], nearby_place_ids: ['etnefjella', 'stordalsvatnet_etne', 'terrasselandskapet_etne'] },
    quiz_profile: { place_type: 'geologisk_lokalitet', subtype: 'innsjo_og_landskapsdrag_langs_forkastningssone', signature_features: ['Krokavatnet ligger langs Etneforkastningen', 'landskapsdraget fortsetter mot Bjørndalsvida', 'jordskjelvet i 1989 knyttes til bevegelse langs forkastningen på dypet'], primary_angles: ['geologi', 'forkastning', 'jordskjelv', 'landskapslesning'], question_families: ['forkastning', 'jordskjelv', 'berggrunn', 'landskapsform'], avoid_angles: ['påstå_synlig_overflatebrudd_fra_1989_uten_kilde', 'plassere_hyposenteret_i_kartmarkoren'], must_include: ['forskjellen mellom forkastningslandskap og jordskjelvsenter', 'koblingen til Etnejordskjelvet'], contrast_targets: ['jettegrytene_rullestad', 'moreneryggen_skanevik'], notes: 'Skal spørres som geologisk struktur og landskapslesning, ikke som farevarsel eller eksakt seismologisk målepunkt.' },
    externalLinks: [{ type: 'reference', label: 'Kringom – Krokavatnet og Etneforkastningen', url: kringomKrokavatnetUrl, lang: 'nn', verifiedAt }],
    emne_ids: [],
    underbadge_ids: ['geologi', 'berggrunn', 'forkastning', 'innsjo']
  },
  {
    id: 'moreneryggen_skanevik',
    name: 'Moreneryggen i Skånevik',
    ...coordFields('moreneryggen_skanevik', {
      r: 850,
      exact: false,
      sourceDescription: 'semantisk områdeanker ved Tjedla/Milja for den dokumenterte endemorenen sør for Skånevik',
      coordNote: 'Semantisk områdeanker for moreneryggen som er tydeligst mellom Miljaelva og Valdraelva og kan følges vestover fra Tjedla. Kartverket-ankeret representerer nærområdet, mens selve moreneryggen er en langstrakt kvartærgeologisk landform uten lagret polygon i denne batchen; derfor kreves manuell visuell QA.'
    }),
    category: 'natur', fylke: 'vestland', kommune: 'Etne', year: null,
    period: 'Endemorene fra Yngre Dryas',
    tags: ['skanevik', 'morene', 'tjedla', 'miljaelva', 'valdraelva', 'yngre_dryas'],
    desc: 'Langstrakt endemorene sør for Skånevik, lagt opp da brefronten rykket fram under Yngre Dryas. Ryggen er særlig tydelig mellom Miljaelva og Valdraelva og ved Tjedla.',
    popupDesc: 'Moreneryggen i Skånevik er et tydelig spor etter brefronten under den siste kalde fasen av istiden. Kringom beskriver ryggen som finest mellom Miljaelva og Valdraelva, der bekkene har skåret seg gjennom en landform som lokalt kan være rundt ti meter høy og trettifem meter bred. Vest for Tjedla kan ryggen følges videre mot Leiknesvika. Den flate terrassen ved Tjedla viser også hvor høyt havet stod da isen trakk seg tilbake.',
    nature_profile: { type: 'endemorene / Yngre Dryas / marin grense', title: 'Brefronten som ble liggende igjen i landskapet', summary: 'Skånevikmorenen er en lang rygg av løsmasser avsatt ved iskanten. Natur-rundingen kobler ryggform, breframrykk og den høye havstanden etter istiden.', themes: ['endemorene', 'Yngre Dryas', 'havstand', 'løsmasser', 'istidslandskap'], nearby_place_ids: ['bokeskogen_milja', 'skaneviksfjella', 'skanevik_sentrum'] },
    quiz_profile: { place_type: 'kvartaergeologisk_lokalitet', subtype: 'lang_endemorene_fra_yngre_dryas', signature_features: ['tydeligst mellom Miljaelva og Valdraelva', 'kan følges vestover fra Tjedla', 'knyttet til breframrykk og høyere havnivå'], primary_angles: ['morene', 'istid', 'havstand', 'landskapsdannelse'], question_families: ['endemorene', 'yngre_dryas', 'marin_grense', 'landskapslesning'], avoid_angles: ['framstille_ankeret_som_eksakt_grense', 'duplisere_bokeskogen_som_hovedtema'], must_include: ['at ryggen er en langstrakt landform', 'koblingen til Yngre Dryas'], contrast_targets: ['terrasselandskapet_etne', 'bokeskogen_milja'], notes: 'Markøren er semantisk og krever visuell QA. Bøkeskogen er et eget natursted selv om deler av den ligger på moreneryggen.' },
    externalLinks: [{ type: 'reference', label: 'Kringom – Skånevikmorenen', url: kringomSkanevikMoreneUrl, lang: 'nn', verifiedAt }, { type: 'official', label: 'Etne kommune – naturforvaltning', url: kommuneUrl, lang: 'nn', verifiedAt }],
    emne_ids: [],
    underbadge_ids: ['geologi', 'morene', 'istidsspor', 'marin_grense']
  },
  {
    id: 'sandvikevatnet_etne',
    name: 'Sandvikevatnet',
    ...coordFields('sandvikevatnet_etne', {
      r: 650,
      sourceDescription: 'offisielt stedsnavnspunkt for Sandvikevatnet i Mosnesvassdraget',
      coordNote: 'Representativt områdeanker for Sandvikevatnet som den største innsjøen i det vernede Mosnesvassdraget. Punktet markerer vannflaten, ikke et bestemt fiske-, ilandstignings- eller tilgangspunkt.'
    }),
    category: 'natur', fylke: 'vestland', kommune: 'Etne', year: 1993,
    period: 'Største innsjø i det vernede Mosnesvassdraget',
    tags: ['sandvikevatnet', 'mosnesvassdraget', 'innsjo', 'brevassdrag', 'skredskog', 'sandur'],
    desc: 'Den største innsjøen i Mosnesvassdraget. Omkring vannet finnes bratte dalsider, skredmateriale og skog, mens brevassdraget har lagt opp store løsmasser ved innløpet.',
    popupDesc: 'Sandvikevatnet er den største innsjøen i det vernede Mosnesvassdraget. NVE beskriver gråor- og heggeskog på skredmateriale i dalsiden ved vannet og en stor sandur ved innløpet, avsatt av den tidligere mer masseførende breelva. Innsjøen er derfor et godt sted for å forstå hvordan bre, elv, sedimenter, skred og vegetasjon virker sammen i ett vassdragssystem.',
    nature_profile: { type: 'innsjø / brevassdrag / skred- og sedimentlandskap', title: 'Innsjøen midt i Mosnesvassdraget', summary: 'Sandvikevatnet samler vann og sedimenter i et vernet brevassdrag. Natur-rundingen kobler vannflaten til sandur, skredmateriale og skog i dalsidene.', themes: ['innsjø', 'brevassdrag', 'sandur', 'skredmateriale', 'skog'], nearby_place_ids: ['mosneselva_etne', 'folgefonnanasjonalpark_etne', 'akrafjorden'] },
    quiz_profile: { place_type: 'innsjo', subtype: 'største_innsjo_i_vernet_brevassdrag', signature_features: ['største innsjø i Mosnesvassdraget', 'sandur ved innløpet', 'skog utviklet på skredmateriale i dalsiden'], primary_angles: ['innsjo', 'sedimenter', 'brevassdrag', 'vegetasjon'], question_families: ['innsjo_i_vassdrag', 'sandur', 'skredmateriale', 'brepåvirkning'], avoid_angles: ['generisk_fiskevann', 'påstå_tilgjengelighet_fra_markoren'], must_include: ['rollen som største innsjø i Mosnesvassdraget', 'sanduren ved innløpet'], contrast_targets: ['stordalsvatnet_etne', 'rullestadvatnet'], notes: 'Områdeanker for hele innsjøen. Ingen oppgaver skal kreve ferdsel i veiløst eller skredutsatt terreng.' },
    externalLinks: [{ type: 'official', label: 'NVE – 042/2 Mosneselva', url: nveMosnesUrl, lang: 'nb', verifiedAt }],
    emne_ids: ['em_natur_elver_bekker_vassdrag', 'em_natur_arter_habitat_mangfold', 'em_natur_vern_forvaltning_politikk'],
    underbadge_ids: ['innsjo', 'vann_og_vassdrag', 'skog', 'sedimenter', 'naturvern']
  },
  {
    id: 'taraldsoy',
    name: 'Taraldsøy',
    ...coordFields('taraldsoy', {
      r: 420,
      sourceDescription: 'offisielt/navngitt områdeanker for Taraldsøy på Skånevikstranda',
      coordNote: 'Representativt områdeanker for Taraldsøy som øy- og friluftsområde. Punktet er ikke en brygge, privat eiendomsgrense eller nøyaktig ferdselsanbefaling; radiusen dekker øya som natur- og rekreasjonssted.'
    }),
    category: 'natur', fylke: 'vestland', kommune: 'Etne', year: null,
    period: 'Tilrettelagt øy- og friluftsområde',
    tags: ['taraldsoy', 'skanevikstranda', 'oy', 'friluftsliv', 'fjord', 'batliv'],
    desc: 'Tilrettelagt øy- og friluftsområde på Skånevikstranda. Etne kommune framhever Taraldsøy som et godt turmål for båtfarende og et av kommunens viktigste låglandsområder for friluftsliv.',
    popupDesc: 'Taraldsøy er et selvstendig øy- og friluftsområde på Skånevikstranda. Kommunen beskriver øya som et godt tilrettelagt turmål for båtfarende, og området forvaltes som del av det regionale friluftstilbudet. Stedet er noe annet enn Brattholmen naturreservat ved Taraldsøy: denne markøren handler om selve øylandskapet og friluftsområdet, mens Brattholmen er et eget vernet fuglereservat.',
    nature_profile: { type: 'øy / kystnatur / friluftsområde', title: 'Øylandskapet på Skånevikstranda', summary: 'Taraldsøy kombinerer kystnatur og tilgjengelig friluftsliv. Natur-rundingen legger vekt på øya som landform, fjordkontakt og eget område, tydelig skilt fra Brattholmen-reservatet.', themes: ['øy', 'kyst og fjord', 'friluftsliv', 'båttilkomst', 'øylandskap'], nearby_place_ids: ['brattholmen_naturreservat_etne', 'skano_naturreservat_etne', 'skanevik_sentrum'] },
    quiz_profile: { place_type: 'oy_og_friluftsomrade', subtype: 'tilrettelagt_oy_pa_skanevikstranda', signature_features: ['selvstendig øy på Skånevikstranda', 'tilrettelagt turmål for båtfarende', 'må skilles fra Brattholmen naturreservat'], primary_angles: ['øylandskap', 'kystnatur', 'friluftsliv', 'stedsskille'], question_families: ['oy_og_fjord', 'friluftsomrade', 'naturreservat_kontrast', 'kystlandskap'], avoid_angles: ['blande_taraldsoy_og_brattholmen', 'påstå_fri_tilgang_til_private_områder'], must_include: ['at Taraldsøy er eget sted', 'forskjellen fra Brattholmen naturreservat'], contrast_targets: ['brattholmen_naturreservat_etne', 'skano_naturreservat_etne'], notes: 'Oppgaver må respektere sjøvær, privat grunn og lokal skilting.' },
    externalLinks: [{ type: 'official', label: 'Etne kommune – friluftsområde', url: friluftUrl, lang: 'nn', verifiedAt }],
    emne_ids: ['em_natur_arter_habitat_mangfold'],
    underbadge_ids: ['oy_og_halvoy', 'kyst_og_fjord', 'friluftsliv', 'rekreasjon']
  },
  {
    id: 'osnes_honsvikjo',
    name: 'Osnes–Honsvikjo',
    ...coordFields('osnes_honsvikjo', {
      r: 850,
      exact: false,
      sourceDescription: 'semantisk områdeanker for Olav Vik-området på Osnes og badeplassen Honsvikjo',
      coordNote: 'Semantisk områdeanker for det sammenhengende låglands- og friluftsområdet på Osnes, inkludert Honsvikjo og naturstien mot Borgåsen. Kartverket-ankeret representerer en navngitt del av området, ikke en maskinlesbar yttergrense for hele friluftsområdet; derfor beholdes markøren til manuell visuell QA.'
    }),
    category: 'natur', fylke: 'vestland', kommune: 'Etne', year: null,
    period: 'Tilrettelagt låglands- og kystfriluftsområde',
    tags: ['osnes', 'honsvikjo', 'friluftsliv', 'natursti', 'badeplass', 'kystnatur'],
    desc: 'Et av de mest tilrettelagte låglandsområdene i Etne, med Honsvikjo, kystnær natur og natursti fra Osnes mot Borgåsen.',
    popupDesc: 'Olav Vik-området på Osnes er blant de mest tilrettelagte friluftsområdene i Etne. Området omfatter blant annet badeplassen i Honsvikjo og en natursti som går videre mot Borgåsen. History Go-stedet representerer den sammenhengende natur- og friluftsopplevelsen i låglandet, ikke én enkelt badeplass eller hele Borgåsen som historisk sted.',
    nature_profile: { type: 'kystnært låglandsområde / natursti / friluftsliv', title: 'Nærnatur fra Honsvikjo mot Borgåsen', summary: 'Osnes–Honsvikjo viser hvordan kyst, strandsone og tilrettelagt natursti kan danne ett sammenhengende nærfriluftsområde. Natur-rundingen handler om overgangen mellom fjordkant og land.', themes: ['kystnatur', 'natursti', 'strandsone', 'rekreasjon', 'låglandsfriluftsliv'], nearby_place_ids: ['etnesjoen_tettstad', 'etneelva', 'terrasselandskapet_etne'] },
    quiz_profile: { place_type: 'friluftsomrade', subtype: 'kystnaert_laglandsomrade_med_natursti', signature_features: ['Olav Vik-området på Osnes', 'Honsvikjo som del av området', 'natursti mot Borgåsen'], primary_angles: ['nærnatur', 'kyst', 'friluftsliv', 'natursti'], question_families: ['friluftsomrade', 'strandsone', 'natursti', 'nærnatur'], avoid_angles: ['redusere_stedet_til_badeplass', 'gjore_borgasen_bygdeborg_til_naturstedets_hovedtema'], must_include: ['sammenhengen mellom Osnes og Honsvikjo', 'naturstien mot Borgåsen'], contrast_targets: ['taraldsoy', 'terrasselandskapet_etne'], notes: 'Markøren er semantisk for et større område og skal visuelt QA-kontrolleres. Bruk bare offentlige og tilrettelagte ferdselslinjer.' },
    externalLinks: [{ type: 'official', label: 'Etne kommune – friluftsområde', url: friluftUrl, lang: 'nn', verifiedAt }],
    emne_ids: ['em_natur_arter_habitat_mangfold'],
    underbadge_ids: ['kyst_og_fjord', 'strandsone', 'friluftsliv', 'tursti', 'rekreasjon']
  }
];

const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
if (!Array.isArray(manifest.files)) throw new Error('data/places/manifest.json is missing files[]');
const manifestSet = new Set(manifest.files);
const activeIds = new Map();
for (const rel of manifest.files) {
  const file = path.join(root, 'data', rel);
  let payload;
  try { payload = JSON.parse(await fs.readFile(file, 'utf8')); } catch { continue; }
  const rows = Array.isArray(payload) ? payload : Array.isArray(payload?.places) ? payload.places : [];
  for (const row of rows) if (row?.id) activeIds.set(String(row.id), rel);
}
for (const place of places) {
  if (activeIds.has(place.id)) throw new Error(`Refusing duplicate active place id ${place.id}; existing file ${activeIds.get(place.id)}`);
  const fileName = `${place.id}.json`;
  await writeJson(path.join(targetDir, fileName), [place]);
  const rel = `places/natur/vestland/etne/${fileName}`;
  if (!manifestSet.has(rel)) {
    manifest.files.push(rel);
    manifestSet.add(rel);
  }
}
await writeJson(manifestPath, manifest);

const summary = {
  batch: 'Etne nature batch 3',
  date: verifiedAt,
  addedPlaceIds: places.map((place) => place.id),
  coordinateStatus: Object.fromEntries(places.map((place) => [place.id, place.coordStatus])),
  coordinateSources: Object.fromEntries(places.map((place) => [place.id, { sourceProvider: place.sourceProvider, sourceObjectId: place.sourceObjectId, lat: place.lat, lon: place.lon }]))
};
await writeJson(path.join(reportDir, 'summary.json'), summary);
await fs.writeFile(path.join(reportDir, 'README.md'), `# Etne natur – batch 3\n\nDato: ${verifiedAt}\n\nLagt til sju natursteder:\n\n${places.map((place) => `- ${place.name} (\`${place.id}\`) – ${place.coordStatus}`).join('\n')}\n\nKoordinater er hentet fra Kartverket SSR eller eksplisitt dokumenterte semantiske områdeankre. Rå kildeoppslag ligger i \`reports/etne-natur-batch-3/sources/\`.\n`, 'utf8');
console.log(JSON.stringify(summary, null, 2));
`;

const tempPath = '/tmp/etne-natur-batch-3.mjs';
await fs.writeFile(tempPath, `${prefix}${body}`, 'utf8');
await import(`${pathToFileURL(tempPath).href}?run=${Date.now()}`);
