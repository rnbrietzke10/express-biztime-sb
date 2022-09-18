const express = require('express');
const ExpressError = require('../expressError');
const db = require('../db');
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM invoices;`);
    return res.json({ invoices: results.rows });
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await db.query(
      `SELECT i.id,
                  i.comp_code,
                  i.amt,
                  i.paid,
                  i.add_date,
                  i.paid_date,
                  c.name,
                  c.description
           FROM invoices AS i
             INNER JOIN companies AS c ON (i.comp_code = c.code)
           WHERE id = $1`,
      [id]
    );
    if (results.rows.length === 0) {
      throw new ExpressError(`Can not get invoice with id of ${id}`, 404);
    }

    const data = results.rows[0];
    const invoice = {
      id: data.id,
      amt: data.amt,
      paid: data.paid,
      add_date: data.add_date,
      paid_date: data.paid_date,
      company: {
        code: data.comp_code,
        name: data.name,
        description: data.description,
      },
    };

    return res.json({ invoice: invoice });
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const results = await db.query(
      `INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date;`,
      [comp_code, amt]
    );
    return res.status(201).json({ invoice: results.rows[0] });
  } catch (e) {
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amt } = req.body;
    const results = await db.query(
      `UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [amt, id]
    );
    if (results.rows.length === 0) {
      throw new ExpressError(`Can not get invoice with id of ${id}`, 404);
    }

    return res.json({ invoice: results.rows[0] });
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const results = await db.query(`SELECT * FROM invoices WHERE id=$1`, [id]);
    if (results.rows.length === 0) {
      throw new ExpressError(`Can not delete invoices with id ${id}`, 404);
    }
    await db.query(`DELETE FROM invoices WHERE id=$1`, [id]);

    return res.json({ status: 'deleted' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
/*
Add routes/invoices.js. All routes in this file should be prefixed by /invoices.

GET /invoices
Return info on invoices: like {invoices: [{id, comp_code}, ...]}
GET /invoices/[id]
Returns obj on given invoice.

If invoice cannot be found, returns 404.

Returns {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}}

POST /invoices
Adds an invoice.

Needs to be passed in JSON body of: {comp_code, amt}

Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}




GET /companies/[code]
Return obj of company: {company: {code, name, description, invoices: [id, ...]}}

If the company given cannot be found, this should return a 404 status response.

 */
