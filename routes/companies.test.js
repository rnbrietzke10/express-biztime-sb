process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const { generateData } = require('../_test_common');
const db = require('../db');

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
        {
          code: 'apple',
          name: 'Apple',
          industry: 'Technology',
        },
        {
          code: 'ibm',
          name: 'IBM',
          industry: 'Technology',
        },
      ],
    });
  });
});

describe('GET /companies/:code', () => {
  test('Get a single company', async () => {
    const res = await request(app).get('/companies/apple');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      company: {
        code: 'apple',
        name: 'Apple',
        description: 'Maker of OSX.',
        invoices: [1, 2],
      },
    });
  });
});
/*
router.get('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const results = await db.query(
      'SELECT * FROM companies, invoices WHERE code = $1 AND invoices.comp_code=companies.code',
      [code]
    );
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't find company with code of ${code}`, 404);
    }
    return res.json({ company: results.rows[0] });
  } catch (e) {
    next(e);
  }
});
*/
