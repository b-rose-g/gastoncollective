export const GASTON_CONTACT_EMAIL = 'thegastoncollective@gmail.com';
export const GASTON_CONTACT_MAILTO = `mailto:${GASTON_CONTACT_EMAIL}`;
const LEGACY_GASTON_CONTACT_MAILTO = 'mailto:hello@gastoncollective.com';

type GastonMailtoOptions = {
  subject?: string;
  body?: string;
};

export function gastonMailto(options: GastonMailtoOptions = {}) {
  const query = [
    mailtoParam('subject', options.subject),
    mailtoParam('body', options.body),
  ].filter(Boolean);

  return query.length > 0 ? `${GASTON_CONTACT_MAILTO}?${query.join('&')}` : GASTON_CONTACT_MAILTO;
}

export function normalizeGastonContactMailto(value: string | null | undefined) {
  if (!value) return value;

  const trimmed = value.trim();
  if (!trimmed.toLowerCase().startsWith(LEGACY_GASTON_CONTACT_MAILTO)) return value;

  return `${GASTON_CONTACT_MAILTO}${trimmed.slice(LEGACY_GASTON_CONTACT_MAILTO.length)}`;
}

function mailtoParam(name: string, value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? `${name}=${encodeURIComponent(trimmed)}` : null;
}
