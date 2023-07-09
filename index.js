
const express = require('express');
const bodyParser = require('body-parser');
const pgp = require('pg-promise')();
require('dotenv').config();

// defining the Express app
const app = express();
// using bodyParser to parse JSON in the request body into JS objects
app.use(bodyParser.json());
const session = require("express-session");
// Database connection details
const dbConfig = {
  host: process.env.POSTGRES_HOST,
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  ssl: true
};
// Connect to database using the above details
const db = pgp(dbConfig);

// set session
app.use(
  session({
    secret: "XASDASDA",
    saveUninitialized: true,
    resave: true,
  })
);
//view engine
app.set("view engine", "ejs");
app.use(bodyParser.json());

//Set user vars
const user = {
  username: undefined,
  first_name: undefined,
  last_name: undefined,
  email: undefined,
};

//Login page
app.get("/login", (req, res) => {
  res.render("pages/login");
});




//This goes bottom
app.listen(4000, () => {
  console.log('listening on port 4000');
});