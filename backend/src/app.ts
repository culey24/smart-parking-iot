import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

// Main API routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

export default app;
