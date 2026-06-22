#!/usr/bin/env node
const assert=require('assert'),fs=require('fs'),vm=require('vm'); global.window=global; vm.runInThisContext(fs.readFileSync('js/social/HGSocialSurfaceContract.js','utf8'));
const c=HG_SocialSurfaceContract; const actions=c.getActions();
assert(actions.allowed.includes('send_preset_invite'),'allowed action exposed');
assert.strictEqual(c.normalizeAction('free_text_chat'),null,'forbidden action not normalized');
assert(!c.validateSurfaceItem({action:'follow_user'}).ok,'forbidden action rejected');
const labels=c.getLabels(); assert.strictEqual(labels.peopleBlock.title,'Kunnskapsfolk her'); assert.strictEqual(labels.inviteStates.accepted,'Godtatt');
const reason=c.normalizeReason({reason:'Nearby good match',sharedDomains:['industri']},{knowledgeDomains:['industri']});
assert(/industrihistorie/.test(reason)); assert(c.scanVisibleText(reason).ok,'reason privacy safe');
assert(!c.scanVisibleText('nearby distance followers i nærheten').ok,'scanner catches forbidden visible words');
console.log('HG social surface contract tests passed');
