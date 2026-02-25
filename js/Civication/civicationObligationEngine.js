// ============================================================
// OBLIGATION TYPES
// ============================================================

const OBLIGATION_TYPES = {

  weekly_login: {
    type: "time_based",
    intervalDays: 7,
    onFail: { reputation: -5 }
  },

  event_response: {
    type: "count_based",
    required: 1,
    intervalDays: 7,
    onFail: { reputation: -3 }
  },

  reputation_floor: {
    type: "threshold",
    minValue: 60,
    onFail: { fire: true }
  }

};
