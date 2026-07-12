export interface GitHubAppConfig {
  appId: string;
  privateKey: string;
  apiBaseUrl?: string;
  userAgent?: string;
}

export interface InstallationToken {
  token: string;
  expiresAt: string;
  permissions?: Record<string, string>;
  repositorySelection?: string;
}
