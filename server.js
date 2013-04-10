var connect = require('connect');

function start() {
    connect.createServer(
        connect.static(__dirname + '/client')
    ).listen(15550);
    
    console.log("HTTP server listening on 15550");
}

exports.start = start;

