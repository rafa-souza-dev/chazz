import { z } from 'zod';

export const receivedPixWebhookSchema = z.object({
  pixQrCode: z.object({
    name: z.string(),
    value: z.number(),
  }),
});

export type ReceivedPixWebhookPayload = z.infer<typeof receivedPixWebhookSchema>;
