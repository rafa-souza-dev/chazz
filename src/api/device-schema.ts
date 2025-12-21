import { z } from 'zod';

export const createDeviceSchema = z.object({
  external_id: z.string().min(1),
  cents_per_cycle: z.number().int().positive(),
  seconds_per_cycle: z.number().int().positive(),
  turn_off_at: z.string().datetime().nullable().optional(),
});

export const updateDeviceSchema = z.object({
  external_id: z.string().min(1).optional(),
  cents_per_cycle: z.number().int().positive().optional(),
  seconds_per_cycle: z.number().int().positive().optional(),
  turn_off_at: z.string().datetime().optional().nullable(),
});

export type CreateDevicePayload = z.infer<typeof createDeviceSchema>;
export type UpdateDevicePayload = z.infer<typeof updateDeviceSchema>;

