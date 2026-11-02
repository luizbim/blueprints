// Names shared by more than one package. Changing any of them changes deployed
// resources, IAM conditions or files on the Devbox, so they live in one place.

// Every Devbox resource carries this tag; the DevboxOperator permission set
// is scoped to it.
export const DEVBOX_TAG = {
  key: 'agent-devbox:role',
  value: 'devbox',
} as const;

export const STACK_NAMES = {
  bootstrap: 'AgentDevboxBootstrap',
  devbox: 'AgentDevbox',
} as const;

export const OPERATOR_PERMISSION_SET_NAME = 'DevboxOperator';

export const TAILSCALE_AUTH_KEY_PARAMETER = '/agent-devbox/tailscale-auth-key';

// The single Linux user (ADR-0008). The Agents run as this user too.
export const LINUX_USER = 'ec2-user';

export const AGENTS = ['claude-code', 'codex'] as const;
export type Agent = (typeof AGENTS)[number];

// Where each Agent writes its session transcripts, relative to the user's home.
// A write under one of these directories is the Idle detector's signal of progress.
export const AGENT_TRANSCRIPT_DIRS: Record<Agent, string> = {
  'claude-code': '.claude/projects',
  codex: '.codex/sessions',
};
