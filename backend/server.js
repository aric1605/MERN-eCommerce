import 'dotenv/config';
import validateEnv from './config/envValidation.js';
import connectDB from './config/db.js';
import app from './app.js';
import logger from './utils/logger.js';

// Fast fail startup env validation
validateEnv();

const port = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.listen(port, () => {
  logger.info(`Production API Server running on port ${port}`);
});
