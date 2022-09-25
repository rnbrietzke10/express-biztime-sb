process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const { generateData } = require('../_test_common');
const db = require('../db');

beforeEach(generateData);

afterAll(async () => {
  await db.end();
});

describe('GET /invoices', () => {
  test('Get list of invoices', async () => {
    const res = await request(app).get('/invoices');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      invoices: [
        { id: 1, comp_code: 'apple' },
        { id: 2, comp_code: 'apple' },
        { id: 3, comp_code: 'ibm' },
      ],
    });
  });
});
