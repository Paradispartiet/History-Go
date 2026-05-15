type CiviRecord = Record<string, unknown>;

type CiviEngineLike = {
  tick?: (...args: unknown[]) => unknown;
  answer?: (...args: unknown[]) => unknown;
  enqueueEvent?: (...args: unknown[]) => unknown;
  getState?: (...args: unknown[]) => unknown;
  setState?: (...args: unknown[]) => unknown;
  [key: string]: unknown;
};

type CiviUiLike = {
  render?: (...args: unknown[]) => unknown;
  refresh?: (...args: unknown[]) => unknown;
  mount?: (...args: unknown[]) => unknown;
  init?: (...args: unknown[]) => unknown;
  [key: string]: unknown;
};

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

    CivicationRoleModelRuntime?: CiviRecord;
    CivicationBlockedJobMessages?: CiviRecord;
    CivicationCareerRoleResolver?: CiviRecord;
    CivicationPlaceAccessBridge?: CiviRecord;
    CivicationHome?: CiviRecord;
    CivicationJobs?: CiviRecord;
    CivicationState?: CiviRecord;

    HG_CiviEngine?: CiviEngineLike;
    CivicationEconomyEngine?: CiviEngineLike;
    CivicationObligationEngine?: CiviEngineLike;
    HG_CapitalMaintenance?: CiviEngineLike;
    HG_CivicationPublic?: CiviEngineLike;
    CAPITAL_ENGINE?: CiviEngineLike;

    CivicationUI?: CiviUiLike;
    HG_CiviShop?: CiviRecord;
    HG_Lifestyle?: CiviRecord;
    HG_IdentityCore?: CiviRecord;

    getPrimaryLifestyle?: (...args: unknown[]) => unknown;
    getPCWallet?: (...args: unknown[]) => unknown;
    savePCWallet?: (...args: unknown[]) => unknown;
    ensureCiviCareerRulesLoaded?: (...args: unknown[]) => unknown;
    checkTierUpgrades?: (...args: unknown[]) => unknown;
    calculateWeeklySalary?: (...args: unknown[]) => unknown;
  }

  const CivicationState: CiviRecord;
  const CivicationEconomyEngine: CiviRecord;
  const CivicationObligationEngine: CiviRecord;
  const CIVI_ITEMS: unknown[];
  const CIVI_SYNERGIES: unknown[];
  const CAREERS: unknown[];
  const LIFESTYLES: unknown[];
}

export {};
