/** Detect common bots/crawlers — do not count in analytics. */
const BOT_PATTERN =
  /bot|crawl|spider|slurp|mediapartners|headless|phantom|selenium|lighthouse|pingdom|gtmetrix|bytespider|petalbot|ahrefs|semrush|yandex|baidu|duckduckbot|facebookexternalhit|whatsapp|telegrambot|preview|prerender|screaming frog/i;

export function isBotUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return BOT_PATTERN.test(userAgent);
}
