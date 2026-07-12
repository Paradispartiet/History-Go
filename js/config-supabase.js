// History Go — Social Meet Supabase runtime config.
//
// Committed SAFE DEFAULT: Supabase is DISABLED here and no key is present, so
// the Social Meet UI keeps using the local/demo backend out of the box. This
// mirrors js/config.js (the safe no-key MapTiler default).
//
// To enable the live Supabase (AHA) backend, fill in the PUBLIC values below
// and flip HG_SOCIAL_MEET_BACKEND to "supabase". See
// docs/social-meet-backend.md → "Enabling the Supabase backend", and the fuller
// template in js/config-supabase.example.js.
//
// SECURITY:
//   * Use ONLY the PUBLIC anon / publishable key (RLS protects the data).
//   * NEVER put the service_role key or any private secret in this browser file.
//   * Do not commit a real key upstream.

window.HG_SOCIAL_MEET_SUPABASE = {
  enabled: false,   // set true once url + anonKey are filled in
  url: "",          // e.g. https://<project-ref>.supabase.co
  anonKey: ""       // e.g. sb_publishable_... (public anon key)
};

// Leave as the local/demo backend by default. Set to "supabase" to use the
// config above.
window.HG_SOCIAL_MEET_BACKEND = "local";
