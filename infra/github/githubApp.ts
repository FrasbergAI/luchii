import { createSign } from "node:crypto";

import type { GitHubAppConfig, InstallationToken } from "./types.js";

const DEFAULT_API_BASE_URL = "https://api.github.com";
const DEFAULT_USER_AGENT = "luchii-github-app-client";
const GITHUB_API_VERSION = "2022-11-28";
const APP_JWT_LIFETIME_SECONDS = 9 * 60;

type InstallationTokenPayload = {
  token?: unknown;
  expires_at?: unknown;
  permissions?: unknown;
  repository_selection?: unknown;
};

export function createAppJwt(config: GitHubAppConfig, now: Date = new Date()): string {
  assertNonEmptyString(config.appId, "GitHub app id");
  assertNonEmptyString(config.privateKey, "GitHub app private key");

  const issuedAt = Math.floor(now.getTime() / 1000) - 60;
  const expiresAt = issuedAt + APP_JWT_LIFETIME_SECONDS;
  const header = encodeBase64Url({ alg: "RS256", typ: "JWT" });
  const payload = encodeBase64Url({
    iss: config.appId,
    iat: issuedAt,
    exp: expiresAt,
  });
  const signer = createSign("RSA-SHA256");
  const body = `${header}.${payload}`;

  signer.update(body);
  signer.end();

  const signature = signer.sign(config.privateKey);

  return `${body}.${encodeBase64Url(signature)}`;
}

export function normalizeInstallationToken(payload: unknown): InstallationToken {
  if (!payload || typeof payload !== "object") {
    throw new Error("GitHub installation token response must be an object.");
  }

  const tokenPayload = payload as InstallationTokenPayload;

  if (typeof tokenPayload.token !== "string" || tokenPayload.token.trim().length === 0) {
    throw new Error("GitHub installation token response must include a non-empty string token.");
  }

  if (typeof tokenPayload.expires_at !== "string" || tokenPayload.expires_at.trim().length === 0) {
    throw new Error("GitHub installation token response must include a non-empty expires_at string.");
  }

  const normalized: InstallationToken = {
    token: tokenPayload.token,
    expiresAt: tokenPayload.expires_at,
  };

  if (isStringRecord(tokenPayload.permissions)) {
    normalized.permissions = tokenPayload.permissions;
  }

  if (typeof tokenPayload.repository_selection === "string" && tokenPayload.repository_selection.length > 0) {
    normalized.repositorySelection = tokenPayload.repository_selection;
  }

  return normalized;
}

export class GitHubAppClient {
  constructor(private readonly config: GitHubAppConfig) {
    assertNonEmptyString(config.appId, "GitHub app id");
    assertNonEmptyString(config.privateKey, "GitHub app private key");
  }

  async getInstallationToken(installationId: string | number): Promise<InstallationToken> {
    const normalizedInstallationId = String(installationId).trim();

    if (normalizedInstallationId.length === 0) {
      throw new Error("GitHub installation id must be a non-empty string or number.");
    }

    const response = await fetch(
      `${normalizeApiBaseUrl(this.config.apiBaseUrl)}/app/installations/${normalizedInstallationId}/access_tokens`,
      {
        method: "POST",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: ["Bearer", createAppJwt(this.config)].join(" "),
          "Content-Type": "application/json",
          "User-Agent": this.config.userAgent ?? DEFAULT_USER_AGENT,
          "X-GitHub-Api-Version": GITHUB_API_VERSION,
        },
        body: "{}",
      },
    );

    const rawBody = await response.text();
    const payload = rawBody.length > 0 ? safeParseJson(rawBody) : undefined;

    if (!response.ok) {
      throw new Error(buildHttpError(response.status, response.statusText, payload));
    }

    return normalizeInstallationToken(payload);
  }
}

function encodeBase64Url(value: Buffer | object): string {
  const buffer = Buffer.isBuffer(value) ? value : Buffer.from(JSON.stringify(value));
  return buffer.toString("base64url");
}

function normalizeApiBaseUrl(apiBaseUrl: string | undefined): string {
  const baseUrl = apiBaseUrl?.trim() || DEFAULT_API_BASE_URL;
  return baseUrl.replace(/\/+$/, "");
}

function safeParseJson(rawBody: string): unknown {
  try {
    return JSON.parse(rawBody);
  } catch {
    return rawBody;
  }
}

function buildHttpError(status: number, statusText: string, payload: unknown): string {
  const details = extractErrorDetails(payload);
  return details
    ? `GitHub installation token request failed with ${status} ${statusText}: ${details}`
    : `GitHub installation token request failed with ${status} ${statusText}.`;
}

function extractErrorDetails(payload: unknown): string | undefined {
  if (typeof payload === "string") {
    return payload.trim() || undefined;
  }

  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  const message = "message" in payload ? payload.message : undefined;

  return typeof message === "string" && message.trim().length > 0 ? message.trim() : undefined;
}

function isStringRecord(value: unknown): value is Record<string, string> {
  if (!value || typeof value !== "object") {
    return false;
  }

  return Object.values(value).every((entry) => typeof entry === "string");
}

function assertNonEmptyString(value: string, label: string): void {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string.`);
  }
}
