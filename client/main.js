var settings = new Settings();

var app;

var runLoop = function() {
    app.update();
    app.draw();
};

var initApp = function() {
    if(app != null) {
        return;
    }
    app = new App(document.getElementById('canvas'));

    window.addEventListener('resize', app.resize, false);

    document.addEventListener('keydown', app.keydown, false);
    document.addEventListener('keyup', app.keyup, false);

    setInterval(runLoop, settings.loopPeriod);
};

var forceInit = function() {
    initApp()
    document.getElementById('unsupported-browser').style.display = "none";
    return false;
};

if(Modernizr.canvas && Modernizr.websockets) {
    initApp();
} else {
    document.getElementById('unsupported-browser').style.display = "block";
    document.getElementById('force-init-button').addEventListener('click', forceInit);
}

$(function() {
    $('a[rel=external]').click(function(e) {
        e.preventDefault();
        window.open($(this).attr('href'));
    });
});

document.body.onselectstart = function() {
    return false;
}
