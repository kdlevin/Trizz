var WebSocketServer = require('ws').Server;
var port = 15560;
var MaxSessions = 100;

var sessionMap = [];

function createSession(ws) {
    // Choose free ID
    var sessionID;
    for(sessionID = 1; sessionID <= MaxSessions; sessionID++)
        if(sessionMap[sessionID] == null)
            break;


    if(sessionID <= MaxSessions)
    {
        sessionMap[sessionID] = new Session(sessionID, ws);
        sessionMap[sessionID].sendWait();
        console.log("SessionID: " + sessionID.toString() + " created");
        return sessionID;
    }
    else
    {
        console.log("No free sessions");
        return 0;
    }
}

function closeSession(sessionID, player) {
    if(sessionMap[sessionID] != null)
    {
        sessionMap[sessionID].close(player);
        delete sessionMap[sessionID];
    }
}


function joinSession(sessionID, ws) {
    if(sessionMap[sessionID] != null)
    {
        return sessionMap[sessionID].join(ws);
    }
    else
        return false;
}

function updateSession(sessionID, player, data) {
    if(sessionMap[sessionID] != null)
    {
        sessionMap[sessionID].forwardMessage(player, data);
    }
}

function endSession(sessionID, player, data) {
    if(sessionMap[sessionID] != null)
    {
        sessionMap[sessionID].end(player, data);
    }
}

function restartSession(sessionID) {
    if(sessionMap[sessionID] != null)
    {
        sessionMap[sessionID].restart();
    }
}

function tick() {
    for(var index in sessionMap)
    {
        sessionMap[index].tick();
    }
}

function Session(ID, _ws) {
    this.ID = ID;
    this.hostWS = _ws;
    this.clientWS = null;
    this.playing = false;
    this.timeCount = 0;
    this.cubesWithGravityCount = 0;


    this.join = function(_ws)
    {
        if(this.clientWS == null)
        {
            this.clientWS = _ws;
            console.log("SessionID: " + this.ID.toString() + " joined");
            this.sendStart();
            return true;
        }
        else
        {
            console.log("SessionID: " + this.ID.toString() + " Another client tried to connect");
            return false;
        }
    };

    this.end = function(_player, _data)
    {
        if(this.playing)
        {
            this.playing = false;
            this.forwardMessage(_player, _data);
            console.log("SessionID: " + this.ID.toString() + " Player " + _player.toString() + " wins");
        }
        else
            console.log("SessionID: " + this.ID.toString() + " End received for a stopped session");
    };

    this.restart = function()
    {
        this.sendStart();
    };

    this.close = function(_player)
    {
        var sendObj = {
            type: 'error',
            text: 'The other player left the session'
        };

        console.log("SessionID: " + this.ID.toString() + ", player " + _player.toString() + " disconnected");

        if(_player == 1 && this.clientWS != null)
            this.clientWS.send(JSON.stringify(sendObj));
        else if(_player == 2)
            this.hostWS.send(JSON.stringify(sendObj));

        this.playing = false;
    };

    this.tick = function()
    {
        if(!this.playing)
            return;

        this.timeCount++;
        if(this.timeCount >= 8)
        {
            this.newCube();
            this.timeCount = 0;
        }
    };

    this.newCube = function()
    {
        if(!this.playing)
            return;

        var random = Math.random() * 10;

        var cubeType;

        if(random < 4.5)
        {
            cubeType = 'down';
            this.cubesWithGravityCount++;
        }
        else if(random < 9)
        {
            cubeType = 'up';
            this.cubesWithGravityCount++;
        }
        else
        {
            cubeType = 'nogravity';
            this.cubesWithGravityCount = 0;
        }

        // Force an "x" cube every 9
        if(this.cubesWithGravityCount > 8)
        {
            cubeType = 'nogravity';
            this.cubesWithGravityCount = 0;
        }

        this.sendNewCube(cubeType);
    };

    this.sendStart = function()
    {
        // Generate random puzzle
        var puzzle = new Array();

        for(var x = 0; x < 6; x++)
        {
            var lowerLimit = Math.floor(Math.random() * 3.5 + 0.5);
            var upperLimit = Math.floor(Math.random() * 3.5 + 3);

            for(var y = lowerLimit; y <= upperLimit; y++)
            {
                puzzle.push({x: x, y: y});
            }
        }

        var sendObj = {
            type: 'start',
            puzzle: puzzle
        };


        this.hostWS.send(JSON.stringify(sendObj));
        this.clientWS.send(JSON.stringify(sendObj));
        this.playing = true;
        this.timeCount = 0;
        this.cubesWithGravityCount = 0;
        this.newCube();

    };

    this.sendWait = function()
    {
        var sendObj = {
            type: 'wait',
            sessionID: this.ID
        };
        this.hostWS.send(JSON.stringify(sendObj));
    };

    this.sendNewCube = function(_cubetype)
    {
        var sendObj = {
            type: 'newcube',
            cubetype: _cubetype
        };

        this.hostWS.send(JSON.stringify(sendObj));
        this.clientWS.send(JSON.stringify(sendObj));
        console.log("SessionID: " + this.ID.toString() + ", New Cube");
    };

    this.forwardMessage = function(_player, _data)
    {
        if(_player == 1 && this.clientWS != null)
            this.clientWS.send(JSON.stringify(_data));
        else if(_player == 2 && this.hostWS != null)
            this.hostWS.send(JSON.stringify(_data));
    };
}

function start() {

    wss = new WebSocketServer({port: port});
    wss.on('connection', function(ws) {
        console.log("Client connected");

        var sessionID = 0;
        var player = 0;

        ws.on('message', function(message) {

            var data = JSON.parse(message);

            // Create session
            if(data.type == "create")
            {
                if(sessionID == 0)
                {
                    sessionID = createSession(ws);
                    player = 1;

                    if(sessionID == 0)
                    {
                        var sendObj = {
                            type: 'error',
                            text: 'No free sessions'
                        };
                        ws.send(JSON.stringify(sendObj));
                    }
                }
            }
            // Join session
            else if(data.type == "join")
            {
                if(sessionID == 0)
                {
                    sessionID = data.sessionID;
                    player = 2;

                    if(!joinSession(sessionID, ws))
                    {
                        sessionID = 0;
                        var sendObj = {
                            type: 'error',
                            text: 'Session does not exist'
                        };
                        ws.send(JSON.stringify(sendObj));
                    }
                }
                else
                    console.log("SessionID: " + sessionID.toString() + " creator tried to join");
            }
            // Update session
            else if(data.type == "update" || data.type == "cubeinteraction")
                updateSession(sessionID, player, data);
            // End session
            else if(data.type == "end")
                endSession(sessionID, player, data);
            // Restart session
            else if(data.type == "restart")
                restartSession(sessionID);
        });


        ws.on('close', function() {
            closeSession(sessionID, player);
        });

    });
    console.log("websocket server listening on " + port.toString());

    setInterval(tick, 1000);
}



exports.start = start;