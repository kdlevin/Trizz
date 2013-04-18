

onSocketOpen = function(e) {
    console.log('Socket opened!', e);
};

onSocketClose = function(e) {
    app.state = App.EnumState.ERROR;
    $('#errortext').text("No connection with the server");
    app.currentUI = uiError;
    uiError();

    console.log('Socket closed!', e);
};

onSocketMessage = function(e) {
    try
    {
        var data = JSON.parse(e.data);

        if(data.type == "wait")
            app.socketComms.onWaitMessage(data);
        else if(data.type == "start")
            app.socketComms.onStartMessage(data);
        else if(data.type == "update")
            app.socketComms.onPlayerUpdateMessage(data);
        else if(data.type == "newcube")
            app.socketComms.onNewCubeMessage(data);
        else if(data.type == "cubeinteraction")
            app.socketComms.onCubeInteraction(data);
        else if(data.type == "error")
            app.socketComms.onErrorMessage(data);
        else if(data.type == "end")
            app.socketComms.onEndMessage();
    }
    catch(e)
    {
        console.log("Excepction in onSocketMessage");
    }
};

var SocketComms = function() {

    var socketServer;
    var host = location.host;
    var nColon = host.indexOf(":");
    var nSlash = host.indexOf("/");

    if(nColon == -1 && nSlash == -1)
        socketServer = "ws://" + host + ":" + settings.portServer.toString();
    else if(nColon == -1)
        socketServer = "ws://" + host.substring(0, nSlash) + ":" + settings.portServer.toString();
    else
        socketServer = "ws://" + host.substring(0, nColon) + ":" + settings.portServer.toString();

    this.webSocket = new WebSocket(socketServer);
    this.webSocket.onopen = onSocketOpen;
    this.webSocket.onclose = onSocketClose;
    this.webSocket.onmessage = onSocketMessage;



    this.sendCreateGame = function()
    {
        var sendObj = {
            type: 'create'
        };
        console.log("create message sent");
        this.webSocket.send(JSON.stringify(sendObj));
    };

    this.sendJoinGame = function(sessionID)
    {
        var sendObj = {
            type: 'join',
            sessionID: sessionID
        };
        console.log("join message sent");
        this.webSocket.send(JSON.stringify(sendObj));
    };

    this.sendPlayerPosition = function()
    {
        var sendObj = {
            type: 'update',
            x: app.player.position.x,
            y: app.player.position.y
        };

        this.webSocket.send(JSON.stringify(sendObj));
    };

    this.sendCubeInteraction = function(_cubeID, _action, _x, _y)
    {
        var sendObj = {
            type: 'cubeinteraction',
            cubeID: _cubeID,
            action: _action,
            x: _x,
            y: _y
        };

        this.webSocket.send(JSON.stringify(sendObj));
    };

    this.sendEnd = function()
    {
        var sendObj = {
            type: 'end'
        };
        console.log("end message sent");
        this.webSocket.send(JSON.stringify(sendObj));
    };

    this.sendRestart = function()
    {
        var sendObj = {
            type: 'restart'
        };
        console.log("restart message sent");
        this.webSocket.send(JSON.stringify(sendObj));
    };


    this.onStartMessage = function(data)
    {
        app.currentUI = uiNone;
        uiNone();

        var puzzleArray = data.puzzle;
        if(app.state == App.EnumState.WAIT || (app.state == App.EnumState.END && app.host))
        {
            // Player one
            app.host = true;
            app.player = new Player(1.5, Math.floor(app.rows / 2) + 0.5, "red");
            app.opponent = new Opponent(app.columns - 1.5, Math.floor(app.rows / 2) + 0.5, "blue");
        }
        else
        {
            // Player two
            app.host = false;
            app.player = new Player(app.columns - 1.5, Math.floor(app.rows / 2) + 0.5, "blue");
            app.opponent = new Opponent(1.5, Math.floor(app.rows / 2) + 0.5, "red");
        }


        app.state = App.EnumState.GAME;

        app.cubeMgr = new CubeManager(app.columns, app.rows);

        app.puzzle = new Puzzle();
        app.puzzle.initialize(puzzleArray);

    };

    this.onWaitMessage = function(data)
    {
        var sessionID = data.sessionID;

        $("#createOutput").val(sessionID);
        app.state = App.EnumState.WAIT;

    };

    this.onNewCubeMessage = function(data)
    {
        var cubetype = data.cubetype;
        var type;

        if(cubetype == "down")
        {
            type = Cube.EnumType.DOWN;
        }
        else if(cubetype == "up")
        {
            type = Cube.EnumType.UP;
        }
        else if(cubetype == "left")
        {
            type = Cube.EnumType.LEFT;
        }
        else if(cubetype == "right")
        {
            type = Cube.EnumType.RIGHT;
        }
        else if(cubetype == "nogravity")
        {
            type = Cube.EnumType.NO_GRAVITY;
        }

        app.cubeMgr.addCube(1.5, Math.floor(app.rows / 2) + 0.5, type);
        app.cubeMgr.addCube(app.columns - 1.5, Math.floor(app.rows / 2) + 0.5, type);

        app.newCubeFlash();
    };

    this.onPlayerUpdateMessage = function(data)
    {
        var x = data.x;
        var y = data.y;

        app.opponent.updateFromMessage(x, y);
    };

    this.onCubeInteraction = function(data)
    {
        var cubeID = data.cubeID;
        var action = data.action;
        var x = data.x;
        var y = data.y;

        app.opponent.onCubeInteraction(cubeID, action, x, y);
    };

    this.onErrorMessage = function(data)
    {
        app.state = App.EnumState.ERROR;
        var text = data.text;
        $('#errortext').text(text);
        app.currentUI = uiError;
        uiError();
    };

    this.onEndMessage = function()
    {
        app.state = App.EnumState.END;

        $('#endtext').text("You lose!");
        app.currentUI = uiEnd;
        uiEnd();
    };


};