export function normalizeLeadEmail(email: string) {
  return email.trim().toLowerCase();
}

export function encodeLeadEmail(email: string) {
  return encodeURIComponent(normalizeLeadEmail(email));
}

export function decodeLeadEmail(email: string) {
  try {
    return normalizeLeadEmail(decodeURIComponent(email));
  } catch {
    return normalizeLeadEmail(email);
  }
}

export function buildLeadHref(email: string) {
  return `/intake/${encodeLeadEmail(email)}`;
}
