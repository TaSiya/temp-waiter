'use strict';

const express = require('express');
const handleBars = require('express-handlebars');
const bodyParser = require('body-parser')
const flash = require('express-flash');
const session = require('express-session');
const pg = require("pg");
const Services = require('./service');
const Routes = require('./route');
const Pool = pg.Pool;

const app = express();

app.engine('handlebars', handleBars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.use(session({
    secret : "<add a secret string here>",
    resave: false,
    saveUninitialized: true
  }));
  // initialise the flash middleware
app.use(flash());

app.use(express.static('public'));

// should we use a SSL connection
let useSSL = false;
let local = process.env.LOCAL || false;
if (process.env.DATABASE_URL && !local){
    useSSL = true;
}
// which db connection to use
const connectionString = process.env.DATABASE_URL || 'postgresql://tasiya:pg123@localhost:5432/waiter_database';

const pool = new Pool({
    connectionString,
    ssl : useSSL
  });

const service = Services(pool);
const route = Routes(service);

function errorHandler(err, req, res, next) {
res.status(500);
res.render('error', { error: err });
}

app.get('/waiters/:username', route.home);
app.post('/waiters/:username', route.checkingDays);
app.get('/days', route.show);
app.post('/newUser', route.addWaiter);
app.get('/reset', route.removeShifts);

  app.use(errorHandler);

const PORT = process.env.PORT || 2018 ;
app.listen(PORT, function () {
    console.log('Starting port...'+PORT);
})