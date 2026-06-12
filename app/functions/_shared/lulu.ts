export type LuluEnv = {
  LULU_API_BASE_URL?: string;
  LULU_CLIENT_KEY?: string;
  LULU_CLIENT_SECRET?: string;
  LULU_CONTACT_EMAIL?: string;
};

export type PagesContext = {
  request: Request;
  env: LuluEnv;
};

type LuluConfig = {
  apiBaseUrl: string;
  clientKey: string;
  clientSecret: string;
  contactEmail: string;
};

type LuluTokenResponse = {
  access_token?: string;
  expires_in?: number;
  token_type?: string;
};

const requiredEnvKeys = [
  'LULU_API_BASE_URL',
  'LULU_CLIENT_KEY',
  'LULU_CLIENT_SECRET',
  'LULU_CONTACT_EMAIL',
] as const;

const tokenPath = '/auth/realms/glasstree/protocol/openid-connect/token';

export class PublicFunctionError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function luluEnvironmentStatus(env: LuluEnv) {
  const missing = requiredEnvKeys.filter((key) => !cleanEnvValue(env[key]));

  return {
    configured: missing.length === 0,
    missing,
    contactEmailConfigured: Boolean(cleanEnvValue(env.LULU_CONTACT_EMAIL)),
  };
}

export async function testLuluTokenRequest(env: LuluEnv) {
  try {
    const config = getLuluConfig(env);
    await getLuluAccessToken(config);
    return true;
  } catch {
    return false;
  }
}

export async function luluApiRequest(
  env: LuluEnv,
  endpoint: string,
  init: { method: 'GET' | 'POST'; body?: unknown },
) {
  const config = getLuluConfig(env);
  const accessToken = await getLuluAccessToken(config);
  const response = await fetch(luluUrl(config.apiBaseUrl, endpoint), {
    method: init.method,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...(init.body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });

  const data = await readResponseBody(response);

  if (!response.ok) {
    return jsonResponse({ error: luluErrorMessage(data), details: data }, response.status);
  }

  return jsonResponse(data, response.status);
}

export async function readJsonBody(request: Request, maxLength = 512 * 1024) {
  const contentType = request.headers.get('content-type') ?? '';
  const contentLength = Number(request.headers.get('content-length') ?? 0);

  if (!contentType.toLowerCase().includes('application/json')) {
    throw new PublicFunctionError(415, 'Send this request as JSON.');
  }

  if (Number.isFinite(contentLength) && contentLength > maxLength) {
    throw new PublicFunctionError(413, 'This Lulu request is too large.');
  }

  const text = await request.text();
  if (text.length > maxLength) {
    throw new PublicFunctionError(413, 'This Lulu request is too large.');
  }

  if (!text.trim()) return {};

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new PublicFunctionError(400, 'This Lulu request is not valid JSON.');
  }
}

export function withDefaultContactEmail(payload: unknown, contactEmail: string | undefined) {
  if (!isRecord(payload) || !contactEmail) return payload;
  if (typeof payload.contact_email === 'string' && payload.contact_email.trim()) return payload;

  return {
    ...payload,
    contact_email: contactEmail,
  };
}

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

export function methodNotAllowed(allowed: string) {
  return new Response(JSON.stringify({ error: 'Method not allowed.' }), {
    status: 405,
    headers: {
      Allow: allowed,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

export function functionErrorResponse(error: unknown) {
  if (error instanceof PublicFunctionError) {
    return jsonResponse({ error: error.message, details: error.details }, error.status);
  }

  return jsonResponse({ error: 'Lulu is not available right now. Please try again soon.' }, 502);
}

export function getConfiguredContactEmail(env: LuluEnv) {
  return cleanEnvValue(env.LULU_CONTACT_EMAIL);
}

function getLuluConfig(env: LuluEnv): LuluConfig {
  const status = luluEnvironmentStatus(env);
  if (!status.configured) {
    throw new PublicFunctionError(500, 'Lulu is not configured yet.', { missing: status.missing });
  }

  return {
    apiBaseUrl: cleanEnvValue(env.LULU_API_BASE_URL),
    clientKey: cleanEnvValue(env.LULU_CLIENT_KEY),
    clientSecret: cleanEnvValue(env.LULU_CLIENT_SECRET),
    contactEmail: cleanEnvValue(env.LULU_CONTACT_EMAIL),
  };
}

async function getLuluAccessToken(config: LuluConfig) {
  const credentials = btoa(`${config.clientKey}:${config.clientSecret}`);
  const body = new URLSearchParams({ grant_type: 'client_credentials' });
  const response = await fetch(luluUrl(config.apiBaseUrl, tokenPath), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  const data = (await readResponseBody(response)) as LuluTokenResponse;
  if (!response.ok || typeof data.access_token !== 'string' || !data.access_token) {
    throw new PublicFunctionError(502, 'Lulu authentication failed.');
  }

  return data.access_token;
}

async function readResponseBody(response: Response) {
  const text = await response.text();
  if (!text.trim()) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text };
  }
}

function luluUrl(baseUrl: string, path: string) {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return new URL(path.replace(/^\/+/, ''), normalizedBase).toString();
}

function luluErrorMessage(data: unknown) {
  if (isRecord(data)) {
    const message = data.message ?? data.error_description ?? data.error;
    if (typeof message === 'string' && message.trim()) return message.trim();
  }

  return 'Lulu request failed.';
}

function cleanEnvValue(value: string | undefined) {
  return String(value ?? '').trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
