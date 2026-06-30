/**
 * index.js — Server entry point
 * Sets up Express with security, CORS, logging, routes, then starts the server.
 */

import express from 'express';
import cors    from 'cors';
import helmet  from 'helmet';
import morgan  from 'morgan';
import dotenv  from 'dotenv';
import 'express-async-errors';

import { connectDB }                   from './utils/db.js';
import { notFound, errorHandler }      from './middleware/errorMiddleware.js';
import { registerRoutes }              from './routes/index.js';

dotenv.config();

const app = express();
// Strip trailing slash from CLIENT_ORIGIN to prevent CORS mismatch
const clientOrigin = (process.env.CLIENT_ORIGIN || '*').replace(/\/$/, '');

app.use(helmet());
app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

registerRoutes(app);
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`)))
  .catch(err => { console.error('DB connection failed:', err); process.exit(1); });
