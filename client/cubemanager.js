function CubeManager(_columns, _rows) {

    // Variables
    this.rows = _rows;
    this.columns = _columns;

    // Constructor
    var i, j;
    this.grid = new Array(this.columns);
    for(i = 0; i < this.columns; i++) {
        this.grid[i] = new Array(this.rows);
    }
    for(i = 0; i < this.columns; i++) {
        for(j = 0; j < this.rows; j++) {
            this.grid[i][j] = null;
        }
    }

    this.cubesArray = new Array();

    this.updateGrid = function(_v, _id, _status)
    {
        var gridOccupancy = this.checkGrid(_v);
        if(gridOccupancy == null || gridOccupancy.id == _id ||
            (gridOccupancy.status == CubeManager.EnumGrid.ENTERING && _status != CubeManager.EnumGrid.ENTERING))
            this.grid[_v.x][_v.y] = {id: _id, status: _status};
    };

    this.resetGrid = function(_v, _id)
    {
        var gridOccupancy = this.checkGrid(_v);
        if(gridOccupancy != null && gridOccupancy.id == _id)
            this.grid[_v.x][_v.y] = null;

    };

    this.checkGrid = function(_v)
    {
        if(_v.x >= 0 && _v.x < settings.columns && _v.y >= 0 && _v.y < settings.rows)
            return this.grid[_v.x][_v.y];
        else
            return {id: -1, status: CubeManager.EnumGrid.OUTOFGRID};
    };


    this.addCube = function(_x, _y, _type)
    {
        var v = new Vector(_x, _y);
        var gridOccupancy = this.checkGrid(v.floor());
        if(gridOccupancy == null)
            this.cubesArray[this.cubesArray.length] = new Cube(this.cubesArray.length, v.x, v.y, _type);
        else
            this.cubesArray[this.cubesArray.length] = null; // Cube could not be created
    }


    this.update = function()
    {
        // First execute down cube to give them priority
        for(i = 0; i < this.cubesArray.length; i++)
        {
            var cube = this.cubesArray[i];
            if(cube != null && cube.type == Cube.EnumType.DOWN)
                cube.update();
        }

        // Then execute the rest of the cubes
        for(i = 0; i < this.cubesArray.length; i++)
        {
            var cube = this.cubesArray[i];
            if(cube != null && cube.type != Cube.EnumType.DOWN)
                cube.update();
        }
    };

    this.draw = function(context) {
        for(i = 0; i < this.cubesArray.length; i++)
        {
            var cube = this.cubesArray[i];
            if(cube != null)
                cube.draw(context);
        }

        var writeGrid = false;
        if(writeGrid)
        {
            context.fillStyle = "black";
            context.font = "10px sans-serif";


            for(i = 0; i < this.columns; i++)
            {
                for(j = 0; j < this.rows; j++)
                {
                    var point = new DrawVector(i + 0.1, j + 0.1);
                    var g = this.grid[i][j];
                    if(g != null)
                        context.fillText(g.id.toString() + "," + g.status, point.xCanvas, point.yCanvas);
                }
            }
        }
    };

}


CubeManager.EnumGrid = {HALTED: 0, ENTERING: 1, LEAVING: 2, OUTOFGRID: 3};