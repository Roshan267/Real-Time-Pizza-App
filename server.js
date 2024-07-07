require('dotenv').config();
const express = require('express');
const app = express();
const ejs = require('ejs');
const path = require('path');
const expressLayout = require('express-ejs-layouts');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo'); // Updated import for connect-mongo
const flash = require('express-flash');
const PORT = process.env.PORT || 3000;

// Database connection
const url = 'mongodb://localhost:27017/Pizza';

mongoose.connect(url)
.then(() => {
  console.log('Database connected...');
})
.catch(err => {
  console.error('Connection failed...', err);
});

const connection = mongoose.connection;

connection.once('open', () => {
  console.log('Connection to database is open...');
});

// Assets
app.use(express.static('Public'));
app.use(express.json())

// Session store
const mongoStore = new MongoStore({
  mongoUrl: url,
  collectionName: 'sessions'
});

// Session config
app.use(session({
  secret: process.env.COOKIE_SECRET || 'default-secret', // Ensure COOKIE_SECRET is set in your .env file
  resave: false,
  saveUninitialized: false,
  store: mongoStore,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));

app.use(flash());

// Global middleware

app.use((req,res,next)=>{
  res.locals.session = req.session
  next() // used to proceed the request
})

// Set template engine
app.use(expressLayout);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/resources/views'));

// Routes
require('./Routes/web')(app);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
