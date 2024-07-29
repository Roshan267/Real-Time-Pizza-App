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
const passport = require('passport');
const Emitter = require('events');
const PORT = process.env.PORT || 3000;

// Database connection
const url = process.env.MONGO_URL || 'mongodb://localhost:27017/Pizza';

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
app.use(express.static('public'));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded bodies

// Session store
const mongoStore = MongoStore.create({
  mongoUrl: url,
  collectionName: 'sessions'
});

// Event emitter
const eventEmitter = new Emitter();
app.set('eventEmitter', eventEmitter);

// Session configuration
app.use(session({
  secret: process.env.COOKIE_SECRET || 'default-secret', // Ensure COOKIE_SECRET is set in your .env file
  resave: false,
  saveUninitialized: false,
  store: mongoStore,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));

app.use(flash());

// Passport configuration
const passportInit = require('./app/config/passport');
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());

// Global middleware
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.user;
  next(); // Proceed the request
});

// Set template engine
app.use(expressLayout);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/resources/views'));

// Routes
require('./routes/web')(app);

app.use((req, res) => {
  res.status(404).render('errors/404');
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

// Socket.io setup
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  // Join a room
  socket.on('join', (orderId) => {
    socket.join(orderId);
  });
});

// Event listeners for socket.io
eventEmitter.on('orderUpdated', (data) => {
  io.to(`order_${data.id}`).emit('orderUpdated', data);
});

eventEmitter.on('orderPlaced', (data) => {
  io.to('adminRoom').emit('orderPlaced', data);
});
