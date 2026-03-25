import express, { Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../lib/logger';
import { createDeviceSchema, updateDeviceSchema } from './device-schema';
import { CreateDevice } from '../use-cases/create-device';
import { GetDevice } from '../use-cases/get-device';
import { ListDevices } from '../use-cases/list-devices';
import { UpdateDevice } from '../use-cases/update-device';
import { DeleteDevice } from '../use-cases/delete-device';
import { DeviceNotFoundError } from '../errors/DeviceNotFoundError';
import { deviceAuthMiddleware } from './device-auth-middleware';

export const deviceRoutes = express.Router();

deviceRoutes.get('/devices', async (req: Request, res: Response) => {
  logger.info({ path: '/devices' }, 'Received list devices request');

  try {
    const devices = await ListDevices.handle();
    logger.info({ deviceCount: devices.length }, 'Devices listed successfully');
    const devicesResponse = devices.map(device => ({
      id: device.id,
      external_id: device.externalId,
      cents_per_cycle: device.centsPerCycle,
      seconds_per_cycle: device.secondsPerCycle,
      turn_off_at: device.turnOffAt,
    }));
    res.status(200).json(devicesResponse);
  } catch (error) {
    logger.error({ error }, 'Unexpected error listing devices');
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

deviceRoutes.use(deviceAuthMiddleware);

deviceRoutes.post('/devices', async (req: Request, res: Response) => {
  logger.info({ path: '/devices' }, 'Received create device request');

  try {
    const validatedPayload = createDeviceSchema.parse(req.body);
    logger.debug({ payload: validatedPayload }, 'Device payload validated');

    const data: any = {
      externalId: validatedPayload.external_id,
      centsPerCycle: validatedPayload.cents_per_cycle,
      secondsPerCycle: validatedPayload.seconds_per_cycle,
    };

    if (validatedPayload.turn_off_at !== undefined) {
      data.turnOffAt = validatedPayload.turn_off_at ? new Date(validatedPayload.turn_off_at) : null;
    }

    const device = await CreateDevice.handle({ data });

    logger.info({ deviceId: device.id }, 'Device created successfully');
    res.status(201).json({
      id: device.id,
      external_id: device.externalId,
      cents_per_cycle: device.centsPerCycle,
      seconds_per_cycle: device.secondsPerCycle,
      turn_off_at: device.turnOffAt,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn({ errors: error.issues }, 'Invalid device payload');
      return res.status(400).json({
        error: 'Invalid payload',
        details: error.issues,
      });
    }

    logger.error({ error }, 'Unexpected error creating device');
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

deviceRoutes.get('/devices/:id', async (req: Request, res: Response) => {
  const deviceId = parseInt(req.params.id, 10);
  logger.info({ path: '/devices/:id', deviceId }, 'Received get device request');

  if (isNaN(deviceId)) {
    logger.warn({ deviceId: req.params.id }, 'Invalid device ID format');
    return res.status(400).json({
      error: 'Invalid device ID. Must be a number',
    });
  }

  try {
    const device = await GetDevice.handle({ id: deviceId });
    logger.info({ deviceId }, 'Device retrieved successfully');
    res.status(200).json({
      id: device.id,
      external_id: device.externalId,
      cents_per_cycle: device.centsPerCycle,
      seconds_per_cycle: device.secondsPerCycle,
      turn_off_at: device.turnOffAt,
    });
  } catch (error) {
    if (error instanceof DeviceNotFoundError) {
      logger.warn({ error: error.message }, 'Device not found');
      return res.status(404).json({
        error: error.message,
      });
    }

    logger.error({ error }, 'Unexpected error getting device');
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

deviceRoutes.put('/devices/:id', async (req: Request, res: Response) => {
  const deviceId = parseInt(req.params.id, 10);
  logger.info({ path: '/devices/:id', deviceId }, 'Received update device request');

  if (isNaN(deviceId)) {
    logger.warn({ deviceId: req.params.id }, 'Invalid device ID format');
    return res.status(400).json({
      error: 'Invalid device ID. Must be a number',
    });
  }

  try {
    const validatedPayload = updateDeviceSchema.parse(req.body);
    logger.debug({ payload: validatedPayload }, 'Device update payload validated');

    const data: any = {};
    if (validatedPayload.external_id !== undefined) {
      data.externalId = validatedPayload.external_id;
    }
    if (validatedPayload.cents_per_cycle !== undefined) {
      data.centsPerCycle = validatedPayload.cents_per_cycle;
    }
    if (validatedPayload.seconds_per_cycle !== undefined) {
      data.secondsPerCycle = validatedPayload.seconds_per_cycle;
    }
    if (validatedPayload.turn_off_at !== undefined) {
      data.turnOffAt = validatedPayload.turn_off_at ? new Date(validatedPayload.turn_off_at) : null;
    }

    const device = await UpdateDevice.handle({ id: deviceId, data });

    logger.info({ deviceId }, 'Device updated successfully');
    res.status(200).json({
      id: device.id,
      external_id: device.externalId,
      cents_per_cycle: device.centsPerCycle,
      seconds_per_cycle: device.secondsPerCycle,
      turn_off_at: device.turnOffAt,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn({ errors: error.issues }, 'Invalid device update payload');
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

    logger.error({ error }, 'Unexpected error updating device');
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

deviceRoutes.delete('/devices/:id', async (req: Request, res: Response) => {
  const deviceId = parseInt(req.params.id, 10);
  logger.info({ path: '/devices/:id', deviceId }, 'Received delete device request');

  if (isNaN(deviceId)) {
    logger.warn({ deviceId: req.params.id }, 'Invalid device ID format');
    return res.status(400).json({
      error: 'Invalid device ID. Must be a number',
    });
  }

  try {
    const device = await DeleteDevice.handle({ id: deviceId });
    logger.info({ deviceId }, 'Device deleted successfully');
    res.status(200).json({
      id: device.id,
      external_id: device.externalId,
      cents_per_cycle: device.centsPerCycle,
      seconds_per_cycle: device.secondsPerCycle,
      turn_off_at: device.turnOffAt,
    });
  } catch (error) {
    if (error instanceof DeviceNotFoundError) {
      logger.warn({ error: error.message }, 'Device not found');
      return res.status(404).json({
        error: error.message,
      });
    }

    logger.error({ error }, 'Unexpected error deleting device');
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

