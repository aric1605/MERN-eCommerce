import pino from 'pino';

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'user.password',
      'token',
      'JWT_SECRET',
      'RAZORPAY_KEY_SECRET',
      'CLOUDINARY_API_SECRET',
      'EMAIL_PASS'
    ],
    censor: '[REDACTED]'
  },
  timestamp: pino.stdTimeFunctions.isoTime
});

export default logger;
