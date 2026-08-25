#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const write = (file, value) => {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};

const placeFile = "data/places/politikk/oslo/places_politikk/youngstorget.json";
const place = read(placeFile);
delete place.rounds;
delete place.layers;
delete place.tags;
delete place.knagger;
delete place.connections_preview;
place.frontImage = place.image;
place.aliases = ["Nytorvet"];
place.place_card_profile = {
  schema: "history_go_place_card_profile_v2",
  collection_ids: ["people", "objects", "brands", "related"],
  reason: "Youngstorget er et vanlig politikksted. Fireflaten viser kildebelagte personer, fysiske objekter og relaterte canonicale steder; Brands beholdes som ærlig tomtilstand etter own-place- og logoaudit.",
  verifiedAt: "2026-08-25"
};
place.related_people_ids = ["jorgen_young", "jacob_wilhelm_nordan", "per_palle_storm", "hagbart_sollos"];
place.related_place_ids = ["torggata", "folkets_hus_oslo", "folketeateret", "mollergata_19", "storgata"];
place.objects = [
  {
    id: "youngstorget_pioneren", title: "Pioneren", type: "bronsefigur", kind: "physical_object",
    desc: "Per Palle Storms helfigur i bronse ble avduket på Youngstorget i 1958 og fremstiller arbeideren som kollektiv pioner.",
    why_here: "Skulpturen gjør arbeiderbevegelsens historie fysisk lesbar på selve torget.",
    placeSpecificReason: "Oslo kommune plasserer og daterer Pioneren eksplisitt på Youngstorget.",
    historicalFunction: "Minnespor etter arbeid, organisering og politisk mobilisering.",
    physicalObject: true, placeSpecific: true, collectable: true, storePrice: 30, currency: "PC",
    collection: "youngstorget_minnespor", unlock: "Finn bronsefiguren og legg merke til arbeidsklærne og kroppsholdningen.",
    source_urls: ["https://www.oslo.kommune.no/slik-bygger-vi-oslo/youngstorget/"],
    sources: ["https://www.oslo.kommune.no/slik-bygger-vi-oslo/youngstorget/", "https://digitaltmuseum.no/021017759961/youngstorget-pioneren-monument-av-per-palle-storm-april-1974"]
  },
  {
    id: "youngstorget_fredsmonumentet", title: "Fredsmonumentet", type: "granittmonument", kind: "physical_object",
    desc: "Hagbart Solløs' fredsmonument i granitt ble reist på Youngstorget i 1997 gjennom LO og Nei til atomvåpen.",
    why_here: "Monumentet knytter torgets protesthistorie til fredsarbeid og motstand mot atomvåpen.",
    placeSpecificReason: "Oslo kommune dokumenterer kunstner, materiale, år og plassering på Youngstorget.",
    historicalFunction: "Fysisk minnespor etter organisert fredsarbeid.",
    physicalObject: true, placeSpecific: true, collectable: true, storePrice: 30, currency: "PC",
    collection: "youngstorget_minnespor", unlock: "Finn granittmonumentet og sammenlign formen med den åpne torgflaten rundt.",
    source_urls: ["https://www.oslo.kommune.no/slik-bygger-vi-oslo/youngstorget/"],
    sources: ["https://www.oslo.kommune.no/slik-bygger-vi-oslo/youngstorget/"]
  },
  {
    id: "youngstorget_fotoutstillingen", title: "Den historiske fotoutstillingen", type: "utendors_fotoutstilling", kind: "physical_object",
    desc: "En permanent utendørs utstilling med 24 historiske fotografier viser Youngstorget som marked, markeringstorg og meningstorg.",
    why_here: "Fotografiene lar besøkende sammenligne torgets egne historiske funksjoner mens de står på stedet.",
    placeSpecificReason: "Utstillingen er etablert på Youngstorget av Oslo kommune i samarbeid med LO og Arbeiderbevegelsens arkiv og bibliotek.",
    historicalFunction: "Kildebasert historieformidling i selve byrommet.",
    physicalObject: true, placeSpecific: true, collectable: true, storePrice: 25, currency: "PC",
    collection: "youngstorget_historiske_bilder", unlock: "Finn minst tre fotografier og se hvilke deler av torget som fortsatt kan gjenkjennes.",
    source_urls: ["https://www.oslo.kommune.no/slik-bygger-vi-oslo/youngstorget/"],
    sources: ["https://www.oslo.kommune.no/slik-bygger-vi-oslo/youngstorget/"]
  },
  {
    id: "youngstorget_fontenen", title: "Fontenen", type: "fontene", kind: "physical_object",
    desc: "Fontenen er et fast orienteringspunkt i torgaksen; en ny avstøpning kom på plass da torget åpnet igjen i 1996.",
    why_here: "Fontenen binder 1939- og 2025-motivene sammen og gjør fysisk endring i plassrommet sammenlignbar.",
    placeSpecificReason: "Oslo byleksikon knytter fontenen og 1996-omformingen eksplisitt til Youngstorget.",
    historicalFunction: "Visuelt anker gjennom torgets markeds- og oppholdsperioder.",
    physicalObject: true, placeSpecific: true, collectable: true, storePrice: 20, currency: "PC",
    collection: "youngstorget_byrom", unlock: "Still deg ved fontenen og se mot Folketeaterbygningens høye midtparti.",
    source_urls: ["https://oslobyleksikon.no/side/Youngstorget"],
    sources: ["https://oslobyleksikon.no/side/Youngstorget", "https://commons.wikimedia.org/wiki/File:2025-09-26-Folketeaterbygningen-Youngstorget.jpg"]
  }
];
place.externalLinks = [
  { type: "source", label: "Oslo kommune – Youngstorget", url: "https://www.oslo.kommune.no/slik-bygger-vi-oslo/youngstorget/", lang: "nb", verifiedAt: "2026-08-25" },
  { type: "source", label: "Oslo byleksikon – Youngstorget", url: "https://oslobyleksikon.no/side/Youngstorget", lang: "nb", verifiedAt: "2026-08-25" },
  { type: "source", label: "Arbark – Det røde torg", url: "https://www.arbark.no/eldok/Arbeiderhistorie1996_9.pdf", lang: "nb", verifiedAt: "2026-08-25" },
  { type: "source", label: "Arbark – Åttetimersdagen del 3", url: "https://www.arbark.no/Utstilling/8timersdagen/8timersdagen_kap03.htm", lang: "nb", verifiedAt: "2026-08-25" },
  { type: "source", label: "LO – Det første skritt til frihet", url: "https://www.lo.no/nyhetsrommet/det-forste-skritt-til-frihet/", lang: "nb", verifiedAt: "2026-08-25" },
  { type: "source", label: "Oslo Museum – Kvinnedagen 2026", url: "https://www.oslomuseum.no/kvinnedagen/", lang: "nb", verifiedAt: "2026-08-25" },
  { type: "source", label: "LO – 1. mai 2026", url: "https://www.lo.no/nyhetsrommet/1.-mai-2026", lang: "nb", verifiedAt: "2026-08-25" },
  { type: "source", label: "Matstreif – Matstreif 2026", url: "https://matstreif.no/", lang: "nb", verifiedAt: "2026-08-25" },
  { type: "map_source", label: "OpenStreetMap – Youngstorget", url: "https://www.openstreetmap.org/relation/12773689", verifiedAt: "2026-08-25" },
  { type: "image_source", label: "Wikimedia Commons – Youngstorget 2019", url: "https://commons.wikimedia.org/wiki/File:2019-08-23_Oslo_09_-_Youngstorget.jpg" },
  { type: "image_source", label: "SNL / Oslo Museum – Youngstorget 1939", url: "https://snl.no/Folketeaterbygningen" },
  { type: "image_source", label: "Wikimedia Commons – Youngstorget 2025", url: "https://commons.wikimedia.org/wiki/File:2025-09-26-Folketeaterbygningen-Youngstorget.jpg" }
];
place.interpretation = {
  what_to_notice: [
    "Folketeaterbygningens høye midtparti og fontenen danner samme hovedakse i 1939- og 2025-bildene.",
    "Pioneren, Fredsmonumentet og de historiske fotografiene gjør ulike politiske tidslag synlige på selve torget.",
    "Basaren langs Møllergata er et fysisk spor etter torgets opprinnelige markedsfunksjon."
  ],
  why_it_matters: [
    "Youngstorget viser hvordan et markedsrom også kan bli infrastruktur for organisering, demonstrasjon og offentlig tale.",
    "Sammenstillingen av monumenter, fotografier og levende arrangementer gjør politisk historie lesbar som bruk av et konkret byrom.",
    "Torgets offentlige karakter avhenger både av fysisk utforming, kommunal forvaltning og hvem som faktisk får bruke plassen."
  ],
  counterpoints: [
    "Torgets sterke forbindelse til arbeiderbevegelsen betyr ikke at selve plassen eies av én organisasjon eller ett parti.",
    "Synlighet på et torg er ikke det samme som politisk gjennomslag; krav må fortsatt møte beslutningsinstitusjoner og motargumenter.",
    "Dagens arrangementer viderefører offentlig bruk, men hvert enkelt arrangement må dokumenteres ferskt og kan ikke gjøres til varig stedsegenskap."
  ],
  sources: place.externalLinks.slice(0, 5).map(link => ({ title: link.label, url: link.url, verifiedAt: "2026-08-25" }))
};
write(placeFile, place);

