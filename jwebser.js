/*
 * jwebser -- A simple http server written by javascript run by nodejs
 *
 * Aug 2018, Joe Xue lgxue@hotmail.com
 */

/*
   1 Only GET is supported so far
   2 Configuration file example, config.js
     module.exports = {
         webroot: '/var/webroot',
         port: 8000
     };
   3 Javascript CGI file example
     module.exports = function(webroot, query) {
         WEBROOT = webroot;
         if (query.action == 'DELETE') {
             delete_record();
        } else if(query.action == 'ADD') {
             add_record(query);
        }
        return '<script> window.location.href = "index.html"</script>';
    };
 */

//Default values
var DEFAULT_PAGE = '/index.html'
var DEFAULT_ROOT = '/var/webroot'
var DEFAULT_PORT = 8080

var http = require('http')
var fs = require('fs');
var url = require('url');

//Pickup the configuration
var conf = require('./config');

var port = conf.port  ? conf.port : DEFAULT_PORT;
var webroot = conf.webroot ? conf.webroot : DEFAULT_ROOT;

function run_file(res, file, query) {
    //console.log("CGI file: " + file);
    //console.log("query:");
    //console.log(query);
    var out
    try {
        out = require(webroot + file)(webroot, query);
    } catch(e) {
        out = "The URL is not right, check your URL"
    }
    //console.log("out: " + out);
    res.write(out);
    res.end();
}

function send_file(res, file) {
    fs.readFile(webroot + file, 'utf8', function(err, data) {
        if (err) {
            res.write("Cannot find the file: " + file);
        } else {
            res.write(data);
        }
        res.end();
    });
}

function listener(req, res) {
    var file, req_data;

    res.writeHead(200, {'Content-Type': 'text/html'});

    req_data = url.parse(req.url);
    file = (req_data.pathname == '/') ? DEFAULT_PAGE : req_data.pathname;

    //console.log("request the file:" + file);
    //console.log(req_data);

    if (req_data.query == null) {
        send_file(res, file);
    } else {
        run_file(res, file, url.parse(req.url, true).query);
    }
}

var ser = http.createServer(listener);

ser.listen(port);
