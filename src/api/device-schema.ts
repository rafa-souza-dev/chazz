import { z } from 'zod';

export const createDeviceSchema = z.object({
  externalId: z.string().min(1),
  centsPerCycle: z.number().int().positive(),
  secondsPerCycle: z.number().int().positive(),
  turnOffAt: z.string().datetime().nullable().optional(),
});

export const updateDeviceSchema = z.object({
  externalId: z.string().min(1).optional(),
  centsPerCycle: z.number().int().positive().optional(),
  secondsPerCycle: z.number().int().positive().optional(),
  turnOffAt: z.string().datetime().optional().nullable(),
});

export type CreateDevicePayload = z.infer<typeof createDeviceSchema>;
export type UpdateDevicePayload = z.infer<typeof updateDeviceSchema>;

