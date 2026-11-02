# Agent Devbox

A single-user, pay-per-hour cloud development machine for running coding agent sessions from any of the Operator's laptops, as if the machine were local.

## Language

### People and connections

**Operator**:
The one person who owns the Devbox, starts and stops it, and connects to it.
_Avoid_: User, admin, owner

**Client**:
A terminal or IDE connection from one of the Operator's laptops to the Devbox.
_Avoid_: Session, connection

### The machine

**Devbox**:
The Operator's cloud development machine, including its persistent home directory.
_Avoid_: VM, instance, server, workstation

**Running**:
The Devbox state in which it is billed for compute and can accept Clients.

**Hibernated**:
The Devbox state in which compute is not billed and memory is preserved, so every process continues exactly where it was on wake.
_Avoid_: Paused, suspended, sleeping

**Stopped**:
The Devbox state in which compute is not billed and memory is lost; only what is on disk survives.
_Avoid_: Off, shut down

**Wake**:
To bring a Hibernated or Stopped Devbox back to Running.
_Avoid_: Spin up, boot, start

### Agents

**Agent**:
A coding agent CLI the Operator chooses to use on the Devbox: Claude Code or Codex.
_Avoid_: Assistant, bot, model, tool

**Agent Session**:
One Claude Code or Codex conversation running on the Devbox, with its transcript persisted on disk.
_Avoid_: Job, task, run

**Unattended**:
Said of an Agent Session that is making progress while no Client is connected.

**Stalled**:
Said of an Agent Session that is waiting for input and making no progress.
_Avoid_: Hung, blocked, stuck

**Resume**:
To continue an Agent Session from its persisted transcript after its process was lost.
_Avoid_: Restore, reattach

### Cost

**Idle**:
The Devbox condition of having no Client connected and no Agent Session making progress, sustained for the idle window. An Idle Devbox hibernates itself.
