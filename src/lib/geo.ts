/**
 * IP-based location → city + region (state) + ISO country code.
 * IP geolocation needs no permission prompt and works in any context (unlike
 * the browser Geolocation API, which requires a secure origin + user grant and
 * fails silently otherwise). We try ipwho.is first, then ipapi.co as a fallback.
 * Swap these for a server-side lookup when you move off local-first.
 */

export async function detectLocation(): Promise<{
  city: string;
  region: string;
  countryCode: string;
} | null> {
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
    /* fall through to the backup provider */
  }

  try {
    const res = await fetch("https://ipapi.co/json/");
    const d = await res.json();
    if (d && (d.city || d.country_code)) {
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
