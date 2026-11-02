import { operatorConfigSchema } from './operator-config.js';

describe('operatorConfigSchema', () => {
  it('defaults the region and starts with no Agents', () => {
    expect(
      operatorConfigSchema.parse({ version: 1, awsProfile: 'devbox' }),
    ).toEqual({
      version: 1,
      awsProfile: 'devbox',
      region: 'eu-south-2',
      agents: [],
    });
  });

  it('rejects a file written by a future CLI version', () => {
    const result = operatorConfigSchema.safeParse({
      version: 2,
      awsProfile: 'devbox',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an Agent listed twice', () => {
    const result = operatorConfigSchema.safeParse({
      version: 1,
      awsProfile: 'devbox',
      agents: ['codex', 'codex'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown Agent', () => {
    const result = operatorConfigSchema.safeParse({
      version: 1,
      awsProfile: 'devbox',
      agents: ['copilot'],
    });
    expect(result.success).toBe(false);
  });
});
