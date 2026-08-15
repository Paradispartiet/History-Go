#!/usr/bin/env node
// Regression coverage for the Civication daily-answer tap path: Daily middleware may
// pre-mark runtime state before the inner answer pipeline, but must not resolve the inbox
// mail until that inner pipeline has consumed the pending item.

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');
const dailyBuilderSource = fs.readFileSync(path.join(repoRoot, 'js/Civication/systems/civicationDailyMailBuilder.js'), 'utf8');
const mailEngineSource = fs.readFileSync(path.join(repoRoot, 'js/Civication/systems/civicationMailEngine.js'), 'utf8');
const nextActionSource = fs.readFileSync(path.join(repoRoot, 'js/Civication/ui/CivicationNextActionUI.js'), 'utf8');
const selectorSource = fs.readFileSync(path.join(repoRoot, 'js/Civication/systems/civicationNextActionSelector.js'), 'utf8');

const middlewareStart = dailyBuilderSource.indexOf('async function dailyMailAnswerMiddleware(ctx, next)');
const middlewareEnd = dailyBuilderSource.indexOf('  function registerAnswerMiddleware()', middlewareStart);
assert(middlewareStart >= 0 && middlewareEnd > middlewareStart, 'Daily answer latency contract must live in the ChoiceDirector middleware');
const answerMiddleware = dailyBuilderSource.slice(middlewareStart, middlewareEnd);

assert(answerMiddleware.includes('markAnswered(eventId, choiceId, { resolveMail: false })'), 'daily answer may pre-mark runtime only when it does not resolve the inbox mail');
assert(answerMiddleware.indexOf('markAnswered(eventId, choiceId, { resolveMail: false })') < answerMiddleware.indexOf('result = await next()'), 'runtime pre-mark must happen before the inner answer pipeline while the inbox item remains pending');
assert(answerMiddleware.includes('dailyRuntimeAnswered: true'), 'daily answer result must flag that runtime/mail resolve is already handled');
assert(!dailyBuilderSource.includes('proto.answer = async function dailyMailAnswer'), 'DailyMailBuilder must not own EventEngine.answer directly after ChoiceDirector migration');
assert(dailyBuilderSource.includes('const ANSWER_MIDDLEWARE_NAME = "daily_mail_builder";'), 'Daily answer middleware must keep its canonical registration name');
assert(dailyBuilderSource.includes('const ANSWER_MIDDLEWARE_PRIORITY = 40;'), 'Daily answer middleware must remain at priority 40');
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
