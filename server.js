/* eslint-disable no-console */
const express = require('express');
const morgan = require('morgan');
const path = require('path');

const app = express();

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, './public')));
app.use(express.urlencoded({ extended: false }));

const exphbs = require('express-handlebars');

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Database configuration.
const mongoose = require('mongoose');

if (process.env.NODE_ENV === 'production') {
  mongoose.connect('');
} else {
  // Connect to MongoDB.
  mongoose.connect('mongodb://localhost:27017/Marvel', { useNewUrlParser: true });
}

const db = mongoose.connection;

// Check for a connection.
db.once('open', () => {
  console.log('Houston, we have a connection!');
});

// Checking for errors.
db.on('error', (err) => {
  console.log('Database error: ', err);
});

const router = require('./controllers/controller.js');

app.use('/', router);

// Import all models.
// eslint-disable-next-line no-unused-vars
const models = require('./models');

// Application is listening on port...
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log('Application is listening on port 5000');
});
