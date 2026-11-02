import { z } from 'zod';
import { INSTANCE_TYPE_NAMES } from './instance-types.js';
import { DEFAULT_REGION, regionSchema } from './region.js';

// Input to the Devbox CDK stack. Every field has a default, so an empty object
// deploys the design as documented in the README.
export const deploymentConfigSchema = z
  .strictObject({
    region: regionSchema.default(DEFAULT_REGION),
    instanceType: z.enum(INSTANCE_TYPE_NAMES).default('t4g.xlarge'),
    homeVolumeGiB: z.int().min(20).max(1000).default(60),
    idleWindowMinutes: z.int().min(5).max(240).default(30),
    snapshotRetentionDays: z.int().min(1).max(35).default(7),
    monthlyBudgetUsd: z.number().positive().default(45),
    // ADR-0006: catches a Devbox whose Idle detector was killed.
    lowCpuBackstop: z
      .strictObject({
        cpuPercent: z.number().gt(0).lt(100).default(2),
        minutes: z.int().min(10).default(120),
      })
      .prefault({}),
  })
  .refine(
    (config) => config.lowCpuBackstop.minutes > config.idleWindowMinutes,
    {
      message:
        'lowCpuBackstop.minutes must be longer than idleWindowMinutes, or the backstop stops the Devbox before it can hibernate',
      path: ['lowCpuBackstop', 'minutes'],
    },
  );

export type DeploymentConfigInput = z.input<typeof deploymentConfigSchema>;
export type DeploymentConfig = z.output<typeof deploymentConfigSchema>;
