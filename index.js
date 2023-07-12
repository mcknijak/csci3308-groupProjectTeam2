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
    First_name: req.First_name,
    Last_name: req.Last_name,
    City: req.City,
    State: req.State,
    Country: req.Country,
    Email: req.Email,
    Username: req.Username,
    Password: req.Password,
  });
});
app.set('views','./All_project_code_components/views');

//Login page
app.get("/login", (req, res) => {
  res.render("pages/login");
});


//Data base structure:
//"User_id" serial NOT NULL,
// "First_name" character varying(30) NOT NULL,
// "Last_name" character varying(30) NOT NULL,
// "City" character varying(50) NOT NULL,
// "State" character varying(30),
// "Country" character varying(30) NOT NULL,
// "Email" character varying(320) NOT NULL,
// "Username" character varying(30) NOT NULL,
// "Password" character varying(100),
// "UserIcon" character,
// PRIMARY KEY ("User_id")

//Insert statment to check that you can log in
//insert into User (First_name, Last_name, City, State, Country, Email, Username, Password) values ('Tester', 'TesterLastName', 'Boulder', 'Colorado', 'America', 'tester@fake.com', 'tester_username', 'Password');
//insert into user (First_name, Last_name, City, State, Country, Email, Username, Password) values ('Tester', 'TesterLastName', 'Boulder', 'Colorado', 'America', 'tester@fake.com', 'tester_username', 'Password');
// Login submission
app.post("/login", (req, res) => {
  //initializing vars
  const email = req.body.email;

  const query = "select * from User where email = $1";
  const values = [email];

  // get the student_id based on the emailid
  db.one(query, values)
    .then((data) => {
      const user = {
        User_id: data.User_id,
        First_name: data.First_name,
        Last_name: data.Last_name,
        City: data.City,
        State: data.State,
        Country: data.Country,
        Email: data.Email,
        Username: data.Username,
        Password: data.Password,
      };

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
  // .then(function (data) {
  //   req.session.save();
  //   res.redirect('/login');
  // })
  .then(function (data) {
    res.status(201).json({
      status: 'success',
      // data: data,
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

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("pages/logout");
});

//This goes bottom
app.listen(4000, () => {
  console.log('listening on port 4000');
});