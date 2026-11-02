# PostgreSQL triggers update `trigger_processor_at` to propagate denormalization fan-out

Vehicle documents embed related entities (Incentive, EnergyPrice) inline. When a related entity changes, the Vehicle documents containing it become stale. To propagate those changes, PostgreSQL triggers update a dedicated `trigger_processor_at` timestamp column on affected Vehicle rows. Debezium detects the row change and fires a Vehicle CDC event naturally, causing `VehicleProcessor` to re-index with fresh enrichment. No synthetic events, no processor-to-processor coupling — the database enforces the fan-out.

`trigger_processor_at` is intentionally separate from `updated_at`. `updated_at` tracks when the Vehicle record itself changed in a business sense. `trigger_processor_at` is pipeline infrastructure — updating it on every upstream incentive change would corrupt the business meaning of `updated_at` and make audit trails misleading.

## Considered Options

**Synthetic Vehicle events from `IncentiveProcessor`:** When an Incentive changes, `IncentiveProcessor` publishes fabricated Vehicle events back to Redpanda for each affected vehicle. Rejected because it creates processor-to-processor coupling, requires `IncentiveProcessor` to know the Vehicle–Incentive relationship, and introduces a second event path for Vehicle processing that bypasses the natural CDC flow.

**Accept bounded staleness:** Vehicle documents update only when the Vehicle row itself changes. Rejected because Incentive is explicitly high-churn — stale incentive data in Vehicle documents is a correctness problem, not an acceptable trade-off.

## Consequences

Any entity added to the denormalized Vehicle document in future must have a corresponding PostgreSQL trigger keeping `trigger_processor_at` current. This is a documented invariant — removing the trigger silently breaks fan-out with no immediate error.
