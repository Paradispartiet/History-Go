type CiviRecord = Record<string, unknown>;

// Civication runtime globals are dynamic browser method bags. The return values
// are intentionally `any` so JS checkJs files can narrow/cast per call site
// without TS treating every runtime method result as `unknown`.
type CiviFn = (...args: unknown[]) => any;

type CiviLearningLogFn = (...args: unknown[]) => any;

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
  getIdentityState?: CiviFn;
  getSnapshot?: CiviFn;
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
type CiviNpcRecordLike = CiviRecord & {
  name?: string;
  title?: string;
};

type CiviNpcDirectoryLike = (CiviMethodBag | CiviRecord) & {
  lookup?: (...args: unknown[]) => CiviNpcRecordLike | null | undefined;
  all?: CiviFn;
  load?: CiviFn;
};
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
    BADGES?: any[];

    CIVI_ITEMS?: unknown[];
    CIVI_SYNERGIES?: unknown[];
    CIVI_LIFESTYLES?: unknown[];
    LIFESTYLES?: unknown[];

    CIVI_CAPITAL_MAINT_PROFILE?: CiviRecord;
    CIVI_QUIZ_CAPITAL_MAP?: CiviRecord;

    HG_STATE?: CiviRecord;

    CivicationMailEngine?: any;
    CivicationMailRuntime?: any;
    CiviRoleStoryletBridge?: any;
    CivicationTaskEngine?: any;
    CivicationHistoryGoTaskBridge?: any;
    CivicationHistoryGoDeepLink?: any;
    CiviStoryResolver?: any;
    CivicationConflicts?: any;
    CivicationEventChannels?: any;
    CivicationEventEngine?: any;

    HG_IdentityCore?: CiviMethodBag;
    CivicationRoleModelRuntime?: CiviMethodBag;
    CivicationBlockedJobMessages?: CiviMethodBag;
    CivicationCareerRoleResolver?: CiviMethodBag;
    CivicationPlaceAccessBridge?: CiviMethodBag;
    CivicationHome?: CiviMethodBag;
    CivicationJobs?: CiviMethodBag;
    CivicationState?: CiviMethodBag;
    CivicationPsyche?: CiviMethodBag;
    CivicationNPCs?: CiviNpcDirectoryLike;
    CivicationThreadBridge?: CiviMethodBag;
    CivicationFriendsEngine?: any;
    CivicationFriendMessages?: any;
    CivicationRelationshipEngine?: any;
    CivicationSocialConversationEngine?: any;
    CivicationSocialPlaceResolver?: any;
    DEBUG?: boolean;

    HG_CiviEngine?: CiviEngineLike;
    CivicationEconomyEngine?: CiviMethodBag;
    CivicationObligationEngine?: CiviMethodBag;
    HG_CapitalMaintenance?: CiviMethodBag;
    HG_CivicationPublic?: CiviMethodBag;
    CAPITAL_ENGINE?: CiviMethodBag;

    CivicationUI?: CiviUiLike;

    // Civication map-motorer og kalibrering. Verifiserte runtime-globaler satt i
    // js/Civication/ui/*. Map-/kalibrerings-API-ene returnerer blandede
    // projeksjons-/anker-records, derfor `any` for å ikke overtypes (og ikke
    // introdusere nye nedstrøms-diagnostics) før formene er kartlagt.
    CivicationCanvasMap?: any;
    CivicationThreeMap?: any;
    CivicationOsloMapCalibration?: any;
    CivicationHistoryGoPlaceLayer?: CiviMethodBag;
  }
}

export {};