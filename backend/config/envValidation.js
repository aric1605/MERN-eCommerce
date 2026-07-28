import { cleanEnv, str, port } from 'envalid';

const validateEnv = () => {
  cleanEnv(process.env, {
    PORT: port({ default: 5000 }),
    JWT_SECRET: str(),
    MONGO_URI: str(),
    EMAIL_USER: str(),
    EMAIL_PASS: str(),
    EMAIL_FROM: str(),
    CLIENT_URL: str(),
    RAZORPAY_KEY_ID: str(),
    RAZORPAY_KEY_SECRET: str()
  });
};

export default validateEnv;
