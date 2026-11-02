import { posix } from 'node:path';
import { z } from 'zod';
import { AGENT_TRANSCRIPT_DIRS, LINUX_USER } from './constants.js';
import type { DeploymentConfig } from './deployment-config.js';

const absolutePath = z.string().startsWith('/', 'Expected an absolute path');

// Written onto the Devbox by the stack and read by the Idle detector. The
// instance ID and region aren't here: the detector reads them from IMDS.
export const idleDetectorConfigSchema = z.strictObject({
  idleWindowMinutes: z.int().min(5).max(240),
  // Clients are counted as established sshd connections on this interface only.
  clientInterface: z.string().min(1).default('tailscale0'),
  sshPort: z.int().min(1).max(65535).default(22),
  transcriptDirs: z.array(absolutePath).min(1),
});

export type IdleDetectorConfigInput = z.input<typeof idleDetectorConfigSchema>;
export type IdleDetectorConfig = z.output<typeof idleDetectorConfigSchema>;

export function idleDetectorConfigFor(
  deployment: Pick<DeploymentConfig, 'idleWindowMinutes'>,
): IdleDetectorConfig {
  // Both Agents are always installed (Q25), so both are always watched.
  const home = posix.join('/home', LINUX_USER);
  return idleDetectorConfigSchema.parse({
    idleWindowMinutes: deployment.idleWindowMinutes,
    transcriptDirs: Object.values(AGENT_TRANSCRIPT_DIRS).map((dir) =>
      posix.join(home, dir),
    ),
  });
}