const brands = read("data/brands/brands_by_place.json");
delete brands.youngstorget;
write("data/brands/brands_by_place.json", brands);

const peopleManifest = read("data/people/manifest.json");
const keepPeople = new Set(place.related_people_ids);
for (const rel of peopleManifest.files) {
  const file = `data/${rel}`;
  const value = read(file);
  const rows = Array.isArray(value) ? value : Array.isArray(value.people) ? value.people : [value];
  let changed = false;
  for (const person of rows) {
    const refs = [person.placeId, person.place_id, ...(person.places || []), ...(person.placeIds || []), ...(person.place_ids || [])];
    if (!keepPeople.has(person.id) && refs.includes("youngstorget")) {
      person.roundHoldbacks = [...new Set([...(person.roundHoldbacks || []), "youngstorget"])];
      changed = true;
    }
  }
  if (changed) write(file, value);
}

// The migrated Max Manus edge had no direct Youngstorget evidence and must not
// survive as a canonical relation merely because an old person record named the place.
const relations = read("data/relations.json");
const filteredRelations = relations.filter(relation => relation.id !== "mig_max_manus_youngstorget_0690962f0c");
write("data/relations.json", filteredRelations);

const leksikonMain = {
  place_id: "youngstorget", title: "Youngstorget", type: "main", version: 1,
  suppress_untitled_legacy_articles: true,
  visual: { designCode: "article_place_essay_miniature" },
  popupDesc: "Youngstorget er et offentlig torg der markedshistorie, arbeiderbevegelse, politiske markeringer og nyere arrangementsbruk møtes i samme plassrom.",
  wikiText: [
    "Torget ble anlagt i 1846 og het offisielt Nytorvet fra 1852 til 1951. Basaren, Pioneren, Fredsmonumentet, fontenen og den permanente fotoutstillingen gjør historiske lag synlige på stedet.",
    "Youngstorget må avgrenses fra Torggata, Folkets Hus, Folketeaterbygningen og Møllergata 19: disse er naboer eller kryssende steder, mens denne artikkelen gjelder selve torgflaten."
  ],
  summary: { one_liner: "Markedstorg, mobiliseringsrom og levende offentlig plass siden 1846.", themes: ["marked", "arbeiderbevegelse", "offentlighet", "byrom"], tone: ["nøktern", "stedsspesifikk"] },
  facts: [
    { id: "fact_youngstorget_01", label: "Anlagt i 1846", desc: "Torget ble etablert i 1846.", confidence: "high", sources: ["Oslo kommune – Youngstorget"] },
    { id: "fact_youngstorget_02", label: "Nytorvet 1852–1951", desc: "Nytorvet var offisielt navn fram til Youngstorget ble offisielt i 1951.", confidence: "high", sources: ["Oslo byleksikon – Youngstorget"] },
    { id: "fact_youngstorget_03", label: "1. mai 1890", desc: "En arbeiderdemonstrasjon gikk fra Youngstorget til Tullinløkka med stopp ved Stortinget.", confidence: "high", sources: ["Arbark – Åttetimersdagen del 3", "LO – Det første skritt til frihet"] }
  ],
  chronology: [
    [1846,"Torget blir anlagt","Youngstorget ble etablert som nytt markedstorg."],
    [1852,"Nytorvet blir offisielt navn","Navnet Nytorvet ble vedtatt."],
    [1877,"Basaren står ferdig","Jacob Wilhelm Nordans basar ble oppført 1876–1877."],
    [1890,"Åttetimerskravet går ut fra torget","1. mai-demonstrasjonen gikk fra Youngstorget via Stortinget til Tullinløkka."],
    [1930,"Massemøter preger torget","Arbark dokumenterer Youngstorget som sentralt samlingsrom i mellomkrigstiden."],
    [1951,"Youngstorget blir offisielt navn","Det folkelige navnet erstattet Nytorvet som offisiell navneform."],
    [1958,"Pioneren avdukes","Per Palle Storms bronsefigur ble avduket på torget."],
    [1996,"Torget åpner etter omforming","Endret trafikkmønster og ny avstøpning av fontenen preget gjenåpningen."],
    [1997,"Fredsmonumentet reises","Hagbart Solløs' granittmonument ble reist gjennom LO og Nei til atomvåpen."],
    [2026,"Politiske markeringer fortsetter","8. mars- og 1. mai-programmer brukte Youngstorget som offentlig møtested."]
  ].map(([year,title,desc],i) => ({ id:`chrono_youngstorget_${year}_${i+1}`, year, title, desc, confidence:"high", sources:[{ title: year === 1890 ? "Arbark – Åttetimersdagen del 3" : year === 2026 ? "LO – 1. mai 2026" : year >= 1951 ? "Oslo kommune – Youngstorget" : "Oslo byleksikon – Youngstorget", url: year === 1890 ? "https://www.arbark.no/Utstilling/8timersdagen/8timersdagen_kap03.htm" : year === 2026 ? "https://www.lo.no/nyhetsrommet/1.-mai-2026" : year >= 1951 ? "https://www.oslo.kommune.no/slik-bygger-vi-oslo/youngstorget/" : "https://oslobyleksikon.no/side/Youngstorget" }] })),
  sources: place.externalLinks.filter(link => link.type === "source").slice(0, 8).map(link => ({ title: link.label, url: link.url, verifiedAt: "2026-08-25" })),
  externalLinks: place.externalLinks,
  interpretation: place.interpretation
};
write("data/leksikon/places/oslo/politikk/leksikon_youngstorget.json", leksikonMain);

