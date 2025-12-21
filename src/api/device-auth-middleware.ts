import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

export const deviceAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    logger.warn({ path: req.path }, 'Missing or invalid authorization header');
    res.setHeader('WWW-Authenticate', 'Basic realm="Device API Authentication"');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');

  const expectedUsername = process.env.DEVICE_API_USERNAME;
  const expectedPassword = process.env.DEVICE_API_PASSWORD;

  if (!expectedUsername || !expectedPassword) {
    logger.error('Device API authentication credentials not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (username !== expectedUsername || password !== expectedPassword) {
    logger.warn({ username }, 'Authentication failed: invalid credentials');
    res.setHeader('WWW-Authenticate', 'Basic realm="Device API Authentication"');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  logger.debug({ username }, 'Authentication successful');
  next();
};

