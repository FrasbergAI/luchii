# Luchii API Quickstart Guide

_Public developer documentation._

## 1. Get Your API Key

Create an account at `frasbergai.com/developers`.  
Generate your API key from the dashboard.

## 2. Install the SDK

### Python

```python
pip install frasbergai
```

### JavaScript

```javascript
npm install frasbergai
```

### Go

```go
go get github.com/frasbergai/sdk
```

## 3. Make Your First Request

### Chat Completion (Python)

```python
from frasbergai import FrasbergAI

client = FrasbergAI(api_key="YOUR_KEY")

response = client.chat.completions.create(
    model="luchii",
    messages=[{"role": "user", "content": "Hello Luchii"}]
)

print(response.output)
```

### Text Completion (JS)

```javascript
import { FrasbergAI } from "frasbergai";

const client = new FrasbergAI({ apiKey: process.env.FRASBERG_KEY });

const result = await client.completions.create({
  model: "luchii",
  prompt: "Write a structured summary of governed intelligence."
});

console.log(result.output);
```

### Embeddings (Go)

```go
resp, _ := client.Embeddings.Create(ctx, frasbergai.EmbeddingsRequest{
    Model: "luchii-embed",
    Input: "Governed intelligence",
})
```

## 4. Tool-Call Example

```python
response = client.tools.call(
    model="luchii",
    messages=[{"role": "user", "content": "Get weather for Las Vegas"}],
    tools=[{
        "name": "getWeather",
        "parameters": {"city": "Las Vegas"}
    }]
)
```

## 5. Best Practices

- Use signed commits
- Respect domain boundaries
- Follow governance guidelines
- Enable region locking for compliance
