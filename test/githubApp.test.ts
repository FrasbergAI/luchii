import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import test, { mock } from "node:test";

import { getCiInstallationToken } from "../infra/github/ci.js";
import { GitHubAppClient, normalizeInstallationToken } from "../infra/github/githubApp.js";

const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const privateKeyPem = privateKey.export({ format: "pem", type: "pkcs1" }).toString();

function createClient(): GitHubAppClient {
  return new GitHubAppClient({
    appId: "12345",
    privateKey: privateKeyPem,
  });
}

test("accepts synthetic long installation tokens", async () => {
  const longToken = `ghs_${"x".repeat(600)}`;
  mock.method(globalThis, "fetch", async () => {
    return new Response(
      JSON.stringify({
        token: longToken,
        expires_at: "2030-01-01T00:00:00Z",
      }),
      { status: 201 },
    );
  });

  try {
    await assert.doesNotReject(async () => {
      const token = await createClient().getInstallationToken(999);
      assert.equal(token.token, longToken);
      assert.equal(token.token.length, 604);
    });
  } finally {
    mock.restoreAll();
  }
});

test("accepts short non-empty tokens without length assumptions", async () => {
  mock.method(globalThis, "fetch", async () => {
    return new Response(
      JSON.stringify({
        token: "x",
        expires_at: "2030-01-01T00:00:00Z",
      }),
      { status: 201 },
    );
  });

  try {
    const token = await createClient().getInstallationToken(999);
    assert.equal(token.token, "x");
  } finally {
    mock.restoreAll();
  }
});

test("rejects empty token values", () => {
  assert.throws(
    () => normalizeInstallationToken({ token: "", expires_at: "2030-01-01T00:00:00Z" }),
    /non-empty string token/,
  );
});

test("rejects non-string token values", () => {
  assert.throws(
    () => normalizeInstallationToken({ token: 123, expires_at: "2030-01-01T00:00:00Z" }),
    /non-empty string token/,
  );
});

test("surfaces clear non-2xx GitHub API errors", async () => {
  mock.method(globalThis, "fetch", async () => {
    return new Response(JSON.stringify({ message: "Bad credentials" }), {
      status: 401,
      statusText: "Unauthorized",
    });
  });

  try {
    await assert.rejects(
      () => createClient().getInstallationToken(999),
      /GitHub installation token request failed with 401 Unauthorized: Bad credentials/,
    );
  } finally {
    mock.restoreAll();
  }
});

test("CI helper validates required environment variables", async () => {
  await assert.rejects(() => getCiInstallationToken({}), /Missing required environment variable: GITHUB_APP_ID\./);
});
