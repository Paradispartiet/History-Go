#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { JSDOM } = require("jsdom");

const source = fs.readFileSync("js/social/HGSocialMeetUI.js", "utf8");

function makeUi(listInvites) {
  const dom = new JSDOM("<!doctype html><body></body>", {
    url: "https://paradispartiet.github.io/History-Go/",
    runScripts: "outside-only",
    pretendToBeVisual: true
  });
  const win = dom.window;
  win.HG_SOCIAL_MEET_BACKEND = "fastapi";
  win.HG_Spotmeeting = {
    getSpotmeetingInbox() {
      return { pending: [{ inviteId: "local-demo-id", status: "pending", context: { title: "Local demo" } }] };
    }
  };
  win.HG_SocialMeetBackend = { listInvites, health: () => ({ mode: "fastapi" }) };
  win.PLACES = [{ id: "the_villa", name: "The Villa" }];
  vm.runInContext(source, dom.getInternalVMContext(), { filename: "HGSocialMeetUI.js" });
  return { win, dom };
}

const invite = (id, status, place = "the_villa") => ({
  inviteId: id,
  status,
  context: { contextType: "place", contextId: place, title: "The Villa" },
  targetDisplayName: id,
  presetLabel: "Vil du ta quizen sammen?"
});

async function run() {
  // A production failure must not render local demo meetings as real invitations.
  {
    const { win } = makeUi(async () => ({ ok: false, reason: "backend_not_enabled" }));
    await win.HG_SocialMeetUI.open();
    assert.match(win.document.body.textContent, /Møteoversikten er ikke aktivert/);
    assert.doesNotMatch(win.document.body.textContent, /Local demo/);
    assert.equal(win.document.querySelector("[data-hg-social-meet-chat]"), null);
    win.close();
  }

  // One canonical, status-filtered list replaces duplicate pending and history blocks.
  {
    const all = [
      invite("pending-one", "pending"),
      invite("accepted-one", "accepted"),
      invite("completed-one", "completed"),
      invite("declined-one", "declined"),
      invite("cancelled-one", "cancelled")
    ];
    const { win } = makeUi(async () => ({ ok: true, invites: all }));
    await win.HG_SocialMeetUI.open({ filter: "place", placeId: "the_villa" });
    assert.equal(win.document.querySelectorAll("[data-hg-social-meet-tab]").length, 4);
    assert.equal(win.document.querySelectorAll(".hg-social-card").length, 1);
    assert.match(win.document.body.textContent, /pending-one/);
    assert.doesNotMatch(win.document.body.textContent, /accepted-one/);
    assert.doesNotMatch(win.document.body.textContent, /MiniProfile|Læringssirkler/);

    win.document.querySelector('[data-hg-social-meet-tab="accepted"]').click();
    assert.equal(win.document.querySelectorAll(".hg-social-card").length, 1);
    assert.match(win.document.body.textContent, /accepted-one/);

    win.document.querySelector('[data-hg-social-meet-tab="declinedCancelled"]').click();
    assert.equal(win.document.querySelectorAll(".hg-social-card").length, 2, "closed invites appear once each");

    let navigation = null;
    win.HG_SpotmeetingUI = { open: params => { navigation = params; } };
    win.document.querySelector("[data-hg-social-meet-find]").click();
    assert(navigation, "find-people action must work");
    assert.equal(navigation.contextId, "the_villa");
    assert.equal(navigation.preferredAction, "match");
    assert.equal(win.document.getElementById("hgSocialMeetSheet").hidden, true);
    win.close();
  }

  // An existing accepted conversation remains discoverable without first clicking an empty pending tab.
  {
    const acceptedId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    const { win } = makeUi(async () => ({ ok: true, invites: [invite(acceptedId, "accepted")] }));
    await win.HG_SocialMeetUI.open();
    assert.equal(win.document.querySelector('[data-hg-social-meet-tab="accepted"]').getAttribute("aria-selected"), "true");
    assert(win.document.querySelector("[data-hg-social-meet-chat]"));
    win.close();
  }
  console.log("hg-social-meet-unified-ui ok");
}

run().catch(error => { console.error(error); process.exitCode = 1; });
