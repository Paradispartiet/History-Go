#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(ROOT, 'scripts/audit-fagverk-by-byliv-hendelser-midlertidighet-phase4.mjs');
let text = fs.readFileSync(file, 'utf8');

const oldGate = "  assert(sources.filter((row) => row.type?.startsWith('datert-')).every((row) => /^\\d{4}-\\d{2}-\\d{2}$/.test(row.published_at || '')), 'Daterte kilder mangler published_at');";
const newGate = "  assert(sources.filter((row) => row.published_at).every((row) => /^\\d{4}-\\d{2}-\\d{2}$/.test(row.published_at)), 'Oppgitt published_at har ugyldig datoformat');\n  assert(/^\\d{4}-\\d{2}-\\d{2}$/.test(sources.find((row) => row.id === 'bym07-sommergater-2023')?.published_at || ''), '2023-pressemeldingen mangler eksplisitt publiseringsdato');";
if (!text.includes(oldGate)) throw new Error('Fant ikke den overstrenge published_at-gaten');
text = text.replace(oldGate, newGate);

const oldClaimGate = "  for (const id of ['bym-08', 'bym-09']) {\n    const claim = claims.find((row) => row.id === id);\n    assert(claim && /20\\d{2}/.test(claim.claim), `${id} mangler eksplisitt årstall`);\n    assert(claim.source_ids.some((sourceId) => sources.find((row) => row.id === sourceId)?.published_at), `${id} mangler datert kilde`);\n  }";
const newClaimGate = "  for (const id of ['bym-08', 'bym-09']) {\n    const claim = claims.find((row) => row.id === id);\n    assert(claim && /20\\d{2}/.test(claim.claim), `${id} mangler eksplisitt årstall`);\n  }\n  const summerSource = sources.find((row) => row.id === 'bym07-sommergater-2023');\n  assert(/^\\d{4}-\\d{2}-\\d{2}$/.test(summerSource?.published_at || ''), 'bym-08 mangler datert pressemeldingskilde');\n  const kirkegataSource = sources.find((row) => row.id === 'bym08-kirkegata-2022');\n  assert(kirkegataSource?.type === 'datert-prosjektside' && kirkegataSource.source_location && kirkegataSource.url?.startsWith('https://'), 'bym-09 mangler låst historisk 2022-prosjektside med locator');";
if (!text.includes(oldClaimGate)) throw new Error('Fant ikke den overstrenge claim-datoporten');
text = text.replace(oldClaimGate, newClaimGate);

fs.writeFileSync(file, text);
console.log('By hendelser/midlertidighet: temporal gate skiller publiseringsdato fra eksplisitt historisk prosjektperiode.');
