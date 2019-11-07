// Grab the articles as a json
$.getJSON("/articles", function(data) {
  $("#articles").empty();
  // For each one
  for (let i = 0; i < data.length; i++) {
    // Display the info on the page
    $("#articles").append(
      "<div id='articleDiv'><div id='topDiv'><h1 id='headline' data-id='" +
        data[i]._id +
        "'>" +
        "<a href='" +
        data[i].link +
        "'>" +
        data[i].title +
        " " +
        "</h1></a></div><p><br /><div class='details'>" +
        data[i].details +
        "</p></div><button class='addBtn' data-id='" +
        data[i]._id +
        "'><i class='far fa-bookmark'></i>&nbsp Save</button><button id='noteBtn'><i class='far fa-comment-alt'></i>&nbsp Comment</button></div>"
    );
  }
});

//When you click the home button
$(document).on("click", "#home", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "articles",
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});

// When you click the savenote button
$(document).on("click", ".addBtn", function() {
  var thisId = $(this).attr("data-id");
  $.ajax({
    method: "POST",
    url: "/save/" + thisId
  }).done(function(data) {
    window.location = "/";
  });
});

$(document).on("click", "#clear", function(err, res) {
  $("#articles").empty();
  $.ajax({
    method: "GET",
    url: "/clear"
  }).done(function(data) {
    window.location.href = "/";
  });
});
