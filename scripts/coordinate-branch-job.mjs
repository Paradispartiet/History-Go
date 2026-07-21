#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const protocolFile = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const reportDir = path.join(root, 'reports/oslo-coordinate-protocol-sync-batch-134');
fs.mkdirSync(reportDir, { recursive: true });

const staleRow = '| `norges_varemesse` – Norges Varemesse | needs_review | Recorden blander institusjonen stiftet i 1920 med Messehallen på Sjølyst fra 1962; virksomheten flyttet til Lillestrøm i 2002 og Oslo-bygningen ble revet. | Omdefiner til historisk Sjølyst-sted med historisk anker, eller flytt institusjonsinnholdet ut av place-modellen. |';

const protocol = fs.readFileSync(protocolFile, 'utf8');
const occurrences = protocol.split(staleRow).length - 1;
if (occurrences !== 1) {
  throw new Error(`Forventet nøyaktig én stale norges_varemesse needs_review-rad, fant ${occurrences}`);
}
const updated = protocol.replace(`${staleRow}\n`, '');
if (!updated.includes('| 134 | `norges_varemesse` | Norges Varemesse – Sjølystsenteret | verified_historical_source | `lokalhistoriewiki:norges-varemesse-sjolyst` |')) {
  throw new Error('Batch 134 verified-raden mangler; avbryter protokollsynk');
}
fs.writeFileSync(protocolFile, updated);

fs.writeFileSync(
  path.join(reportDir, 'summary.json'),
  `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    action: 'remove_stale_unresolved_row',
    placeId: 'norges_varemesse',
    retainedBatch: 134,
    retainedStatus: 'verified_historical_source',
    retainedSourceObjectId: 'lokalhistoriewiki:norges-varemesse-sjolyst',
  }, null, 2)}\n`,
);

console.log('Removed stale norges_varemesse needs_review row; batch 134 verified row retained.');
