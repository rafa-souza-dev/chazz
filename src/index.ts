import 'dotenv/config';
import express, { Request, Response } from 'express';
import cron from 'node-cron';

import { webhookRoutes } from './api/webhook-routes';
import { TurnOffPendingDevices } from './use-cases/turn-off-pending-devices';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.use(webhookRoutes);

cron.schedule('*/5 * * * * *', async () => {
  try {
    await TurnOffPendingDevices.handle();
  } catch (error) {
    console.error('Error executing TurnOffPendingDevices:', error);
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Health check disponível em http://localhost:${PORT}/health`);
  console.log('Cronjob iniciado: TurnOffPendingDevices será executado a cada 5 segundos');
});
