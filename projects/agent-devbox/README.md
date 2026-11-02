# agent-devbox

A single-user, pay-per-hour cloud development machine on AWS for running Claude Code and Codex agent sessions, controlled from any laptop through the `devbox` CLI.

Vocabulary is defined in [GLOSSARY.md](./GLOSSARY.md); decisions and their trade-offs are in [docs/adr](./docs/adr).

## Goals, in priority order

1. **Feel local.** Typing in a remote terminal must be responsive from Sevilla, Spain.
2. **Cost little.** Billed only while in use, hibernates itself when Idle. Target: under $45/month at about 176 running hours.
3. **Be safe to run agents unattended**, including with permission prompts skipped.
4. **Be a showcase.** Code, tests and documentation matter as much as features.

## Non-goals

- Multi-user or team use, high availability, GPU or local model inference, Windows, phone clients.
- Dotfiles sync, per-session instance types, a web dashboard, cost reporting in `devbox status`.
- Spot instances: an interruption would kill Unattended Agent Sessions.

## Projects

| Path                     | Purpose                                                                |
| ------------------------ | ---------------------------------------------------------------------- |
| `packages/config`        | Shared schema: the single source of truth for tags, names and settings |
| `packages/cli`           | The `devbox` CLI, published as `@luizbim/agent-devbox`                 |
| `packages/idle-detector` | Bundled to one file and run by a systemd timer on the Devbox           |
| `infra`                  | CDK app with two stacks: `Bootstrap` (SSO permission set) and `Devbox` |

## Manual steps

These are the steps CloudFormation can't do. Each is done once and isn't repeated by later deploys.

1. **Enable IAM Identity Center** in the AWS console and create your user.
2. **Create a Tailscale auth key** in the Tailscale admin console: tagged `tag:devbox`, pre-approved, reusable off, ephemeral off. Store it as a SecureString in SSM Parameter Store before the first deploy of the `Devbox` stack.
3. **Enable device-code login for Codex** in your ChatGPT security settings, if you'll use Codex.
4. **Create a fine-grained GitHub token** limited to the repositories the Agents may work on, with contents and pull-request write access only. `devbox setup` asks for it and installs it on the Devbox.

## `devbox setup`

Every step checks first and fixes only what's missing, so the command is safe to re-run at any time. Any command run with no valid config starts it automatically.

1. AWS CLI installed; if not, suggests the install for your OS.
2. SSO profile with the `DevboxOperator` permission set, and a live session.
3. Tailscale installed on this laptop and signed in to the same tailnet.
4. Devbox exists; if not, prints the deploy command.
5. Connectivity: asks before Waking the Devbox, then checks the Tailscale path is direct and SSH login works.
6. IDE entry: writes the `~/.ssh/config` host block used by VS Code and WebStorm.
7. Agents: choose Claude Code, Codex or both, and log in to each on the Devbox.
8. GitHub: paste the fine-grained token from manual step 4; it's installed on the Devbox, never stored on the laptop.

## Backups

The `/home` volume is snapshotted daily, and snapshots are kept for 7 days.
