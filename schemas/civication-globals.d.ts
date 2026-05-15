type CiviRecord = Record<string, unknown>;

type CiviMethodBag = {
  get?: (...args: unknown[]) => unknown;
  set?: (...args: unknown[]) => unknown;
  load?: (...args: unknown[]) => unknown;
  save?: (...args: unknown[]) => unknown;
  init?: (...args: unknown[]) => unknown;
  mount?: (...args: unknown[]) => unknown;
  render?: (...args: unknown[]) => unknown;
  refresh?: (...args: unknown[]) => unknown;
  update?: (...args: unknown[]) => unknown;
  tick?: (...args: unknown[]) => unknown;
  answer?: (...args: unknown[]) => unknown;
  enqueueEvent?: (...args: unknown[]) => unknown;
  getState?: (...args: unknown[]) => unknown;
  setState?: (...args: unknown[]) => unknown;

  boot?: (...args: unknown[]) => unknown;
  evaluate?: (...args: unknown[]) => unknown;
  tickWeekly?: (...args: unknown[]) => unknown;
  registerLogin?: (...args: unknown[]) => unknown;
  registerEventResponse?: (...args: unknown[]) => unknown;

  getWallet?: (...args: unknown[]) => unknown;
  updateWallet?: (...args: unknown[]) => unknown;
  getActivePosition?: (...args: unknown[]) => unknown;
  setActivePosition?: (...args: unknown[]) => unknown;
  appendJobHistoryEnded?: (...args: unknown[]) => unknown;
  getInbox?: (...args: unknown[]) => unknown;
  setInbox?: (...args: unknown[]) => unknown;
  getPulse?: (...args: unknown[]) => unknown;
  setPulse?: (...args: unknown[]) => unknown;

  resolveCareerRoleScope?: (...args: unknown[]) => unknown;
  enqueueNoUnlockedBrandEmployerMessage?: (...args: unknown[]) => unknown;

  getLatestPendingOffer?: (...args: unknown[]) => unknown;
  acceptOffer?: (...args: unknown[]) => unknown;
  declineOffer?: (...args: unknown[]) => unknown;
  maybeApplyNegativeCareerOutcome?: (...args: unknown[]) => unknown;
  pushOffer?: (...args: unknown[]) => unknown;
  getOffers?: (...args: unknown[]) => unknown;
  setOffers?: (...args: unknown[]) => unknown;

  getHomeInfluence?: (...args: unknown[]) => unknown;
  canPurchaseDistrict?: (...args: unknown[]) => unknown;
  purchaseDistrict?: (...args: unknown[]) => unknown;

  getInv?: (...args: unknown[]) => unknown;
  getPacks?: (...args: unknown[]) => unknown;
  buyPack?: (...args: unknown[]) => unknown;

  getStamp?: (...args: unknown[]) => unknown;
  getPrimary?: (...args: unknown[]) => unknown;
  addTags?: (...args: unknown[]) => unknown;

  getBoost?: (...args: unknown[]) => unknown;
  shiftFocus?: (...args: unknown[]) => unknown;
  getPsycheModifiers?: (...args: unknown[]) => unknown;
  getProfile?: (...args: unknown[]) => unknown;
  generatePerceptionProfile?: (...args: unknown[]) => unknown;

  announceCollapse?: (...args: unknown[]) => unknown;
  applyCareerCapital?: (...args: unknown[]) => unknown;

  onAppOpen?: (...args: unknown[]) => unknown;
  getPendingEvent?: (...args: unknown[]) => unknown;
  getFeed?: (...args: unknown[]) => unknown;


  [key: string]: unknown;
};

type CiviEngineLike = CiviMethodBag;
type CiviUiLike = CiviMethodBag;

declare global {
  interface Window {
    CIVI_CAREER_RULES?: unknown[] | CiviRecord;
    HG_CAREERS?: unknown[] | CiviRecord;
    CAREERS?: unknown[] | CiviRecord;
    BADGES?: unknown[];

    CIVI_ITEMS?: unknown[];
    CIVI_SYNERGIES?: unknown[];
    CIVI_LIFESTYLES?: unknown[];
    LIFESTYLES?: unknown[];

    CIVI_CAPITAL_MAINT_PROFILE?: CiviRecord;
    CIVI_QUIZ_CAPITAL_MAP?: CiviRecord;

    CivicationRoleModelRuntime?: CiviMethodBag;
    CivicationBlockedJobMessages?: CiviMethodBag;
    CivicationCareerRoleResolver?: CiviMethodBag;
    CivicationPlaceAccessBridge?: CiviMethodBag;
    CivicationHome?: CiviMethodBag;
    CivicationJobs?: CiviMethodBag;
    CivicationState?: CiviMethodBag;

    HG_CiviEngine?: CiviEngineLike;
    CivicationEconomyEngine?: CiviMethodBag;
    CivicationObligationEngine?: CiviMethodBag;
    HG_CapitalMaintenance?: CiviMethodBag;
    HG_CivicationPublic?: CiviMethodBag;
    CAPITAL_ENGINE?: CiviMethodBag;

    CivicationUI?: CiviUiLike;
    HG_CiviShop?: CiviMethodBag;
    HG_Lifestyle?: CiviMethodBag;
    HG_IdentityCore?: CiviMethodBag;

    getPrimaryLifestyle?: (...args: unknown[]) => unknown;
    getPCWallet?: (...args: unknown[]) => unknown;
    savePCWallet?: (...args: unknown[]) => unknown;
    ensureCiviCareerRulesLoaded?: (...args: unknown[]) => unknown;
    checkTierUpgrades?: (...args: unknown[]) => unknown;
    calculateWeeklySalary?: (...args: unknown[]) => unknown;
  }

  const CivicationState: CiviMethodBag;
  const CivicationEconomyEngine: CiviMethodBag;
  const CivicationObligationEngine: CiviMethodBag;
  const CIVI_ITEMS: unknown[];
  const CIVI_SYNERGIES: unknown[];
  const CAREERS: unknown[];
  const LIFESTYLES: unknown[];
}

export {};
