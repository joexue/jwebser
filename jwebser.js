/*
 * jwebser -- A simple http server written by javascript run by nodejs
 *
 * Aug 2018, Joe Xue lgxue@hotmail.com
 *
 * Copyright (c) 2018-2020 by Joe Xue
 */

/*
   1 Only GET is supported so far
   2 Configuration file example, config.json
     {
         "webroot": '/var/webroot',
         "port": 8000
     }
   3 Javascript CGI file example
     module.exports = function(webroot, query) {
         if (query.action == 'DELETE') {
             //call your "DELETE" function here with the query parameters
         } else if(query.action == 'ADD') {
             //call your "ADD" function here with the query parameters
         }
        return '<script> window.location.href = "index.html"</script>';
    };
 */

//Default values
const DEFAULT_PAGE = '/index.html'
const DEFAULT_ROOT = '/var/webroot'
const DEFAULT_PORT = 8080

const http = require('http')
const fs = require('fs');
const url = require('url');
const querystring = require('querystring');

var cfg

function executeFile(res, file, query) {
    //console.log("CGI file: ", file);
    //console.log("query:", query);
    var out
    try {
        out = require(cfg.webroot + file)(cfg.webroot, query);
    } catch(e) {
        out = "The URL is not right, check your URL"
    }
    //console.log("out: ",  out);
    res.write(out);
    res.end();
}

function sendFile(res, file) {
    fs.readFile(cfg.webroot + file, 'utf8', function(err, data) {
        if (err) {
            res.write("Cannot find the file: " + file);
        } else {
            res.write(data);
        }
        res.end();
    });
}

function listener(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});

    const udata = url.parse(req.url);
    const file = (udata.pathname == '/') ? DEFAULT_PAGE : udata.pathname;

    //console.log("request the file: ", file);
    //console.log(udata);

    if (udata.query == null) {
        sendFile(res, file);
    } else {
        executeFile(res, file, querystring.parse(udata.query));
    }
}

function loadConfig()
{
    var conf = {}

    try {
        conf = JSON.parse(fs.readFileSync('./config.json'))
    } catch(e) {
        console.log("No configuration file, use default values")
    }

    const port = conf.port  ? conf.port : DEFAULT_PORT;
    const webroot = conf.webroot ? conf.webroot : DEFAULT_ROOT;
    return {port, webroot}
}

function run()
{
    cfg = loadConfig()
    const ser = http.createServer(listener);
    ser.listen(cfg.port);
}

/*
 * Start
 */
run()
