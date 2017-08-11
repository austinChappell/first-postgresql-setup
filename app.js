const express = require('express'),
      app = express(),
      bodyParser = require('body-parser'),
      mustacheExpress = require('mustache-express');

const { Client } = require('pg')

require('dotenv').config();

const mustache = mustacheExpress();
mustache.cache = null;
app.engine('mustache', mustache);
app.set('view engine', 'mustache');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {

  const client = new Client();
  client.connect().then(() => {
    return client.query('SELECT * FROM customers ORDER BY name ASC');
  }).then((results) => {
    res.render('index', results)
  }).catch((err) => {
    console.log(err);
  });
});

app.get('/entry', (req, res) => {
  res.render('entry');
});

app.post('/entry', (req, res) => {
  let name = req.body.name;
  let business = req.body.business;
  let tier = req.body.tier;

  const client = new Client();

  client.connect().then(() => {
    const sql = 'INSERT INTO customers (name, business, tier) VALUES ($1, $2, $3)';
    const params = [req.body.name, req.body.business, req.body.tier];

    return client.query(sql, params);
  }).then((result) => {

    client.end();
    res.redirect('/');
  })
});

app.get('/edit/:id', (req, res) => {
  let id = req.params.id;
  const client = new Client();

  client.connect().then(() => {
    const sql = 'SELECT * FROM customers WHERE id = $1';
    const params = [id];

    return client.query(sql, params);
  }).then((result) => {
    if (result.rows.length > 0) {
      res.render('edit', result.rows[0]);
    } else {
      res.redirect('/');
    }
  })
});

app.post('/edit/:id', (req, res) => {
  let id = req.params.id;
  const client = new Client();

  client.connect().then(() => {
    const sql = 'UPDATE customers SET name=$1, business=$2, tier=$3 WHERE id = $4';
    const params = [req.body.name, req.body.business, req.body.tier, id];

    return client.query(sql, params);
  }).then((result) => {
    res.redirect('/');
  })
});

app.post('/destroy/:id', (req, res) => {
  let id = req.params.id;

  const client = new Client();

  client.connect().then(() => {
    const sql = 'DELETE FROM customers WHERE id = ($1)';
    const params = [id];
    return client.query(sql, params);
  }).then((result) => {
    client.end();
    res.redirect('/');
  });
});

let port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Your app is now running on PORT ${ port }.`);
});
