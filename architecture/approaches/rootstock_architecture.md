# Reference Architecture Notes — Rootstock

Original Source Repository:

- <https://github.com/corewood-tech/rootstock>

---

## Overview

Rootstock is both:

1. A production-oriented reference architecture for AI-assisted software engineering
2. A demonstration application implementing that architecture

The demonstration application is a citizen-science IoT platform where distributed participants contribute environmental sensor data to scientific campaigns.

The deeper architectural value is not necessarily the demo application itself, but rather the engineering philosophy behind how the system is structured to support:

- large-scale AI-assisted development
- modular decomposition
- maintainability
- predictable code generation
- scalable orchestration
- clear dependency boundaries

The architecture is specifically designed to reduce entropy and architectural drift when using LLMs like ChatGPT, Claude, Copilot, Cursor, Windsurf, or other AI coding systems.

---

## Core Architectural Philosophy

The architecture attempts to solve a common problem in AI-assisted engineering:

As codebases grow:

- LLM context windows become insufficient
- abstractions become inconsistent
- generated code drifts from original patterns
- coupling increases
- dependency direction becomes unclear
- "vibe coding" becomes unstable

Rootstock addresses this through:

- strict layering
- strong module boundaries
- one-way dependency flow
- highly explicit orchestration
- volatility isolation
- predictable folder structures
- narrow responsibility domains

The system is designed such that:

- each component has a small and understandable context
- LLMs can safely modify isolated sections
- architectural consistency is easier to maintain
- generated code remains composable

---

## Layered Architecture

The repository uses a strict layered architecture.

Dependency direction flows ONLY inward:

```text
Handler → Flow → Ops → Repo
```

No layer may depend on outer layers.

---

## Layer Definitions

### 1. Handlers

Purpose:

- API boundary
- protocol translation
- authentication
- request validation
- transport concerns

Examples:

- REST
- RPC
- gRPC
- websocket handlers
- auth middleware

Responsibilities:

- receive requests
- validate payloads
- map protocol objects to internal objects
- invoke flows

Should NOT:

- contain business logic
- directly query databases
- orchestrate workflows

---

### 2. Flows

Purpose:

- orchestration layer
- workflow coordination
- transaction sequencing

Responsibilities:

- coordinate operations
- manage execution ordering
- invoke ops modules
- manage high-level business workflows

Examples:

- user onboarding flow
- entity enrichment workflow
- graph expansion workflow
- data ingestion pipeline

Flows are effectively:

- application services
- orchestration controllers

Should NOT:

- contain infrastructure logic
- contain database access details

---

### 3. Ops

Purpose:

- business logic layer
- domain operations
- reusable computation units

Responsibilities:

- core algorithms
- scoring systems
- transformation logic
- validation rules
- analytics

Examples:

- sanctions scoring
- graph centrality calculations
- tariff estimation
- entity resolution
- anomaly detection

Ops should:

- be reusable
- remain deterministic where possible
- avoid transport concerns

---

### 4. Repo

Purpose:

- infrastructure access
- persistence
- external integrations

Responsibilities:

- database queries
- API integrations
- filesystem interactions
- cache access
- vector DB access
- graph DB access

Examples:

- PostgreSQL
- Databricks
- OpenSearch
- Neo4j
- S3
- external customs APIs

Repos should:

- expose clean interfaces
- isolate infrastructure complexity
- avoid business logic

---

## Why This Works Well With LLMs

LLMs perform best when:

- scope is constrained
- patterns are consistent
- responsibilities are narrow
- architecture is predictable

This architecture intentionally optimizes for those properties.

Benefits:

- easier code generation
- easier debugging
- easier context management
- easier onboarding
- easier testing
- reduced architectural drift

Each module can often fit entirely within an LLM context window.

This significantly improves:

- code completion quality
- refactor reliability
- autonomous agent behavior

---

## Technology Stack Used By Rootstock

### Backend

- Go

## Frontend

- SvelteKit

## RPC / API

- Connect RPC
- protobuf

## Authentication

- Zitadel

## Authorization

- Open Policy Agent (OPA)

## Database

- PostgreSQL

