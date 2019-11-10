var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");


var request = require("request");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

// Initialize Express, port at 3009
var PORT = process.env.PORT || 3009;
var app = express();




app.use(logger("dev"));
// Body-parser 
app.use(bodyParser.urlencoded({ extended: true }));

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
    const promise_list = [];
  
    $(".headline").each(function(i, element) {
 
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
        const dbTransaction = new Promise((resolve, reject) => {
          db.Article.create(
            {
              title: title,
              link: link,
              details: details,
              saved: false
            },
            function(err, inserted) {
              if (err) {
                // Log error 
                console.log(err);
                resolve();
              } else {
              
                console.log(inserted);
                resolve();
              }
            }
          );
        });
        promise_list.push(dbTransaction);
      }
    });

    Promise.all(promise_list).finally(() => {
     
      res.status(200).json({ message: "Scrape complete!" });
    });
  });
});

// Route for getting all Articles from the db
app.get("/articles/:saved", function(req, res) {
 
  const saveParam = req.params.saved;
  const saved = saveParam === 'true' ? true : false;
  console.log({ saved });
  db.Article.find({ saved })
    .then(function(dbArticle) {
      
      console.log(dbArticle);
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.get("/saved/:id", function(req, res) {

});

app.post("/save/:id", function(req, res) {

  const thisId = req.params.id;
  db.Article.updateOne({ _id: thisId }, { saved: true }).then((result) => {
    console.log(result);
    res.json({ 
      message: 'updated successfully',
      success: true
    });
  });
});


app.get("/articles/:id", function(req, res) {
  
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
     
      res.json(dbArticle);
    })
    .catch(function(err) {

      res.json(err);
    });
});

app.delete("/articles/:id", function(req, res) {
  const thisId = req.params.id;
  db.Article.updateOne({ _id: thisId }, { saved: false }).then((result) => {
    console.log(result);
    res.json({ 
      message: 'updated successfully',
      success: true
    });
  });
});


app.post("/articles/:id", function(req, res) {

  db.Note.create(req.body)
    .then(function(dbNote) {

      return db.Article.findOneAndUpdate(
        { _id: req.params.id },
        { note: dbNote._id },
        { new: true }
      );
    })
    .then(function(dbArticle) {
   
      res.json(dbArticle);
    })
    .catch(function(err) {
   
      res.json(err);
    });
});

app.get("/clear", function(req, res) {
  console.log("yffyfytftyfty");
  db.Article.deleteMany({  }).then(function() {
    res.json({message: "All clear!"});
  });
});

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
