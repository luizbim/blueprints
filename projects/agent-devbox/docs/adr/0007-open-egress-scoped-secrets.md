# Egress is open; blast radius is limited through narrowly scoped secrets

The Devbox can reach any outbound destination, even though [ADR-0001](./0001-agent-is-the-adversary.md) treats the agent as an adversary. Data exfiltration is accepted as a residual risk. It is kept small by limiting what each secret can reach:

- The Agent logins (Claude Code subscription login, Codex `auth.json`) live only on the Devbox.
- Git access uses a fine-grained GitHub token limited to the chosen repositories, with contents and pull-request write access only.
- Branch protection on `main` blocks direct pushes.

An agent needs its own model token to work, so it can always read that token. Restricting egress can't change that.

## Considered Options

**A domain allowlist through AWS Network Firewall:** about $290 a month, many times the whole budget.

**A self-run egress proxy with an allowlist:** cheap, but agents routinely need registries, docs sites and APIs that nobody can predict. The allowlist either breaks agent work or grows until it no longer restricts anything.
