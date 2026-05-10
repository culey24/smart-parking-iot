import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'OPTIONS') {
    return next();
  }

  // EventSource (SSE) cannot send custom headers — accept token via query param as fallback
  const token = req.headers.authorization?.split(' ')[1] || (req.query.token as string);

  if (!token) {
    logger.debug({ method: req.method, url: req.url }, 'Auth: no token');
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    (req as any).user = decoded;
    next();
  } catch (error) {
    logger.debug({ method: req.method, url: req.url }, 'Auth: invalid token');
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};