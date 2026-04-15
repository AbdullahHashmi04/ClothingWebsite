const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function getCached(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const { data, timestamp } = JSON.parse(raw);
    const isExpired = Date.now() - timestamp > CACHE_TTL_MS;

    if (isExpired) {
      localStorage.removeItem(key); // clean up stale entry
      return null;
    }

    return data;
  } catch {
    return null; // corrupted cache, ignore it
  }
}

export function setCached(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // localStorage can be full — fail silently
  }
}