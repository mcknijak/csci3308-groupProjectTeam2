const express = require("express");
const app = express();
const pgp = require("pg-promise")();
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require('bcrypt');

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
// const user = {
//   User_id: undefined,
//   First_name: undefined,
//   Last_name: undefined,
//   City: undefined,
//   State: undefined,
//   Country: undefined,
//   Email: undefined,
//   Username: undefined,
//   Password: undefined,
// };

app.set('views','./All_project_code_components/views');
//
app.get('/', (req, res) => {
  if(!req.session.user){
    res.redirect('/login');
  }else{
    res.render("pages/home");
  }
});
//Login page
app.get("/login", (req, res) => {
  res.render("pages/login");
});

app.get("/sign-up", (req, res) => {//sign up page
  res.render("pages/signup");
});



//old log in
// app.post("/login", (req, res) => {
//   //initializing vars
//   const email = req.body.email;

//   const query = "select * from User where email = $1";
//   const values = [email];

//   // get the student_id based on the emailid
//   db.one(query, values)
//     .then((data) => {
//       const user = {
//         User_id: data.User_id,
//         First_name: data.First_name,
//         Last_name: data.Last_name,
//         City: data.City,
//         State: data.State,
//         Country: data.Country,
//         Email: data.Email,
//         Username: data.Username,
//         Password: data.Password,
//       };

//       req.session.user = user;
//       req.session.save();

//       res.redirect("/");
//     })
//     .catch((err) => {
//       console.log(err);
//       res.redirect("/login");
//     });
// });
app.post('/login', async (req, res) => {
  // check if password from request matches with password in DB
  var data = await db.any(`select * from "User" where "Email" = '${req.body.Email}';`);
  
  if (!data) {
      console.log('error 401');
  }else{

      var user = data[0];
      console.log(user);
      const match = await bcrypt.compare(req.body.Password, user.Password);

      if (match == true) {
          req.session.user = user;
          req.session.save();
          res.redirect('/');
      }else{
          console.log('Incorrect username or password.');
          res.redirect('/register');
      }
  }
  
});

// const auth = (req, res, next) => {
//   if (!req.session.user) {
//     return res.redirect("/login");
//   }
//   next();
// };

// // Making sure the user logs in

// app.use(auth);

app.post('/sign-up', async (req,res) => {
  
  const First_name = req.body.First_name;
  const Last_name = req.body.Last_name;
  const City = req.body.City;
  const State = req.body.State;
  const Country = req.body.Country;
  const Email = req.body.Email;
  const Username = req.body.Username;
  const Password = await bcrypt.hash(req.body.Password, 10);
  const query = 
   `insert into "User" ("First_name", "Last_name", "City", "State", "Country", "Email", "Username", "Password") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING * ;`;

  db.any(query, [
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
    res.redirect('/login');
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



app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("pages/logout");
});

//This goes bottom
app.listen(4000, () => {
  console.log('listening on port 4000');
});