#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { JSDOM } = require("jsdom");

const src = fs.readFileSync("js/social/HGSocialMeetUI.js", "utf8");
const id = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
function setup(mode, status) {
  const dom = new JSDOM("<!doctype html><body></body>", {
    url: "https://paradispartiet.github.io/History-Go/",
    runScripts: "outside-only", pretendToBeVisual: true
  });
  const win = dom.window;
  win.HG_SocialMeetBackend = {
    async listInvites() {
      return { ok: true, invites: [{
        inviteId: id, status,
        context: { contextId:"history_place", contextType:"place", title:"Historisk sted" },
        targetDisplayName:"Mottaker", presetLabel:"Møtes"
      }] };
    },
    health() { return { ok: true, mode }; }
  };
  vm.runInContext(src, dom.getInternalVMContext(), { filename:"HGSocialMeetUI.js" });
  return win;
}
(async () => {
  for (const status of ["accepted","completed"]) {
    const win = setup("fastapi",status);
    await win.HG_SocialMeetUI.open();
    const button = win.document.querySelector("[data-hg-social-meet-chat]");
    assert.ok(button, "Canonical accepted/complete invite must have chat");
    assert.equal(button.getAttribute("data-hg-social-meet-chat"),id);
    button.click();
    const frame = win.document.querySelector(".hg-social-meet-chat-layer iframe");
    assert.ok(frame, "Chat must open within History Go Social Meet sheet");
    assert.equal(frame.src,
      "https://paradispartiet.github.io/AHA-EchoNet/friend-chat.html?embed=1&meetInviteId="+id);
    win.document.querySelector("[data-hg-social-meet-chat-close]").click();
    assert.equal(win.document.querySelector(".hg-social-meet-chat-layer"),null);
    win.close();
  }
  for (const mode of ["local","fallback","supabase"]) {
    const win = setup(mode,"accepted");
    await win.HG_SocialMeetUI.open();
    assert.equal(win.document.querySelector("[data-hg-social-meet-chat]"),null,
      "Demo/fallback must not claim production chat");
    win.close();
  }
  const pending = setup("fastapi","pending");
  await pending.HG_SocialMeetUI.open();
  assert.equal(pending.document.querySelector("[data-hg-social-meet-chat]"),null,
    "Pending invitations must not open chat");
  pending.close();
  assert.doesNotMatch(src, /HistoryGoAHAAuth\.signIn|AHAIngest|historyGo\.visitedPlaces/,
    "Social Meet must remain decoupled from AHA data, AI and History Go visits");
  console.log("hg-social-meet-aha-private-chat ok");
})().catch(error => { console.error(error); process.exitCode=1; });