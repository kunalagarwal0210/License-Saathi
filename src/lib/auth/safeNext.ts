// Open-redirect guard for the OAuth callback: only same-origin relative paths
// are allowed. Must start with "/" but not "//" or "/\" (protocol-relative).
export function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) {
    return "/";
  }
  return raw;
}
