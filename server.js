var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Scraping tools
var request = require("request");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

// Initialize Express, port at 3000
var PORT = process.env.PORT || 3009;
var app = express();

// Middleware

// Morgan logger for logging requests
app.use(logger("dev"));
// Body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Express.static to serve the public folder as a static directory
app.use(express.static("public"));

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/NewScrape";

// Connect to the Mongo DB
mongoose.connect(MONGODB_URI);

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // Make a request for bangordailynews.com
  request("https://www.washingtonpost.com/", function(error, response, html) {
    // Load the html body from request into cheerio
    const $ = cheerio.load(html);
    // For each element with a "title" class
    $(".headline").each(function(i, element) {
      // Save the text and href of each link enclosed in the current element
      // Save an empty result object
      var result = {};

      const title = $(element)
        .children()
        .text();
      const link = $(element)
        .children()
        .attr("href");
      const details = $(element)
        .siblings(".blurb")
        .text();
      // If this found element had both a title and a link
      if (title && link && details) {
        // Insert the data in the scrapedData db
        db.Article.create(
          {
            title: title,
            link: link,
            details: details,
            saved: false
          },
          function(err, inserted) {
            if (err) {
              // Log the error if one is encountered during the query
              console.log(err);
            } else {
              // Otherwise, log the inserted data
              console.log(inserted);
            }
          }
        );
      }
    });
  });
  // Send a "Scrape Complete" message to the browser
  res.send("Scrape complete!");
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.get("/saved/:id", function(req, res) {
  //
  // db.Article.find({"saved": true}).populate("notes").exec(function(error, articles) {
  //   var hbsObject = {
  //     article: articles
  //   };
  //   res.render("saved", hbsObject);
  //   console.log("saved")
  // });
});

app.post("/save/:id", function(req, res) {
  // Grab the id associated with the article from the submit button
  // var thisId = $(this).attr("data-id");
  const thisId = req.params.id;
  db.Article.updateOne(thisId, { saved: true });
 
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {

      return db.Article.findOneAndUpdate(
        { _id: req.params.id },
        { note: dbNote._id },
        { new: true }
      );
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.get("/clear", function(res, req) {
  console.log("yffyfytftyfty");
  db.Article.deleteMany({ saved: false }).then(function() {
    res.send("All clear!");
  });
  // .catch(function(err) {
  // If an error occurred, send it to the client
  //  res.json(err);
  // });
});

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
