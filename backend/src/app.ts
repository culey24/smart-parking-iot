import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { requestLogger } from './middlewares/requestLogger';
import { setupSwagger } from './config/swagger';
import adminRoutes from './routes/admin.routes';
import reportRoutes from './routes/reports.routes';

const app = express();

app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Cache-Control'],
  credentials: true,
}));
app.use(requestLogger);
app.use(express.json());

app.use('/api', routes);

setupSwagger(app);

app.use(errorHandler);

export default app;