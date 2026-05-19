import { jest } from '@jest/globals';
import request from 'supertest';

const Stripe = jest.fn();
jest.unstable_mockModule('stripe', () => ({ default: Stripe }));

let app;
beforeAll(async () => {
  Stripe.mockImplementation(() => ({
    webhooks: {
      constructEvent: (body, sig, secret) => ({ type: 'checkout.session.completed' })
    }
  }));
  const mod = await import('../app.js');
  app = mod.default;
});

describe('Stripe webhook', () => {
  it('responds 200 when signature valid', async () => {
    const res = await request(app)
      .post('/api/stripe/webhook')
      .set('stripe-signature', 'test')
      .send({});
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('received', true);
  });
});
