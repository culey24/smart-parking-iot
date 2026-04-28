import { Request, Response, NextFunction } from 'express';

// 1. Định nghĩa Interface cho Error để TypeScript không báo lỗi khi truy cập .statusCode
interface AppError extends Error {
  statusCode?: number;
  code?: number; // Mã lỗi của MongoDB (ví dụ 11000 cho trùng unique)
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Mặc định là lỗi 500 (Server) nếu không được chỉ định
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // 2. Tự động chuẩn hóa các lỗi phổ biến từ Mongoose (MongoDB)
  
  // Lỗi trùng dữ liệu (Unique Constraint) - Ví dụ trùng biển số xe hoặc mã Admin
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Dữ liệu đã tồn tại trong hệ thống (Trùng khóa duy nhất).';
  }

  // Lỗi Validation (Nhập thiếu hoặc sai định dạng theo Schema)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Dữ liệu nhập vào không hợp lệ.';
  }

  // Lỗi CastError (Ví dụ truyền ID sai định dạng của MongoDB)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Tham số truyền vào sai định dạng (Invalid ID).';
  }

  // 3. Log lỗi ra terminal để Dev dễ debug (chỉ log khi là lỗi 500)
  if (statusCode === 500) {
    console.error('🔥 [SERVER ERROR]:', err.stack);
  } else {
    console.warn(`⚠️ [CLIENT ERROR ${statusCode}]:`, message);
  }

  // 4. Trả về JSON theo đúng chuẩn format của nhóm
  res.status(statusCode).json({
    success: false,
    message: message
  });
};