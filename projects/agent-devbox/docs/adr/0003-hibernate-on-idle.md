# Hibernate on Idle, on Amazon Linux 2023 arm64

When Idle, the Devbox hibernates instead of stopping. That way tmux, shells and Agent Session processes continue exactly where they were on Wake, which is what makes a remote machine feel local across days. Stopping, followed by Resume from the agents' persisted transcripts, is the fallback for the cases hibernation can't handle: the 60-day hibernation limit, a change of instance type, or a failed hibernate.

Amazon Linux 2023 arm64 was chosen over the more familiar Ubuntu 24.04 because AWS documents hibernation support for AL2023 on Graviton and does not list Ubuntu 24.04.

## Consequences

- Hibernation can only be enabled at launch. Turning it on or off later means replacing the instance.
- The root volume must be encrypted and large enough to hold RAM, which costs about 16 GiB of extra gp3 for a 16 GiB instance.
- Agent API calls that were in flight when the Devbox hibernated fail on Wake and are retried by the agent.
