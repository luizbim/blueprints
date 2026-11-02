# Tailscale for network access, with no inbound ports

The Devbox is reached only over Tailscale. Its security group allows no inbound traffic, and its public IPv4 address exists only for outbound traffic (model APIs, package registries, git hosts, and Tailscale itself). This takes on a third-party dependency in exchange for meeting every access goal at once: low latency over a direct WireGuard path, no exposed ports, and a stable name that survives IP changes on wake.

## Considered Options

**Self-hosted WireGuard:** no third party, but it needs a public UDP port, and the Operator manages keys on every laptop by hand.

**SSM Session Manager / EC2 Instance Connect Endpoint:** AWS-native with no open ports, but the SSM relay adds latency to every keystroke, which conflicts with the top goal of feeling local.

**Public IP with a security group allowlist:** breaks every time the Operator's home or travel IP changes, and leaves sshd exposed to the internet.

**NAT gateway for egress:** about $35 a month on its own, which would eat most of the $45 budget.

## Consequences

The tailnet policy lets the Operator's devices connect to the Devbox (`tag:devbox`), but the Devbox can never initiate connections to them. Without this rule, a prompt-injected agent could move from the Devbox to the Operator's laptops. The Devbox joins with a tagged, pre-approved, non-ephemeral key, because tagged nodes don't expire and ephemeral nodes would drop out of the tailnet while the Devbox hibernates.

If a direct path can't be established, Tailscale falls back to its relay servers (DERP), which adds latency. Day-one latency measurements must confirm the path is direct.
