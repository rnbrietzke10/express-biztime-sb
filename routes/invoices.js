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
    const results = await db.query(`SELECT * FROM invoices WHERE id=$1`, [id]);
    if (results.rows.length === 0) {
      throw new ExpressError(`Can not get ivoice with id of ${id}`, 404);
    }

    return res.json({ invoice: results.rows });
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const results = db.query(
      `INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date;`,
      [comp_code, amt]
    );
    return res.status(201).json({ invoice: results.rows[0] });
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

PUT /invoices/[id]
Updates an invoice.

If invoice cannot be found, returns a 404.

Needs to be passed in a JSON body of {amt}

Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}

DELETE /invoices/[id]
Deletes an invoice.

If invoice cannot be found, returns a 404.

Returns: {status: "deleted"}

Also, one route from the previous part should be updated:

GET /companies/[code]
Return obj of company: {company: {code, name, description, invoices: [id, ...]}}

If the company given cannot be found, this should return a 404 status response.

 */
