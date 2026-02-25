// civicationState.js

const LS_CIVI = "hg_civication_v2";

const DEFAULT_STATE = {
  stability: "STABLE",
  strikes: 0,
  score: 0,

  role: {
    active_position: null,
    history: []
  },

  career: {
    activeJob: null,
    reputation: 70,
    obligations: [],
    salaryModifier: 1
  },

  economy: {
    wallet: { balance: 0, last_tick_iso: null },
    capital: {}
  },

  pulse: {
    date: null,
    seen: {}
  }
};

function getCiviState() {
  const raw = localStorage.getItem(LS_CIVI);
  const parsed = raw ? JSON.parse(raw) : {};
  return deepMerge(DEFAULT_STATE, parsed);
}

function setCiviState(patch) {
  const current = getCiviState();
  const next = { ...current, ...patch };
  localStorage.setItem(LS_CIVI, JSON.stringify(next));
  return next;
}
