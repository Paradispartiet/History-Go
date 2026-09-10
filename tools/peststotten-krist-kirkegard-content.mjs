export const id = "peststotten_krist_kirkegard";
export const verifiedAt = "2026-09-10";
export const placeFile = "data/places/historie/oslo/places_historie_added_batch_01/peststotten_krist_kirkegard.json";

export const urls = {
  byleksikonPest: "https://oslobyleksikon.no/side/Pestst%C3%B8tten",
  osloKrist: "https://www.oslo.kommune.no/natur-kultur-og-fritid/gravplasser-og-kremasjoner/vare-gravplasser/krist-kirkegard/",
  osloBrochure: "https://www.oslo.kommune.no/get-file/766998/0694c536d50540e4ef116c01620abda7fbd06d399f487a8a3926c0f0533a7dd6",
  byleksikonKrist: "https://oslobyleksikon.no/side/Krist_kirkeg%C3%A5rd",
  lokalKrist: "https://lokalhistoriewiki.no/wiki/Krist_kirkeg%C3%A5rd",
  lokalPest: "https://lokalhistoriewiki.no/wiki/Pesten_p%C3%A5_%C3%98stlandet_1654",
  commons: "https://commons.wikimedia.org/wiki/File:Pestst%C3%B8tten_p%C3%A5_Krist_Kirkeg%C3%A5rd_i_Oslo.JPG"
};

export const sourceDefs = {
  byleksikon_pest: { url: urls.byleksikonPest, source_type: "reputable_secondary", title: "Oslo byleksikon – Peststøtten" },
  oslo_krist: { url: urls.osloKrist, source_type: "official", title: "Oslo kommune – Krist kirkegård" },
  oslo_brochure: { url: urls.osloBrochure, source_type: "official", title: "Oslo kommune – Krist kirkegård, historisk brosjyre" },
  byleksikon_krist: { url: urls.byleksikonKrist, source_type: "reputable_secondary", title: "Oslo byleksikon – Krist kirkegård" },
  lokal_krist: { url: urls.lokalKrist, source_type: "reputable_secondary", title: "Lokalhistoriewiki – Krist kirkegård" },
  lokal_pest: { url: urls.lokalPest, source_type: "reputable_secondary", title: "Lokalhistoriewiki – Pesten på Østlandet 1654" },
  commons: { url: urls.commons, source_type: "archive", title: "Wikimedia Commons – Peststøtten på Krist kirkegård" }
};

export const desc = "Peststøtten ble reist i 1654 ved inngangen til Krist kirkegård på Hammersborg, gravplassen som ble tatt i bruk under pestutbruddet samme år. Oslo byleksikon omtaler kalksteinsstøtten med kors som Oslos eldste offentlige monument. Den gjør sammenhengen mellom epidemi, begravelsesbehov og byens minnekultur fysisk synlig i et lite bevart kirkegårdsrom mellom nyere institusjonsbygg.";

export const popupDesc = `Peststøtten står ved inngangen til Krist kirkegård på Hammersborg og bærer årstallet 1654. Oslo byleksikon omtaler den som Oslos eldste offentlige monument. Støtten er av kalkstein, har kors øverst og en innskrift som knytter monumentet direkte til peståret og gravplassen.

Krist kirkegård ble tatt i bruk fordi pestutbruddet i 1654 skapte behov for flere gravsteder. Kildene er langt sikrere på dette behovet enn på ett bestemt dødstall for hele byen. Derfor brukes ikke et eksakt samlet antall pestdøde som nøkkelfakta i denne produksjonen.

Innskriften navngir både embetsmenn og kirkelige aktører og forteller at soldaten Arne Sigvardsøn fra Vang var den første som ble gravlagt her. Monumentet er et felles minnesmerke ved en pestgravplass, ikke en individuell gravstein for alle som døde under epidemien. Det skillet er viktig når støtten brukes som historisk kilde.

Gravplassen fikk senere nye lag. Den ble særlig brukt som militær kirkegård, og i 1835 ble den utvidet i forbindelse med koleraepidemien. Nye utvidelser fulgte i 1840 og 1856. Slik viser området at smitte, befolkningsvekst og behovet for gravplasser satte konkrete spor i byen lenge etter peståret.

Familien til Edvard Munch har også en dokumentert tilknytning til kirkegården. Moren Laura, faren Christian og søsteren Sophie ble gravlagt her, og Munch malte motivet ved morens grav. Denne forbindelsen viser hvordan et gravsted kan få et nytt minnelag gjennom kunst og familiehistorie uten at Munch selv er gravlagt på Krist kirkegård.

Krist kirkegård ble stengt for nye begravelser i 1924. Etter senere omlegginger rundt Hammersborg ble den øvre delen bevart som minnepark. Oslo byleksikon oppgir at smijernsgjerdet, laget ved Christiania Spigerverk, kom på plass i 1971, mens Oslo kommune dokumenterer rehabilitering og ny åpning som minnepark i 1999.

Stedet kan derfor leses gjennom flere typer spor samtidig: monumentets materiale og innskrift, gravplassens avgrensning, senere restaureringer og skriftlige kilder som beskriver epidemier og bruksendringer. Ingen av disse kildene alene kan rekonstruere erfaringene til alle som ble berørt. En kildekritisk lesning skiller det som er fysisk bevart fra det som er dokumentert i ettertid, og lar usikre dødstall forbli usikre.`;

