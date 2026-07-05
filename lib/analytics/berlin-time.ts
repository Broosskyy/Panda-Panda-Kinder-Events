/** Midnight today in Europe/Berlin as UTC ISO string (fallback when RPC unavailable). */
export function berlinTodayStartIso(): string {
  const now = new Date();
  const berlinNow = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Berlin" }));
  berlinNow.setHours(0, 0, 0, 0);
  const offsetMs = now.getTime() - new Date(now.toLocaleString("en-US", { timeZone: "Europe/Berlin" })).getTime();
  return new Date(berlinNow.getTime() - offsetMs).toISOString();
}
