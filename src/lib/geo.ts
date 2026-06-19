/**
 * IP-based location → city + region (state) + ISO country code.
 *
 * Primary path is our same-origin `/api/location` route, which runs the lookup
 * server-side. A direct browser call to a third-party geo API gets blocked by
 * privacy browsers (Brave) and ad/tracker blockers, so that route is what makes
 * "Add location" actually work for real users. We keep a direct call as a
 * last-ditch fallback for when the route is unavailable.
 */

interface Location {
  city: string;
  region: string;
  countryCode: string;
}

export async function detectLocation(): Promise<Location | null> {
  // Server-side proxy — same origin, can't be ad-blocked.
  try {
    const res = await fetch("/api/location", { cache: "no-store" });
    if (res.ok) {
      const d = (await res.json()) as Location | null;
      if (d && (d.city || d.countryCode)) return d;
    }
  } catch {
    /* fall through to the direct provider */
  }

  // Fallback: direct call (may be blocked by the browser/extensions).
  try {
    const res = await fetch("https://ipwho.is/");
    const d = await res.json();
    if (d && d.success !== false && (d.city || d.country_code)) {
      return {
        city: d.city ?? "",
        region: d.region ?? "",
        countryCode: d.country_code ?? "",
      };
    }
  } catch {
    /* give up quietly — location stays unset */
  }

  return null;
}
