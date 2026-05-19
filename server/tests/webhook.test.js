import request from 'supertest';
import app from '../app.js';
import Stripe from 'stripe';

jest.mock('stripe');

describe('Stripe webhook', () => {
  beforeAll(() => {
    Stripe.mockImplementation(() => ({
      webhooks: {
        constructEvent: (body, sig, secret) => ({ type: 'checkout.session.completed' })
      }
    }));
  });

  it('responds 200 when signature valid', async () => {
    const res = await request(app)
      .post('/api/stripe/webhook')
      .set('stripe-signature', 'test')
      .send({});
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('received', true);
  });
});
