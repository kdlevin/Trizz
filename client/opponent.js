function Opponent(_x, _y, _color) {
    // Constants
    this.maxSpeed = 7;
    this.acceleration = 0.4;
    this.size = 0.5;
    this.color = _color;

    // Variables
    this.position = new Vector(_x, _y);
    this.prevPosition = new Vector(_x, _y);
    this.speed = new Vector(0, 0);
    this.pickedCube = -1;
    this.updateX = _x;
    this.updateY = _y;

    this.onCubeInteraction = function(_cubeID, _action, _x, _y)
    {
        this.position.set(_x + 0.5, _y + 0.5);
        this.speed.set(0, 0);

        if(_action == 'pick')
        {
            this.pickedCube = _cubeID;
            app.cubeMgr.cubesArray[_cubeID].isPickedByOpponent = true;
        }
        else if(_action == 'drop')
        {
            app.cubeMgr.cubesArray[_cubeID].updateFromOpponent();
            app.cubeMgr.cubesArray[_cubeID].isPickedByOpponent = false;
            this.pickedCube = -1;
        }
    };


    this.updateFromMessage = function(_x, _y)
    {
        this.updateX = _x;
        this.updateY = _y;
    };

    this.update = function()
    {
        // Interpolate ???
        this.prevPosition = Vector.copy(this.position);
        this.position.set(this.updateX, this.updateY);
        this.speed = Vector.scalarProduct(Vector.substract(this.position, this.prevPosition), settings.loopPeriod);

        if(this.pickedCube != -1)
            app.cubeMgr.cubesArray[this.pickedCube].updateFromOpponent();
    };


    this.draw = function(context)
    {
        var center = new DrawVector(this.position.x, this.position.y);
        var radiusCanvas = (new DrawVector(this.size / 2, 0)).getCanvasMod();
        context.strokeStyle = this.color;
        context.lineWidth = 3;
        context.beginPath();
        context.arc(center.xCanvas, center.yCanvas, radiusCanvas, 0, (Math.PI / 180) * (360), false);
        context.stroke();
        context.closePath();
    };
}
