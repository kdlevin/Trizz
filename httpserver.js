var connect = require('connect');
var port = 8080;

function start() {
    connect.createServer(
        connect.static(__dirname + '/client')
    ).listen(port);
    
    console.log("HTTP server listening on " + port.toString());
}

exports.start = start;

