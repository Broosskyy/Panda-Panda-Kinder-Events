/** Safe JSON-LD serialization — prevents script breakout via </script> in CMS strings */
export function safeJsonLdStringify(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
