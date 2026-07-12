# DEPLOYMENT.md — Frasberg AI / Luchii Codex Deployment Architecture

## Overview

This document describes the full operational deployment architecture for Luchii, the Frasberg AI core codex model.

It covers:

- Docker & Docker Compose
- Multi-region Kubernetes deployments
- CI/CD GitHub Actions pipeline
- Supabase/Postgres logging layer
- Production API Gateway (rate limiting, auth, quotas)
- End-to-end service wiring

This is the official infrastructure blueprint for the FrasbergAI/luchii repository.

---

## 1. Architecture Summary

Luchii is deployed as a governed-intelligence service:

```
Client → API Gateway → Region Router → Luchii Core → Governance Layer → Tools → Redaction → Logs
```

Key components:

- **Luchii Core Model**
- **Domain Engines** (Species, Civilizations, Chronicles)
- **Governance Layer** (Constitution, Policy Engine, Redaction, Audit)
- **Multi-Region Router**
- **Tool-Call Engine**
- **Supabase/Postgres Logging Layer**
- **Kubernetes Multi-Region Clusters**
- **NGINX API Gateway**
- **GitHub Actions CI/CD**

---

## 2. Docker Deployment

### Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY server/ server/
COPY api/ api/
COPY configs/ configs/
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

ENV PORT=8000

CMD ["uvicorn", "server.server:app", "--host", "0.0.0.0", "--port", "8000"]
```

### docker-compose.yml

```yaml
version: "3.9"

services:
  luchii:
    build: .
    container_name: luchii-core
    ports:
      - "8000:8000"
    environment:
      - LOG_DB_URL=******logs-db:5432/luchii_logs
      - REGION=us-west
    depends_on:
      - logs-db

  logs-db:
    image: postgres:15
    container_name: logs-db
    environment:
      POSTGRES_USER: luchii
      POSTGRES_PASSWORD: luchii
      POSTGRES_DB: luchii_logs
    ports:
      - "5432:5432"
    volumes:
      - logs_data:/var/lib/postgresql/data

volumes:
  logs_data:
```

---

## 3. Kubernetes Multi-Region Deployment

### US-West Cluster

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: luchii-us-west
spec:
  replicas: 3
  selector:
    matchLabels:
      app: luchii
      region: us-west
  template:
    metadata:
      labels:
        app: luchii
        region: us-west
    spec:
      containers:
        - name: luchii
          image: frasbergai/luchii:latest
          env:
            - name: REGION
              value: "us-west"
          ports:
            - containerPort: 8000
---
apiVersion: v1
kind: Service
metadata:
  name: luchii-us-west
spec:
  selector:
    app: luchii
    region: us-west
  ports:
    - port: 80
      targetPort: 8000
```

### EU-Central Cluster

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: luchii-eu-central
spec:
  replicas: 3
  selector:
    matchLabels:
      app: luchii
      region: eu-central
  template:
    metadata:
      labels:
        app: luchii
        region: eu-central
    spec:
      containers:
        - name: luchii
          image: frasbergai/luchii:latest
          env:
            - name: REGION
              value: "eu-central"
          ports:
            - containerPort: 8000
---
apiVersion: v1
kind: Service
metadata:
  name: luchii-eu-central
spec:
  selector:
    app: luchii
    region: eu-central
  ports:
    - port: 80
      targetPort: 8000
```

### Global Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: luchii-global-ingress
spec:
  rules:
    - host: api.frasbergai.com
      http:
        paths:
          - path: /v1/us-west
            pathType: Prefix
            backend:
              service:
                name: luchii-us-west
                port:
                  number: 80
          - path: /v1/eu-central
            pathType: Prefix
            backend:
              service:
                name: luchii-eu-central
                port:
                  number: 80
```

---

## 4. CI/CD GitHub Actions Pipeline

