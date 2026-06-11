import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import problemsRoutes from './routes/problems.routes';
import submissionsRoutes from './routes/submissions.routes';
import usersRoutes from './routes/users.routes';
import leaderboardRoutes from './routes/leaderboard.routes';
import adminRoutes from './routes/admin.routes';
import roastRoutes from './routes/roast.routes';
import learningRoutes from './routes/learning.routes';
import creditsRoutes from './routes/credits.routes';
import systemRoutes from './routes/system.routes';
import { errorHandler } from './middleware/errorHandler';
import './jobs/submission.job';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: '50kb' }));

app.get('/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/problems', problemsRoutes);
app.use('/api/v1/submissions', submissionsRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/leaderboard', leaderboardRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/roast', roastRoutes);
app.use('/api/v1/learning', learningRoutes);
app.use('/api/v1/credits', creditsRoutes);
app.use('/api/v1/system', systemRoutes);

app.use(errorHandler);

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`RoastCoder API listening on port ${PORT}`);
});
