const express = require('express');
const ExpressError = require('../expressError');
const router = express.Router();
const slugify = require('slugify');
const db = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(
      `SELECT c.code, c.name, i.industry FROM companies AS c
        INNER JOIN companies_industries AS ci ON (ci.comp_code = c.code)
        INNER JOIN industries AS i ON i.code = ci.industry_code;`
    );
    console.log(results.rows);
    return res.json({ companies: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.get('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const compResult = await db.query(
      `SELECT code, name, description
           FROM companies
           WHERE code = $1`,
      [code]
    );

    const invResult = await db.query(
      `SELECT id
           FROM invoices
           WHERE comp_code = $1`,
      [code]
    );
    if (compResult.rows.length === 0) {
      throw new ExpressError(`Can't find company with code of ${code}`, 404);
    }
    const company = compResult.rows[0];
    const invoices = invResult.rows;

    company.invoices = invoices.map((inv) => inv.id);

    return res.json({ company: company });
  } catch (e) {
    return next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const code = slugify(name);
    const results = await db.query(
      'INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description',
      [code, name, description]
    );
    return res.status(201).json({ company: results.rows[0] });
  } catch (e) {
    next(e);
  }
});

router.put('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body;
    const results = await db.query(
      `UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description;`,
      [name, description, code]
    );
    if (results.rows.length === 0) {
      throw new ExpressError(`Can not update company with code ${code}`, 404);
    }
    return res.json({ company: results.rows[0] });
  } catch (e) {
    next(e);
  }
});

router.delete('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;

    const results = await db.query(`SELECT * FROM companies WHERE code=$1`, [
      code,
    ]);
    if (results.rows.length === 0) {
      throw new ExpressError(`Can not delete company with code ${code}`, 404);
    }
    await db.query(`DELETE FROM companies WHERE code=$1`, [code]);

    return res.json({ status: 'deleted' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
