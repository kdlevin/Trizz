function Player(_x, _y, _color) {
    // Constants
    this.maxSpeed = 7;
    this.acceleration = 0.4;
    this.size = 0.5;
    this.color = _color;

    // Variables
    this.position = new Vector(_x, _y);
    this.speed = new Vector(0, 0);
    this.moveRequest = new Vector(0, 0);
    this.pickedCube = -1;
    this.stealingCube = -1;

    this.IsPlayerOnItsField = function()
    {
        if(app.host)
            return !Math.floor(2 * this.position.x / app.columns);
        else
            return Math.floor(2 * this.position.x / app.columns);

    };

    this.onSpacePressed = function()
    {
        if(this.speed.module() == 0 && this.moveRequest.module() == 0)
        {
            if(this.pickedCube == -1)
            {
                // Pick cube
                var cell = Vector.floor(this.position);
                var gridOccupancy = app.cubeMgr.checkGrid(cell);
                if(gridOccupancy != null && gridOccupancy.id != -1 && gridOccupancy.status == CubeManager.EnumGrid.HALTED)
                {
                    if(app.cubeMgr.cubesArray[gridOccupancy.id].isPickedByOpponent != true &&
                        (this.IsPlayerOnItsField() || app.cubeMgr.cubesArray[gridOccupancy.id].type != Cube.EnumType.NO_GRAVITY))
                    {
                        app.cubeMgr.cubesArray[gridOccupancy.id].isPickedByPlayer = true;
                        this.pickedCube = gridOccupancy.id;
                        app.socketComms.sendCubeInteraction(gridOccupancy.id, 'pick', cell.x, cell.y);

                        if(!this.IsPlayerOnItsField())
                            this.stealingCube = this.pickedCube;
                        else
                            this.stealingCube = -1;
                    }
                }
            }
            else
            {
                // Release cube
                var cell = Vector.floor(this.position);
                if(this.stealingCube == -1 || this.IsPlayerOnItsField())
                {
                    app.cubeMgr.cubesArray[this.pickedCube].isPickedByPlayer = false;
                    app.socketComms.sendCubeInteraction(this.pickedCube, 'drop', cell.x, cell.y);
                    this.pickedCube = -1;
                }
            }
        }
    };



    this.update = function() {

        // This function works properly only if this.moveRequest 
        // has only one of its components different from 0

        var checkStop = false;

        // Calculate speed
        if(this.speed.module() == 0)
        {
            this.speed.add(Vector.scalarProduct(this.moveRequest, this.acceleration));
        }
        else
        {
            if(Vector.equal(Vector.abs(this.moveRequest), Vector.abs(Vector.sign(this.speed))))
            {
                if(Vector.equal(Vector.sign(this.moveRequest), Vector.sign(Vector.substract(0, this.speed))))
                    this.speed = Vector.scalarProduct(this.moveRequest, this.acceleration);
                else
                    this.speed.add(Vector.scalarProduct(this.moveRequest, this.acceleration));
            }
            else
            {
                this.speed.add(Vector.scalarProduct(Vector.sign(this.speed), this.acceleration));
                checkStop = true;
            }
        }

        if(Math.sqrt(this.speed.module()) > this.maxSpeed)
            this.speed = Vector.scalarProduct(Vector.sign(this.speed), this.maxSpeed);



        // Calculate position
        var prevPosition = Vector.copy(this.position);

        if(this.pickedCube != -1 && this.speed.module() != 0)
        {
            // If the player has a cube picked and it's moving into a full cell
            // we set the position on the leaving cell
            var cube = app.cubeMgr.cubesArray[this.pickedCube];
            var gridOccupancy = app.cubeMgr.checkGrid(cube.enteringCell());

            if(gridOccupancy != null && gridOccupancy.id != cube.id)
            {
                this.speed = new Vector(0, 0);
                var lc = cube.leavingCell();
                this.position = new Vector(lc.x + 0.5, lc.y + 0.5);
            }
        }


        var delta = Vector.scalarProduct(this.speed, settings.loopPeriod / 1000);

        if(checkStop)
        {
            var auxVector = Vector.dotProduct(Vector.sign(delta), Vector.substract(Vector.add(this.position, delta), Vector.round(this.position)));

            if(auxVector.x > 0.5)
            {
                this.position.x = Math.round(this.position.x) + 0.5 * sign(delta.x);
                this.speed.x = 0;
            }
            else if(auxVector.y > 0.5)
            {
                this.position.y = Math.round(this.position.y) + 0.5 * sign(delta.y);
                this.speed.y = 0;
            }
            else // We don't have to stop
                this.position.add(delta);
        }
        else
            this.position.add(delta);


        // We only allow trespassing of the frontier between players zones
        // if a cube is picked and is not and a NO_GRAVITY cube
        if(this.pickedCube == -1 || app.cubeMgr.cubesArray[this.pickedCube].type == Cube.EnumType.NO_GRAVITY)
        {
            if(prevPosition.x >= (app.columns / 2 + 0.5) && (app.columns / 2 + 0.5) > this.position.x)
            {
                this.position.x = app.columns / 2 + 0.5;
                this.speed.x = 0;
            }
            if(prevPosition.x <= (app.columns / 2 - 0.5) && (app.columns / 2 - 0.5) < this.position.x)
            {
                this.position.x = app.columns / 2 - 0.5;
                this.speed.x = 0;
            }
        }

        // Check board limits. The player cannot enter the home base of the opponent
        if(this.position.x < 0.5 + !app.host * 3)
        {
            this.position.x = 0.5 + !app.host * 3;
            this.speed.x = 0;
        }
        if(this.position.x > settings.columns - 0.5 - app.host * 3)
        {
            this.position.x = settings.columns - 0.5 - app.host * 3;
            this.speed.x = 0;
        }

        if(this.position.y < 0.5)
        {
            this.position.y = 0.5;
            this.speed.y = 0;
        }
        if(this.position.y > settings.rows - 0.5)
        {
            this.position.y = settings.rows - 0.5;
            this.speed.y = 0;
        }

        if(this.pickedCube != -1)
            app.cubeMgr.cubesArray[this.pickedCube].updateFromPlayer();

    };


    this.draw = function(context) {

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