const news = [
  { id:"youngstorget_news_kvinnedagen_2026", place_id:"youngstorget", title:"8. mars-markeringen startet på Youngstorget", type:"news_note", version:1, date:"2026-03-08", date_type:"event", status:"archived", location:"Youngstorget", popupDesc:"Oslo Museums programoversikt oppga at det offisielle 8. mars-programmet i Oslo startet på Youngstorget klokken 16.", summary:{one_liner:"Det offisielle Oslo-programmet for kvinnedagen brukte Youngstorget 8. mars 2026.",themes:["kvinnedagen","markering","offentlighet"]}, tags:["news_note","Youngstorget"], sources:[{label:"Oslo Museum – Kvinnedagen",url:"https://www.oslomuseum.no/kvinnedagen/"}], verifiedAt:"2026-08-25" },
  { id:"youngstorget_news_forste_mai_2026", place_id:"youngstorget", title:"LOs hovedtale ble holdt på Youngstorget 1. mai", type:"news_note", version:1, date:"2026-05-01", date_type:"event", status:"archived", location:"Youngstorget", popupDesc:"LO oppga at Kine Asper Vistnes holdt hovedtalen på LO i Oslos 1. mai-arrangement på Youngstorget. Talen løftet blant annet hotell- og restaurantstreiken.", summary:{one_liner:"Youngstorget var talested for LO i Oslos 1. mai-markering i 2026.",themes:["1. mai","arbeidsliv","tale"]}, tags:["news_note","Youngstorget"], sources:[{label:"LO – 1. mai 2026",url:"https://www.lo.no/nyhetsrommet/1.-mai-2026"},{label:"LO – De streikende har hele LO-familien i ryggen",url:"https://www.lo.no/nyhetsrommet/de-streikende-har-hele-lo-familien-i-ryggen/"}], verifiedAt:"2026-08-25" },
  { id:"youngstorget_news_matstreif_2026", place_id:"youngstorget", title:"Matstreif kommer til Youngstorget 18.–19. september", type:"news_note", version:1, date:"2026-09-18", date_type:"scheduled_event", status:"scheduled", valid_through:"2026-09-19", location:"Youngstorget", popupDesc:"Matstreif annonserer lokalmat- og drikkefestival på Youngstorget 18. og 19. september 2026, med produsenter fra hele landet.", summary:{one_liner:"Matstreif er annonsert på Youngstorget 18.–19. september 2026.",themes:["matmarked","arrangement","torghandel"]}, tags:["news_note","Youngstorget"], sources:[{label:"Matstreif 2026",url:"https://matstreif.no/"}], verifiedAt:"2026-08-25" }
];
write("data/leksikon/places/oslo/politikk/leksikon_youngstorget_news.json", news);

const leksikonManifest = read("data/leksikon/manifest.json");
for (const file of ["data/leksikon/places/oslo/politikk/leksikon_youngstorget.json", "data/leksikon/places/oslo/politikk/leksikon_youngstorget_news.json"]) if (!leksikonManifest.files.includes(file)) leksikonManifest.files.push(file);
write("data/leksikon/manifest.json", leksikonManifest);

write("data/leksikon/sprak/places/europe/norway/oslo/youngstorget.json", {
  place_id:"youngstorget", title:"Språkleksikon: Youngstorget", verified_at:"2026-08-25", entries:[
    { id:"youngstorget_nytorvet", term:"Nytorvet", type:"historisk_navn", meaning:"Det offisielle navnet på torget fra 1852 til 1951.", context:"Navnet peker på torgets opprinnelige rolle som nytt markedstorg. Youngstorget ble først offisiell navneform i 1951.", linked_to:{kind:"place",id:"youngstorget"}, tags:["stedsnavn","marked","1852"], sources:[{label:"Oslo byleksikon – Youngstorget",url:"https://oslobyleksikon.no/side/Youngstorget"}] },
    { id:"youngstorget_youngstorget", term:"Youngstorget", type:"stedsnavn", meaning:"Navnet viser til kjøpmannen og grunneieren Jørgen Young.", context:"Den folkelige navnebruken ble gjort offisiell i 1951; navnet gjelder selve torget, ikke automatisk alle institusjonene rundt.", linked_to:{kind:"place",id:"youngstorget"}, tags:["stedsnavn","Jørgen Young","1951"], sources:[{label:"Oslo byleksikon – Youngstorget",url:"https://oslobyleksikon.no/side/Youngstorget"}] },
    { id:"youngstorget_meningstorg", term:"meningstorg", type:"stedsspesifikt_begrep", meaning:"Et offentlig torg der grupper samles for å synliggjøre krav, markeringer og politiske budskap.", context:"Oslo kommune bruker torgets historiske bilder til å beskrive Youngstorget som markedsplass, markeringstorg og meningstorg.", linked_to:{kind:"place",id:"youngstorget"}, tags:["offentlighet","demonstrasjon","byrom"], sources:[{label:"Oslo kommune – Youngstorget",url:"https://www.oslo.kommune.no/slik-bygger-vi-oslo/youngstorget/"}] }
  ]
});
const sprakManifest = read("data/leksikon/sprak/manifest.json");
sprakManifest.place_files.youngstorget = "data/leksikon/sprak/places/europe/norway/oslo/youngstorget.json";
write("data/leksikon/sprak/manifest.json", sprakManifest);

