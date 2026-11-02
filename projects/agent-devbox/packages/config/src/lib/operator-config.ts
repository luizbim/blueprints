import { z } from 'zod';
import { AGENTS } from './constants.js';
import { DEFAULT_REGION, regionSchema } from './region.js';

// The CLI's per-laptop file, written by `devbox setup`. It holds no instance ID:
// the Devbox is found by its tag on every run, so a rebuild needs no re-setup.
export const operatorConfigSchema = z.strictObject({
  version: z.literal(1),
  awsProfile: z.string().min(1),
  region: regionSchema.default(DEFAULT_REGION),
  agents: z
    .array(z.enum(AGENTS))
    .default([])
    .refine((agents) => new Set(agents).size === agents.length, {
      message: 'Each Agent may be listed only once',
    }),
});

export type OperatorConfigInput = z.input<typeof operatorConfigSchema>;
export type OperatorConfig = z.output<typeof operatorConfigSchema>;
