import type { Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

import { logger } from '../lib/logger';

let wss: WebSocketServer | null = null;

export function initDeviceUpdatesWebSocket(server: Server): void {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', () => {
    logger.info({ path: '/ws' }, 'WebSocket client connected');
  });
}

export function broadcastDeviceRescheduled(deviceId: number, turnOffAt: Date): void {
  if (!wss) {
    return;
  }

  const payload = JSON.stringify({
    type: 'device_rescheduled',
    device_id: deviceId,
    turn_off_at: turnOffAt.toISOString(),
  });

  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}
