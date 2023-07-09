
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

// Login submission
app.post("/login", (req, res) => {
  //initializing vars
  email = req.body.email;

  const query = "select * from User where email = $1";
  const values = [email];

  // get the student_id based on the emailid
  db.one(query, values)
    .then((data) => {
      user.User_id = data.User_id;
      user.Username = username;
      user.First_name = data.First_name;
      user.Last_name = data.Last_name;
      user.Email = data.Email;

      req.session.user = user;
      req.session.save();

      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/login");
    });
});

// Making sure the user logs in
const auth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
};
app.use(auth);

app.get("/l", (req, res) => {
  res.render("pages/home");
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("pages/logout");
});

//This goes bottom
app.listen(4000, () => {
  console.log('listening on port 4000');
});