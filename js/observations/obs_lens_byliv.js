// obs_lens_byliv.js
// Klikkbar observasjons-UI for "Byliv" (7 dimensjoner)
// Output: { selected: [...], note: "..." }

(function () {
  "use strict";

  const BYLIV_SCHEMA = [
    {
      id: "bevegelse",
      title: "Bevegelse",
      hint: "Hvordan beveger folk seg her?",
      options: ["Gåing", "Sykling", "Kollektiv", "Gjennomfart", "Kryssing", "Stopp/opphopning"]
    },
    {
      id: "opphold",
      title: "Opphold",
      hint: "Hvor stopper folk – og hvorfor?",
      options: ["Sitte", "Stå", "Vente", "Henge", "Sol/skygge", "Uformelt opphold"]
    },
    {
      id: "moter",
      title: "Møter",
      hint: "Hvordan møtes mennesker?",
      options: ["Tilfeldige møter", "Planlagte møter", "Samtaler", "Observerer hverandre", "Lite/ingen samhandling"]
    },
    {
      id: "bruk",
      title: "Bruk av rom",
      hint: "Hva brukes stedet faktisk til?",
      options: ["Gjennomgang", "Lek", "Hvile", "Handel", "Servering", "Arrangement", "Demonstrasjon", "Annet"]
    },
    {
      id: "tid",
      title: "Tidsrytmer",
      hint: "Når lever dette stedet?",
      options: ["Morgen", "Dag", "Kveld", "Natt", "Hverdag", "Helg", "Sesongavhengig"]
    },
    {
      id: "miks",
      title: "Sosial miks",
      hint: "Hvem er her? (kryss av det som er tydelig synlig)",
      options: [
        "Barn", "Unge", "Voksne", "Eldre",
        "Lokale", "Turister",
        "Mangfoldig miks", "Ganske ensartet"
      ]
    },
    {
      id: "stemning",
      title: "Stemning og friksjon",
      hint: "Hvordan føles stedet – og hvor gnager det?",
      options: ["Rolig", "Livlig", "Stressende", "Trygt", "Utrygt", "Konfliktfylt", "Harmonisk", "Uformelle regler"]
    }
  ];

  function esc(s) {
    return String(s || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function slug(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^\wæøå_-]+/g, "");
  }

  function buildSelected(mount) {
    const out = [];
    BYLIV_SCHEMA.forEach(sec => {
      const secEl = mount.querySelector(`[data-byliv-sec="${sec.id}"]`);
      if (!secEl) return;

      const checked = [...secEl.querySelectorAll("input[type=checkbox]:checked")];
      checked.forEach(cb => {
        const label = cb.getAttribute("data-label") || cb.value || "";
        out.push(`${sec.title}: ${label}`);
      });

      // "Annet" fritekst (kun hvis fylt)
      const other = secEl.querySelector("input[type=text][data-other]");
      if (other && other.value.trim()) {
        out.push(`${sec.title}: Annet – ${other.value.trim()}`);
      }
    });
    return out;
  }

  function renderBylivLensHtml(target) {
    const title = target?.title ? esc(target.title) : "Sted";
    const when  = new Date().toLocaleString("no-NO");

    return `
      <div class="hg-obs">
        <div class="hg-obs-head">
          <div class="hg-obs-kicker">Byliv-observasjon</div>
          <div class="hg-obs-title"><strong>${title}</strong></div>
          <div class="hg-obs-meta">${when}</div>
        </div>

        <div class="hg-obs-sections">
          ${BYLIV_SCHEMA.map(sec => {
            const sid = esc(sec.id);
            return `
              <section class="hg-obs-sec" data-byliv-sec="${sid}">
                <div class="hg-obs-sec-head">
                  <div class="hg-obs-sec-title">${esc(sec.title)}</div>
                  <div class="hg-obs-sec-hint">${esc(sec.hint)}</div>
                </div>

                <div class="hg-obs-grid">
                  ${sec.options.map(opt => {
                    const id = `byliv_${sec.id}_${slug(opt)}`;
                    return `
                      <label class="hg-obs-chip" for="${esc(id)}">
                        <input id="${esc(id)}" type="checkbox" value="${esc(opt)}" data-label="${esc(opt)}">
                        <span>${esc(opt)}</span>
                      </label>
                    `;
                  }).join("")}
                </div>

                ${
                  sec.options.includes("Annet")
                    ? `
                      <div class="hg-obs-other">
                        <input type="text" data-other placeholder="Annet (valgfritt) …">
                      </div>
                    `
                    : ""
                }
              </section>
            `;
          }).join("")}
        </div>

        <div class="hg-obs-note">
          <div class="hg-obs-note-title">Samlet refleksjon</div>
          <textarea id="hgObsNote" rows="4" placeholder="Hva sier dette stedet om bylivet her? (kort)"></textarea>
        </div>

        <div class="hg-obs-actions">
          <button type="button" class="hg-btn" data-obs-cancel>Avbryt</button>
          <button type="button" class="hg-btn primary" data-obs-save>Lagre observasjon</button>
        </div>
      </div>
    `;
  }

  // Standalone mount: returnerer { selected, note }
  window.HGBylivLensUI = {
    mount(mountEl, ctx) {
      if (!mountEl) return;

      const target = ctx?.target || null;
      mountEl.innerHTML = renderBylivLensHtml(target);

      const onCancel = typeof ctx?.onCancel === "function" ? ctx.onCancel : null;
      const onSave   = typeof ctx?.onSave === "function" ? ctx.onSave : null;

      const btnCancel = mountEl.querySelector("[data-obs-cancel]");
      const btnSave   = mountEl.querySelector("[data-obs-save]");

      if (btnCancel) btnCancel.onclick = () => onCancel && onCancel();

      if (btnSave) {
        btnSave.onclick = () => {
          const selected = buildSelected(mountEl);
          const note = (mountEl.querySelector("#hgObsNote")?.value || "").trim();

          const payload = { selected, note };

          // Minimal validering: krever minst 1 valg eller note
          if (!payload.selected.length && !payload.note) {
            if (window.showToast) window.showToast("Velg minst én ting eller skriv et kort notat");
            return;
          }

          onSave && onSave(payload);
        };
      }
    }
  };
})();
