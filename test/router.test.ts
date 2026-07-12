import assert from "node:assert/strict";
import test from "node:test";

import { InMemoryProviderRegistry } from "../luchii/router/providers.js";
import { Router, type RouterConfig } from "../luchii/router/router.js";

const registry = new InMemoryProviderRegistry();

test("exact tenant/domain/region beats wildcard matches", () => {
  const router = new Router(
    {
      schemaVersion: "1.0.0",
      rules: [
        {
          id: "region-default",
          region: "eu-central-1",
          model: { providerId: "provider-a", model: "broad-model" },
        },
        {
          id: "tenant-domain-region",
          tenant: "tenant-a",
          domain: "finance",
          region: "eu-central-1",
          model: { providerId: "provider-a", model: "precise-model" },
        },
        {
          id: "tenant-domain",
          tenant: "tenant-a",
          domain: "finance",
          model: { providerId: "provider-a", model: "less-precise-model" },
        },
      ],
    },
    registry,
  );

  assert.equal(
    router.resolveRule({ tenant: "tenant-a", domain: "finance", region: "eu-central-1" }).id,
    "tenant-domain-region",
  );
});

test("domain and region beats region-only", () => {
  const router = new Router(
    {
      schemaVersion: "1.0.0",
      rules: [
        {
          id: "region-only",
          region: "us-east-1",
          model: { providerId: "provider-a", model: "region-model" },
        },
        {
          id: "domain-region",
          domain: "legal",
          region: "us-east-1",
          model: { providerId: "provider-a", model: "domain-region-model" },
        },
      ],
    },
    registry,
  );

  assert.equal(router.resolveRule({ domain: "legal", region: "us-east-1" }).id, "domain-region");
});

test("catch-all fallback works when no more specific rule matches", () => {
  const router = new Router(
    {
      schemaVersion: "1.0.0",
      rules: [
        {
          id: "tenant-only",
          tenant: "tenant-a",
          model: { providerId: "provider-a", model: "tenant-model" },
        },
        {
          id: "catch-all",
          model: { providerId: "provider-a", model: "fallback-model" },
        },
      ],
    },
    registry,
  );

  assert.equal(router.resolveRule({ tenant: "tenant-b", domain: "science", region: "ap-southeast-1" }).id, "catch-all");
});

test("missing applicable rules throws a clear error", () => {
  const router = new Router(
    {
      schemaVersion: "1.0.0",
      rules: [
        {
          id: "tenant-only",
          tenant: "tenant-a",
          model: { providerId: "provider-a", model: "tenant-model" },
        },
      ],
    },
    registry,
  );

  assert.throws(
    () => router.resolveRule({ tenant: "tenant-b", domain: "science", region: "ap-southeast-1" }),
    /No applicable routing rule for tenant='tenant-b', domain='science', region='ap-southeast-1'\./,
  );
});

test("equal specificity preserves config order", () => {
  const config: RouterConfig = {
    schemaVersion: "1.0.0",
    rules: [
      {
        id: "first-domain-rule",
        domain: "finance",
        model: { providerId: "provider-a", model: "first" },
      },
      {
        id: "second-domain-rule",
        domain: "finance",
        model: { providerId: "provider-a", model: "second" },
      },
    ],
  };

  const router = new Router(config, registry);

  assert.equal(router.resolveRule({ domain: "finance" }).id, "first-domain-rule");
});
