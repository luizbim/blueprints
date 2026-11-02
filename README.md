<p align="center">
  <img src="docs/logo.png" width="120" style="border-radius: 50%;" />
</p>

# Blueprints

A collection of production-grade architecture patterns and projects built with TypeScript, AWS CDK, and event-driven design — each one a deliberate technical decision worth explaining.

---

## Philosophy

Every project in this repo starts with a real problem and a constraint. The architecture follows from those, not from defaults. Technology choices are made to be defended, not just convenient.

---

## Projects

### [`shapeshift`](./projects/shapeshift)

A production-grade CDC pipeline with a pluggable transformer layer and a real-time observability dashboard.

PostgreSQL with logical replication feeds Debezium, which publishes change events to Redpanda — a Kafka-compatible broker running on EC2 at a fraction of MSK cost. A NestJS transformer service consumes those events, applies entity-specific shapers to flatten and denormalize the Debezium envelope, and upserts into OpenSearch. Dead letters route through SQS. A Next.js dashboard surfaces pipeline health in real time: replication lag, event throughput, error rates, and a live search UI proving the indexed data is correct.

The transformer layer is the centrepiece — a pluggable processor interface where each entity type owns its own shaping logic, with idempotency, schema evolution handling, and DLQ routing built in. This is the layer most pipeline examples skip.

**Stack:** PostgreSQL · Debezium · Redpanda (Kafka-compatible) · NestJS · OpenSearch · SQS · AWS CDK · Next.js

### [`agent-devbox`](./projects/agent-devbox)

A pay-per-hour cloud development machine for running Claude Code and Codex agent sessions unattended, controlled from any laptop through a CLI published on npm.

The Devbox runs on Graviton in eu-south-2 and is reached only over Tailscale, with no inbound ports. VS Code and WebStorm connect over plain SSH, using 60-second EC2 Instance Connect keys tied to the operator's IAM Identity Center session. When nothing is connected and no agent is making progress, it hibernates itself, so tmux panes and agent processes continue exactly where they were on the next `devbox up`. A CloudWatch alarm and an AWS Budgets action sit outside the machine as backstops. The design treats the agent as the adversary: the box is disposable and holds nothing that reaches beyond itself.

**Stack:** AWS CDK · EC2 (Graviton, hibernation) · IAM Identity Center · Tailscale · Amazon Linux 2023 · TypeScript CLI on npm

---

## Stack

| Layer           | Technology      |
| --------------- | --------------- |
| Language        | TypeScript      |
| Backend         | NestJS, Node.js |
| Frontend        | Next.js, React  |
| Infrastructure  | AWS CDK         |
| Monorepo        | Nx              |
| Package manager | pnpm            |

---

## Design principles

**Cost awareness.** Managed services are chosen only when they justify their cost. Where a self-hosted or lighter alternative fits, it is used and documented with the trade-offs.

**Deployability.** Every project targets a personal AWS account at under $30/month. Infrastructure is one CDK command away from running.

**Explainability.** Every architectural decision has a reason. The README for each project explains not just what was built, but why — and what was considered and rejected.

---

## Getting started

```bash
pnpm install
```

Each project lives in its own directory with its own README covering local setup, CDK deployment, and architectural decisions.

---

## Author

**Luiz Augusto de Souza Bim**
Lead Software Engineer · TypeScript · AWS · Event-driven systems

[LinkedIn](https://www.linkedin.com/in/luiz-bim/) · [Email](mailto:luiz@luizbim.dev)
