type LuluTokenResponse = {
  access_token?: string;
};

const luluEnvKeys = [
  "LULU_API_BASE_URL",
  "LULU_CLIENT_KEY",
  "LULU_CLIENT_SECRET",
  "LULU_CONTACT_EMAIL",
] as const;

const tokenPath = "/auth/realms/glasstree/protocol/openid-connect/token";

type LuluConfig = {
  apiBaseUrl: string;
  clientKey: string;
  clientSecret: string;
};

export async function testLuluTokenRequestFromEnv() {
  try {
    const config = getLuluConfigFromEnv();
    const response = await fetch(luluUrl(config.apiBaseUrl, tokenPath), {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${Buffer.from(`${config.clientKey}:${config.clientSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ grant_type: "client_credentials" }),
    });

    const data = await readJson(response);
    return response.ok && typeof data?.access_token === "string" && data.access_token.length > 0;
  } catch {
    return false;
  }
}

function getLuluConfigFromEnv(): LuluConfig {
  const missing = luluEnvKeys.filter((key) => !cleanEnvValue(process.env[key]));
  if (missing.length > 0) {
    throw new Error("Lulu is not configured.");
  }

  return {
    apiBaseUrl: cleanEnvValue(process.env.LULU_API_BASE_URL),
    clientKey: cleanEnvValue(process.env.LULU_CLIENT_KEY),
    clientSecret: cleanEnvValue(process.env.LULU_CLIENT_SECRET),
  };
}

async function readJson(response: Response) {
  const text = await response.text();
  if (!text.trim()) return null;

  try {
    return JSON.parse(text) as LuluTokenResponse;
  } catch {
    return null;
  }
}

function luluUrl(baseUrl: string, pathValue: string) {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(pathValue.replace(/^\/+/, ""), normalizedBase).toString();
}

function cleanEnvValue(value: string | undefined) {
  return String(value ?? "").trim();
}
