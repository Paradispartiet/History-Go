// History Go — Social Meet Supabase runtime config (EXAMPLE / template).
//
// The committed `js/config-supabase.js` is the safe DISABLED default the app
// actually loads. To enable Supabase, edit that file with your project's PUBLIC
// values (this file is just the annotated reference / template).
//
// Rules (see docs/social-meet-backend.md):
//   * Use ONLY the project URL and the PUBLIC anon / publishable key.
//   * NEVER put the service_role key (or any private secret) in a browser file.
//   * With no config present, History Go stays on the local/demo backend and
//     nothing here is required.
//
// Where the values come from (Supabase dashboard → your project → Connect):
//   url      = Project URL,      e.g. https://<project-ref>.supabase.co
//   anonKey  = Publishable key,  e.g. sb_publishable_...  (a.k.a. anon key)
//
// The History Go project is "AHA" in the EchoNet organization; its schema is
// created by supabase/migrations/001_social_meet.sql.

// Public project URL and publishable (anon) key — replace the placeholders.
window.HG_SOCIAL_MEET_SUPABASE = {
  enabled: true,
  url: "https://DIN_PROJECT_REF.supabase.co",
  anonKey: "DIN_PUBLISHABLE_ANON_KEY"
};

// Switch the Social Meet UI from the local/demo backend to Supabase.
// Leave this unset (or "local") to keep using the demo layer.
window.HG_SOCIAL_MEET_BACKEND = "supabase";
