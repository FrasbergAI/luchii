# Frasberg AI Luchii Protection Ruleset

This document preserves the intended GitHub ruleset configuration for the `luchii` repository.

## GitHub Target

- Branches: `main`, `stable`, `release/*`

## Branch Protection

- Require pull requests
- Require at least **2 reviewers**
- Require **signed commits**
- Require **status checks**
- Block force pushes
- Block branch deletions

## Path Restrictions

Protect these paths:

```text
/models/
/engine/
/governance/
/docs/api/
/blueprints/
/diagrams/
/species/
/civilizations/
```

Rules:

- No direct commits
- PRs only
- Review required
- Governance approval required

## Secret Scanning

- Enable GitHub Advanced Security
- Enable secret scanning
- Enable push protection

## Code Security

- Require dependency scanning
- Require code scanning
- Require vulnerability checks

## Enforcement

- Enabled

## Repository Note

This file is a codified reference for GitHub repository settings. The actual ruleset must be configured in GitHub branch and repository protection settings.
