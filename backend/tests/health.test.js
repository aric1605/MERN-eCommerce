import request from 'supertest';
import app from '../app.js';

describe('System Health & Configuration API', () => {
  it('GET /api/health should return 200 OK with health status metadata', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('uptime');
  });

  it('GET /api/v1/payment/razorpay/config should return razorpayKeyId without exposing secret', async () => {
    const res = await request(app).get('/api/v1/payment/razorpay/config');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('razorpayKeyId');
    expect(res.body).not.toHaveProperty('razorpayKeySecret');
  });
});