## Observability

- OpenTelemetry
- Grafana

## Workflow Engine

- DBOS

## Testing

- Playwright

---

## Example Demonstration Application

The Rootstock demo application is a distributed citizen-science platform.

Researchers create campaigns requesting environmental sensor data.

Users contribute data from:

- weather stations
- air quality sensors
- IoT devices
- water sensors
- GPS-enabled equipment

Example campaign:

- collect humidity data
- southeastern US
- every 15 minutes
- during hurricane season

The system:

- validates submissions
- aggregates results
- tracks contributors
- exposes campaign analytics
- orchestrates ingestion workflows

---

## Why This Architecture Is Particularly Relevant To Andrew's Interests

This architecture strongly aligns with:

- graph analytics systems
- trade intelligence platforms
- network analytics
- AI-assisted engineering
- supply chain intelligence
- entity resolution systems
- workflow orchestration
- large-scale data applications

Particularly relevant given:

- Databricks-heavy environments
- graph-modeled ownership systems
- transshipment analytics
- network screening tooling
- supply chain enrichment workflows
- analyst-facing applications
- AI-assisted product engineering

---

## Potential Adaptation For Supply Chain Intelligence

### Example Mapping

### Handlers

- analyst APIs
- graph query endpoints
- upload interfaces
- search APIs
- websocket dashboards

### Flows

- ownership expansion orchestration
- supplier discovery workflows
- enrichment pipelines
- sanctions screening workflows
- N-tier expansion pipelines

### Ops

- network centrality
- risk scoring
- sanctions logic
- anomaly detection
- entity matching
- tariff estimation
- transshipment motif detection

### Repo

- Databricks
- Delta Lake
- OpenSearch
- graph database
- customs APIs
- UN Comtrade
- HTS datasets

---

## Additional Architectural Guidance For Replication

### Recommended Principles

### 1. Strict Dependency Direction

Never allow reverse dependencies.

### 2. Small Modules

Prefer many small modules over large monoliths.

### 3. Explicit Contracts

Use typed interfaces wherever possible.

### 4. Infrastructure Isolation

All infrastructure logic belongs in Repo.

### 5. Deterministic Ops

Ops should ideally remain side-effect free.

### 6. Thin Handlers

Handlers should only translate requests.

### 7. Orchestration In Flows

Business sequencing belongs in Flows.

### 8. AI-Friendly Folder Structures

Maintain predictable naming conventions.

Example:

```text
/services
  /ownership
    /handler
    /flow
    /ops
    /repo
```

---

## Suggested Enhancements For A Modern Variant

Potential additions:

- event-driven orchestration
- Kafka / Redpanda
- vector search
- agent workflows
- graph-native storage
- semantic indexing
- retrieval-augmented generation
- model routing
- MCP-compatible tooling
- distributed compute orchestration

---

## Potential Personal Project Applications

### 1. Supply Chain Intelligence Platform

Interactive graph-based trade intelligence.

## 2. Geopolitical Risk Explorer

Country/company relationship mapping.

## 3. Trade Flow Simulation Engine

Scenario analysis for tariffs and disruptions.

## 4. Ownership Network Navigator

Interactive ownership graph exploration.

## 5. AI Analyst Workbench

Agent-assisted trade and sanctions research.

## 6. Interactive Galactic Portfolio Site

A WebGL-based personal portfolio where:

- star systems represent domains/projects
- planets represent assets/repos
- users navigate via spacecraft
- graph-like relationships connect systems

This architecture is especially useful for:

- separating rendering logic
- gameplay orchestration
- asset management
- analytics
- AI-generated interactions

---

## High-Level Takeaway

The most important insight from Rootstock is not the specific technologies.

It is the idea that:

"AI-assisted software engineering requires architectures intentionally optimized for AI cognition."

The architecture should:

- reduce ambiguity
- reduce coupling
- reduce hidden state
- reduce dependency chaos
- maximize local reasoning

This is likely to become increasingly important as:

- autonomous coding agents improve
- multi-agent workflows emerge
- software systems become partially AI-generated

Rootstock is an early but strong example of that design philosophy.
