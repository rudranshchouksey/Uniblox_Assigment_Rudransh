import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './config/swagger';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { env } from './config/env';

const app = express();

// Swagger Documentation
app.use(`${env.API_PREFIX}-docs`, swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get(`${env.API_PREFIX}-docs.json`, (req, res) => res.json(swaggerDocument));

// Middleware
app.use(cors({
  origin: env.FRONTEND_URL
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Versioning
app.use(env.API_PREFIX, routes);

// Centralized Error Handling
app.use(errorHandler);

export default app;
