// fagkartLoader.ts
// Felles loader for fagkart.json (fagfelt → families → subfields)
//
// Migrert til TypeScript ESM-modul. Bundles av build/build-web.mjs til
// dist/web/fagkartLoader.js (iife). Interop-kontrakt: modulen publiserer
// fortsatt window.Fagkart som sideeffekt slik at klassiske konsumenter
// (js/hgchips.js og inline-script i knowledge.html) fungerer uendret.

// DEBUG følger global bryter hvis den finnes (window.DEBUG), ellers false
const DEBUG = !!(globalThis as any).DEBUG;

// Juster stien hvis du legger fagkart.json et annet sted
const FAGKART_URL = "/emner/fagkart.json";

let cache: any = null;
let loadingPromise: Promise<any> | null = null;

export async function loadAll(): Promise<any> {
  // Returner cache hvis vi allerede har lastet
  if (cache) return cache;

  // Hvis en lastingen allerede pågår, gjenbruk samme promise
  if (loadingPromise) return loadingPromise;

  loadingPromise = fetch(FAGKART_URL)
    .then((res) => {
      if (!res.ok) {
        if (DEBUG) console.warn("Kunne ikke laste fagkart:", res.status, res.statusText);
        return {};
      }
      return res.json();
    })
    .then((data) => {
      cache = data || {};
      return cache;
    })
    .catch((err) => {
      if (DEBUG) console.warn("Feil ved henting av fagkart:", err);
      cache = {};
      return cache;
    })
    .finally(() => {
      loadingPromise = null;
    });

  return loadingPromise;
}

// Hent ett fagfelt (humaniora, naturvitenskap, osv.)
export async function getField(fieldId: string): Promise<any> {
  const all = await loadAll();
  return all[fieldId] || null;
}

// Liste over alle fagfelt (som array)
export async function listFields(): Promise<any[]> {
  const all = await loadAll();
  return Object.entries(all)
    .filter(([k, v]: [string, any]) => k !== "_meta" && v && typeof v === "object" && Array.isArray(v.families))
    .map(([, v]) => v);
}

// Sync/bruk senere: f.eks. hente alle subfields som flat liste
export async function listAllSubfields(): Promise<any[]> {
  const all = await loadAll();
  const out: any[] = [];

  Object.entries(all).forEach(([fieldId, field]: [string, any]) => {
    if (fieldId === "_meta") return;
    (field.families || []).forEach((fam: any) => {
      (fam.subfields || []).forEach((sf: any) => {
        out.push({
          fieldId,
          fieldLabel: field.label,
          familyId: fam.id,
          familyLabel: fam.label,
          subfieldId: sf.id,
          subfieldLabel: sf.label
        });
      });
    });
  });

  return out;
}

export const Fagkart = {
  loadAll,
  getField,
  listFields,
  listAllSubfields
};

// Interop: publiser global for klassiske (ikke-migrerte) konsumenter.
(globalThis as any).Fagkart = Fagkart;
