# ADR 0001: Governance-first routing scaffold and GitHub App token safety

## Status

Accepted

## Context

Luchii needs an initial runtime-facing scaffold that keeps governance, model routing, tools, and audit concerns separable even before a full service implementation exists.

GitHub App installation tokens are opaque bearer credentials. They may use the `ghs_` prefix and can be substantially longer than legacy assumptions such as `VARCHAR(255)` or fixed-length validation rules.

## Decision

### Architecture split

We introduce an initial implementation scaffold with four distinct layers:

- governance hooks to bracket provider operations
- model routing abstractions and provider registry interfaces
- tool-call request and invocation types for future orchestration
- response-ready shapes that can carry audit-friendly metadata later

### Routing precedence

Routing rules match on optional `tenant`, `domain`, and `region` selectors.

Precedence is deterministic:

1. rules with more exact selector matches beat rules with more wildcards
2. a full tenant + domain + region match outranks broader combinations
3. a catch-all rule is represented by leaving all selectors undefined
4. equal-specificity ties preserve the order declared in configuration
5. an error is raised only when no applicable rule exists at all

### GitHub App token handling

GitHub installation tokens are treated as opaque strings.

- validate presence as a non-empty string only
- never validate or branch on token length
- centralize installation-token creation in `infra/github/githubApp.ts`
- avoid logging tokens, bearer headers, or private keys
- use storage that safely accepts long opaque values, such as `TEXT` or a sufficiently large equivalent, instead of `VARCHAR(255)`

## Consequences

This scaffold is intentionally small, but it establishes stable seams for provider expansion, governance policy injection, and future audit traces.

The GitHub module becomes the single place to harden token handling, reducing the risk of length-based regressions or accidental secret exposure elsewhere in the codebase.
