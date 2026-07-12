# JavaScript SDK Concept

This page documents an aspirational JavaScript SDK surface for the FrasbergAI codex.

The package names and examples below are contract-oriented placeholders for a future unified SDK. They are included to describe intended developer ergonomics, not to claim that a published runtime package already exists from this repository.

## Install

```bash
npm install frasberg-luchii
```

## Initialize

```js
import { Luchii } from "frasberg-luchii";

const luchii = new Luchii({
  apiKey: process.env.LUCHII_KEY,
  clientId: "creator-22"
});
```

## Market

```js
const signal = await luchii.market.signal("BTCUSDT");
console.log(signal);
```

## Lead Routing

```js
const route = await luchii.lead.route({
  leadId: "L-8821",
  pressure: 0.64
});
```

## Coaching

```js
const nbl = await luchii.coach.nextLine({
  context: "I need to explain impact clearly.",
  persona: "confident"
});
```

## Memory

```js
await luchii.memory.store({
  memory_type: "session",
  content: { event: "next-line-generated", topic: "hook" },
  tags: ["coaching"]
});
```

## ASSISIS Rep

```js
const reply = await luchii.assist.rep({
  intent: "follow_up",
  context: "Can you send details after the call?"
});
```

## Persona Skin

```js
await luchii.skin.persona({
  persona_id: "executive",
  traits: { tone: "direct", style: "operator" }
});
```

## Runtime Pipeline Example

```js
const signal = await luchii.market.signal("BTCUSDT");
const route = await luchii.lead.route({ leadId: "L-8821", pressure: signal.confidence ?? 0.5 });
const nbl = await luchii.coach.nextLine({ context: "Transition to CTA", persona: "executive" });
await luchii.memory.store({ memory_type: "session", content: { signal, route, nbl } });
```

## Scope Note

Treat this document as a codex contract sketch for future SDK work that may land in Luchii-adjacent runtime repositories or a later unified FrasbergAI SDK.
