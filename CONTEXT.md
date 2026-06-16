# Blueprints

## Glossary

### App
A deployable piece of the monorepo. An app wires together packages and infrastructure into something that can be deployed to AWS. Apps are not shared between other apps.

### Package
A shareable library consumed by one or more apps. Packages contain reusable logic and define public interfaces but are not directly deployable.

### EntityProcessor
A code-level plugin — a TypeScript class authored per entity type that owns the shaping logic for that entity: flattening the Debezium envelope, denormalizing related fields, and producing the target OpenSearch document structure. Implemented by app authors; the interface is defined in the core package.

### Pipeline (framework)
The IoC runtime exported by the core package. App authors register EntityProcessors with it and call `pipeline.start()`. The Pipeline owns the Kafka consumer loop, idempotency checks, OpenSearch upsertion, and DLQ routing — app authors never implement these directly.

### CDK Constructs
Reusable AWS CDK constructs exported by `@org/shapeshift-cdk`. Provide the infrastructure primitives (Redpanda cluster, Debezium connector, OpenSearch domain, SQS DLQ) consumed by app CDK stacks. Never imported by app runtime code.

### Runtime Framework
The `@org/shapeshift` package. Exports the `EntityProcessor` interface and `Pipeline` class. Imported by app runtime services (NestJS). Has no CDK dependency.

### Processor Registration
The act of binding one or more Debezium topics to an `EntityProcessor` implementation. Done by the app author at startup via `pipeline.register(topics, processor)`. A single processor may handle multiple topics. The server/schema prefix in topic names is deployment config, not processor logic.

### `Result<T, E>`
A discriminated union type exported by `@org/shapeshift`. Used as the return type of `EntityProcessor.validate()`. Defined as `{ ok: true; value: T } | { ok: false; error: E }`. Ships in the package — no dependency on `neverthrow` or any external result library. Keeps the framework self-contained and imposes no opinionated dependencies on consumers.

### Repository Interface
A TypeScript interface defined by each processor for its enrichment dependencies. The framework has no knowledge of repositories. Each processor defines its own interfaces (e.g. `VehicleProcessor` defines `IncentiveRepository`, `EnergyPriceRepository`), with PostgreSQL implementations in `apps/transformer` and in-memory fakes in tests. Processors are fully unit-testable without infrastructure — `validate` and `shape` are called directly with a fake repository injected.

### Operational Model
The system is not always-on. Local development uses Docker Compose (PostgreSQL, Debezium, Redpanda, OpenSearch, NestJS, Next.js). AWS deployment is on-demand via CDK (`cdk deploy`) for demos or recordings, then torn down (`cdk destroy`). OpenSearch cannot be stopped without being destroyed — always-on AWS deployment is not cost-viable for a portfolio project. The code, ADRs, and a recorded demo constitute the portfolio artifact, not a live URL.

### Fan-out
When a denormalized entity changes (e.g. Incentive), Vehicle documents embedding it become stale. Propagation is handled by PostgreSQL triggers: when a related record changes, the trigger updates `trigger_processor_at` on affected Vehicle rows. Debezium detects the row change and fires a Vehicle CDC event naturally. No synthetic events, no processor-to-processor coupling.

### `trigger_processor_at`
A timestamp column on entities that participate in fan-out (e.g. `vehicles.trigger_processor_at`). Updated exclusively by PostgreSQL triggers when upstream related data changes. Distinct from `updated_at`, which carries business semantics (when the record itself changed). `trigger_processor_at` exists solely to cause Debezium to fire a CDC event, triggering re-indexing of the denormalized document.

### Enrichment
Related data a processor reads at shaping time to produce a complete denormalized document. Owned by the processor, not the framework. Injected via NestJS DI as read-only repositories backed by PostgreSQL. The framework has no concept of enrichment — it calls `validate` and `shape`, the processor handles the rest.

### OpenSearch Document Model
Vehicle is the primary denormalized document — it embeds Incentives and EnergyPrice for its market inline, making a single document answer cost and eligibility questions without joins. ChargingStation is a separate geospatially-indexed document (users search for stations near them, not near a vehicle model). EVMarketStats is a separate index for aggregate/regional queries. Five entities, three indices.

### Domain
Electric vehicle data aggregation and search. Data originates from multiple external sources, is ingested into PostgreSQL, and CDC'd into OpenSearch via the shapeshift pipeline.

### Vehicle
The core entity. All other entities relate to it. Represents an EV model with its specifications (range, battery capacity, charging speeds, etc.).

### Incentive
A financial incentive (tax credit, rebate, subsidy) applicable to a Vehicle in a specific market. Changes frequently — a high-churn entity that stresses the pipeline's schema evolution and reprocessing story.

### ChargingStation
A physical charging point of interest. Has geospatial data (coordinates, region). Relates to Vehicle via compatibility (connector type, charging speed supported).

### EVMarketStats
Regional market context — adoption rates, market share by segment. Provides the evangelist/trend layer for the search experience.

### EnergyPrice
Regional electricity pricing data. Makes cost-of-ownership comparison real and queryable.

### Monorepo Structure
```
packages/
  shapeshift/        # @org/shapeshift — runtime framework (EntityProcessor, Pipeline)
  shapeshift-cdk/    # @org/shapeshift-cdk — reusable CDK constructs
apps/
  transformer/       # NestJS service + entity-specific processors (deployable)
  dashboard/         # Next.js observability dashboard (deployable)
infra/               # CDK entry point — imports @org/shapeshift-cdk, wires the stack
```
Apps are not shared. Processors live inside `apps/transformer` — they are deployment-specific, not reusable across projects. A new project starts its own app and imports `@org/shapeshift` for the framework interface.

### Credentials Boundary
The NestJS transformer service is the sole holder of credentials for all pipeline infrastructure: Redpanda (Kafka consumer), PostgreSQL (replication slot reads), SQS (DLQ publish + depth queries), and OpenSearch (upsert + search). The Next.js dashboard holds no infrastructure credentials — it communicates exclusively with the NestJS service via internal HTTP. This applies to both pipeline health metrics and live search queries.

### Dead Letter Queue (DLQ)
An SQS queue that receives events the framework cannot successfully process. The framework publishes a structured envelope — `{ event, error, processorName, topic, lsn, failedAt }` — rather than the raw event alone. Retry mechanics are handled by SQS redrive policies, not the framework. The structured envelope is what makes DLQ events queryable in the dashboard.

### Schema Evolution
Handled via the tolerant reader pattern with runtime validation. Each `EntityProcessor<T>` declares a `validate(payload: unknown): Result<T, ValidationError>` method. The framework calls `validate` before `shape` on every event. Validation failure routes the event to the DLQ with the error as context — no crash, no silent data corruption. App authors implement `validate` using any runtime validator (Zod, type guards, io-ts); the framework only requires the `Result` return type. Additive schema changes (new columns) are handled by treating unexpected fields as irrelevant; breaking changes surface as validation failures and land in the DLQ until the processor is updated.

### Idempotency
Enforced via OpenSearch external versioning. Every upsert carries the Debezium `source.lsn` (PostgreSQL WAL Log Sequence Number) as the document version with `version_type=external`. OpenSearch rejects writes whose version is ≤ the stored version, making duplicate event delivery a safe no-op. Deletes use a tombstone pattern (`deleted: true` + timestamp) rather than document removal, preserving the versioning guarantee.
