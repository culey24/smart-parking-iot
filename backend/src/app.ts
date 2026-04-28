import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { setupSwagger } from './config/swagger';
import adminRoutes from './routes/admin.routes';
import reportRoutes from './routes/reports.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/reports', reportRoutes);

// Admin API routes
app.use('/api/admin', adminRoutes);

// 2. Khởi chạy giao diện Swagger (nên để trước các route chính)
setupSwagger(app);

// Main API routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

export default app;
