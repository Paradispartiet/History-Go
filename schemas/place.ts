export interface Place {
  id: string;
  name?: string;
  title?: string;
  lat?: number;
  lon?: number;
  lng?: number;
  r?: number;
  category?: string;
  year?: number;
  desc?: string;
  popupDesc?: string;
  image?: string;
  frontImage?: string;
  cardImage?: string;
  popupImage?: string;
  emne_ids?: string[];
  hidden?: boolean;
  stub?: boolean;
  quiz_profile?: Record<string, unknown>;
  relations?: unknown[];
  people?: unknown[];
  wonderkammer?: unknown;
}
