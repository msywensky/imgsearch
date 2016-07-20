var mongoose = require ("mongoose");
var express = require('express');
var app = express();
var path = require('path');
var URL = require('url');
var request = require('request');

var searchHistorySchema = require('./searchHistorySchema');

var uristring = 
  process.env.MONGODB_URI || 
  'mongodb://localhost/imgsearch';

var apikey = process.env.API_KEY;
var cx="017869192687361199722%3A5elxmvmg8gk";

mongoose.connect(uristring, function (err, res) {
  if (err) { 
    console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log ('Succeeded connected to: ' + uristring);
  }
});

app.set('port', (process.env.PORT || 5000));
app.use(express.static(path.join(__dirname, 'public')));

app.get("/api/imagesearch/:qry", function(req,res) {
  var qry = req.params.qry;
  var offset = req.query.offset;

 searchHistorySchema.saveSearch(qry, function(o) {
    //res.send(result);
    var url = getUrl(qry,offset);

    request(url, (error, response, body)=> {
      if (!error && response.statusCode === 200) {
        var searchResult = JSON.parse(body);
        var outResults = [];
        if ( (searchResult.items)  && (searchResult.items.length) ) {
            searchResult.items.forEach(function(element) {
              outResults.push( { 
                url : element.link,
                snippet : element.snippet,
                thumbnail : element.image.thumbnailLink,
                context : element.image.contextLink
              });
            }, this);
          res.send(outResults);
        } else {
          res.send({hello:"something went wrong", result:searchResult});
        }
      } else {
        res.send(error);
        //console.log("Got an error: ", error, ", status code: ", response.statusCode)
      }
    })

  })
});

app.get("/api/latest/imagesearch", function(req,res) {
  searchHistorySchema.getSearchHistory(function(results) {
    res.send(results);
  })
});

app.set('json spaces', 2);

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

var isNumeric = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

var getUrl = function(query, offset) {
  if (!isNumeric(offset)) {
    offset="1";
  }

  return "https://www.googleapis.com/customsearch/v1?q=" + query + "&cx=" + cx + "&imgType=photo&searchType=image&start=" + offset + "&key=" + apikey;
}
