import assert from 'node:assert/strict';
import test from 'node:test';
import { audit } from '../scripts/audit-juss-rettsvitenskap-reconciliation-v1.mjs';
test('Juss reconciliation starter 0/12 og Felt 1 source-first uten å flytte Politikk-eierinnhold',()=>{assert.deepEqual(audit(),{status:'pass',domains:12,materialized:0,sourceFirstReady:1,strictCompletionProven:false,reuseWithExpansion:1,newProductionRequired:11,moveExisting:0,nextDomain:'juridisk_metode_rettskilder_tolkning_argumentasjon'});});
