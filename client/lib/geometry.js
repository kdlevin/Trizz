
function sign(x) {
    return x ? x < 0 ? -1 : 1 : 0;
}

function Vector(_x, _y)
{
    this.x = _x;
    this.y = _y;
}

Vector.prototype.set = function(_x, _y)
{
    this.x = _x;
    this.y = _y;
};

Vector.add = function(_v1, _v2)
{
    var NewVector = new Vector(0, 0);
    NewVector.x = _v1.x + _v2.x;
    NewVector.y = _v1.y + _v2.y;
    return NewVector;
};

Vector.prototype.add = function(_v)
{
    this.x += _v.x;
    this.y += _v.y;
    return this;
};

Vector.substract = function(_v1, _v2)
{
    var NewVector = new Vector(0, 0);
    NewVector.x = _v1.x - _v2.x;
    NewVector.y = _v1.y - _v2.y;
    return NewVector;
};

Vector.prototype.substract = function(_v)
{
    this.x -= _v.x;
    this.y -= _v.y;
    return this;
};

Vector.scalarProduct = function(_v, _s)
{
    var NewVector = new Vector(_v.x, _v.y);
    NewVector.x *= _s;
    NewVector.y *= _s;
    return NewVector;
};

Vector.prototype.scalarProduct = function(_s)
{
    this.x *= _s;
    this.y *= _s;
    return this;
};

Vector.dotProduct = function(_v1, _v2)
{
    var NewVector = new Vector(0, 0);
    NewVector.x = _v1.x * _v2.x;
    NewVector.y = _v1.y * _v2.y;
    return NewVector;
};

Vector.prototype.dotProduct = function(_v)
{
    this.x *= _v.x;
    this.y *= _v.y;
    return this;
};

Vector.floor = function(_v)
{
    var NewVector = new Vector(0, 0);
    NewVector.x = Math.floor(_v.x);
    NewVector.y = Math.floor(_v.y);
    return NewVector;
};

Vector.prototype.floor = function()
{
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    return this;
};

Vector.round = function(_v)
{
    var NewVector = new Vector(0, 0);
    NewVector.x = Math.round(_v.x);
    NewVector.y = Math.round(_v.y);
    return NewVector;
};

Vector.prototype.round = function()
{
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
};

Vector.abs = function(_v)
{
    var NewVector = new Vector(0, 0);
    NewVector.x = Math.abs(_v.x);
    NewVector.y = Math.abs(_v.y);
    return NewVector;
};

Vector.prototype.abs = function()
{
    this.x = Math.abs(this.x);
    this.y = Math.abs(this.y);
    return this;
};

Vector.sign = function(_v)
{
    var NewVector = new Vector(0, 0);
    NewVector.x = sign(_v.x);
    NewVector.y = sign(_v.y);
    return NewVector;
};


Vector.prototype.module = function()
{
    var module = Math.sqrt(this.x * this.x + this.y * this.y);
    return module;
};

Vector.equal = function(_v1, _v2)
{
    return (_v1.x == _v2.x && _v1.y == _v2.y);
};

Vector.copy = function(_v)
{
    var NewVector = new Vector(_v.x, _v.y);
    return NewVector;
};


function DrawVector(x, y)
{
    this.xGame = x;
    this.yGame = y;
    this.xCanvas;
    this.yCanvas;


    this.rotate = function(_angle) {
        var angleRadians = Math.PI / 180 * _angle;
        var xGame = this.xGame * Math.cos(angleRadians) - this.yGame * Math.sin(angleRadians);
        var yGame = this.xGame * Math.sin(angleRadians) + this.yGame * Math.cos(angleRadians);
        var NewVector = new DrawVector(xGame, yGame);
        return NewVector;
    };

    this.translate = function(_x, _y) {
        var xGame = this.xGame + _x;
        var yGame = this.yGame + _y;
        var NewVector = new DrawVector(xGame, yGame);
        return NewVector;
    };

    this.updateCanvasCoordinates = function() {
        position = app.toCanvasCoordinates(this.xGame, this.yGame);
        this.xCanvas = position.x;
        this.yCanvas = position.y;
    };

    this.updateGameCoordinates = function() {
        position = app.toGameCoordinates(this.xCanvas, this.yCanvas);
        this.xCanvas = position.x;
        this.yCanvas = position.y;
    };

    this.set = function(_x, _y) {
        this.xGame = _x;
        this.yGame = _y;
        this.updateCanvasCoordinates();
        return this;
    };

    this.setCanvas = function(_x, _y) {
        this.xCanvas = _x;
        this.yCanvas = _y;
        this.updateGameCoordinates();
        return this;
    };

    this.getGameMod = function() {
        return Math.sqrt(Math.pow(this.xGame, 2) + Math.pow(this.yGame, 2));
    };

    this.getCanvasMod = function() {
        return app.toCanvasDimension(this.getGameMod());
    };

    this.lineTo = function(context) {
        context.lineTo(this.xCanvas, this.yCanvas);
    };

    this.moveTo = function(context) {
        context.moveTo(this.xCanvas, this.yCanvas);
    };

    this.drawBrokenLineTo = function(context, _x, _y, _size, _proportion) {

        var blackStretch = app.toCanvasDimension(_size) * _proportion;
        var whiteStretch = app.toCanvasDimension(_size) * _proportion;
        var endPosition = app.toCanvasCoordinates(_x, _y);
        var totalDistance = Math.sqrt(Math.pow(endPosition.x - this.xCanvas, 2) + Math.pow(endPosition.y - this.yCanvas, 2));


        var point = new Vector(this.xCanvas, this.yCanvas);
        var direction = new Vector(endPosition.x - this.xCanvas, endPosition.y - this.yCanvas);
        direction.scalarProduct(1 / direction.module());


        var i = 0;
        var bContinue = true;
        var accumulatedDistance = 0;

        context.beginPath();
        this.moveTo(context);
        while(bContinue)
        {
            if(i % 2)
            {
                if(accumulatedDistance + whiteStretch < totalDistance)
                {
                    point.add(Vector.scalarProduct(direction, whiteStretch));
                    context.moveTo(point.x, point.y);
                    accumulatedDistance += whiteStretch;
                }
                else
                {
                    context.moveTo(endPosition.x, endPosition.y);
                    bContinue = false;
                }
            }
            else
            {
                if(accumulatedDistance + blackStretch < totalDistance)
                {
                    point.add(Vector.scalarProduct(direction, blackStretch));
                    context.lineTo(point.x, point.y);
                    accumulatedDistance += blackStretch;
                }
                else
                {
                    context.lineTo(endPosition.x, endPosition.y);
                    bContinue = false;
                }
            }

            i++;
        }

        context.stroke();
        context.closePath();
    };


    // Constructor
    this.updateCanvasCoordinates();


}