export const chronologyRows = [
  [1654, "Pesten utløser nytt gravplassbehov", "Krist kirkegård tas i bruk under pestutbruddet."],
  [1654, "Peststøtten reises", "Kalksteinsmonumentet markerer peståret og gravplassen."],
  [1835, "Kolera gir ny utvidelse", "Kirkegården utvides i forbindelse med koleraepidemien."],
  [1840, "Kirkegården utvides igjen", "Gravplassen får et større areal på Hammersborg."],
  [1856, "Ny utvidelse", "En tredje dokumentert utvidelse følger i 1856."],
  [1924, "Nye begravelser opphører", "Krist kirkegård stenges for nye begravelser."],
  [1960, "Området formes som minnepark", "Den bevarte delen restaureres og gis tydeligere minneparkpreg."],
  [1971, "Smijernsgjerdet monteres", "Et gjerde laget ved Christiania Spigerverk rammer inn kirkegården."],
  [1999, "Minneparken rehabiliteres", "Oslo kommune rehabiliterer området og åpner det på nytt som minnepark."]
];

export const readingRows = [
  ["byleksikon_pest", "Peststøtten", "Oslo byleksikon", urls.byleksikonPest, "Hovedkilde for monumentets identitet, innskrift og 1654-kontekst.", "recognized"],
  ["oslo_krist", "Krist kirkegård", "Oslo kommune", urls.osloKrist, "Offisiell kilde for gravplassens etablering og rehabilitering som minnepark.", "canonical"],
  ["byleksikon_krist", "Krist kirkegård", "Oslo byleksikon", urls.byleksikonKrist, "Kronologi for utvidelser, stenging, gjerde og senere minnepark.", "recognized"],
  ["lokalhistorie", "Krist kirkegård", "Lokalhistoriewiki", urls.lokalKrist, "Supplerer med Munch-familiens tilknytning og kunstnerisk minnebruk.", "recognized"]
];

