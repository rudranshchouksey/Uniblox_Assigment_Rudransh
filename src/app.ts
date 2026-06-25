import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './config/swagger';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Versioning
app.use('/api', routes);

// Centralized Error Handling
app.use(errorHandler);

export default app;
