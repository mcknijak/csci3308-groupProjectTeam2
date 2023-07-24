const express = require("express");
const app = express();
const pgp = require("pg-promise")();
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require('bcrypt');
const axios = require('axios');
const path = require('path')

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

//stlyesheet link
app.use(express.static(path.join(__dirname, 'All_project_code_components')));

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

app.set('views', './All_project_code_components/views');
//
app.get('/', (req, res) => {
  if (!req.session.user) {
    res.redirect('/login');
  } else {
    res.render("pages/home", {
      Username: req.session.user.Username,
      error : null
    });
  }
});
//Login page
app.get("/login", (req, res) => {
  res.render("pages/login");
});

app.get("/sign-up", (req, res) => {//sign up page
  res.render("pages/signup");
});

app.post('/home', async (req, res) => {
  // check if password from request matches with password in DB
  var data = await db.any(`select * from "User" where "Username" = '${req.session.user.Username}';`);

  if (data.length === 0) {
    res.render("pages/home", {
      Username: req.session.user.Username,
      error: "Username not found"
    });
  } else {
    const query =
      `insert into "User_service" ("User_id", "Service_id", "api_key", "signing_key") values ($1, $2, $3)`
      const u_id = data[0].User_id;
      let s_id;
      const key = req.body.API_key;
      
      if(req.body.connected_app == "slack"){
        s_id = 6;
      }else if(req.body.connected_app == "telegram"){
        s_id = 3;
      }else{
        s_id =2;
      }
      db.any(query, [
        u_id,
        s_id,
        key,
      ])
      .then(function (data) {
        res.render("pages/home", {
          Username: req.session.user.Username,
          error: "Data added successfully"
        });
      })
      // if query execution fails
      // send error message
      .catch(function (err) {
        res.render("pages/home", {
          Username: req.session.user.Username,
          error: "Failure to add data"
        });
        return console.log(err);
      });
  }
});


app.post('/login', async (req, res) => {
  // check if password from request matches with password in DB
  var data = await db.any(`select * from "User" where "Email" = '${req.body.Email}';`);

  if (data.length === 0) {
    res.redirect('/sign-up');
    console.log('error 401');
  } else {

    var user = data[0];
    //console.log(user);
    const match = await bcrypt.compare(req.body.Password, user.Password);

    if (match == true) {
      req.session.user = user;
      req.session.save();
      res.redirect('/');
    } else {
      console.log('Incorrect username or password.');
      res.redirect('/login');
    }
  }

});

app.post('/sign-up', async (req, res) => {
  try {
    const First_name = req.body.first_name;
    const Last_name = req.body.last_name;
    const City = req.body.city;
    const State = req.body.state;
    const Country = req.body.country;
    const Email = req.body.email;
    const Username = req.body.username;
    const Password = await bcrypt.hash(req.body.password, 10);
    const query =
      `INSERT INTO "User" ("First_name", "Last_name", "City", "State", "Country", "Email", "Username", "Password") VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`;

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
    res.redirect('/login');
  } catch (err) {
    res.redirect('/register');
  }
});



// Authentication Middleware.
const auth = (req, res, next) => {
  if (!req.session.user) {
    // Default to login page.
    return res.redirect('/login');
  }
  next();
};

// Authentication Required
// app.use(auth);

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("pages/logout");
});


////////////////////////////// CHAT SECTION HERE //////////////////////////////

app.get("/chat", async (req, res) => {
  var messages;
  try { 
    if (req.body.service_id == "telegram") {
      messages = await getTelegramChatMessages(req.body.room_id, process.env.TELEGRAM_API_KEY);
    } else {
      messages = await getThreadBlendMessages(req.body.room_id);
    }

    res.render("pages/chat", {
      Message: messages, 
      User: req.session.user, 
      Sender,
    });
  } catch (error) {
    console.error('Error getting chat messages:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

////////////////////////////// GET MESSAGES HERE //////////////////////////////

async function getTelegramChatMessages(chatId, apiKey) {
  try {
    const response = await axios.get(`https://api.telegram.org/bot${apiKey}/getChatMessages?chat_id=${chatId}`);

    // Assuming the response data is in JSON format
    const messages = response.data.messages;

    // Process and handle the messages as needed
    console.log(messages);
    return messages;
  } catch (error) {
    console.error('Error retrieving chat messages:', error.message);
  }
}

async function getThreadBlendMessages(room_id) {

  let query = `select * from messages where room_id = ${room_id};`; // query to retrieve matching messages from given room id

  db.any(query)
    .then(function (data) {
      const messages = data.messages;
      console.log(messages);
      return messages;
    })
    .catch(function (error) {
      console.error('Error retrieving chat messages:', error.message);
    });
}


app.get("/chat/messages/sync", (req, res) => {


  if (req.body.service_id == "telegram") {
    getTelegramChatMessages(req.body.room_id, process.env.TELEGRAM_API_KEY);
  } else if (req.body.service_id == "discord") {
    // getDiscordChatMessages(req.body.room_id, process.env.DISCORD_API_KEY);
  } else {
    getThreadBlendMessages(req.body.room_id);
  }
})

async function getChats(user_id) {
  let query = `SELECT channel_id FROM active_chats WHERE user_id = ${user_id} ;`;
  try {
    const data = await db.any(query);
    // const channel_ids = data.map(row => row.channel_id);
    console.log(data);
    return data;
  } catch (error) {
      console.error('Error getting channel ids:', error.message);
      throw error;
    };
}


////////////////////////////////   POST MESSAGES HERE ////////////////////////////////

async function postTelegramChatMessages(room_id, apiKey, message) {
  try {
    const response = await axios.post(`https://api.telegram.org/bot${apiKey}/sendMessage`, {
      chat_id: room_id,
      text: message
    });

    const result = response.data.message;

    // Process and handle the response as needed
    console.log(message);
  } catch (error) {
    console.error('Error posting chat message:', error.message);
  }
}

async function postThreadBlendMessages(room_id, message) {

  let query = `insert into messages (room_id, message) values (${room_id}, ${message});`; // query to retrieve matching messages from given room id

  db.any(query)
    .then(function (data) {
      const messages = data.messages;
      console.log(messages);
      return messages;
    })
    .catch(function (error) {
      console.error('Error retrieving chat messages:', error.message);
    });
}


app.post("/chat/messages/send", (req, res) => {


  if (req.body.service_id == "telegram") {
    postTelegramChatMessages(req.body.room_id, process.env.TELEGRAM_API_KEY, req.body.message);
  } else if (req.body.service_id == "discord") {
    // postDiscordChatMessages(req.body.room_id, process.env.DISCORD_API_KEY);
  } else {
    postThreadBlendMessages(req.body.room_id, req.body.message);
  }
})


//add_chat form
app.post('/add_chat', async (req, res) => {
  // check if password from request matches with password in DB
  var data = await db.any(`select * from "User" where "Username" = '${req.session.user.Username}';`);
  var u_id = data[0].User_id;
  const c_id = req.body.channel_name;
    const query =
      `insert into "active_chats" ("user_id", "channel_id") values ($1, $2)`
      db.any(query, [
        u_id,
        c_id
      ])
      .then(function (data) {
        console.log("added to active_chats successfully");
      })
      // if query execution fails
      // send error message
      .catch(function (err) {
        return console.log("failure to add to active_chats");
      });
});







//This goes bottom
app.listen(4000, () => {
  console.log('listening on port 4000');
});