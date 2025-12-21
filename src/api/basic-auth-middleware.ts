import { Request, Response, NextFunction } from 'express';

export const basicAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Webhook Authentication"');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');

  const expectedUsername = process.env.WEBHOOK_USERNAME;
  const expectedPassword = process.env.WEBHOOK_PASSWORD;

  if (!expectedUsername || !expectedPassword) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (username !== expectedUsername || password !== expectedPassword) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Webhook Authentication"');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};
