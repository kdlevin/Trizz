

function Cube(_id, _column, _row, _type) {

    // Variables
    this.position = new Vector(_column + 0.5, _row + 0.5);
    this.speed = new Vector(0, 0);
    this.moveRequest = new Vector(0, 0);
    this.isPickedByPlayer = false;
    this.isPickedByOpponent = false;


    // Constants
    this.id = _id;
    this.type = _type;
    this.acceleration = 9.8;
    this.size = 1;



    this.enteringCell = function()
    {
        if(this.speed.module())
            return Vector.floor(Vector.add(this.position, Vector.scalarProduct(Vector.sign(this.speed), 0.5)));
        else
            return Vector.floor(Vector.add(this.position, this.moveRequest));
    };

    this.leavingCell = function()
    {
        if(this.speed.module())
            return Vector.floor(Vector.substract(this.position, Vector.scalarProduct(Vector.sign(this.speed), 0.5)));
        else
            return Vector.floor(this.position);
    };

    this.updateGrid = function()
    {
        if(this.speed.module() == 0)
        {
            app.cubeMgr.updateGrid(this.leavingCell(), this.id, CubeManager.EnumGrid.HALTED);
        }
        else
        {
            app.cubeMgr.updateGrid(this.leavingCell(), this.id, CubeManager.EnumGrid.LEAVING);
            app.cubeMgr.updateGrid(this.enteringCell(), this.id, CubeManager.EnumGrid.ENTERING);
        }
    };


    this.update = function() {

        if(this.isPickedByPlayer || this.isPickedByOpponent)
            return;

        switch(this.type)
        {
            case Cube.EnumType.DOWN:
                this.moveRequest = new Vector(0, -1);
                break;
            case Cube.EnumType.UP:
                this.moveRequest = new Vector(0, 1);
                break;
            case Cube.EnumType.NO_GRAVITY:
                this.moveRequest = new Vector(0, 0);
                break;
        }

        if(this.moveRequest.module() == 0)
        {
            app.cubeMgr.updateGrid(this.leavingCell(), this.id, CubeManager.EnumGrid.HALTED);
            return;
        }


        var gridOccupancy = null;
        var canMove;
        var cube = null;


        // Reset grid for this cube
        app.cubeMgr.resetGrid(this.leavingCell(), this.id);
        app.cubeMgr.resetGrid(this.enteringCell(), this.id);

        // Check if the cube can move
        canMove = false;
        gridOccupancy = app.cubeMgr.checkGrid(this.enteringCell());

        if(gridOccupancy == null || gridOccupancy.id == this.id)
            canMove = true;
        else if(gridOccupancy.status != CubeManager.EnumGrid.OUTOFGRID && gridOccupancy.status != CubeManager.EnumGrid.HALTED)
        {
            //  Caso especial caen en la misma direccion
            cube = app.cubeMgr.cubesArray[gridOccupancy.id];
            if(!(cube.isPickedByPlayer) && Vector.equal(cube.moveRequest, this.moveRequest))
                canMove = true;
        }


        // Move
        if(canMove)
        {
            this.speed.add(Vector.scalarProduct(this.moveRequest, settings.loopPeriod * this.acceleration / 1000));
            this.position.add(Vector.scalarProduct(this.speed, settings.loopPeriod / 1000));
        }
        else
            this.speed = new Vector(0, 0);


        // Check if I have moved more than i can
        if(canMove)
        {
            gridOccupancy = app.cubeMgr.checkGrid(this.enteringCell());
            if(gridOccupancy != null)
            {
                cube = app.cubeMgr.cubesArray[gridOccupancy.id];

                if(cube != null &&
                    gridOccupancy.status != CubeManager.EnumGrid.OUTOFGRID &&
                    gridOccupancy.status != CubeManager.EnumGrid.HALTED &&
                    !(cube.isPickedByPlayer) &&
                    Vector.equal(cube.moveRequest, this.moveRequest))
                {
                    if(Vector.abs(Vector.substract(cube.position, this.position)).module() < 1)
                        this.position = Vector.substract(cube.position, this.moveRequest);
                }
                else if(gridOccupancy.id != this.id)
                {
                    var lc = this.leavingCell();
                    this.position = new Vector(lc.x + 0.5, lc.y + 0.5);
                    this.speed = new Vector(0, 0);
                }
            }
        }

        // Update Grid
        this.updateGrid();

    };


    this.updateFromPlayer = function()
    {
        // Reset grid for this cube
        app.cubeMgr.resetGrid(this.leavingCell(), this.id);
        app.cubeMgr.resetGrid(this.enteringCell(), this.id);

        // Get speed and position from player
        this.speed = Vector.copy(app.player.speed);
        this.moveRequest = Vector.sign(this.speed);
        this.position = Vector.copy(app.player.position);


        // Update Grid
        this.updateGrid();
    };

    this.updateFromOpponent = function()
    {
        // Reset grid for this cube
        app.cubeMgr.resetGrid(this.leavingCell(), this.id);
        app.cubeMgr.resetGrid(this.enteringCell(), this.id);

        // Get speed and position from player
        this.speed = Vector.copy(app.opponent.speed);
        this.moveRequest = Vector.sign(this.speed);
        this.position = Vector.copy(app.opponent.position);

        // Update Grid
        this.updateGrid();
    };


    this.draw = function(context) {
        var center = new DrawVector(this.position.x, this.position.y);
        var drawSize = 0.95 * this.size;

        if(this.isPickedByPlayer)
        {
            context.strokeStyle = app.player.color;
            context.lineWidth = 3;
        }
        else if(this.isPickedByOpponent)
        {
            context.strokeStyle = app.opponent.color;
            context.lineWidth = 3;
        }
        else
        {
            context.strokeStyle = "black";
            context.lineWidth = 2;
        }


        // Check if it is a ghost cube
        var backgroundColor, symbolcolor;
        if(this.id % 2 == Math.floor(2* this.position.x /app.columns))
        {
            backgroundColor = "grey";
            symbolcolor = "white";
        }
        else
        {
            backgroundColor = "white";
            symbolcolor = "black";
        }

        context.lineStyle = "butt";
        context.fillStyle = backgroundColor;



        // Box
        context.beginPath();
        center.translate(drawSize / 2, drawSize / 2).moveTo(context);
        center.translate(-drawSize / 2, drawSize / 2).lineTo(context);
        center.translate(-drawSize / 2, -drawSize / 2).lineTo(context);
        center.translate(drawSize / 2, -drawSize / 2).lineTo(context);
        center.translate(drawSize / 2, drawSize / 2).lineTo(context);
        context.stroke();
        context.fill();
        context.closePath();

        context.strokeStyle = symbolcolor;
        context.lineWidth = 2;

        var point = new DrawVector(this.position.x, this.position.y);

        // In draw
        switch(this.type)
        {
            case Cube.EnumType.DOWN:
                context.beginPath();
                point.translate(0, drawSize / 5).moveTo(context);
                point.translate(0, -drawSize / 5).lineTo(context);
                point.translate(-drawSize / 8, -drawSize / 10).moveTo(context);
                point.translate(0, -drawSize / 5).lineTo(context);
                point.translate(drawSize / 8, -drawSize / 10).lineTo(context);
                context.stroke();
                context.closePath();
                break;

            case Cube.EnumType.UP:
                context.beginPath();
                point.translate(0, -drawSize / 5).moveTo(context);
                point.translate(0, drawSize / 5).lineTo(context);
                point.translate(-drawSize / 8, drawSize / 10).moveTo(context);
                point.translate(0, drawSize / 5).lineTo(context);
                point.translate(drawSize / 8, drawSize / 10).lineTo(context);
                context.stroke();
                context.closePath();
                break;

            case Cube.EnumType.NO_GRAVITY:
                context.beginPath();
                point.translate(Math.SQRT2 * drawSize / 8, Math.SQRT2 * drawSize / 8).moveTo(context);
                point.translate(-Math.SQRT2 * drawSize / 8, -Math.SQRT2 * drawSize / 8).lineTo(context);
                point.translate(Math.SQRT2 * drawSize / 8, -Math.SQRT2 * drawSize / 8).moveTo(context);
                point.translate(-Math.SQRT2 * drawSize / 8, Math.SQRT2 * drawSize / 8).lineTo(context);
                context.stroke();
                context.closePath();
                break;
        }

    };
}

Cube.EnumType = {DOWN: 0, UP: 1, NO_GRAVITY: 2};