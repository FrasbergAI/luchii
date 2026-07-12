# Agent Framework v2.0 — FrasbergAI/Luchii

## 1. Goals

- **Unified agent interface** across languages.
- **First-class governance** in every agent.
- **Composable pipelines** (domains, tools, regions).
- **Deterministic behavior** with clear lifecycle.

---

## 2. Core Concepts

- **Agent:** Orchestrates Luchii + domains + governance + tools.
- **Pipeline:** Ordered steps an agent executes.
- **Context:** Shared state (messages, region, domain, policies).
- **Policy Hooks:** Governance checks at each stage.

---

## 3. Agent Interface (Python)

```python
class Agent:
    def __init__(self, name: str, region: str = "us-west", domain: str | None = None):
        self.name = name
        self.region = region
        self.domain = domain

    def run(self, messages: list[dict]) -> dict:
        ctx = {"messages": messages, "region": self.region, "domain": self.domain}
        ctx = self._route(ctx)
        ctx = self._infer(ctx)
        ctx = self._govern(ctx)
        ctx = self._tools(ctx)
        ctx = self._redact(ctx)
        ctx = self._log(ctx)
        return ctx["output"]

    def _route(self, ctx): ...
    def _infer(self, ctx): ...
    def _govern(self, ctx): ...
    def _tools(self, ctx): ...
    def _redact(self, ctx): ...
    def _log(self, ctx): ...
```

---

## 4. Built-in Agent Types

- **ChatAgent** — conversational interface.
- **CompletionAgent** — structured text.
- **EmbeddingAgent** — vector generation.
- **SpeciesAgent / CivilizationsAgent / ChroniclesAgent** — domain‑locked.
- **GovernanceAgent** — policy + redaction only.
- **ToolAgent** — tool‑centric orchestration.
- **RegionAgent** — region‑aware routing.

---

## 5. Composition Example

```python
chat = Agent(name="ChatAgent", region="eu-central")
resp = chat.run([{"role": "user", "content": "Explain governed intelligence."}])
```
