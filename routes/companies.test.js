process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const { generateData } = require('../_test_common');
const db = require('../db');

/**
 router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM companies;`);
    return res.json({ companies: results.rows });
  } catch (e) {
    next(e);
  }
});
 */

beforeEach(generateData);

afterAll(async () => {
  await db.end();
});

describe('GET /companies', () => {
  test('Get list of companies', async () => {
    const res = await request(app).get('/companies');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      companies: [
        { code: 'apple', name: 'Apple', description: 'Maker of OSX.' },
        { code: 'ibm', name: 'IBM', description: 'Big blue.' },
      ],
    });
  });
});
