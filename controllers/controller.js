/* eslint-disable prefer-template */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-console */
/* eslint-disable func-names */
const express = require('express');

const router = express.Router();

const axios = require('axios');

const cheerio = require('cheerio');

// Require all models.
const db = require('../models');

// Redirects the user to the login page from root.
router.get('/', (req, res) => {
  res.redirect('/scrape');
});

// Where the articles live...
router.get('/articles', function (req, res) {
  db.Article.find().sort({ id: -1 })
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
router.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("http://www.echojs.com/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("article h2").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    //res.send("Scrape Complete");
    res.redirect('./articles');
  });
});

module.exports = router;
