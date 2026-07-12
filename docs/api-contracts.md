# API Contracts and Technical Scope

This directory holds the technical documentation layer for the FrasbergAI codex.

## Current Scope

- Document shared contracts and interface expectations
- Describe how semantic nodes may align to a common core contract
- Preserve technical placeholders without implying a production runtime

## Contract Framing

The unified FrasbergAI architecture may later expose domain-oriented interfaces such as:

- `GET /v1/models`
- `GET /v1/species`
- `GET /v1/civilizations`
- `GET /v1/chapters`
- `POST /v1/infer`
- `POST /v1/generate`

These endpoints are codex-level API contract examples only. They are included to express intended boundary design for a multi-domain mesh, not to claim that a live service exists in this repository today.

## Governance Note

Any future runtime or service implementation should inherit from the contracts and governed lineage documented here, whether it remains adjacent to Luchii or moves into dedicated repositories later.
