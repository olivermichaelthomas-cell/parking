import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import bodyParser from 'body-parser';
import { config } from './config';
import authRoutes from './routes/auth';
import zoneRoutes from './routes/zones';
import vehicleRoutes from './routes/vehicles';
import sessionRoutes from './routes/sessions';
import { scheduleNotificationSweep } from './utils/notifications';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/auth', authRoutes);
app.use('/zones', zoneRoutes);
app.use('/vehicles', vehicleRoutes);
app.use('/sessions', sessionRoutes);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Unexpected error' });
});

app.listen(config.port, () => {
  console.log(`API running on port ${config.port}`);
  scheduleNotificationSweep();
});

export default app;