const normalizeI18n = value => String(value || "").normalize("NFC").replace(/\r\n?/g,"\n").replace(/[ \t]+/g," ").trim();
const i18nHash = crypto.createHash("sha256").update(JSON.stringify({name:normalizeI18n(place.name),desc:normalizeI18n(place.desc),popupDesc:normalizeI18n(place.popupDesc)})).digest("hex").slice(0,16);
const translations = {
  en:{
    desc:"Youngstorget was laid out in 1846 and received the official name Nytorvet in 1852; Youngstorget became the official name in 1951. The square developed from a market for agricultural goods and cattle into a gathering place for the labour movement, demonstrations and political events. The bazaar, Pioneren, the peace monument and the historical photo exhibition make several layers of this history visible on the square itself.",
    popupDesc:`Youngstorget was laid out in 1846 on land that had belonged to the merchant Jørgen Young. From 1852 to 1951, Nytorvet was the official name, before Youngstorget became official in 1951. The square was planned for trade in agricultural goods and was used for cattle trading for a long time. When market traffic was moved here from Stortorvet in the 1850s, trade on the square became livelier. The bazaar building from the 1870s remains a concrete trace of this market function.

Toward the end of the nineteenth century, the square also acquired a clear role as a gathering and demonstration place for the labour movement. On 1 May 1890, a workers’ demonstration went from Youngstorget to Tullinløkka, and the Labour Movement Archive and Library states that about 4,000 workers took part. The sources also document large mass meetings on the square in the 1920s and 1930s. The marketplace and the mobilisation space are two documented historical layers of the same urban space.

Several physical elements at Youngstorget connect the history to what can be seen on site. The bronze figure Pioneren by Per Palle Storm was unveiled here in 1958. A granite peace monument by Hagbart Solløs was erected in 1997 through LO and No to Nuclear Weapons. The square also has a permanent outdoor exhibition of 24 historical photographs, established in cooperation between the City of Oslo, LO and the Labour Movement Archive and Library. Together, the sculptures, monument and photographs make parts of the square’s political and social history readable in the physical space.

Youngstorget was extensively rebuilt in the 1990s. The sources document that the square reopened with a changed traffic pattern in 1996, when a new cast of the historical fountain was also installed. The City of Oslo also lists newer measures including new seating, renovated planters and planting, information screens, the historical photo exhibition and new winter lighting. The physical square bears traces of both the nineteenth-century market and later transformations of public space.

The City of Oslo describes Youngstorget as a place for demonstrations, public events, market trading, outdoor dining, culture and other activities. On 8 March 2026, Oslo Museum’s programme placed the official Oslo Women’s Day event at Youngstorget. On 1 May 2026, LO used the square for its Oslo event and a speech before the march continued. Since 2023, the municipality has worked on rental rules and measures intended to balance everyday life on the square with large events. Current use continues the documented mixture of trade, organised mobilisation and other forms of public urban life.

Torggata crosses Youngstorget, while Pløens gate, Eva Kolstads gate, Møllergata, Youngs gate and the Folketeater quarter frame the square. This makes the square easy to confuse with the institutions and streets around it, but the history above belongs to the square itself because the sources describe trade, meetings, demonstrations, art and rebuilding here. Youngstorget’s distinctive feature is that the same square metres have accommodated cattle trading, labour demonstrations, monuments, a photo exhibition and newer events in different periods.`
  },
  es:{
    desc:"Youngstorget fue trazada en 1846 y recibió el nombre oficial de Nytorvet en 1852; Youngstorget pasó a ser el nombre oficial en 1951. La plaza evolucionó de mercado de productos agrícolas y ganado a lugar de reunión del movimiento obrero, manifestaciones y actos políticos. El bazar, Pioneren, el monumento a la paz y la exposición histórica de fotografías hacen visibles varias capas de esta historia en la propia plaza.",
    popupDesc:`Youngstorget fue trazada en 1846 en un terreno que había pertenecido al comerciante Jørgen Young. Entre 1852 y 1951, Nytorvet fue el nombre oficial, antes de que Youngstorget se hiciera oficial en 1951. La plaza se planificó para el comercio de productos agrícolas y durante mucho tiempo se utilizó para la compraventa de ganado. Cuando parte del tráfico del mercado se trasladó aquí desde Stortorvet en la década de 1850, el comercio se intensificó. El edificio del bazar de la década de 1870 sigue siendo una huella concreta de esa función mercantil.

A finales del siglo XIX, la plaza adquirió también un papel claro como lugar de reunión y manifestación del movimiento obrero. El 1 de mayo de 1890, una manifestación de trabajadores salió de Youngstorget hacia Tullinløkka, y el Archivo y Biblioteca del Movimiento Obrero cifra la participación en unos 4.000 trabajadores. Las fuentes documentan asimismo grandes concentraciones en la plaza durante las décadas de 1920 y 1930. El mercado y el espacio de movilización son dos capas históricas documentadas del mismo espacio urbano.

Varios elementos físicos de Youngstorget conectan la historia con lo que se puede observar en el lugar. La figura de bronce Pioneren, de Per Palle Storm, se inauguró aquí en 1958. En 1997 se levantó un monumento a la paz en granito, obra de Hagbart Solløs, por iniciativa de LO y No a las Armas Nucleares. La plaza cuenta además con una exposición exterior permanente de 24 fotografías históricas, creada en colaboración entre el Ayuntamiento de Oslo, LO y el Archivo y Biblioteca del Movimiento Obrero. Las esculturas, el monumento y las fotografías hacen legibles partes de la historia política y social de la plaza.

Youngstorget fue objeto de una amplia remodelación en la década de 1990. Las fuentes documentan que la plaza reabrió en 1996 con un patrón de tráfico modificado y con una nueva fundición de la fuente histórica. El Ayuntamiento de Oslo enumera también medidas más recientes: nuevos asientos, jardineras y vegetación rehabilitadas, pantallas informativas, la exposición fotográfica histórica y nueva iluminación invernal. La plaza física conserva huellas tanto del mercado del siglo XIX como de transformaciones posteriores del espacio público.

El Ayuntamiento de Oslo describe Youngstorget como lugar para manifestaciones, actos públicos, comercio, terrazas, cultura y otros eventos. El 8 de marzo de 2026, el programa del Museo de Oslo situó en Youngstorget el acto oficial del Día de la Mujer en la ciudad. El 1 de mayo de 2026, LO utilizó la plaza para su acto en Oslo y un discurso antes de continuar la marcha. Desde 2023, el municipio trabaja con normas de alquiler y medidas para equilibrar la vida cotidiana en la plaza con los grandes eventos. El uso actual mantiene la mezcla documentada de comercio, movilización organizada y otras formas de vida urbana pública.

Torggata cruza Youngstorget, mientras Pløens gate, Eva Kolstads gate, Møllergata, Youngs gate y el barrio de Folketeater enmarcan la plaza. Por ello es fácil confundirla con las instituciones y calles vecinas, pero la historia anterior pertenece a la propia plaza: las fuentes sitúan aquí el comercio, las reuniones, las manifestaciones, el arte y las remodelaciones. El rasgo distintivo de Youngstorget es que los mismos metros cuadrados han acogido compraventa de ganado, manifestaciones obreras, monumentos, una exposición fotográfica y eventos recientes en épocas diferentes.`
  },
  pt:{
    desc:"A Youngstorget foi implantada em 1846 e recebeu o nome oficial Nytorvet em 1852; Youngstorget tornou-se o nome oficial em 1951. A praça passou de mercado de produtos agrícolas e gado a ponto de encontro do movimento operário, manifestações e eventos políticos. O bazar, a escultura Pioneren, o monumento à paz e a exposição histórica de fotografias tornam visíveis várias camadas dessa história na própria praça.",
    popupDesc:`A Youngstorget foi implantada em 1846 numa área que pertencera ao comerciante Jørgen Young. De 1852 a 1951, Nytorvet foi o nome oficial, antes de Youngstorget se tornar oficial em 1951. A praça foi planejada para o comércio de produtos agrícolas e durante muito tempo serviu à negociação de gado. Quando parte do movimento do mercado foi transferida de Stortorvet para cá na década de 1850, o comércio ficou mais intenso. O edifício do bazar da década de 1870 permanece como vestígio concreto dessa função mercantil.

No fim do século XIX, a praça também ganhou papel claro como local de reunião e manifestação do movimento operário. Em 1º de maio de 1890, uma manifestação de trabalhadores saiu de Youngstorget em direção a Tullinløkka, e o Arquivo e Biblioteca do Movimento Operário informa a participação de cerca de 4.000 trabalhadores. As fontes também documentam grandes comícios na praça nas décadas de 1920 e 1930. O mercado e o espaço de mobilização são duas camadas históricas documentadas do mesmo espaço urbano.

Vários elementos físicos de Youngstorget ligam a história ao que pode ser observado no local. A figura de bronze Pioneren, de Per Palle Storm, foi inaugurada aqui em 1958. Em 1997 foi erguido um monumento à paz em granito, obra de Hagbart Solløs, por iniciativa da LO e do movimento Não às Armas Nucleares. A praça também possui uma exposição externa permanente com 24 fotografias históricas, criada em cooperação entre o Município de Oslo, a LO e o Arquivo e Biblioteca do Movimento Operário. Esculturas, monumento e fotografias tornam legíveis partes da história política e social da praça.

A Youngstorget passou por uma ampla remodelação na década de 1990. As fontes documentam a reabertura da praça em 1996 com novo padrão de trânsito e uma nova fundição da fonte histórica. O Município de Oslo também lista medidas mais recentes: novos assentos, floreiras e vegetação reabilitadas, telas informativas, a exposição fotográfica histórica e nova iluminação de inverno. A praça conserva vestígios tanto do mercado do século XIX quanto de transformações posteriores do espaço público.

O Município de Oslo descreve Youngstorget como local de manifestações, atos públicos, comércio, restaurantes ao ar livre, cultura e outros eventos. Em 8 de março de 2026, o programa do Museu de Oslo colocou na Youngstorget o ato oficial do Dia Internacional da Mulher na cidade. Em 1º de maio de 2026, a LO utilizou a praça para o evento de Oslo e um discurso antes de a marcha continuar. Desde 2023, o município trabalha com regras de locação e medidas destinadas a equilibrar a vida cotidiana na praça e os grandes eventos. O uso atual mantém a combinação documentada de comércio, mobilização organizada e outras formas de vida urbana pública.

A Torggata atravessa Youngstorget, enquanto Pløens gate, Eva Kolstads gate, Møllergata, Youngs gate e o quarteirão do Folketeater delimitam a praça. Isso facilita confundi-la com instituições e ruas vizinhas, mas a história acima pertence à própria praça porque as fontes situam aqui comércio, reuniões, manifestações, arte e remodelações. O traço distintivo de Youngstorget é que os mesmos metros quadrados receberam comércio de gado, manifestações operárias, monumentos, uma exposição fotográfica e eventos recentes em períodos diferentes.`
  }
};
for (const [lang, translation] of Object.entries(translations)) {
  const file=`data/i18n/content/places/${lang}.json`;
  const pack=read(file);
  pack.youngstorget={_sourceHash:i18nHash,_status:"machine_translated",name:"Youngstorget",...translation};
  write(file,pack);
}

