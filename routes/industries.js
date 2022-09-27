const express = require('express');
const ExpressError = require('../expressError');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const results =
      await db.query(`SELECT i.code, i.industry, ci.comp_code FROM industries AS i
      INNER JOIN companies_industries AS ci ON (i.code = ci.industry_code);`);
    return res.json(results.rows);
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { code, industry } = req.body;
    const results = await db.query(
      `INSERT INTO industries (code, industry) VALUES ($1, $2)
      RETURNING code, industry`,
      [code, industry]
    );
    return res.json(results.rows[0]);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
