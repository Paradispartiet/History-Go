type CiviRecord = Record<string, unknown>;

type CiviFn = (...args: unknown[]) => unknown;

type CiviLearningLogFn = (...args: unknown[]) => unknown;

type CiviMethodBag = {
  get?: CiviFn;
  set?: CiviFn;
  load?: CiviFn;
  save?: CiviFn;
  init?: CiviFn;
  mount?: CiviFn;
  render?: CiviFn;
  refresh?: CiviFn;
  update?: CiviFn;
  tick?: CiviFn;
  answer?: CiviFn;
  enqueueEvent?: CiviFn;
  getState?: CiviFn;
  setState?: CiviFn;

  boot?: CiviFn;
  evaluate?: CiviFn;
  tickWeekly?: CiviFn;
  registerLogin?: CiviFn;
  registerEventResponse?: CiviFn;

  getWallet?: CiviFn;
  updateWallet?: CiviFn;
  getActivePosition?: CiviFn;
  setActivePosition?: CiviFn;
  appendJobHistoryEnded?: CiviFn;
  getInbox?: CiviFn;
  setInbox?: CiviFn;
  getPulse?: CiviFn;
  setPulse?: CiviFn;

  resolveCareerRoleScope?: CiviFn;
  enqueueNoUnlockedBrandEmployerMessage?: CiviFn;

  getLatestPendingOffer?: CiviFn;
  acceptOffer?: CiviFn;
  declineOffer?: CiviFn;
  maybeApplyNegativeCareerOutcome?: CiviFn;
  pushOffer?: CiviFn;
  getOffers?: CiviFn;
  setOffers?: CiviFn;

  getHomeInfluence?: CiviFn;
  canPurchaseDistrict?: CiviFn;
  purchaseDistrict?: CiviFn;

  getInv?: CiviFn;
  getPacks?: CiviFn;
  buyPack?: CiviFn;

  getStamp?: CiviFn;
  getPrimary?: CiviFn;
  addTags?: CiviFn;

  getBoost?: CiviFn;
  shiftFocus?: CiviFn;
  getPsycheModifiers?: CiviFn;
  getProfile?: CiviFn;
  generatePerceptionProfile?: CiviFn;

  announceCollapse?: CiviFn;
  applyCareerCapital?: CiviFn;

  onAppOpen?: CiviFn;
  getPendingEvent?: CiviFn;
  getFeed?: CiviFn;


  [key: string]: CiviFn | undefined;
};

type CiviEngineLike = CiviMethodBag;
type CiviUiLike = CiviMethodBag;



declare global {
  function deriveTierFromPoints(
    badge: unknown,
    points: number
  ): {
    tierIndex?: number;
    label?: string;
    [key: string]: unknown;
  };
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
    CivicationPsyche?: CiviMethodBag;

    HG_CiviEngine?: CiviEngineLike;
    CivicationEconomyEngine?: CiviMethodBag;
    CivicationObligationEngine?: CiviMethodBag;
    HG_CapitalMaintenance?: CiviMethodBag;
    HG_CivicationPublic?: CiviMethodBag;
    CAPITAL_ENGINE?: CiviMethodBag;

    CivicationUI?: CiviUiLike;
    CivicationSectionsUI?: CiviMethodBag;
    HG_CiviShop?: CiviMethodBag;
    HG_Lifestyle?: CiviMethodBag;
    HG_IdentityCore?: CiviMethodBag;
    CivicationCalendar?: any;

    getPrimaryLifestyle?: CiviFn;
    getPCWallet?: CiviFn;
    savePCWallet?: CiviFn;
    ensureCiviCareerRulesLoaded?: CiviFn;
    hgGetJobOffers?: CiviFn;
    hgSetJobOffers?: CiviFn;
    checkTierUpgrades?: CiviFn;
    calculateWeeklySalary?: CiviFn;

    __CIVI_BOOT_ERROR__?: unknown;

    HGLearningLog?: {
      add?: CiviLearningLogFn;
      push?: CiviLearningLogFn;
      log?: CiviLearningLogFn;
      record?: CiviLearningLogFn;
      getQuizHistory?: (...args: unknown[]) => any[];
      [key: string]: CiviLearningLogFn | undefined;
    };
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