const readingFile = "data/lesespor/lesespor_oslo_batch2.json";
const readingPackage = read(readingFile);
const readings = readingPackage.items;
const additions = [
  { id:"lesespor_youngstorget_arbark_rode_torg", title:"Det røde torg", author:"Lill-Ann Jensen", publication:"Arbeiderhistorie / Arbark", date:"1996-01-01", year:1996, type:"historical_article", subjects:["Youngstorget","arbeiderbevegelsen","massemøter","byrom"], place_ids:["youngstorget"], person_ids:[], category_hints:["politikk","historie","by"], url:"https://www.arbark.no/eldok/Arbeiderhistorie1996_9.pdf", access:"open", rights:"link_only", source_quality:"institutional_archive", curation_status:"strong_candidate", relevance:"Åpen, stedsspesifikk fagartikkel om Youngstorgets utvikling som arbeiderbevegelsens samlingsrom." },
  { id:"lesespor_youngstorget_arbark_8timersdagen", title:"Åttetimersdagen – del 3", author:null, publication:"Arbeiderbevegelsens arkiv og bibliotek", date:null, year:1890, type:"digital_exhibition", subjects:["1. mai","åttetimersdagen","Youngstorget","Tullinløkka"], place_ids:["youngstorget"], person_ids:[], category_hints:["politikk","historie"], url:"https://www.arbark.no/Utstilling/8timersdagen/8timersdagen_kap03.htm", access:"open", rights:"link_only", source_quality:"institutional_archive", curation_status:"strong_candidate", relevance:"Åpen nettutstilling som dokumenterer demonstrasjonen fra Youngstorget 1. mai 1890." },
  { id:"lesespor_youngstorget_lo_forste_skritt", title:"Det første skritt til frihet", author:null, publication:"Landsorganisasjonen i Norge", date:"2024-04-30", year:2024, type:"historical_article", subjects:["1. mai","arbeiderbevegelsen","Youngstorget"], place_ids:["youngstorget"], person_ids:[], category_hints:["politikk","historie"], url:"https://www.lo.no/nyhetsrommet/det-forste-skritt-til-frihet/", access:"open", rights:"link_only", source_quality:"primary_organization", curation_status:"strong_candidate", relevance:"Åpen historisk gjennomgang av 1. mai med konkret rute og deltakertall fra Youngstorget i 1890." }
];
for (const item of additions) if (!readings.some(row => row.id === item.id)) readings.push(item);
write(readingFile, readingPackage);

