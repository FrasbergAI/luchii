import { GitHubAppClient } from "./githubApp.js";
import type { InstallationToken } from "./types.js";

export async function getCiInstallationToken(
  env: NodeJS.ProcessEnv = process.env,
): Promise<InstallationToken> {
  const appId = getRequiredEnv(env, "GITHUB_APP_ID");
  const privateKey = getRequiredEnv(env, "GITHUB_APP_PRIVATE_KEY").replace(/\\n/g, "\n");
  const installationId = getRequiredEnv(env, "GITHUB_APP_INSTALLATION_ID");
  const apiBaseUrl = env.GITHUB_API_URL?.trim() || undefined;
  const userAgent = env.GITHUB_APP_USER_AGENT?.trim() || undefined;

  const config = {
    appId,
    privateKey,
    ...(apiBaseUrl ? { apiBaseUrl } : {}),
    ...(userAgent ? { userAgent } : {}),
  };

  return new GitHubAppClient(config).getInstallationToken(installationId);
}

function getRequiredEnv(env: NodeJS.ProcessEnv, key: string): string {
  const value = env[key]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}.`);
  }

  return value;
}
