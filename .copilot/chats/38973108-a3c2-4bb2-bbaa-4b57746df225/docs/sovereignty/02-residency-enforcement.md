# Sovereign Zone Residency Enforcement

Enforce residency rules ensuring workloads never leave allowed regions.

## Core Principles

1. Residency First — Residency-locked workloads cannot cross forbidden boundaries
2. Compliance Non-Negotiable — Industry/regulatory bundles are hard constraints
3. Sovereignty Absolute — Sovereign zones have supreme authority

## Residency Rules

### EU-SOVEREIGN
**Allowed:** AWS (eu-central-1, eu-west-1), Azure (westeurope), GCP (europe-west1)
**Forbidden:** Non-EU regions, EU↔US, EU↔APAC corridors

### US-SOVEREIGN  
**Allowed:** AWS (us-west-2, us-east-1), Azure (eastus), GCP (us-central1)
**Forbidden:** Non-US regions, US↔EU, US↔APAC corridors

### FINANCE-GLOBAL
**Allowed:** Finance-certified regions only across all clouds
**Constraints:** Strong encryption, extended audit retention, strict corridor whitelisting

### HEALTH-GLOBAL
**Allowed:** Health-certified regions only
**Constraints:** HIPAA compliance, PHI routing restricted, 7-year audit retention

### GOV-NATIONAL
**Allowed:** Regions explicitly whitelisted by national authority
**Special:** National emergency override channel

## Implementation

Located in `packages/sovereignty/`:
- SovereignResidencyEnforcementEngine — Residency enforcement logic
- Integration with FederationEngine for routing decisions
- Integration with ABR Kernel for autonomy cycles

## Violations

Detected residency violations trigger:
- Immediate kernel veto of routing change
- Sovereign Council + Compliance Council notification
- Full incident review & investigation
- Remediation & re-certification requirement
- Complete audit trail publication