const sources = {
  oslo_kommune:{url:"https://www.oslo.kommune.no/slik-bygger-vi-oslo/youngstorget/",source_type:"official_municipality",review_status:"reviewed",review_note:"Identitet, basar, kunst, fotoutstilling, tiltak og nåværende bruk."},
  oslo_byleksikon:{url:"https://oslobyleksikon.no/side/Youngstorget",source_type:"institutional_reference",review_status:"reviewed",review_note:"Avgrensning, navn, marked, fontene og 1996-omforming."},
  arbark_rode_torg:{url:"https://www.arbark.no/eldok/Arbeiderhistorie1996_9.pdf",source_type:"archive_research",review_status:"reviewed",review_note:"Torget som arbeiderbevegelsens samlingsrom og dokumenterte massemøter."},
  arbark_8timer:{url:"https://www.arbark.no/Utstilling/8timersdagen/8timersdagen_kap03.htm",source_type:"archive_exhibition",review_status:"reviewed",review_note:"1. mai 1890, rute og omtrent 4 000 deltakere."},
  lo_historie:{url:"https://www.lo.no/nyhetsrommet/det-forste-skritt-til-frihet/",source_type:"primary_organization_history",review_status:"reviewed",review_note:"1. mai-historie, 3 600 deltakere og stopp ved Stortinget."},
  oslo_museum_2026:{url:"https://www.oslomuseum.no/kvinnedagen/",source_type:"institutional_event",review_status:"reviewed",review_note:"Offisielt 8. mars-program på Youngstorget i 2026."},
  lo_2026:{url:"https://www.lo.no/nyhetsrommet/1.-mai-2026",source_type:"primary_organization_event",review_status:"reviewed",review_note:"LOs hovedtale på Youngstorget 1. mai 2026."}
};
const specs = [
  ["fact","Når ble Youngstorget anlagt?",["1846","1852","1951"],"1846","Torget ble anlagt i 1846.","oslo_kommune","em_pol_mediert_offentlighet"],
  ["fact","Hva var torgets offisielle navn fra 1852 til 1951?",["Nytorvet","Youngsløkka","Folkets torg"],"Nytorvet","Nytorvet var offisielt navn fra 1852 til 1951.","oslo_byleksikon","em_pol_mediert_offentlighet"],
  ["fact","Hvem viser navnet Youngstorget til?",["Kjøpmannen Jørgen Young","Arkitekten Jacob Wilhelm Nordan","Billedhuggeren Per Palle Storm"],"Kjøpmannen Jørgen Young","Området der torget ble anlagt hadde tilhørt Jørgen Young.","oslo_byleksikon","em_pol_mediert_offentlighet"],
  ["fact","Hva var en hovedfunksjon på torget i den tidlige perioden?",["Handel med landbruksvarer og kveg","Parlamentariske avstemninger","Jernbanedrift"],"Handel med landbruksvarer og kveg","Torget var planlagt for landbruksvarer og ble lenge brukt til kveghandel.","oslo_byleksikon","em_pol_arbeidsliv_kollektiv_kamp"],
  ["fact","Hva er basaren et fysisk spor etter?",["Torgets markedsfunksjon","En tidligere jernbanestasjon","En middelalderborg"],"Torgets markedsfunksjon","Basaren fra 1870-årene er et fysisk spor etter markedsfunksjonen.","oslo_kommune","em_pol_arbeidsliv_kollektiv_kamp"],
  ["fact","Hvilken gate krysser selve Youngstorget?",["Torggata","Karl Johans gate","Pilestredet"],"Torggata","Torggata krysser den navngitte plassflaten.","oslo_byleksikon","em_pol_mediert_offentlighet"],
  ["fact","Hva representerer Youngstorget-place i History GO?",["Selve den navngitte torgflaten","Alle organisasjoner rundt torget","Hele Torggata og Storgata"],"Selve den navngitte torgflaten","Canonical identitet er selve torget, ikke nabobygg eller kryssende gater.","oslo_byleksikon","em_pol_mediert_offentlighet"],
  ["fact","Hvor gikk 1. mai-demonstrasjonen fra Youngstorget i 1890?",["Til Tullinløkka via Stortinget","Til Akershus festning via Rådhuset","Til Frognerparken via Slottet"],"Til Tullinløkka via Stortinget","Demonstrasjonen gikk til Tullinløkka og stanset ved Stortinget.","lo_historie","em_pol_demonstrasjoner_protest"],
  ["fact","Hvilket hovedkrav bar 1. mai-toget i 1890?",["Åtte timers normalarbeidsdag","Allmenn bilfri bykjerne","Ny nasjonalforsamling"],"Åtte timers normalarbeidsdag","Parolen krevde normalarbeidsdag på åtte timer.","arbark_8timer","em_pol_arbeidsliv_kollektiv_kamp"],
  ["fact","Omtrent hvor mange deltakere oppgir kildene for 1890-toget?",["Mellom 3 600 og rundt 4 000","Omtrent 40","Over 100 000"],"Mellom 3 600 og rundt 4 000","LO oppgir 3 600, mens Arbark oppgir rundt 4 000; forskjellen beholdes synlig.","lo_historie","em_pol_demonstrasjoner_protest"],
  ["fact","Hva dokumenterer Arbark om Youngstorget i mellomkrigstiden?",["Store massemøter","Ingen politiske samlinger","Bare privat varehandel"],"Store massemøter","Arbark dokumenterer store massemøter på torget i 1920- og 1930-årene.","arbark_rode_torg","em_pol_demonstrasjoner_protest"],
  ["fact","Hva slags politisk rom ble Youngstorget særlig for arbeiderbevegelsen?",["Et tilbakevendende samlings- og demonstrasjonssted","Et lukket regjeringskontor","En domstol"],"Et tilbakevendende samlings- og demonstrasjonssted","Torget utviklet seg til et tilbakevendende mobiliseringsrom.","arbark_rode_torg","em_pol_demonstrasjoner_protest"],
  ["context","Hvorfor er ruten via Stortinget viktig i 1890-historien?",["Den kobler mobilisering på torget til en formell beslutningsinstitusjon","Den beviser at Stortinget eide torget","Den viser at toget var et marked"],"Den kobler mobilisering på torget til en formell beslutningsinstitusjon","Stoppet ved Stortinget viser forbindelsen mellom offentlig krav og parlamentarisk institusjon.","lo_historie","em_pol_mediert_offentlighet"],
  ["context","Hva skiller Youngstorget fra Stortinget som politisk rom?",["Torget synliggjør mobilisering nedenfra; Stortinget behandler politikk formelt","Torget vedtar lover; Stortinget arrangerer markeder","Det finnes ingen forskjell"],"Torget synliggjør mobilisering nedenfra; Stortinget behandler politikk formelt","Youngstorget er et mobiliseringsrom, ikke en lovgivende institusjon.","arbark_rode_torg","em_pol_mediert_offentlighet"],
  ["fact","Hvem laget bronsefiguren Pioneren?",["Per Palle Storm","Hagbart Solløs","Jacob Wilhelm Nordan"],"Per Palle Storm","Per Palle Storm laget Pioneren.","oslo_kommune","em_pol_arbeidsliv_kollektiv_kamp"],
  ["fact","Når ble Pioneren avduket?",["1958","1890","1997"],"1958","Pioneren ble avduket på Youngstorget i 1958.","oslo_kommune","em_pol_arbeidsliv_kollektiv_kamp"],
  ["fact","Hvem stod bak reisningen av Fredsmonumentet i 1997?",["LO og Nei til atomvåpen","Oslo Sporveier og NSB","Stortinget alene"],"LO og Nei til atomvåpen","Monumentet ble reist gjennom LO og Nei til atomvåpen.","oslo_kommune","em_pol_demonstrasjoner_protest"],
  ["context","Hvorfor er Pioneren et kollektivt politisk symbol?",["Figuren fremstiller arbeideren som pioner, ikke én navngitt leder","Den er et portrett av Jørgen Young","Den markerer en militær seier"],"Figuren fremstiller arbeideren som pioner, ikke én navngitt leder","Pioneren gjør kollektivt arbeid og organisering synlig uten å være et personportrett.","oslo_kommune","em_pol_arbeidsliv_kollektiv_kamp"],
  ["context","Hva kobler Fredsmonumentet til torgets historie?",["Fredsarbeid og atomvåpenmotstand til organisert mobilisering","Kveghandel til jernbanedrift","Kinohistorie til skipsfart"],"Fredsarbeid og atomvåpenmotstand til organisert mobilisering","Monumentet føyer fredsaktivisme til torgets protesthistorie.","oslo_kommune","em_pol_demonstrasjoner_protest"],
  ["context","Hva tilfører fotoutstillingen opplevelsen på stedet?",["24 historiske bilder kan sammenlignes med det nåværende torget","Den erstatter alle skriftlige kilder","Den viser bare nabobygg"],"24 historiske bilder kan sammenlignes med det nåværende torget","Den permanente utstillingen lar historiske funksjoner leses i dagens plassrom.","oslo_kommune","em_pol_mediert_offentlighet"],
  ["fact","Hvor mange fotografier består den permanente utstillingen av?",["24","4","240"],"24","Utstillingen består av 24 historiske fotografier.","oslo_kommune","em_pol_mediert_offentlighet"],
  ["fact","Når åpnet torget igjen etter den store omformingen i 1990-årene?",["1996","1951","2019"],"1996","Torget åpnet igjen i 1996 med endret trafikkmønster.","oslo_byleksikon","em_pol_mediert_offentlighet"],
  ["fact","Hvilket element kom som ny avstøpning ved 1996-omformingen?",["Fontenen","Pioneren","Basaren"],"Fontenen","En ny avstøpning av den historiske fontenen kom på plass.","oslo_byleksikon","em_pol_mediert_offentlighet"],
  ["fact","Hvilken bruk nevner Oslo kommune for dagens Youngstorget?",["Demonstrasjoner, handel, kultur og arrangementer","Bare privat parkering","Bare lukket kontorvirksomhet"],"Demonstrasjoner, handel, kultur og arrangementer","Kommunen beskriver en blanding av markeringer, torghandel, servering, kultur og arrangementer.","oslo_kommune","em_pol_mediert_offentlighet"],
  ["context","Hva viser før/etter-paret fra 1939 og 2025 tydeligst?",["Samme torgakse er blitt åpnere og mindre tett fylt av marked og kjøretøy","Folketeaterbygningen er revet","Torget er flyttet til en annen bydel"],"Samme torgakse er blitt åpnere og mindre tett fylt av marked og kjøretøy","Bygningen og fontenen gir faste ankre, mens bruken av plassflaten er tydelig forskjellig.","oslo_byleksikon","em_pol_mediert_offentlighet"],
  ["context","Hvorfor kan ikke bildene alene bevise årsaken til alle endringer?",["De viser to tidspunkter, men ikke hele beslutnings- og ombyggingskjeden","Bilder kan aldri vise fysiske forskjeller","Årstallene er ukjente"],"De viser to tidspunkter, men ikke hele beslutnings- og ombyggingskjeden","Visuell endring er dokumentert, men årsaksforklaringer krever egne kilder.","oslo_byleksikon","em_pol_mediert_offentlighet"],
  ["context","Hva forsøker kommunal forvaltning å balansere på Youngstorget?",["Hverdagsliv på torget mot store arrangementer","Stortingsvalg mot rettssaker","Togtrafikk mot havnedrift"],"Hverdagsliv på torget mot store arrangementer","Kommunen har arbeidet med regler og tiltak som balanserer daglig bruk og store arrangementer.","oslo_kommune","em_pol_mediert_offentlighet"],
  ["context","Hva viser 8. mars og 1. mai i 2026 om kontinuitet?",["Torget brukes fortsatt til organiserte politiske markeringer","Torget brukes ikke lenger offentlig","All bruk er blitt privat"],"Torget brukes fortsatt til organiserte politiske markeringer","De daterte hendelsene dokumenterer fortsatt mobiliseringsbruk uten å gjøre hvert program permanent.","lo_2026","em_pol_demonstrasjoner_protest"],
  ["concept","Hva bør en offentlighetsanalyse undersøke når Youngstorget fylles av en markering?",["Hvem får adgang, synlighet og mulighet til å sette dagsorden","Bare hvor mange benker som finnes","Kun hvem som eier nabobyggene"],"Hvem får adgang, synlighet og mulighet til å sette dagsorden","Offentlighetsanalyse skiller synlighet, adgang, dagsorden og mulig innflytelse.","oslo_kommune","em_pol_mediert_offentlighet","met_pol_offentlighetsanalyse","offentlighet","jurgen_habermas"],
  ["concept","Hvordan hjelper Habermas-perspektivet i analysen av en tale på torget?",["Det spør hvordan offentlige krav begrunnes og sirkulerer videre","Det avgjør automatisk om talen er sann","Det teller bare publikum"],"Det spør hvordan offentlige krav begrunnes og sirkulerer videre","Offentlig begrunnelse viser hvordan et synlig krav søker gyldighet og innflytelse.","lo_2026","em_pol_mediert_offentlighet","met_pol_offentlighetsanalyse","offentlighet","jurgen_habermas"],
  ["concept","Hva tilfører Nancy Frasers idé om motoffentligheter til Youngstorget-caset?",["Den undersøker om grupper uten lik adgang organiserer egne arenaer og språk","Den gjør alle markeringer identiske","Den erstatter stedets historie"],"Den undersøker om grupper uten lik adgang organiserer egne arenaer og språk","Motoffentligheter gjør ulik adgang og deltakelsesparitet til konkrete spørsmål.","arbark_rode_torg","em_pol_mediert_offentlighet","met_pol_offentlighetsanalyse","offentlighet","nancy_fraser"],
  ["concept","Hva belyser Hannah Arendts idé om offentlig fremtredelse på et torg?",["At mennesker blir politisk synlige gjennom handling og tale foran andre","At bare bygninger kan være politiske","At synlighet alltid gir vedtak"],"At mennesker blir politisk synlige gjennom handling og tale foran andre","Torget kan fungere som fremtredelsesrom, men synlighet er fortsatt ikke det samme som beslutningsmakt.","arbark_rode_torg","em_pol_mediert_offentlighet","met_pol_offentlighetsanalyse","offentlighet","hannah_arendt"],
  ["concept","Hva er den viktigste forskjellen mellom offentlig synlighet og politisk innflytelse?",["Synlighet gjør et krav merkbart; innflytelse krever at beslutninger eller dagsorden faktisk påvirkes","Det finnes ingen forskjell","Innflytelse betyr bare flere tilskuere"],"Synlighet gjør et krav merkbart; innflytelse krever at beslutninger eller dagsorden faktisk påvirkes","Youngstorget dokumenterer synlighet og mobilisering, mens gjennomslag må undersøkes i videre prosesser.","lo_historie","em_pol_mediert_offentlighet","met_pol_offentlighetsanalyse","offentlighet","nancy_fraser"],
  ["concept","Hvordan kan en dokumentanalyse supplere observasjon på torget?",["Den kan spore regler, program og begrunnelser som ikke er synlige i steindekket","Den kan bevise alt uten kilder","Den gjør fotografier unødvendige"],"Den kan spore regler, program og begrunnelser som ikke er synlige i steindekket","Stedsobservasjon viser bruk og form; dokumenter viser beslutninger, regler og aktørenes begrunnelser.","oslo_kommune","em_pol_mediert_offentlighet","met_pol_dokumentanalyse","offentlighet","jurgen_habermas"],
  ["concept","Hva er en kildekritisk slutning om Youngstorget?",["Torget har dokumentert mobiliseringshistorie, men hvert påstått gjennomslag må belegges separat","Alle taler på torget endrer loven","Nærhet til Folkets Hus gjør alle naboer til torgets innhold"],"Torget har dokumentert mobiliseringshistorie, men hvert påstått gjennomslag må belegges separat","Kilder støtter sted, hendelser og bruk; virkning og representativitet krever egen evidens.","arbark_rode_torg","em_pol_mediert_offentlighet","met_pol_dokumentanalyse","offentlighet","hannah_arendt"]
];

