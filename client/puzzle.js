function Puzzle() {

    this.puzzleMatrix = [];
    this.columns = settings.puzzleColumns;
    this.rows = settings.puzzleRows;
    this.color = "green";

    this.initialize = function(puzzleArray)
    {
        var i, j;
        this.puzzleMatrix = new Array(this.columns);
        for(i = 0; i < this.columns; i++) {
            this.puzzleMatrix[i] = new Array(this.rows);
        }
        for(i = 0; i < this.columns; i++) {
            for(j = 0; j < this.rows; j++) {
                this.puzzleMatrix[i][j] = false;
            }
        }

        for(i in puzzleArray)
        {
            var p = puzzleArray[i];
            if(p.x >= 0 && p.x < this.columns && p.y >= 0 && p.y < this.rows)
                this.puzzleMatrix[p.x][p.y] = true;
        }

    };

    this.check = function()
    {
        var isLeftPuzzleSolved = true;
        var isRightPuzzleSolved = true;
        var i, j;

        this.color = "green";

        // Left puzzle
        for(i = 0; i < this.columns && isLeftPuzzleSolved; i++)
        {
            for(j = 0; j < this.rows && isLeftPuzzleSolved; j++)
            {
                var gridOccupancy = app.cubeMgr.checkGrid({x: settings.columns / 2 - settings.puzzleColumns + i, y: j});

                if(this.puzzleMatrix[i][j] == false && gridOccupancy != null)
                    isLeftPuzzleSolved = false;

                if(this.puzzleMatrix[i][j] == true)
                {
                    if(gridOccupancy == null || gridOccupancy.status != CubeManager.EnumGrid.HALTED)
                        isLeftPuzzleSolved = false;
                    else if(app.cubeMgr.cubesArray[gridOccupancy.id].isPickedByPlayer ||
                        app.cubeMgr.cubesArray[gridOccupancy.id].isPickedByOpponent)
                        isLeftPuzzleSolved = false;


                }
            }
        }

        if(isLeftPuzzleSolved)
        {
            this.color = "red";
        }

        // Right puzzle
        for(i = 0; i < this.columns && isRightPuzzleSolved; i++)
        {
            for(j = 0; j < this.rows && isRightPuzzleSolved; j++)
            {
                var gridOccupancy = app.cubeMgr.checkGrid({x: settings.columns / 2 + settings.puzzleColumns - i - 1, y: j});

                if(this.puzzleMatrix[i][j] == false && gridOccupancy != null)
                    isRightPuzzleSolved = false;

                if(this.puzzleMatrix[i][j] == true)
                {
                    if(gridOccupancy == null || gridOccupancy.status != CubeManager.EnumGrid.HALTED)
                        isRightPuzzleSolved = false;
                    else if(app.cubeMgr.cubesArray[gridOccupancy.id].isPickedByPlayer ||
                        app.cubeMgr.cubesArray[gridOccupancy.id].isPickedByOpponent)
                        isRightPuzzleSolved = false;
                }
            }
        }
        
        if(app.host && isLeftPuzzleSolved || !(app.host) && isRightPuzzleSolved)
            app.winGame();

    };

    this.draw = function(context)
    {
        var point = new DrawVector(0, 0);
        var size = 0.95;
        context.strokeStyle = this.color;
        context.lineStyle = "butt";
        context.lineWidth = 3;


        var i, j;
        for(i = 0; i < this.columns; i++)
        {
            for(j = 0; j < this.rows; j++)
            {
                if(this.puzzleMatrix[i][j])
                {
                    if(i == 0 || this.puzzleMatrix[i - 1][j] == false)
                    {
                        // Draw left bar
                        point.set(settings.columns / 2 - settings.puzzleColumns + i, j);
                        context.beginPath();
                        point.moveTo(context);
                        point.translate(0, 1).lineTo(context);
                        context.stroke();
                        context.closePath();

                        // And symmetrical
                        point.set(settings.columns / 2 + settings.puzzleColumns - i, j);
                        context.beginPath();
                        point.moveTo(context);
                        point.translate(0, 1).lineTo(context);
                        context.stroke();
                        context.closePath();
                    }

                    if(j == 0 || this.puzzleMatrix[i][j - 1] == false)
                    {
                        // Draw down bar
                        point.set(settings.columns / 2 - settings.puzzleColumns + i, j);
                        context.beginPath();
                        point.moveTo(context);
                        point.translate(1, 0).lineTo(context);
                        context.stroke();
                        context.closePath();

                        // And symmetrical
                        point.set(settings.columns / 2 + settings.puzzleColumns - i - 1, j);
                        context.beginPath();
                        point.moveTo(context);
                        point.translate(1, 0).lineTo(context);
                        context.stroke();
                        context.closePath();
                    }


                    if(i == this.columns - 1 || this.puzzleMatrix[i + 1][j] == false)
                    {
                        // Draw right bar
                        point.set(settings.columns / 2 - settings.puzzleColumns + i + 1, j);
                        context.beginPath();
                        point.moveTo(context);
                        point.translate(0, 1).lineTo(context);
                        context.stroke();
                        context.closePath();

                        // And symmetrical
                        point.set(settings.columns / 2 + settings.puzzleColumns - i - 1, j);
                        context.beginPath();
                        point.moveTo(context);
                        point.translate(0, 1).lineTo(context);
                        context.stroke();
                        context.closePath();
                    }

                    if(j == this.rows - 1 || this.puzzleMatrix[i][j + 1] == false)
                    {
                        // Draw up bar
                        point.set(settings.columns / 2 - settings.puzzleColumns + i, j + 1);
                        context.beginPath();
                        point.moveTo(context);
                        point.translate(1, 0).lineTo(context);
                        context.stroke();
                        context.closePath();

                        // And symmetrical
                        point.set(settings.columns / 2 + settings.puzzleColumns - i - 1, j + 1);
                        context.beginPath();
                        point.moveTo(context);
                        point.translate(1, 0).lineTo(context);
                        context.stroke();
                        context.closePath();
                    }
                }
            }
        }
    };

}


