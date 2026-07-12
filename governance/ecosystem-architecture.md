# Frasberg AI Multi-Repo Architecture Map

```text
Frasberg-AI/
│
├── luchii/                     → Core model, codex, governance
│   ├── docs/
│   ├── blueprints/
│   ├── diagrams/
│   ├── governance/
│   └── scripts/
│
├── frasberg-ai-species/        → Species ontology
│   ├── schemas/
│   ├── entries/
│   └── lineage/
│
├── frasberg-ai-civilizations/  → Civilizations atlas
│   ├── cultures/
│   ├── histories/
│   └── systems/
│
├── frasberg-ai-chronicles/     → Chapters, lore, narratives
│   ├── volumes/
│   ├── chapters/
│   └── canon/
│
├── frasberg-ai-governance/     → Constitutions, policies, safety
│   ├── constitutions/
│   ├── policies/
│   └── audits/
│
├── frasberg-ai-engine/         → Serving, inference, runtime
│   ├── orchestrator/
│   ├── gateway/
│   └── workers/
│
└── frasberg-ai-ui/             → Portal, dashboards, interfaces
    ├── portal/
    ├── dashboards/
    └── components/
```

## Codex Note

This map expresses the intended ecosystem decomposition. It documents likely repository boundaries without claiming that all of these repositories already exist or are production-ready today.
