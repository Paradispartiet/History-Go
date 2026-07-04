#!/usr/bin/env node
// Regression coverage for the Civication daily-answer tap path: daily runtime answers must
// not resolve the mail before the legacy EventEngine answer chain can see its pending item.

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');
const dailyBuilderSource = fs.readFileSync(path.join(repoRoot, 'js/Civication/systems/civicationDailyMailBuilder.js'), 'utf8');
const mailEngineSource = fs.readFileSync(path.join(repoRoot, 'js/Civication/systems/civicationMailEngine.js'), 'utf8');
const nextActionSource = fs.readFileSync(path.join(repoRoot, 'js/Civication/ui/CivicationNextActionUI.js'), 'utf8');
const selectorSource = fs.readFileSync(path.join(repoRoot, 'js/Civication/systems/civicationNextActionSelector.js'), 'utf8');

const answerPatch = dailyBuilderSource.slice(
  dailyBuilderSource.indexOf('proto.answer = async function dailyMailAnswer'),
  dailyBuilderSource.indexOf('    return true;', dailyBuilderSource.indexOf('proto.answer = async function dailyMailAnswer'))
);

assert(answerPatch.includes('markAnswered(eventObj?.id || eventId, choiceId, { resolveMail: false })'), 'daily answer may pre-mark runtime only when it does not resolve the inbox mail');
assert(answerPatch.indexOf('markAnswered(eventObj?.id || eventId, choiceId, { resolveMail: false })') < answerPatch.indexOf('previousAnswer.call'), 'runtime pre-mark must happen before dayPatches/onAppOpen, while the inbox item remains pending');
assert(answerPatch.includes('dailyRuntimeAnswered: true'), 'daily answer result must flag that runtime/mail resolve is already handled');
assert(mailEngineSource.includes('result?.dailyRuntimeAnswered !== true'), 'MailEngine.answerMail must not run a duplicate markResolved for daily runtime answers');

assert(nextActionSource.includes('perfMark("civi-answer-click")'), 'NextActionUI must mark click timing');
assert(nextActionSource.includes('perfMark("civi-answer-after-answerMail")'), 'NextActionUI must mark after answerMail');
assert(nextActionSource.includes('perfMark("civi-answer-after-markAnswered")'), 'NextActionUI must mark after markAnswered');
assert(nextActionSource.includes('perfMark("civi-answer-after-advanceUntilNextRealAction")'), 'NextActionUI must mark after advanceUntilNextRealAction');
assert(nextActionSource.includes('perfMark("civi-answer-after-render")'), 'NextActionUI must mark after render');
assert(nextActionSource.includes('requestAnimationFrame(flush)'), 'NextActionUI refresh events must be coalesced into one frame');

assert(selectorSource.indexOf('const queuedRef = inspection.nextQueuedItem') > selectorSource.indexOf('const openInboxAction = getInboxAction'), 'NextAction selector should choose queued runtime items from inspect() without rebuilding the day');

const uiAnswer = nextActionSource.slice(nextActionSource.indexOf('function answer(mailId, choiceId)'), nextActionSource.indexOf('  function openTaskGate', nextActionSource.indexOf('function answer(mailId, choiceId)')));
assert(!uiAnswer.includes('prewarm(') && !uiAnswer.includes('.prewarm?.'), 'NextAction click handler must not block on prewarm');

console.log('civication-daily-answer-latency-regression.test.js passed');