export const fagverk = {
  schema: "history_go_place_fagverk_v2", level: "standard", status: "curated",
  intro: "Peststøtten og Krist kirkegård gjør en epidemi lesbar gjennom materiale, gravplass, innskrift og senere minnebruk. Stedet viser samtidig hvorfor et monument ikke er det samme som en full fortelling om alle menneskene som ble berørt.",
  article: [
    "Pesten i 1654 skapte et akutt gravplassbehov ved Christiania og Akershus. Krist kirkegård ble tatt i bruk på Hammersborg, og Peststøtten ved inngangen knytter året, gravplassen og byens minnearbeid sammen i ett fysisk objekt.",
    "Støtten kan leses som en materiell kilde. Kalkstein, kors, årstall og innskrift viser hva de som reiste monumentet valgte å registrere offentlig. Innskriften navngir aktører og den første gravlagte, men den gir ikke stemme til alle som døde eller til familiene deres.",
    "Kirkegården fikk nye historiske lag etter peståret. Militær bruk, kolerautvidelsen i 1835, senere utvidelser og stengingen for nye begravelser i 1924 viser at stedet endret funksjon samtidig som gravminnene fortsatte å bære eldre minner.",
    "Munch-familiens graver tilfører et annet minnelag. Edvard Munch malte motivet ved morens grav, og dermed blir kirkegården også et eksempel på hvordan familiehistorie og kunst kan omforme hvordan et sted huskes uten at kunstverket opphever stedets eldre epidemihistorie.",
    "Etterkrigstidens omlegginger, smijernsgjerdet fra 1971 og rehabiliteringen i 1999 viser at bevaring er en aktiv historisk prosess. Den som besøker stedet møter derfor både 1600-tallsminnet og senere valg om hvilke spor som skulle beskyttes, rammes inn og gjøres lesbare.",
    "Kildene må sammenlignes. De er enige om 1654, plasseringen og hovedfunksjonen, mens tallfesting av den samlede dødeligheten er mer usikker. Produksjonen bruker derfor sikre stedsspesifikke opplysninger som ryggrad og holder usikre totalanslag utenfor quizens nøkkelfakta."
  ],
  subject_ids: ["historie"],
  emne_ids: ["em_his_sosialhistorie_hverdagsliv", "em_his_minnesteder_historiebruk", "em_his_spor_materialitet", "em_his_historiske_lag_i_byrom"],
  chapter_ids: ["historisk_tid_periodisering"],
  lenses: [
    { id: "peststotten_spor", title: "Materielle spor", prompt: "Hva kan selve støtten og innskriften dokumentere, og hva kan de ikke dokumentere?", subject_id: "historie", emne_id: "em_his_spor_materialitet", evidence: "Kalkstein, kors, årstall, innskrift og plassering ved kirkegårdsinngangen." },
    { id: "peststotten_sosial", title: "Epidemi og hverdagsliv", prompt: "Hvordan blir et helsebrudd synlig gjennom behovet for en ny gravplass?", subject_id: "historie", emne_id: "em_his_sosialhistorie_hverdagsliv", evidence: "Kirkegården ble tatt i bruk i peståret og utvidet under koleraen i 1835." },
    { id: "peststotten_minnested", title: "Minnested og historiebruk", prompt: "Hvordan endrer senere minnepark, gjerde og kunstneriske forbindelser måten stedet leses på?", subject_id: "historie", emne_id: "em_his_minnesteder_historiebruk", evidence: "Munch-tilknytningen, gjerdet fra 1971 og rehabiliteringen som minnepark i 1999." },
    { id: "peststotten_tidslag", title: "Historiske lag", prompt: "Hvilke tidslag er samtidige i landskapet, men ikke i historien?", subject_id: "historie", emne_id: "em_his_historiske_lag_i_byrom", evidence: "1654-monumentet, 1800-tallsutvidelser og 1900-tallets minneparktiltak står i samme avgrensede rom." }
  ],
  guiding_questions: ["Hvorfor ble Krist kirkegård tatt i bruk i 1654?", "Hva forteller innskriften om hvem som fikk plass i den offentlige fortellingen?", "Hvordan skiller vi peståret fra senere bruk av gravplassen?", "Hvorfor bør usikre dødstall holdes adskilt fra sikre stedsspor?"],
  concepts: ["epidemi", "minnested", "materielle spor", "kildekritikk", "historiske lag", "gravplass"],
  observable_traces: [
    { title: "Peststøtten", observation: "Se etter kors, årstall og innskrift på kalksteinsmonumentet.", interpretation_boundary: "Innskriften viser monumentets minnebudskap, ikke en full liste eller erfaringene til alle pestofre.", source_urls: [urls.byleksikonPest, urls.osloBrochure] },
    { title: "Minneparkens avgrensning", observation: "Legg merke til hvordan monument, eldre gravminner og senere gjerde rammer inn den bevarte delen av kirkegården.", interpretation_boundary: "Dagens innramming er resultat av senere restaurering og bevaring og skal ikke leses som uendret 1600-tallsmiljø.", source_urls: [urls.byleksikonKrist, urls.osloKrist] }
  ],
  source_urls: [urls.byleksikonPest, urls.osloKrist, urls.osloBrochure, urls.byleksikonKrist, urls.lokalKrist, urls.lokalPest], verified_at: verifiedAt
};
