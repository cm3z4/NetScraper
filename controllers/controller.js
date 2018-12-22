/* eslint-disable no-unused-vars */
/* eslint-disable prefer-template */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-console */
/* eslint-disable func-names */
const express = require('express');

const router = express.Router();

const axios = require('axios');

const cheerio = require('cheerio');

// Database configuration.
const mongoose = require('mongoose');

if (process.env.NODE_ENV === 'production') {
  mongoose.connect('');
} else {
  // Connect to MongoDB.
  mongoose.connect('mongodb://localhost:27017/net-scraper', { useNewUrlParser: true });
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

// Require all models.
const models = require('../models');

// Redirects the user to the login page from root.
router.get('/', (req, res) => {
  res.redirect('/scrape');
});

// Where the articles live...
router.get('/articles', function (req, res) {
  models.Article.find().sort({ id: -1 })
    // .populate('comment')
    .exec(function (err, doc) {
      if (err) {
        console.log(err);
      } else {
        const hbsObject = { articles: doc };
        res.render('index', hbsObject);
      }
    });
});

// Where the scraping happens...
router.get('/scrape', function (req, res) {
  // Grabbing the site's content with axios.
  axios.get('https://www.linuxtoday.com/').then(function (response) {
    // Loading the cannon...
    const $ = cheerio.load(response.data);

    $('.index').each(function (_i, _element) {
      const result = {};

      result.title = $(this)
        .children('a')
        .text();
      result.summary = $(this)
        .children('p').text();
      result.link = $(this)
        .children('a')
        .attr('href');

      // Create a new article for each result.
      models.Article.create(result)
        .then(function (dbArticle) {
          console.log(dbArticle);
        })
        .catch(function (err) {
          console.log(err);
        });
    });

    // Redirect to the articles page.
    res.redirect('./articles');
  });
});

// Clean the slate!
router.get('/clear', function (req, res) {
  db.collection('articles').deleteMany({});
  console.log('Everything is gone...');
  res.redirect('/articles');
});

module.exports = router;
