# AGENT_BLUEPRINTS.md — Ready‑to‑Run Agent Templates

## Overview

Agents are the operational layer that orchestrate Luchii's reasoning, governance, domains, tools, and region routing.
This file provides ready‑to‑run agent templates for the FrasbergAI/luchii repo.

---

## 1. Core Agent Blueprint

```python
class CoreAgent:
    def __init__(self, region="us-west"):
        self.region = region

    def run(self, messages):
        routed = route_request(messages, self.region)
        raw = luchii.chat(routed)
        governed = apply_governance(raw, self.region)
        tooled = maybe_execute_tool(governed)
        safe = apply_redaction(tooled)
        return safe
```

---

## 2. Domain Agent Blueprint

```python
class DomainAgent:
    def __init__(self, domain, region="us-west"):
        self.domain = domain
        self.region = region

    def run(self, messages):
        routed = f"[DOMAIN:{self.domain}] " + route_request(messages, self.region)
        raw = luchii.chat(routed)
        governed = apply_governance(raw, self.region)
        safe = apply_redaction(raw)
        return safe
```

---

## 3. Governance Agent Blueprint

```python
class GovernanceAgent:
    def enforce(self, output, region):
        governed = apply_governance(output, region)
        redacted = apply_redaction(governed)
        return redacted
```

---

## 4. Tool Agent Blueprint

```python
class ToolAgent:
    def execute(self, output):
        return maybe_execute_tool(output)
```

---

## 5. Region Agent Blueprint

```python
class RegionAgent:
    def __init__(self, region):
        self.region = region

    def route(self, messages):
        return route_request(messages, self.region)
```

---

## 6. Agent Composition Example

```python
agent = CoreAgent(region="eu-central")
response = agent.run([
    {"role": "user", "content": "Explain governed intelligence."}
])
```