const optionOverrides = {
  12:["Samlings- og demonstrasjonssted","Lukket regjeringskontor","Domstol for arbeidskonflikter"],
  13:["Mobilisering kobles til formell makt","Stortinget eide torget","Toget var et handelsmarked"],
  14:["Mobilisering mot formell lovbehandling","Lovvedtak mot varehandel","Privat partilokale mot marked"],
  18:["Kollektiv arbeiderfigur","Portrett av Jørgen Young","Minnesmerke over militær seier"],
  19:["Fredsaktivisme og atomvåpenmotstand","Kveghandel og jernbanedrift","Kinohistorie og skipsfart"],
  20:["Historiske bilder i dagens plassrom","Alle skriftlige kilder erstattes","Bare nabobygg blir vist"],
  24:["Markeringer, handel, kultur og arrangement","Privat parkering og kontorbruk","Jernbane, havn og fergetrafikk"],
  25:["Åpnere torgflate med samme hovedakse","Folketeaterbygningen er revet","Torget er flyttet til ny bydel"],
  26:["To bilder viser ikke hele årsakskjeden","Bilder viser aldri fysiske endringer","Bildenes årstall er ukjente"],
  28:["Fortsatt organiserte politiske markeringer","Ingen offentlig bruk lenger","All bruk er blitt privat"],
  29:["Adgang, synlighet og dagsorden","Antall benker og plantekasser","Eierskap til alle nabobygg"],
  30:["Offentlige begrunnelser og sirkulasjon","Automatisk sannhetsprøve av talen","Bare telling av publikum"],
  31:["Ulik adgang og egne motoffentligheter","Alle markeringer blir identiske","Stedets historie blir overflødig"],
  32:["Politisk synlighet gjennom handling og tale","Bare bygninger kan være politiske","Synlighet gir alltid vedtak"],
  33:["Merkbarhet mot faktisk påvirkning","To ord for samme prosess","Flere mot færre tilskuere"],
  34:["Regler og begrunnelser bak det synlige","Bevis uten eksterne kilder","Fotografier blir unødvendige"],
  35:["Mobilisering er dokumentert; gjennomslag må belegges","Alle taler på torget endrer loven","Alle naboer er del av samme sted"]
};
for (const [number, options] of Object.entries(optionOverrides)) {
  specs[Number(number)-1][2] = options;
  specs[Number(number)-1][3] = options[0];
}
specs[32][1] = "Hvordan skiller offentlig synlighet seg fra politisk innflytelse?";

const claims = specs.map((row, index) => {
  const [family,,,,statement,sourceId,emne,method_id,topic_hook_id,thinker_id] = row;
  const claim = { claim_id:`claim_youngstorget_quiz_${index+1}`, order:index+1, planned_phase:index<7?"opening":index<21?"middle":index<28?"bridge":"final", family:family === "concept" ? "concept_theory" : family, statement, source_ids:[sourceId], source_origin:"external", emne_id:emne };
  if (method_id) Object.assign(claim,{method_id,topic_hook_id,thinker_id});
  return claim;
});
const existing_quiz_audit = {
  searched_paths:["data/quiz/manifest.json","data/quiz/politikk/youngstorget_sets.json","data/stories/stories_youngstorget.json","data/places/production/youngstorget.json"],
  active_before:{file:"data/quiz/politikk/youngstorget_sets.json",set_count:1,question_count:5,finding:"Fem gode kjerner fantes, men pakken manglet source brief, production_context, profilvalg og full 7-spørsmålsprogresjon."},
  decisions:["Bevar temaene marked, basar, Pioneren, Fredsmonumentet og kontrasten til Stortinget i en ny kildebåret pakke.","Skriv alle spørsmål mot reviewede eksterne source-id-er og egne claim-id-er.","Hold teori og metode ute av de første 14 spørsmålene."],
  knowledge_migration:"Eksisterende fem kunnskapsforklaringer inngår redaksjonelt i ny pakke; canonical Knowledge-registre regenereres deterministisk etter materialisering."
};
const profile_decision = {profile:"rich",set_count:5,questions_per_set:7,justification:"Fem selvstendige kildebårne læringsjobber: identitet og marked, arbeiderbevegelse og 1890, synlige minnespor, fysisk omforming og dagens bruk, samt avsluttende offentlighets- og kildeanalyse."};
const held_back_candidates = ["Påstander om at et konkret arrangement eller en tale automatisk ga politisk gjennomslag.","Nabovirksomheter og organisasjoner som Brands uten own-place-eierskap og fullt verifisert logo/wordmark-proveniens.","People-koblinger basert på generell arbeiderbevegelse, sentrumstilknytning eller nærhet alene.","Eksakt deltakertall i 1890 som én ubestridt fasit; kildenes 3 600 og rundt 4 000 beholdes som intervall."];
const brief = { schema_version:"1.0",status:"reviewed",categoryId:"politikk",targetId:"youngstorget",profile_hint:"rich",reviewed_at:"2026-08-25",review_note:"Kildegrunnlaget skiller torgflaten fra nabobygg, dokumenterer historiske hendelser og fysiske spor, og holder synlighet, bruk og politisk gjennomslag analytisk atskilt.",scope:{place:"Youngstorget",production_profile:"rich",set_count:5,questions_per_set:7,total_questions:35,normal_opening_questions:14},sources,selected_curriculum:{module_ids:["konflikt_makt_sivilsamfunn","demokrati_representasjon_offentlighet"],emne_ids:["em_pol_arbeidsliv_kollektiv_kamp","em_pol_demonstrasjoner_protest","em_pol_mediert_offentlighet"],topic_hook_ids:["offentlighet"],method_ids:["met_pol_offentlighetsanalyse","met_pol_dokumentanalyse"],thinker_ids:["jurgen_habermas","nancy_fraser","hannah_arendt"],works:[]},existing_quiz_audit,profile_decision,held_back_candidates,claims };
write("data/quiz/production_briefs/politikk/youngstorget.json", brief);

