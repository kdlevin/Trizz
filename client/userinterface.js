function joinGame1()
{
    app.currentUI = uiJoin;
    uiJoin();
}

function joinGame2()
{
    app.socketComms.sendJoinGame($("#joinInput").val());
    app.currentUI = uiNone;
    uiNone();
}


function createGame()
{
    app.socketComms.sendCreateGame();
    app.currentUI = uiCreate;
    uiCreate();
}

function restart()
{
    app.socketComms.sendRestart();
}

function uiNone()
{
    $("#ui").hide();
}

function uiInit()
{
    $("#uiInit").show();
    $("#uiCreate").hide();
    $("#uiJoin").hide();
    $("#uiError").hide();
    $("#uiEnd").hide();

    $("#ui").show();

    placeUI();
}

function uiJoin()
{
    $("#uiInit").hide();
    $("#uiCreate").hide();
    $("#uiJoin").show();
    $("#uiError").hide();
    $("#uiEnd").hide();

    $("#ui").show();

    placeUI();
}

function uiCreate()
{
    $("#uiInit").hide();
    $("#uiCreate").show();
    $("#uiJoin").hide();
    $("#uiError").hide();
    $("#uiEnd").hide();

    $("#ui").show();

    placeUI();
}

function uiError()
{
    $("#uiInit").hide();
    $("#uiCreate").hide();
    $("#uiJoin").hide();
    $("#uiError").show();
    $("#uiEnd").hide();

    $("#ui").show();

    placeUI();
}


function uiEnd()
{
    $("#uiInit").hide();
    $("#uiCreate").hide();
    $("#uiJoin").hide();
    $("#uiError").hide();
    $("#uiEnd").show();

    $("#ui").show();

    placeUI();
}

function placeUI()
{
    var canvas = $("#canvas")[0];
    var canvasOffset = $("#canvas").offset();
    var ui = $("#ui");
    ui.css('position', 'fixed');
    var padding_top = ui.css("padding-top").replace("px", "");
    var border_width = ui.css("border-width").replace("px", "");
    var padding_left = ui.css("padding-left").replace("px", "");

    var top = canvasOffset.top + canvas.height / 2 - ui.height() / 2 - padding_top - border_width;
    var left = canvasOffset.left + canvas.width / 2 - ui.width() / 2 - padding_left;
    ui.offset({top: top, left: left});
}