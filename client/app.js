
var App = function(aCanvas) {

    var app = this;

    var canvas, context;

    var keyNav = {x: 0, y: 0};

    var newCubeFlashCounter = 0;

    this.currentUI = uiInit;


    app.update = function() {
        if(app.state == App.EnumState.GAME)
        {
            app.cubeMgr.update();
            app.opponent.update();
            app.player.update();
            app.puzzle.check();

            app.socketComms.sendPlayerPosition();
        }
    };

    app.winGame = function() {
        app.state = App.EnumState.END;
        app.socketComms.sendEnd();

        $('#endtext').text("You win!");
        app.currentUI = uiEnd;
        uiEnd();
    };


    app.drawBoard = function() {
        var canvasMargin = settings.canvasMargin;

        // Erase current content
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Table
        context.strokeStyle = "#DCDCDC";
        context.lineWidth = 1;

        for(var i = 0; i < app.columns; i++) {
            for(var j = 0; j < app.rows; j++) {
                context.strokeRect(canvasMargin + i * app.side, canvasMargin + j * app.side, app.side, app.side);
            }
        }

        // Draw delimiters
        context.strokeStyle = "black";
        (new DrawVector(3, app.rows)).drawBrokenLineTo(context, 3, 0, 0.4, 0.5);
        (new DrawVector(app.columns / 2, app.rows)).drawBrokenLineTo(context, app.columns / 2, 0, 0.4, 0.5);
        (new DrawVector(app.columns - 3, app.rows)).drawBrokenLineTo(context, app.columns - 3, 0, 0.4, 0.5);

        // Mark new cubes position
        context.strokeStyle = "black";
        context.lineWidth = 1;

        (new DrawVector(1, Math.round(app.rows / 2 - 1))).drawBrokenLineTo(context, 1, Math.round(app.rows / 2), 0.4, 0.5);
        (new DrawVector(1, Math.round(app.rows / 2))).drawBrokenLineTo(context, 2, Math.round(app.rows / 2), 0.4, 0.5);
        (new DrawVector(2, Math.round(app.rows / 2))).drawBrokenLineTo(context, 2, Math.round(app.rows / 2 - 1), 0.4, 0.5);
        (new DrawVector(2, Math.round(app.rows / 2 - 1))).drawBrokenLineTo(context, 1, Math.round(app.rows / 2 - 1), 0.4, 0.5);

        (new DrawVector(app.columns - 2, Math.round(app.rows / 2 - 1))).drawBrokenLineTo(context, app.columns - 2, Math.round(app.rows / 2), 0.4, 0.5);
        (new DrawVector(app.columns - 2, Math.round(app.rows / 2))).drawBrokenLineTo(context, app.columns - 1, Math.round(app.rows / 2), 0.4, 0.5);
        (new DrawVector(app.columns - 1, Math.round(app.rows / 2))).drawBrokenLineTo(context, app.columns - 1, Math.round(app.rows / 2 - 1), 0.4, 0.5);
        (new DrawVector(app.columns - 1, Math.round(app.rows / 2 - 1))).drawBrokenLineTo(context, app.columns - 2, Math.round(app.rows / 2 - 1), 0.4, 0.5);

        // Draw Border
        context.strokeStyle = "black";
        context.lineWidth = 1;
        context.strokeRect(canvasMargin, canvasMargin, app.columns * app.side, app.rows * app.side);
    };

    app.drawFlashing = function()
    {
        if(newCubeFlashCounter != 0)
        {
            var NumberOfCyclesActive = 5;
            if(Math.floor(newCubeFlashCounter / NumberOfCyclesActive) % 2)
            {
                context.strokeStyle = "orange";
                context.lineWidth = 6;

                (new DrawVector(1, Math.round(app.rows / 2 - 1))).drawBrokenLineTo(context, 1, Math.round(app.rows / 2), 0.4, 0.5);
                (new DrawVector(1, Math.round(app.rows / 2))).drawBrokenLineTo(context, 2, Math.round(app.rows / 2), 0.4, 0.5);
                (new DrawVector(2, Math.round(app.rows / 2))).drawBrokenLineTo(context, 2, Math.round(app.rows / 2 - 1), 0.4, 0.5);
                (new DrawVector(2, Math.round(app.rows / 2 - 1))).drawBrokenLineTo(context, 1, Math.round(app.rows / 2 - 1), 0.4, 0.5);

                (new DrawVector(app.columns - 2, Math.round(app.rows / 2 - 1))).drawBrokenLineTo(context, app.columns - 2, Math.round(app.rows / 2), 0.4, 0.5);
                (new DrawVector(app.columns - 2, Math.round(app.rows / 2))).drawBrokenLineTo(context, app.columns - 1, Math.round(app.rows / 2), 0.4, 0.5);
                (new DrawVector(app.columns - 1, Math.round(app.rows / 2))).drawBrokenLineTo(context, app.columns - 1, Math.round(app.rows / 2 - 1), 0.4, 0.5);
                (new DrawVector(app.columns - 1, Math.round(app.rows / 2 - 1))).drawBrokenLineTo(context, app.columns - 2, Math.round(app.rows / 2 - 1), 0.4, 0.5);

            }
            newCubeFlashCounter--;
        }
    };

    app.draw = function() {

        app.drawBoard();
        if(app.state == App.EnumState.GAME || app.state == App.EnumState.END)
        {
            app.puzzle.draw(context);
            app.cubeMgr.draw(context);
            app.drawFlashing();
            app.opponent.draw(context);
            app.player.draw(context);
        }

    };

    app.newCubeFlash = function()
    {
        newCubeFlashCounter = 20;
    };


    app.keydown = function(e) {
        if(e.keyCode == keys.up) {
            keyNav.y = 1;
            app.player.moveRequest.x = 0;
            app.player.moveRequest.y = 1;
            e.preventDefault();
        }
        else if(e.keyCode == keys.down) {
            keyNav.y = -1;
            app.player.moveRequest.x = 0;
            app.player.moveRequest.y = -1;
            e.preventDefault();
        }
        else if(e.keyCode == keys.left) {
            keyNav.x = -1;
            app.player.moveRequest.x = -1;
            app.player.moveRequest.y = 0;
            e.preventDefault();
        }
        else if(e.keyCode == keys.right) {
            keyNav.x = 1;
            app.player.moveRequest.x = 1;
            app.player.moveRequest.y = 0;
            e.preventDefault();
        }
        else if(e.keyCode == keys.space) {
            app.player.onSpacePressed();
            e.preventDefault();
        }
    };
    app.keyup = function(e) {
        if(e.keyCode == keys.up && keyNav.y == 1)
        {
            keyNav.y = 0;
            app.player.moveRequest.y = 0;
            e.preventDefault();
        }
        else if(e.keyCode == keys.down && keyNav.y == -1)
        {
            keyNav.y = 0;
            app.player.moveRequest.y = 0;
            e.preventDefault();
        }
        else if(e.keyCode == keys.left && keyNav.x == -1)
        {
            keyNav.x = 0;
            app.player.moveRequest.x = 0;
            e.preventDefault();
        }
        else if(e.keyCode == keys.right && keyNav.x == 1)
        {
            keyNav.x = 0;
            app.player.moveRequest.x = 0;
            e.preventDefault();
        }
    };

    app.resize = function(e) {
        resizeCanvas();
    };

    app.toCanvasCoordinates = function(_x, _y) {
        var position = {x: 0, y: 0};
        position.x = settings.canvasMargin + _x * app.side;
        position.y = settings.canvasMargin + (app.rows - _y) * app.side;
        return position;
    };

    app.toCanvasDimension = function(_s) {
        return _s * app.side;
    };

    app.toGameCoordinates = function(_x, _y) {
        var position = {x: 0, y: 0};
        position.x = (_x - settings.canvasMargin) / app.side;
        position.y = app.rows - (_y - settings.canvasMargin) / app.side;
        return position;
    };

    app.toGameDimension = function(_s) {
        return _s / app.side;
    };


    var resizeCanvas = function() {
        canvas.width = window.innerWidth - 25;

        app.columns = settings.columns;
        app.rows = settings.rows;
        app.side = Math.floor((canvas.width - 2 * settings.canvasMargin) / app.columns);
        canvas.height = app.rows * app.side + settings.canvasMargin * 2;

        var aux = canvas.height + 50;
        document.body.style.minHeight = aux.toString() + "px";

        app.currentUI();
    };


    // Constructor
    (function() {
        canvas = aCanvas;
        context = canvas.getContext('2d');
        resizeCanvas();

        app.state = App.EnumState.INIT;
        app.host = true;

        app.socketComms = new SocketComms();

        app.currentUI = uiInit;
        uiInit();

        window.onscroll = function() {
            app.currentUI();
        };


    })();
};

App.EnumState = {INIT: 0, WAIT: 1, GAME: 2, END: 3, ERROR: 4};