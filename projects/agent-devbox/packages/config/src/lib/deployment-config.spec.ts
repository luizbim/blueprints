import { deploymentConfigSchema } from './deployment-config.js';
import { hibernationRootVolumeGiB, ROOT_OS_GIB } from './instance-types.js';

describe('deploymentConfigSchema', () => {
  it('deploys the documented design from an empty object', () => {
    expect(deploymentConfigSchema.parse({})).toEqual({
      region: 'eu-south-2',
      instanceType: 't4g.xlarge',
      homeVolumeGiB: 60,
      idleWindowMinutes: 30,
      snapshotRetentionDays: 7,
      monthlyBudgetUsd: 45,
      lowCpuBackstop: { cpuPercent: 2, minutes: 120 },
    });
  });

  it('fills backstop defaults when only some backstop fields are given', () => {
    const config = deploymentConfigSchema.parse({
      lowCpuBackstop: { cpuPercent: 5 },
    });
    expect(config.lowCpuBackstop).toEqual({ cpuPercent: 5, minutes: 120 });
  });

  it('rejects instance types that do not support hibernation', () => {
    const result = deploymentConfigSchema.safeParse({
      instanceType: 't3.large',
    });
    expect(result.success).toBe(false);
  });

  it('rejects unknown keys so typos fail instead of silently using defaults', () => {
    const result = deploymentConfigSchema.safeParse({ idleWindowMins: 10 });
    expect(result.success).toBe(false);
  });

  it('rejects a backstop that would fire before the Idle window ends', () => {
    const result = deploymentConfigSchema.safeParse({
      idleWindowMinutes: 60,
      lowCpuBackstop: { minutes: 60 },
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual([
      'lowCpuBackstop',
      'minutes',
    ]);
  });

  it.each(['eu-south-2', 'us-east-1', 'ap-southeast-1'])(
    'accepts region %s',
    (region) => {
      expect(deploymentConfigSchema.safeParse({ region }).success).toBe(true);
    },
  );

  it.each(['spain', 'eu-south', 'EU-SOUTH-2'])(
    'rejects region %s',
    (region) => {
      expect(deploymentConfigSchema.safeParse({ region }).success).toBe(false);
    },
  );
});

describe('hibernationRootVolumeGiB', () => {
  it('holds the OS plus all of memory', () => {
    expect(hibernationRootVolumeGiB('t4g.xlarge')).toBe(ROOT_OS_GIB + 16);
    expect(hibernationRootVolumeGiB('m7g.large')).toBe(ROOT_OS_GIB + 8);
  });
});