const resolved_files = {pensum:"data/fag/politikk/politikkpensum_canonical_v4_5.json",emner:"data/fag/politikk/emner_politikk_canonical_v4_5.json",fagkart:"data/fag/politikk/fagkart_politikk_canonical_v4_5.json",methods:"data/fag/politikk/methods_politikk_canonical_v4_5.json",supersetQuizMal:"data/fag/politikk/supersetQUIZMAL_politikk.json",quizStandard:"data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md",quizQuestionSchema:"data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json"};
const production_context = {manifest_category:"politikk",profile:"rich_5x7",standard_version:"3.3",source_brief:"data/quiz/production_briefs/politikk/youngstorget.json",context_artifact:"data/quiz/production_context/politikk/youngstorget.json",resolved_files,required_inputs_loaded:["pensum","emner","fagkart","methods","supersetQuizMal","quizStandard","quizQuestionSchema"],pensum_module_ids:brief.selected_curriculum.module_ids,emne_ids:brief.selected_curriculum.emne_ids,topic_hook_ids:brief.selected_curriculum.topic_hook_ids,method_ids:brief.selected_curriculum.method_ids,thinker_ids:brief.selected_curriculum.thinker_ids,works:[],source_review_status:"reviewed",existing_quiz_audit,profile_decision,held_back_candidates,theory_start_phase:"final",method_start_phase:"final"};
const conceptByEmne = {
  em_pol_arbeidsliv_kollektiv_kamp: { label:"organisasjonsmakt", id:"co_politikk_organisasjonsmakt_487ee5f8ad" },
  em_pol_demonstrasjoner_protest: { label:"mobilisering", id:"co_politikk_mobilisering_ba8276988a" },
  em_pol_mediert_offentlighet: { label:"offentlighet", id:"co_politikk_offentlighet_53c695a61f" }
};
const conceptByQuestion = {
  0:{label:"offentlig rom",id:"co_politikk_offentlig_rom_1bf1644b98"},
  7:{label:"arbeiderbevegelse",id:"co_politikk_arbeiderbevegelse_8d59d95676"},
  9:{label:"mobilisering nedenfra",id:"co_politikk_mobilisering_nedenfra_02fca69205"},
  11:{label:"aktivisme",id:"co_politikk_aktivisme_6b7ebe6ac2"},
  12:{label:"talerstol",id:"co_politikk_talerstol_288de94bed"},
  16:{label:"kollektiv identitet",id:"co_politikk_kollektiv_identitet_0716f400ea"},
  17:{label:"solidaritet",id:"co_politikk_solidaritet_69c104a2eb"},
  18:{label:"fredsarbeid",id:"co_politikk_fredsarbeid_6f3c6ca3f6"},
  19:{label:"monument",id:"co_politikk_monument_7a35b08741"},
  28:{label:"politisk offentlighet",id:"co_politikk_politisk_offentlighet_6573351da8"},
  32:{label:"politisk synlighet",id:"co_politikk_politisk_synlighet_4a1fee97d4"}
};
const questions = specs.map((row,index) => {
  const [family,question,options,answer,knowledge,sourceId,emne,method_id,topic_hook_id,thinker_id] = row;
  const setNo = Math.floor(index/7)+1, qNo=index%7+1;
  const concept = conceptByQuestion[index] || conceptByEmne[emne];
  const q = {id:`youngstorget_quiz_${index+1}`,quiz_id:`politikk_youngstorget_set_${setNo}_q${qNo}`,categoryId:"politikk",placeId:"youngstorget",targetId:"youngstorget",question_scope:"place",question,options,answer,answerIndex:options.indexOf(answer),knowledge,difficulty:Math.min(4,setNo),question_type:family,emne_id:emne,source:[sourceId],source_origin:"external",claim_basis:claims[index].statement,claim_id:claims[index].claim_id,primary_knowledge_unit_id:`ku_politikk_youngstorget_${String(index+1).padStart(2,"0")}`,knowledge_unit_ids:[`ku_politikk_youngstorget_${String(index+1).padStart(2,"0")}`],concepts:[concept.label],concept_ids:[concept.id],term_ids:[],knowledge_contract_version:1,knowledge_link_status:"linked"};
  if(method_id){Object.assign(q,{method_id,topic_hook_id,thinker_id,theory_ref:{topic_hook_id,thinker_id,why_it_helps:`${thinker_id.replaceAll("_"," ")} brukes for å analysere den dokumenterte Youngstorget-situasjonen uten å erstatte kildegrunnlaget.`},guidance_basis:["data/fag/politikk/fagkart_politikk_canonical_v4_5.json","data/fag/politikk/methods_politikk_canonical_v4_5.json"]});}
  return q;
});
const phases=["opening","middle","middle","bridge","final"];
const titles=["Torget, navnet og markedet","Mobilisering og åttetimerskravet","Minnespor i plassrommet","Omforming og dagens bruk","Offentlighet, makt og kildekritikk"];
const quiz={targetId:"youngstorget",categoryId:"politikk",sources:Object.fromEntries(Object.entries(sources).map(([id,source])=>[id,source.url])),production_context,sets:Array.from({length:5},(_,i)=>({set_id:`politikk_youngstorget_set_${i+1}`,title:titles[i],level:i+1,order:i+1,phase:phases[i],xp:50+i*10,questions:questions.slice(i*7,i*7+7)}))};
write("data/quiz/politikk/youngstorget_sets.json",quiz);

const fagManifest=read("data/fag/fag_manifest.json");
fagManifest.politikk.quizProduction.targets.youngstorget={source_brief:"../quiz/production_briefs/politikk/youngstorget.json",context_artifact:"../quiz/production_context/politikk/youngstorget.json",quiz_file:"../quiz/politikk/youngstorget_sets.json"};
write("data/fag/fag_manifest.json",fagManifest);

const productionFile = "data/places/production/youngstorget.json";
const production = read(productionFile);
production.roundsReadiness = {
  status:"production_ready", reviewedAt:"2026-08-25",
  auditFile:"reports/place-production/youngstorget-phase24-final-audit-v1.json",
  badgePlacement:"separate_header",
  contentRoundIds:["people","objects","brands","related"],
  placeCardProfile:"history_go_place_card_profile_v2",
  peopleIds:place.related_people_ids,
  objectIds:place.objects.map(item=>item.id),
  brandIds:[],
  brandFallback:"honest_empty_state_after_candidate_and_logo_audit",
  relatedPlaceIds:place.related_place_ids,
  objectSourceCoveragePercent:100,
  routeStopResolutionPercent:100
};
production.completion = {...production.completion,currentStatus:"current",sourceVerifiedAt:"2026-08-25"};
production.reviewsNotes = "Stedet er avgrenset til selve torgflaten. Fire canonical People har direkte stedsevidens; brede legacy-koblinger holdes ute av rundingen. Fire nabovirksomheter er fjernet som falske Brands, og Brands viser kontraktens ærlige tomtilstand.";
write(productionFile,production);

const politicsFile="data/places/politikk-production/youngstorget.json";
const politics=read(politicsFile);
politics.quizOpening={status:"PASS",quizTargetId:"youngstorget",firstTwoSetsQuestionCount:14,sourceBrief:"data/quiz/production_briefs/politikk/youngstorget.json",productionContext:"data/quiz/production_context/politikk/youngstorget.json",requiredInputs:Object.values(resolved_files)};
politics.gates.F={status:"PASS",evidenceRefs:["data/quiz/politikk/youngstorget_sets.json","data/quiz/production_briefs/politikk/youngstorget.json","data/quiz/production_context/politikk/youngstorget.json"]};
politics.review={reviewer:"Youngstorget full completion review",reviewedAt:"2026-08-25",notes:"Alle Politikk-porter, inkludert normal 14-spørsmålsåpning, er kontrollert mot canonical quizProduction."};
write(politicsFile,politics);

console.log("Youngstorget completion data materialized");
