# NestJS transformer service is the sole credentials boundary

The NestJS transformer service holds all infrastructure credentials: Redpanda (Kafka consumer), PostgreSQL (replication slot reads), SQS (DLQ publish and depth queries), and OpenSearch (upsert and search). The Next.js dashboard holds no infrastructure credentials and communicates exclusively with NestJS via internal HTTP — including live search, which is proxied through a `/search` endpoint rather than queried from the browser or Next.js backend directly.

## Considered Options

**Next.js queries OpenSearch directly for search:** Natural for a search UI and avoids a round-trip through NestJS. Rejected because it requires a second credential surface (OpenSearch credentials in the Next.js environment), and it splits the trust boundary across two services with no meaningful gain.

**Next.js queries all sources directly:** Eliminates NestJS as a middleman for the dashboard. Rejected because it distributes Redpanda, PostgreSQL, SQS, and OpenSearch credentials across both services, doubles the credential rotation surface, and removes the ability to shape or aggregate metrics before they reach the dashboard.

## Consequences

NestJS must expose `/metrics` and `/search` in addition to its pipeline runtime responsibilities. These are read-only endpoints and carry no write risk. The dashboard's dependency on NestJS availability is acceptable given they are co-deployed in the same stack.
