# API_GATEWAY_SPEC.md — Full Production API Gateway Specification

## Overview

The API Gateway is the front door of the Frasberg AI Platform.
It enforces authentication, rate limiting, quotas, region routing, and governance boundaries.

---

## 1. Responsibilities

- API key authentication
- Rate limiting
- Quotas
- Region routing
- TLS termination
- Logging
- Governance boundary enforcement

---

## 2. Routing Structure

```
/v1/us-west      → Luchii US West Cluster
/v1/us-east      → Luchii US East Cluster
/v1/eu-central   → Luchii EU Central Cluster
/v1/ap-southeast → Luchii AP Southeast Cluster
```

---

## 3. Authentication

### API Key

- Required for all requests
- Passed via `Authorization: ******
- Scoped by region
- Rotatable
- Never stored in plaintext