```yaml
name: Luchii CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - name: Install deps
        run: pip install -r requirements.txt
      - name: Run tests
        run: pytest -q

  docker-build-and-push:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Login to registry
        run: echo "${{ secrets.REGISTRY_TOKEN }}" | docker login ${{ secrets.REGISTRY_URL }} -u ${{ secrets.REGISTRY_USER }} --password-stdin
      - name: Build image
        run: docker build -t ${{ secrets.REGISTRY_URL }}/frasbergai/luchii:latest .
      - name: Push image
        run: docker push ${{ secrets.REGISTRY_URL }}/frasbergai/luchii:latest

  deploy-k8s:
    needs: docker-build-and-push
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup kubectl
        uses: azure/setup-kubectl@v4
      - name: Configure kubeconfig
        run: echo "${{ secrets.KUBECONFIG }}" > kubeconfig && export KUBECONFIG=$PWD/kubeconfig
      - name: Apply manifests
        run: |
          kubectl apply -f k8s/luchii-deployment-us-west.yaml
          kubectl apply -f k8s/luchii-deployment-eu-central.yaml
          kubectl apply -f k8s/ingress-global.yaml
```

---

## 5. Supabase / Postgres Logging Layer

### Logging Module

```python
# server/logging_layer.py
import os
import psycopg2
from datetime import datetime

LOG_DB_URL = os.getenv("LOG_DB_URL")

def log_request(request_id, region, policies, redactions, tools):
    conn = psycopg2.connect(LOG_DB_URL)
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO request_logs (request_id, region, policies, redactions, tools, created_at)
        VALUES (%s, %s, %s, %s, %s, %s)
        """,
        (request_id, region, policies, redactions, tools, datetime.utcnow()),
    )
    conn.commit()
    cur.close()
    conn.close()
```

### Database Schema

```sql
CREATE TABLE IF NOT EXISTS request_logs (
  id SERIAL PRIMARY KEY,
  request_id TEXT NOT NULL,
  region TEXT NOT NULL,
  policies JSONB,
  redactions JSONB,
  tools JSONB,
  created_at TIMESTAMP NOT NULL
);
```

### Wire into server.py

```python
from logging_layer import log_request
import uuid

# inside chat endpoint
req_id = str(uuid.uuid4())
log_request(req_id, region, ["constitution", "safety"], [], [])
```

---

## 6. Production API Gateway (NGINX)

```nginx
worker_processes auto;

events { worker_connections 1024; }

http {
  limit_req_zone $binary_remote_addr zone=luchii_limit:10m rate=10r/s;

  upstream luchii_us_west {
    server luchii-us-west.default.svc.cluster.local:80;
  }

  upstream luchii_eu_central {
    server luchii-eu-central.default.svc.cluster.local:80;
  }

  server {
    listen 80;
    server_name api.frasbergai.com;

    # API Key Auth
    set $api_key "";
    if ($http_authorization ~* "******") {
      set $api_key $1;
    }
    if ($api_key = "") {
      return 401;
    }

    # Rate Limiting
    limit_req zone=luchii_limit burst=20 nodelay;

    location /v1/us-west/ {
      proxy_pass http://luchii_us_west/;
    }

    location /v1/eu-central/ {
      proxy_pass http://luchii_eu_central/;
    }
  }
}
```

---

## 7. End-to-End Flow

```
Client Request
   ↓
API Gateway (auth, rate limit, quotas)
   ↓
Region Router (/v1/us-west or /v1/eu-central)
   ↓
Luchii Core Model
   ↓
Governance Layer (Constitution → Policy Engine → Redaction)
   ↓
Tool-Call Engine (optional)
   ↓
Supabase/Postgres Logging Layer
   ↓
Response to Client
```

---

## 8. Deployment Checklist

### Model
- [x] Luchii Core wired
- [x] Domain engines connected
- [x] Tool-call engine active

### Governance
- [x] Constitution loaded
- [x] Policy Engine active
- [x] Redaction Layer enforced
- [x] Audit logging enabled

### Infrastructure
- [x] Docker build
- [x] Compose stack
- [x] Multi-region Kubernetes
- [x] Global ingress routing
- [x] API gateway
- [x] CI/CD pipeline
- [x] Logging DB

---

## 9. Status

**Luchii Codex Deployment: Operational, Governed, Multi-Region Ready**

This document is the official deployment reference for FrasbergAI/luchii.
