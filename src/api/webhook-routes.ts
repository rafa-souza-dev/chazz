import express, { Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../lib/logger';
import { receivedPixWebhookSchema } from './webhook-schema';
import { RescheduleDeviceTurnOff } from '../use-cases/reschedule-device-turn-off';
import { DeviceNotFoundError } from '../errors/DeviceNotFoundError';
import { basicAuthMiddleware } from './basic-auth-middleware';

export const webhookRoutes = express.Router();

webhookRoutes.post('/webhooks/received-pix', basicAuthMiddleware, async (req: Request, res: Response) => {
  logger.info({ path: '/webhooks/received-pix' }, 'Received PIX webhook request');

  try {
    const validatedPayload = receivedPixWebhookSchema.parse(req.body);
    logger.debug({ payload: validatedPayload }, 'Webhook payload validated');

    const deviceName = validatedPayload.pixQrCode.name;
    const deviceIdMatch = deviceName.match(/Device id_(\d+)/);

    if (!deviceIdMatch) {
      logger.warn({ deviceName }, 'Invalid device name format');
      return res.status(400).json({
        error: 'Invalid device name format. Expected format: "Device id_<number>"',
      });
    }

    const deviceId = parseInt(deviceIdMatch[1], 10);
    const paidCents = validatedPayload.pixQrCode.value;

    logger.info({ deviceId, paidCents }, 'Processing device reschedule');

    await RescheduleDeviceTurnOff.handle({ deviceId, paidCents });

    logger.info({ deviceId, paidCents }, 'Device reschedule completed successfully');
    res.status(200).json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn({ errors: error.issues }, 'Invalid webhook payload');
      return res.status(400).json({
        error: 'Invalid payload',
        details: error.issues,
      });
    }

    if (error instanceof DeviceNotFoundError) {
      logger.warn({ error: error.message }, 'Device not found');
      return res.status(404).json({
        error: error.message,
      });
    }

    logger.error({ error }, 'Unexpected error processing webhook');
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

