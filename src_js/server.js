//The runner is just listening for requests.

const http = require('node:http');
const urlParser = require('url');

const scanner = require('./scan_control');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {

  var query = urlParser.parse(req.url, true).query;
  var action = {"welcome" : "Hello there" };
  
  if( !("url" in query) || query.url == "" ){
    action.error = "URL is a required field";
    res.statusCode = 412;
  }

  if( !("error" in action) ){
    try{
      test = new URL(query.url) 
    }
    catch(err){
      action.error = query.url+ " : does not look like a valid url";
    }
  }
  //could add further checks here like making sure it exists before we start... 
  //other things to consider is do we NEED to scan or is it the same page as before ..
  //rate limiting..
  //site map generation...
  //results returing via callback url ( as they are created...) 
      
  if(!("error" in action) ){
    scanner.testScan(query);
    action = query;
    res.statusCode = 200;
  }

  res.setHeader('Content-Type', 'text/json');
  res.end( JSON.stringify(action) );
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});