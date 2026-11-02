import {
  idleDetectorConfigFor,
  idleDetectorConfigSchema,
} from './idle-detector-config.js';

describe('idleDetectorConfigFor', () => {
  it('watches both Agents and only the Tailscale interface', () => {
    expect(idleDetectorConfigFor({ idleWindowMinutes: 30 })).toEqual({
      idleWindowMinutes: 30,
      clientInterface: 'tailscale0',
      sshPort: 22,
      transcriptDirs: [
        '/home/ec2-user/.claude/projects',
        '/home/ec2-user/.codex/sessions',
      ],
    });
  });
});

describe('idleDetectorConfigSchema', () => {
  it('rejects relative transcript directories', () => {
    const result = idleDetectorConfigSchema.safeParse({
      idleWindowMinutes: 30,
      transcriptDirs: ['.claude/projects'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects an empty transcript list, which would hide Unattended Agent Sessions', () => {
    const result = idleDetectorConfigSchema.safeParse({
      idleWindowMinutes: 30,
      transcriptDirs: [],
    });
    expect(result.success).toBe(false);
  });
});
