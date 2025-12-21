import 'dotenv/config';
import express, { Request, Response } from 'express';
import cron from 'node-cron';

import { logger } from './lib/logger';
import { webhookRoutes } from './api/webhook-routes';
import { TurnOffPendingDevices } from './use-cases/turn-off-pending-devices';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  logger.debug({ path: '/health' }, 'Health check requested');
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.use(webhookRoutes);

cron.schedule('*/5 * * * * *', async () => {
  logger.debug('Executing TurnOffPendingDevices cronjob');
  try {
    await TurnOffPendingDevices.handle();
    logger.debug('TurnOffPendingDevices cronjob completed successfully');
  } catch (error) {
    logger.error({ error }, 'Error executing TurnOffPendingDevices cronjob');
  }
});

app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Server started');
  logger.info({ path: '/health' }, 'Health check endpoint available');
  logger.info({ interval: '5 seconds' }, 'Cronjob started: TurnOffPendingDevices');
});
