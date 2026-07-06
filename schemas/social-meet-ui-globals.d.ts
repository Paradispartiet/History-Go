// Runtime globals for the Social Meet sheet/popup.

declare global {
  interface Window {
    HG_SocialMeetUI?: {
      open?: (options?: any) => any;
      close?: () => void;
      render?: (options?: any) => void;
      renderPlaceSummary?: (placeId?: string) => string;
      getPlaceSummary?: (placeId?: string) => any;
      enhanceOnSiteLinks?: (scope?: any) => void;
      bind?: () => void;
      health?: () => any;
      [key: string]: any;
    };
    __HG_SOCIAL_MEET_UI_BOUND__?: boolean;
    __HG_SOCIAL_MEET_UI_OBSERVER__?: MutationObserver | null;
    __HG_SOCIAL_MEET_UI_REFRESH_GUARD__?: boolean;
  }

  var HG_SocialMeetUI: any;
}

export {};
