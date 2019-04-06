var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var url = require('url');
var host = ( 'localhost');
var port = ( 9000);
var http=require('http');

var app = express();

//Logger setup
var fs = require('fs');
var util = require('util');
var log_file = fs.createWriteStream(__dirname + '/log/debug-'+Date.now()+'.log', {flags : 'w'});
var log_stdout = process.stdout;


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded());


console.log = function(d) { //
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};

//Routing home page to Index.html
app.use('/', indexRouter);
//app.use('/users', usersRouter);

//Function declaration to validate requested URL
function validateUrl(value) {
  return /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/.test(value);
}

//Function declaration to build sitemap
function createHTML(json, isArray){
  var html = '<ul>';
  for(var key in json){
    if(typeof json[key] == 'object'){

      html += '<li>' + (!isArray ? '<strong>'+ key +'</strong>' : '') + '</li>' + createHTML(json[key], (json[key] instanceof Array ? 1 : 0));
    } else {
      html += '<li>'+ json[key] +'</li>';
    }
  }
  return html+'</ul>';

}

//Receives POST requests and makes API call to backend service running at port 5000
app.post('/sitemap',function(req,res){
  var mydate = new Date();
  var currentdatetime = mydate.toDateString()+" "+mydate.toTimeString();
  var request_url = req.body.url;

  console.log("REQUEST: received at "+currentdatetime +" => " + req.body.url );

  //Check if the URL has null value
  if (request_url === null || request_url === '') {
    res.writeHead(400, { 'Content-Type': 'text/html' });
    console.log("ERROR: Request at "+currentdatetime +" => "+request_url+": contains null value");
    res.write("Please enter the URL")
    res.end()
  }
  else{
    validation_res=validateUrl(request_url);
    if(!validation_res){
      console.log("ERROR: Request at "+currentdatetime +" => "+request_url+": URL Invalid");
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.write("Please enter valid URL!")
      res.end()
    }
    else {

      data = JSON.stringify({
        "url": request_url
      });
      properties = [];

      options = {
        port: 5000,
        path: '/sitemap',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };
      // console.log(options)

      var requestapi = http.request(options, function (responseapi) {
        // res.setEncoding('utf8');
        responseapi.on('data', function (chunk) {

          properties += chunk;
          // console.log("Data receiving"+properties)
        });
        responseapi.on('end', function (err, result) {
          if (!err) {


            var data = JSON.parse(properties);

            var output = {};
            var current;

            for(var a=0; a<data.length; a++) {
              var s = data[a].split('/');
              current = output;
              for(var i=0; i<s.length; i++) {
                if(s[i] != '') {
                  if(current[s[i]] == null)
                    current[s[i]] = {};
                  current = current[s[i]];
                }
              }
            }
          console.log("SUCCESS: Request at "+currentdatetime +" => "+request_url+": Responded successfully");

          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.write(createHTML(output,false));
          res.end();


          } else {
            console.log("ERROR: Request at "+currentdatetime +" => "+request_url+": Internal Server Error");
            res.writeHead(503, { 'Content-Type': 'text/html' });
            res.write("Internal Server Error! Please try in sometime!")
            res.end()
          }

        });
      })
          .on('error', function (err) {
            console.log('error ' + err)
            res.writeHead(503, { 'Content-Type': 'text/html' });
            res.write("Internal Server Error! Please try in sometime!")
            res.end();
          });
      requestapi.write(data);
      requestapi.end();
    }
  }
});


app.get('/*', function(req, res) {
  res.writeHead(503, { 'Content-Type': 'text/html' });
  res.write("ERROR: Invalid request!")
  res.end();
});

app.listen(9000, '0.0.0.0');
console.log('App started on port ' + port);

module.exports = app;
