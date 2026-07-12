# TOOLS.md — Tool‑Call Registry & Schemas

## Overview

Tools extend Luchii's capabilities by allowing governed function execution.
This document defines the tool registry, schemas, governance rules, and execution flow.

---

## 1. Tool‑Call Philosophy

- Tools must be deterministic
- Tools must be safe
- Tools must be governed
- Tools must be schema‑validated
- Tools must be logged

---

## 2. Tool Registry Structure

```
tools/
  ├── registry.json
  ├── getWeather.json
  ├── searchDatabase.json
  ├── classifyEntity.json
  └── ...
```

---

## 3. Example Tool Schema

```json
{
  "name": "getWeather",
  "description": "Get current weather for a city.",
  "parameters": {
    "type": "object",
    "properties": {
      "city": { "type": "string" }
    },
    "required": ["city"]
  },
  "permissions": {
    "domains": ["civilizations", "general"],
    "regions": ["us-west", "us-east"]
  }
}
```

---

## 4. Governance Rules for Tools

### Before Execution

1. Validate schema
2. Check domain permissions
3. Check region permissions
4. Apply policy engine

### After Execution

1. Redact unsafe output
2. Log tool event
3. Return governed result

---

## 5. Tool Execution Flow

```
Luchii decides → Validate schema → Governance check → Execute tool → Redact → Log → Return
```
