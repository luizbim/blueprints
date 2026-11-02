# Idle is detected on the Devbox, with backstops outside it

A systemd timer on the Devbox checks for Idle every minute. It counts Clients by the established connections to sshd on the Tailscale interface, and it takes Agent Session progress from writes to the agents' transcript files. When the Devbox is Idle, it hibernates itself through its instance role, which is limited to `ec2:StopInstances` (with hibernate) on its own ARN. Only the Devbox can see Clients and transcripts. A transcript write is the most honest signal of progress, because a Stalled session writes nothing.

Under [ADR-0001](./0001-agent-is-the-adversary.md), an agent may disable that timer, so two backstops sit outside the Devbox:

- A CloudWatch alarm stops the Devbox when its CPU stays below 2% for 2 hours. It stops rather than hibernates, because alarm actions can't hibernate.
- An AWS Budgets action stops the Devbox when the monthly spend reaches $45.

## Consequences

A backstop stop loses memory, which hibernation would have kept. Agent Sessions are then Resumed from their transcripts, not continued in place.
