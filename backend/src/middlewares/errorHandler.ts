import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

interface AppError extends Error {
  statusCode?: number;
  code?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.code === 11000) {
    statusCode = 400;
    message = 'Dữ liệu đã tồn tại trong hệ thống (Trùng khóa duy nhất).';
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Dữ liệu nhập vào không hợp lệ.';
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Tham số truyền vào sai định dạng (Invalid ID).';
  }

  if (statusCode === 500) {
    logger.error({ err, req: { method: req.method, url: req.url, body: req.body } }, message);
  } else {
    logger.warn({ req: { method: req.method, url: req.url } }, message);
  }

  res.status(statusCode).json({
    success: false,
    message: message
  });
};