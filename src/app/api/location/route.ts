import type { NextRequest } from "next/server";

// Always run at request time — we read the caller's IP/geo from request headers.
export const dynamic = "force-dynamic";

interface Location {
  city: string;
  region: string;
  countryCode: string;
}

/**
 * Geo from platform-injected request headers. This is the reliable path on the
 * deployed site: the hosting layer (Cloudflare / Vercel) attaches the visitor's
 * location to every request, so there's no third-party API to be blocked, rate
 * limited, or time out.
 *
 * Cloudflare: `cf-ipcountry` is always present; `cf-ipcity`/`cf-region` require
 * the "Add visitor location headers" Managed Transform to be enabled in the
 * dashboard (Rules → Settings → Managed Transforms).
 */
function fromHeaders(h: Headers): Location | null {
  const cfCity = h.get("cf-ipcity");
  const cfCountry = h.get("cf-ipcountry");
  if (cfCity || (cfCountry && cfCountry !== "XX")) {
    return {
      city: cfCity ?? "",
      region: h.get("cf-region") ?? "",
      countryCode: cfCountry && cfCountry !== "XX" ? cfCountry : "",
    };
  }

  // Vercel injects these (city is URL-encoded, e.g. "New%20York").
  const vCity = h.get("x-vercel-ip-city");
  const vCountry = h.get("x-vercel-ip-country");
  if (vCity || vCountry) {
    return {
      city: vCity ? decodeURIComponent(vCity) : "",
      region: h.get("x-vercel-ip-country-region") ?? "",
      countryCode: vCountry ?? "",
    };
  }

  return null;
}

/**
 * Loopback/private IPs (e.g. `::1` and `127.0.0.1` in local dev, or LAN ranges)
 * can't be geolocated, so we treat them as "no IP" — the provider then falls
 * back to the server's own public IP, which is what we want locally.
 */
function publicIp(ip: string): string {
  if (
    !ip ||
    ip === "::1" ||
    ip === "::" ||
    ip.startsWith("127.") ||
    /^10\./.test(ip) ||
    /^192\.168\./.test(ip) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
    /^f[cd]/i.test(ip) || // IPv6 unique-local
    /^fe80:/i.test(ip) // IPv6 link-local
  ) {
    return "";
  }
  return ip;
}

/**
 * External fallback for local dev (no platform geo headers). Forwards the
 * visitor's IP so the result is theirs, not the datacenter's. Providers are
 * tried in order; an empty `ip` makes each fall back to the caller's own IP.
 */
async function lookup(ip: string): Promise<Location | null> {
  try {
    const url = ip
      ? `https://freeipapi.com/api/json/${encodeURIComponent(ip)}`
      : "https://freeipapi.com/api/json/";
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      const d = (await res.json()) as {
        cityName?: string;
        regionName?: string;
        countryCode?: string;
      };
      if (d && (d.cityName || d.countryCode)) {
        return {
          city: d.cityName ?? "",
          region: d.regionName ?? "",
          countryCode: d.countryCode ?? "",
        };
      }
    }
  } catch {
    /* try the next provider */
  }

  try {
    const url = ip
      ? `http://ip-api.com/json/${encodeURIComponent(ip)}`
      : "http://ip-api.com/json/";
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      const d = (await res.json()) as {
        status?: string;
        city?: string;
        regionName?: string;
        countryCode?: string;
      };
      if (d && d.status === "success" && (d.city || d.countryCode)) {
        return {
          city: d.city ?? "",
          region: d.regionName ?? "",
          countryCode: d.countryCode ?? "",
        };
      }
    }
  } catch {
    /* give up */
  }

  return null;
}

export async function GET(request: NextRequest) {
  const h = request.headers;
  const ip = publicIp(
    h.get("cf-connecting-ip") ??
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      ""
  );

  // `/api/location?debug=1` surfaces what the runtime actually sees (and why a
  // lookup failed), so location issues can be diagnosed without guessing.
  if (request.nextUrl.searchParams.get("debug") === "1") {
    const probe = async (url: string) => {
      try {
        const res = await fetch(url, { cache: "no-store" });
        return { ok: res.ok, status: res.status, body: await res.text() };
      } catch (e) {
        return { error: e instanceof Error ? e.message : String(e) };
      }
    };
    return Response.json({
      ip,
      headers: {
        "cf-ipcity": h.get("cf-ipcity"),
        "cf-region": h.get("cf-region"),
        "cf-ipcountry": h.get("cf-ipcountry"),
        "x-vercel-ip-city": h.get("x-vercel-ip-city"),
      },
      fromHeaders: fromHeaders(h),
      fromLookup: await lookup(ip),
      probes: {
        freeipapi: await probe("https://freeipapi.com/api/json/"),
        ipapi: await probe("http://ip-api.com/json/"),
      },
    });
  }

  // Prefer platform geo (instant, unblockable). Fall back to the external
  // lookup if headers gave us no city.
  const header = fromHeaders(h);
  if (header && header.city) return Response.json(header);

  const looked = await lookup(ip);
  return Response.json(looked ?? header);
}
