
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
  User_id: undefined,
  First_name: undefined,
  Last_name: undefined,
  City: undefined,
  State: undefined,
  Country: undefined,
  Email: undefined,
  Username: undefined,
  Password: undefined,
};

app.get('/', (req, res) => {
  res.render("pages/home", {
    User_id: req.session.user.User_id,
    First_name: req.session.user.First_name,
    Last_name: req.session.user.Last_name,
    City: req.session.user.City,
    State: req.session.user.State,
    Country: req.session.user.Country,
    Email: req.session.user.Email,
    Username: req.session.user.Username,
    Password: req.session.user.Password,
  });
});

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



app.post('/user/create_account', (req,res) => {
  const query = 
    'INSERT INTO User (User_id, First_name, Last_name, City, State, Country, Email, Username, Password) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING * ;';
  const User_id = req.body.User_id;
  const First_name = req.body.First_name;
  const Last_name = req.body.Last_name;
  const City = req.body.City;
  const State = req.body.State;
  const Country = req.body.Country;
  const Email = req.body.Email;
  const Username = req.body.Username;
  const Password = req.body.Password;

  db.any(query, [
    User_id,
    First_name,
    Last_name,
    City, 
    State,
    Country,
    Email,
    Username,
    Password,
  ])
  .then(function (data) {
    req.session.save();
    res.redirect('/login');
  })
  .then(function (data) {
    res.status(201).json({
      status: 'success',
      data: data,
      message: 'data added successfully',
    });
  })
  .catch(function (err) {
    return console.log(err);
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