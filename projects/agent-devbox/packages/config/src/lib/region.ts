import { z } from 'zod';

export const DEFAULT_REGION = 'eu-south-2';

export const regionSchema = z
  .string()
  .regex(
    /^[a-z]{2}(-[a-z]+)+-\d$/,
    'Expected an AWS region such as eu-south-2',
  );
