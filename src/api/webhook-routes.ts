import express, { Request, Response } from 'express';
import { ZodError } from 'zod';
import { receivedPixWebhookSchema } from './webhook-schema';
import { RescheduleDeviceTurnOff } from '../use-cases/reschedule-device-turn-off';
import { DeviceNotFoundError } from '../errors/DeviceNotFoundError';
import { basicAuthMiddleware } from './basic-auth-middleware';

export const webhookRoutes = express.Router();

webhookRoutes.post('/webhooks/received-pix', basicAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const validatedPayload = receivedPixWebhookSchema.parse(req.body);

    const deviceName = validatedPayload.pixQrCode.name;
    const deviceIdMatch = deviceName.match(/Device id_(\d+)/);

    if (!deviceIdMatch) {
      return res.status(400).json({
        error: 'Invalid device name format. Expected format: "Device id_<number>"',
      });
    }

    const deviceId = parseInt(deviceIdMatch[1], 10);
    const paidCents = validatedPayload.pixQrCode.value;

    await RescheduleDeviceTurnOff.handle({ deviceId, paidCents });

    res.status(200).json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Invalid payload',
        details: error.issues,
      });
    }

    if (error instanceof DeviceNotFoundError) {
      return res.status(404).json({
        error: error.message,
      });
    }

    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

