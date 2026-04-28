const CIVI_CONTACTS_KEY = "hg_civi_contacts_v1";
function dispatchProfileUpdate() {
  try { window.dispatchEvent(new Event("updateProfile")); } catch {}
}

function getCiviContacts() {
  try {
    const raw = JSON.parse(localStorage.getItem(CIVI_CONTACTS_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function saveCiviContacts(contacts) {
  const safe = Array.isArray(contacts) ? contacts : [];
  const nextRaw = JSON.stringify(safe);
  const prevRaw = localStorage.getItem(CIVI_CONTACTS_KEY);
  if (prevRaw === nextRaw) return safe;
  localStorage.setItem(CIVI_CONTACTS_KEY, nextRaw);
  dispatchProfileUpdate();
  return safe;
}

function addCiviContact(contact) {
  const contacts = getCiviContacts();

  const safeContact = {
    id: String(contact?.id || `contact_${Date.now()}`),
    type: String(contact?.type || "generic"),
    name: String(contact?.name || "Kontakt"),
    sourcePhase: String(contact?.sourcePhase || ""),
    sourceContextId: contact?.sourceContextId ? String(contact.sourceContextId) : null,
    sourceContextLabel: contact?.sourceContextLabel ? String(contact.sourceContextLabel) : null,
    careerId: String(contact?.careerId || ""),
    strength: Number(contact?.strength || 1),
    createdAt: String(contact?.createdAt || new Date().toISOString())
  };

  const existingIdx = contacts.findIndex(
    (c) =>
      String(c?.type || "") === safeContact.type &&
      String(c?.sourceContextId || "") === String(safeContact.sourceContextId || "") &&
      String(c?.careerId || "") === safeContact.careerId
  );

  let next;
  if (existingIdx >= 0) {
    next = contacts.map((c, i) =>
      i === existingIdx
        ? {
            ...c,
            strength: Number(c?.strength || 1) + 1
          }
        : c
    );
  } else {
    next = contacts.concat([safeContact]);
  }

  return saveCiviContacts(next);
}


function maybeCreateContactFromChoice(phaseTag, pendingEvent, choice, result) {
  const activeCareerId =
    window.CivicationState?.getActivePosition?.()?.career_id || "";

  const effect = Number(result?.effect || 0);
  const choiceId = String(choice?.id || "");
  const tags = Array.isArray(choice?.tags) ? choice.tags : [];

  const lunchContext = pendingEvent?.lunch_context || null;
  const eveningContext = pendingEvent?.evening_context || null;
  const ctx = phaseTag === "lunch" ? lunchContext : eveningContext;

  if (phaseTag === "lunch" && choiceId === "B") {
    addCiviContact({
      type: "miljo",
      name: "Lunsjkontakt",
      sourcePhase: "lunch",
      sourceContextId: ctx?.history_go_context_id || ctx?.store_id || null,
      sourceContextLabel:
        ctx?.history_go_context_label || ctx?.store_name || "Lunsjmiljø",
      careerId: activeCareerId,
      strength: 1
    });
    return true;
  }

  if (phaseTag === "evening" && choiceId === "C") {
    addCiviContact({
      type: "nettverk",
      name: "Kveldskontakt",
      sourcePhase: "evening",
      sourceContextId: ctx?.history_go_context_id || ctx?.store_id || null,
      sourceContextLabel:
        ctx?.history_go_context_label || ctx?.store_name || "Kveldsmiljø",
      careerId: activeCareerId,
      strength: 1
    });
    return true;
  }

  if (phaseTag === "afternoon" && effect > 0) {
    addCiviContact({
      type: "kollega",
      name: "Arbeidskontakt",
      sourcePhase: "afternoon",
      sourceContextId: activeCareerId || null,
      sourceContextLabel: activeCareerId || "Arbeidsmiljø",
      careerId: activeCareerId,
      strength: 1
    });
    return true;
  }

  if ((phaseTag === "lunch" || phaseTag === "evening") && tags.includes("visibility")) {
    addCiviContact({
      type: "synlighet",
      name: "Synlig kontakt",
      sourcePhase: phaseTag,
      sourceContextId: ctx?.history_go_context_id || ctx?.store_id || null,
      sourceContextLabel:
        ctx?.history_go_context_label || ctx?.store_name || "Synlig miljø",
      careerId: activeCareerId,
      strength: 1
    });
    return true;
  }

  return false;
}

function buildContactsHtml() {
  const contacts = getCiviContacts();
  if (!Array.isArray(contacts) || !contacts.length) return "";

  const sorted = contacts
    .slice()
    .sort((a, b) => Number(b?.strength || 0) - Number(a?.strength || 0))
    .slice(0, 5);

  return `
    <div class="civi-contacts-report" style="margin-bottom:12px;padding:12px;border:1px solid rgba(255,255,255,0.12);border-radius:14px;background:rgba(255,255,255,0.04);">
      <div style="font-weight:700;margin-bottom:8px;">Kontakter</div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${sorted
          .map((c) => {
            const type = String(c?.type || "kontakt");
            const name = String(c?.name || "Kontakt");
            const label = String(c?.sourceContextLabel || "Ukjent miljø");
            const strength = Number(c?.strength || 1);

            return `
              <div style="padding:8px 10px;border:1px solid rgba(255,255,255,0.08);border-radius:10px;background:rgba(255,255,255,0.03);">
                <div style="font-weight:600;">${name}</div>
                <div style="font-size:0.9rem;opacity:0.9;">Type: ${type} · Miljø: ${label}</div>
                <div style="font-size:0.88rem;opacity:0.8;">Styrke: ${strength}</div>
              </div>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}
