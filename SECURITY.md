# Security Policy — Frasberg AI / Luchii

## Supported Versions

| Version | Supported |
|---------|-----------|
| main    | Yes       |
| stable  | Yes       |
| dev     | No        |

## Reporting a Vulnerability

If you discover a security issue, please email:

**security@frasberg.ai**

We will respond within **48 hours**.

## Security Requirements

- All commits must be signed.
- All PRs must pass security checks.
- No secrets may be stored in the repository.
- All model manifests must be checksum-verified.
- All domain documents must be integrity-verified.

## Allowed Contributions

- Documentation
- Diagrams
- Blueprints
- Non-sensitive scripts

## Forbidden Contributions

- Secrets
- Credentials
- Private model weights
- Sensitive operational data

## Security Tools

- GitHub Advanced Security
- Secret scanning
- Dependency scanning
- Code scanning
- CI/CD security gates
