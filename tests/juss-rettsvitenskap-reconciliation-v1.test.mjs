import assert from 'node:assert/strict';
import test from 'node:test';
import { audit } from '../scripts/audit-juss-rettsvitenskap-reconciliation-v1.mjs';
test('Juss reconciliation 1/12 og Felt 2 source-first uten å flytte Politikk-eierinnhold',()=>{assert.deepEqual(audit(),{status:'pass',domains:12,materialized:1,sourceFirstReady:2,strictCompletionProven:false,reuseWithExpansion:1,newProductionRequired:11,moveExisting:0,nextDomain:'statsrett_grunnlov_maktfordeling_konstitusjonell_kontroll'});});
