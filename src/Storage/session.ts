interface Session {
  readonly token: string;
  readonly expiresAt: number;
}
const KEY = "nova-admin-session";
const TTL = 8 * 60 * 60 * 1000;

function expiration(token: string) {
  const parts = token.split(".");
  if (parts.length === 1 && token.trim()) return Infinity;
  if (parts.length !== 3 || parts.some((part) => !part)) return 0;
  try {
    const payload: unknown = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (typeof payload !== "object" || payload === null || !("exp" in payload)) return Infinity;
    const exp = payload.exp;
    if (exp === undefined) return Infinity;
    return typeof exp === "number" && Number.isFinite(exp) ? exp * 1000 : 0;
  } catch {
    return 0;
  }
}

function restore(): Session | undefined {
  try {
    const saved: unknown = JSON.parse(sessionStorage.getItem(KEY) ?? "null");
    if (typeof saved === "object" && saved !== null && "token" in saved && "expiresAt" in saved) {
      const { token, expiresAt: savedExpiry } = saved;
      if (
        typeof token === "string" &&
        typeof savedExpiry === "number" &&
        Number.isFinite(savedExpiry)
      ) {
        const expiresAt = Math.min(savedExpiry, expiration(token), Date.now() + TTL);
        if (expiresAt > Date.now()) return { token, expiresAt };
      }
    }
    sessionStorage.removeItem(KEY);
  } catch {
    // Storage may be unavailable or contain invalid JSON.
  }
}

let session = restore();

export function beginSession(token: string) {
  const expiresAt = Math.min(Date.now() + TTL, expiration(token));
  if (expiresAt <= Date.now()) throw new Error("Expired session");
  const next = { token, expiresAt };
  sessionStorage.setItem(KEY, JSON.stringify(next));
  session = next;
}

export function getSession() {
  return session && session.expiresAt > Date.now() ? session : undefined;
}

export function clearSession() {
  session = undefined;
  sessionStorage.removeItem(KEY);
}
