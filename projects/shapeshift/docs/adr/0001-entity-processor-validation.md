# EntityProcessor owns payload validation, not a schema registry

Each `EntityProcessor<T>` is required to implement `validate(payload: unknown): Result<T, ValidationError>`. The framework calls `validate` before `shape` on every event; failure routes the event to the DLQ with the error as context rather than crashing or silently corrupting the index. App authors supply the validator (Zod, hand-written type guard, etc.) — the framework only requires the `Result` return type.

## Considered Options

**Schema Registry (Confluent-compatible, Redpanda built-in):** Events serialised as Avro/Protobuf with a schema ID. Incompatible changes caught at the registry before reaching the processor. Rejected because it adds a schema registration step to every deployment, couples the event format to Avro/Protobuf, and introduces an operational dependency that outlives its value for a code-level plugin model where the processor already owns the type.

**Bare TypeScript cast (`payload as T`):** Zero infrastructure, caught by the compiler on type updates. Rejected because `as` casts provide no runtime safety — missing or mistyped fields from an in-flight schema change still cause runtime exceptions, and the DLQ never sees them.

## Consequences

Breaking schema changes (column removed, renamed) surface as DLQ events until the processor's `validate` method and type `T` are updated. Additive changes (new columns) are invisible to the processor — `validate` passes, `shape` ignores the extra fields. This is the intended behaviour.
