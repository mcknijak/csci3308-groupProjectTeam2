const express = require("express");
const app = express();
const pgp = require("pg-promise")();
const bodyParser = require("body-parser");
const session = require("express-session");

// db config
const dbConfig = {
  host: process.env.POSTGRES_HOST,
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  ssl: true
};

const db = pgp(dbConfig);

app.set("view engine", "ejs");
app.use(bodyParser.json());

// set session
app.use(
  session({
    secret: "XASDASDA",
    saveUninitialized: true,
    resave: true,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);


//Set user vars
const user = {
  username: undefined,
  first_name: undefined,
  last_name: undefined,
  email: undefined,
};

app.set('views','./All_project_code_components/views');

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

app.get("/", (req, res) => {
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