// Returns the app's public URL with any accidental whitespace (spaces, tabs,
// newlines from copy-paste) and trailing slashes removed. A stray tab in the
// environment variable makes Supabase reject the redirect link, which the
// browser then reports as a misleading "CORS request did not succeed" error.
export function getSiteUrl(fallback) {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || fallback || "").trim();
  return raw.replace(/\/+$/, "");
}
