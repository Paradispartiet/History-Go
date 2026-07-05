// Runtime globals for the canonical Spotmeeting UI bridge.
// Kept separate from app-globals.d.ts so PR #1688 can satisfy the
// TypeScript guard without widening unrelated History Go globals.

declare global {
  interface Window {
    HG_Spotmeeting?: any;
    HG_SpotmeetingUI?: {
      open?: (contextOrOptions?: any) => any;
      close?: () => void;
      buildContext?: (contextOrOptions?: any, options?: any) => any;
      buildPlaceContext?: (place?: any, options?: any) => any;
      render?: (context?: any, selectedAction?: string) => void;
      renderCandidates?: (context?: any, action?: string) => void;
      sendInvite?: (button?: any) => any;
      canonicalizePlaceCardSections?: (scope?: any) => void;
      bind?: () => void;
      health?: () => any;
      [key: string]: any;
    };
    HG_SpotmeetingPlaceCardDemo?: any;
    __HG_SPOTMEETING_UI_BOUND__?: boolean;
    __HG_SPOTMEETING_UI_OBSERVER__?: MutationObserver;
    renderHGSpotmeetingPlaceCardSection?: (place?: any) => string;
  }

  var HG_Spotmeeting: any;
  var HG_SpotmeetingUI: any;
  var HG_SpotmeetingPlaceCardDemo: any;
}

export {};
