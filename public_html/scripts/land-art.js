function shuffle(array) {
    var counter = array.length, temp, index;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

function assert(condition, message) {
    if (!condition) {
        message = message || "Assertion failed";
        if (typeof Error !== "undefined") {
            throw new Error(message);
        }
        throw message; // Fallback
    }
}

// http://weblog.jamisbuck.org/2010/12/27/maze-generation-recursive-backtracking

var Type = {
    USABLE: true, 
    UNUSABLE: false
}

var Direction = function(flag, oppositeFlag) {
    this.flag = flag;
    this.oppositeFlag = oppositeFlag;
}

Direction.prototype = {

    opposite: function() {
        switch (this) {    
            case Directions.NORTH: 
                return Directions.SOUTH;
            case Directions.SOUTH: 
                return Directions.NORTH;
            case Directions.EAST:
                return Directions.WEST;
            case Directions.WEST: 
                return Directions.EAST;
        }
    },

    mirror: function(axe) {
        switch (axe) {
            case Axes.HORIZONTAL:
                switch (this) {    
                    case Directions.NORTH: 
                        return Directions.SOUTH;
                    case Directions.SOUTH: 
                        return Directions.NORTH;
                    case Directions.EAST:
                        return Directions.EAST;
                    case Directions.WEST: 
                        return Directions.WEST;
                }
                break;
            case Axes.VERTICAL:
                switch (this) {    
                    case Directions.NORTH: 
                        return Directions.NORTH;
                    case Directions.SOUTH: 
                        return Directions.SOUTH;
                    case Directions.EAST:
                        return Directions.WEST;
                    case Directions.WEST: 
                        return Directions.EAST;
                }
                break;
        }

    },

    removeFrom: function(array) {
        var a = new Array();
        for (var i = 0; i < array.length; i++) {
            if (array[i] != this) {
                a.push(array[i]);
            }
        }
        return a;
    }, 
    addTo: function(array) {
        var a = array.slice();
        a.push(this);
        return a;
    }

}

var Directions = {
    NORTH: new Direction(1, 2), 
    SOUTH: new Direction(2, 1), 
    EAST: new Direction(4, 8), 
    WEST: new Direction(8, 4), 
    all: function() {
        return [Directions.NORTH, Directions.SOUTH, Directions.EAST, Directions.WEST];
    }, 

    random: function() {
        return shuffle(this.all())[0];
    }, 

    none: function() {
        return new Array();
    }
}

var Wall = function(direction, size) {
    this.direction = direction;
    this.size = size;
}

Wall.prototype = {

    draw: function(path, coordinates) {
        var startPoint = null;
        var stopPoint = null;
        switch (this.direction) {    
            case Directions.NORTH: 
                startPoint = new paper.Point(coordinates.x, coordinates.y);
                stopPoint = startPoint.add([this.size.width, 0]);
                break; 
            case Directions.SOUTH: 
                startPoint = new paper.Point(coordinates.x, coordinates.y + this.size.height);
                stopPoint = startPoint.add([this.size.width, 0]);
                break;
            case Directions.EAST:
                startPoint = new paper.Point(coordinates.x + this.size.width, coordinates.y);
                stopPoint = startPoint.add([0, this.size.width]);
                break;
            case Directions.WEST: 
                startPoint = new paper.Point(coordinates.x, coordinates.y);
                stopPoint = startPoint.add([0, this.size.width]);
                break;
        }

        /*var line = new paper.Path.Line(startPoint, stopPoint);
        line.strokeColor = "#00FF00";
        line.strokeWidth = 1;
        path.add(line);*/
                        
                        
        var startCircle = new paper.Path.Circle(startPoint.x, startPoint.y, 1);
        startCircle.strokeWidth = 1;
        startCircle.fillColor = "#FF0000";
        var stopCircle = new paper.Path.Circle(stopPoint.x, stopPoint.y, 1);
        stopCircle.strokeWidth = 1;
        stopCircle.fillColor = "#FF0000";
        path.add(startCircle);
        path.add(stopCircle);
    }, 

    mirror: function(axe) {
        return new Wall(this.direction.mirror(axe), this.size);
    }

}

var Walls = {

    all: function(size) {
        return [
            new Wall(Directions.NORTH, size), 
            new Wall(Directions.SOUTH, size), 
            new Wall(Directions.EAST, size), 
            new Wall(Directions.WEST, size)
        ];
    }

}

var Axes = {
    HORIZONTAL: 1, 
    VERTICAL: 2
};

var Flags = {
    NONE: 0, 
    MAZE: 2, 
    ROUND: 4
}

var Cell = function(grid, i, j, size) {
    this.grid = grid;
    this.size = size;
    this.i = i;
    this.j = j;

    this.kept = true;
    
    this.flag = Flags.NONE;

    this.walls = []; //Walls.all(this.size);
}

Cell.prototype = {
   
    isFlaggedWith: function(flag) {
        return (this.flag & flag) == flag;
    },
   
    split: function(grid, times) {
        // Let's initialize the cells
        var cells = new Array(times); 
        for (var i = 0; i < times; i++) {
            cells[i] = new Array(times);
            for (var j = 0; j < times; j++) {
                cells[i][j] = new Cell(grid, this.i * times + i, this.j * times + j, this.size.divide(times));
                cells[i][j].kept = this.kept;
                cells[i][j].walls = [];
                cells[i][j].flag = this.flag;
            }
        }
        
        if (this.kept) {
            for (var k = 0; k < this.walls.length; k++) {
                var wall = this.walls[k];
                //console.log(wall);
                var direction = wall.direction;
                switch (direction) {
                    case Directions.NORTH: 
                        for (var i = 0; i < times; i++) {
                            cells[i][0].__addWall(Directions.NORTH);
                        }
                        break;
                    case Directions.SOUTH:
                        for (var i = 0; i < times; i++) {
                            cells[i][times - 1].__addWall(Directions.SOUTH);
                        }
                        break;
                        
                    case Directions.EAST: 
                        for (var j = 0; j < times; j++) {
                            cells[times - 1][j].__addWall(Directions.EAST);
                        }
                        break;
                    case Directions.WEST:
                        for (var j = 0; j < times; j++) {
                            cells[0][j].__addWall(Directions.WEST);
                        }
                        break;
                }
            }
            
            for (var i = 1; i < times - 1; i++) {
                for (var j = 1; j < times - 1; j++) {
                    cells[i][j].walls = [];
                }
            }
        } else {
            
        }
        
        //console.log(cells);
        return cells;
    },

    draw: function(path, x, y) {
        if (this.kept) {
            //////////////console.log(x + " / " + y);
            for (var i = 0; i < this.walls.length; i++) {
                this.walls[i].draw(path, new Coordinates(x, y));
            }
        } else {
            var rectangle = new paper.Path.Rectangle(x, y, this.size.width, this.size.height);
            rectangle.fillColor = "#EEEEEE";
            path.add(rectangle);
        }
    },

    neighbour: function(direction) {
        var di = 0;
        var dj = 0;
        switch (direction) {    
            case Directions.NORTH: 
                dj = -1;
                break; 
            case Directions.SOUTH: 
                dj = +1;
                break;
            case Directions.EAST:
                di = +1;
                break;
            case Directions.WEST: 
                di = -1;
                break;
        }
        var i = this.i + di;
        var j = this.j + dj;

        if (i < 0 || j < 0 || i >= this.grid.columnCount || j >= this.grid.rowCount) {
            return null;
        }

        return this.grid.cellAt(i, j);
    }, 

    directions: function() {
        var directions = new Array();
        var allDirections = Directions.all();
        for (var i = 0; i < allDirections.length; i++) {
            var direction = allDirections[i];
            var neighbourCell = this.neighbour(direction);
            if (neighbourCell != null && neighbourCell.kept) {
                directions.push(direction);
            }
        }
        return directions;
    },

    neighbours: function() {
        var allDirections = Directions.all();
        var neighbours = new Array();
        for (var i = 0; i < allDirections.length; i++) {
            if (allDirections[i].kept) {
                neighbours.push(this.neighbour(allDirections[i]));
            }
        }
        return neighbours;
    },

    toRectangle: function(origin) {
        return new Rectangle(origin, this.size);
    }, 

    breakWall: function(direction) {
        //////////////console.log(direction);
        this.__removeWall(direction);
        var neighbourCell = this.neighbour(direction); 
        if (neighbourCell != null) neighbourCell.__removeWall(direction.opposite());
    }, 

    buildWall: function(direction) {
        this.__addWall(direction);
        var neighbourCell = this.neighbour(direction); 

        if (neighbourCell != null) neighbourCell.__addWall(direction.opposite());
    }, 

    __addWall: function(direction) {
        var add = true;
        for (var i = 0; i < this.walls.length; i++) {
            var wall = this.walls[i];
            if (wall.direction == direction) {
                add = false;
            }
        }

        if (add) {
            this.walls.push(new Wall(direction, this.size));
        }
    }, 

    __removeWall: function(direction) {
        ////////////console.log(this.walls);
        for (var i = 0; i < this.walls.length; i++) {
            var wall = this.walls[i];
            if (wall.direction == direction) {
                this.walls.splice(i, 1);
                break;
            }
        }
        ////////////console.log(this.walls);
        ////////////console.log("----------");
    }, 
    
    hasWall: function(direction) {
        for (var k = 0; k < this.walls.length; k++) {
            if (this.walls[k].direction == direction) {
                return true;
            }
        }
        
        return false;
    }

}

var Grid = function(width, height, space) {
    this.columnCount = width / space;
    this.rowCount = height / space;

    this.width = width;
    this.height = height;
    this.space = space;

    this.cells = new Array(this.columnCount);

    for (var i = 0; i < this.columnCount; i++) {
        this.cells[i] = new Array(this.rowCount);
        for (var j = 0; j < this.rowCount; j++) {
            this.cells[i][j] = new Cell(this, i, j, new Size(space, space));
        }
    }
}

var Circle = function(center, radius) {

    this.center = center;
    this.radius = radius;

}

Circle.prototype = {
    contains: function(object, lax) {
        if (object instanceof Coordinates) return this.__contains(object, lax);
        if (object instanceof Rectangle) return this.__containsRectangle(object, lax);
    },
    __contains: function(coordinates) {
        var k = Math.pow(coordinates.x - this.center.x, 2) + Math.pow(coordinates.y - this.center.y, 2) - Math.pow(this.radius, 2); 
        return  k < 0;
    },
    __containsRectangle: function(rectangle, lax) {
        //console.log(rectangle);
        var points = [
            rectangle.origin, 
            rectangle.origin.translate(0, rectangle.size.height), 
            rectangle.origin.translate(rectangle.size.width, 0), 
            rectangle.origin.translate(rectangle.size.width, rectangle.size.height)
        ];

        //////////////console.log(points);
        //////////////console.log(rectangle.size);

        if (lax) {
            var ok = false;
            for (var i = 0; i < points.length; i++) {
                if (this.contains(points[i])) {
                  ok = true;
                  break;
                }
            }
            return ok;
        } else {
            var ok = true;
            for (var i = 0; i < points.length; i++) {
                if (!this.contains(points[i])) {
                  ok = false;
                  break;
                }
            }
            return ok;
        }
    }, 

    draw: function(path) {
        var circle = new paper.Path.Circle(this.center.x, this.center.y, this.radius);
        circle.strokeColor = "#FF0000";
        path.add(circle);
    }
}

var Coordinates = function(x, y) {
    this.x = x; 
    this.y = y;
}

Coordinates.prototype = {

    translate: function(width, height) {
        return new Coordinates(this.x + width, this.y + height);
    }

}

var Size = function(width, height) {
    this.width = width;
    this.height = height;
}

Size.prototype = {
    
    divide: function(times) {
        return new Size(this.width / times, this.height / times);
    }
    
}


var Rectangle = function(origin, size) {
    this.origin = origin;
    this.size = size;
}

var Ring = function(center, innerRadius, outerRadius) {
    this.center = center;
    this.innerRadius = innerRadius;
    this.outerRadius = outerRadius;
}

Ring.prototype = {

    contains: function(object, lax) {
        var innerCircle = new Circle(this.center, this.innerRadius);
        var outerCircle = new Circle(this.center, this.outerRadius);
        //////////////console.log(outerCircle);

        return !innerCircle.contains(object, !lax) && outerCircle.contains(object, lax);
    }, 

    draw: function(path) {
        new Circle(this.center, this.innerRadius).draw(path);
        new Circle(this.center, this.outerRadius).draw(path);
    }
}

Grid.prototype = {
    
    breakRandomWall: function(direction) {
        var eligibleCells = new Array();
        switch (direction) {
            case Directions.NORTH: 
                for (var i = 0; i < this.columnCount; i++) {
                    var cell = this.cellAt(i, 0);
                    if (cell.kept) {
                        eligibleCells.push(cell);
                    }
                }
                var cell = shuffle(eligibleCells)[0];
                cell.breakWall(Directions.NORTH);
                break;
            case Directions.WEST: 
                for (var j = 0; j < this.rowCount; j++) {
                    var cell = this.cellAt(0, j);
                    if (cell.kept) {
                        eligibleCells.push(cell);
                    }
                }
                var cell = shuffle(eligibleCells)[0];
                console.log(cell);
                cell.breakWall(Directions.WEST);
                break;
        }
    },
    
    split: function(times) {
        var splitGrid = new Grid(this.width, this.height, this.space / times)
        for (var i = 0; i < this.columnCount; i++) {
            for (var j = 0; j < this.rowCount; j++) {
                var splitCells = this.cellAt(i, j).split(splitGrid, times);
                for (var a = 0; a < times; a++) {
                    for (var b = 0; b < times; b++) {
                        //console.log(splitCells[a][b].walls);
                        splitGrid.cells[i * times + a][j * times + b] = splitCells[a][b];
                    }
                }
            }
        }
        return splitGrid;
    }, 
    
    optimizeWalls: function() {
        for (var i = 0; i < this.columnCount; i++) {
            for (var j = 0; j < this.rowCount; j++) {
                var cell = this.cellAt(i, j);
                var northNeighbour = cell.neighbour(Directions.NORTH);
                if (northNeighbour != null && northNeighbour.kept && northNeighbour.hasWall(Directions.SOUTH)) {
                    cell.__removeWall(Direction.NORTH);
                }
                
                var westNeighbour = cell.neighbour(Directions.WEST);
                if (westNeighbour != null && westNeighbour.kept && westNeighbour.hasWall(Directions.EAST)) {
                    cell.__removeWall(Direction.WEST);
                }
            }
        }
    },
    
    cellAt: function(i, j) {
        return this.cells[i][j];
    }, 

    draw: function (path, coordinates) {
        var rectangle = paper.Path.Rectangle(coordinates.x, coordinates.y, this.width, this.height);
        rectangle.strokeColor = "#000000";
        rectangle.strokeWidth = 1;
        path.add(rectangle);

        for (var i = 0; i < this.columnCount; i++) {
            for (var j = 0; j < this.rowCount; j++) {
                var cell = this.cellAt(i, j);
                //////////////console.log(" i = " + i + " /  j = " + j);
                cell.draw(path, coordinates.x + i * this.space, coordinates.y + j * this.space);
            }
        }
    }, 

    keepCells: function(coordinates, visitor) {
        for (var i = 0; i < this.columnCount; i++) {
            for (var j = 0; j < this.rowCount; j++) {
                var cell = this.cellAt(i, j);
                cell.kept = visitor(coordinates.translate(i * cell.size.width, j * cell.size.height), cell);
            }
        }
    }, 

    buildWalls: function(callback) {
        for (var i = 0; i < this.columnCount; i++) {
            for (var j = 0; j < this.rowCount; j++) {
                var cell = this.cellAt(i, j);
                var directions = callback(cell);
                if (directions != null) {
                    for (var k = 0; k < directions.length; k++) {
                        var direction = directions[k];
                        cell.buildWall(direction);
                    }
                }
            }
        } 
    }, 

    flagCells: function(coordinates, callback) {
        for (var i = 0; i < this.columnCount; i++) {
            for (var j = 0; j < this.rowCount; j++) {
                var cell = this.cellAt(i, j);
                var flag = callback(coordinates.translate(i * cell.size.width, j * cell.size.height), cell);
                if (flag != null) {
                    cell.flag = flag;
                }
            }
        }
    },

    mirror: function(axe) {
        var mirroredGrid = new Grid(this.width, this.height, this.space);
        for (var i = 0; i < this.columnCount; i++) {
            for (var j = 0; j < this.rowCount; j++) {
                var cell;
                switch (axe) {
                    case Axes.HORIZONTAL: 
                        cell = new Cell(mirroredGrid, i , this.rowCount - j - 1, new Size(this.space, this.space));
                        mirroredGrid.cells[i][this.rowCount - j - 1] = cell;
                        break;
                    case Axes.VERTICAL:
                        cell = new Cell(mirroredGrid, this.columnCount -i - 1, j, new Size(this.space, this.space));
                        mirroredGrid.cells[this.columnCount -i - 1][j] = cell;
                        break;
                }
                cell.kept = this.cells[i][j].kept;
                cell.walls = this.cells[i][j].walls.map(function(wall) { return wall.mirror(axe); });
                ////console.log(cell.walls);
                ////console.log(cell.size);
            }
        }
        return mirroredGrid;
    }, 

    assemble: function(that, direction) {
        switch (direction) {
            case Directions.SOUTH:
                return this.__assembleSouth(that);
            case Directions.WEST:
                return this.__assembleWest(that);
        }
    },

    __assembleWest: function(that) {
        assert(this.height == that.height);
        assert(this.space == that.space);

        var width = this.width + that.width;
        var height = this.height;
        var space = this.space;

        var grid = new Grid(width, height, space);

        for (var i = 0; i < that.columnCount; i++) {
            for (var j = 0; j < that.rowCount; j++) {

                grid.cells[i][j] = new Cell(grid, i, j, that.cells[i][j].size);
                grid.cells[i][j].kept = that.cells[i][j].kept;
                grid.cells[i][j].walls = that.cells[i][j].walls;
            }
        }

        for (var i = 0; i < this.columnCount; i++) {
            for (var j = 0; j < this.rowCount; j++) {
                grid.cells[this.columnCount + i][j] = new Cell(grid, i, j, this.cells[i][j].size);
                grid.cells[this.columnCount + i][j].kept = this.cells[i][j].kept;
                grid.cells[this.columnCount + i][j].walls = this.cells[i][j].walls;
            }
        }

        return grid;
    },

    __assembleSouth: function(that) {
        assert(this.width == that.width);
        assert(this.space == that.space);

        var width = this.width;
        var height = this.height + that.height;
        var space = this.space;

        var grid = new Grid(width, height, space);

        for (var i = 0; i < that.columnCount; i++) {
            for (var j = 0; j < that.rowCount; j++) {

                grid.cells[i][j] = new Cell(grid, i, j, that.cells[i][j].size);
                grid.cells[i][j].kept = that.cells[i][j].kept;
                grid.cells[i][j].walls = that.cells[i][j].walls;
            }
        }

        for (var i = 0; i < this.columnCount; i++) {
            for (var j = 0; j < this.rowCount; j++) {
                grid.cells[i][this.rowCount + j] = new Cell(grid, i, j, this.cells[i][j].size);
                grid.cells[i][this.rowCount + j].kept = this.cells[i][j].kept;
                grid.cells[i][this.rowCount + j].walls = this.cells[i][j].walls;
            }
        }

        return grid;
    }

}

var Maze = function() {

}

Maze.prototype = {

    carve: function(grid) {
        var visited = new Array(grid.columnCount);
        for (var i = 0; i < grid.columnCount; i++) {
            visited[i] = new Array(grid.rowCount);
            for (var j = 0; j < grid.rowCount; j++) {
                visited[i][j] = false;
            }
        }
        var cell = grid.cellAt(6, 6);
        this.__carveFrom(grid, this.__findBeginCell(grid), visited);
    }, 

    __carveFrom: function(grid, cell, visited) {
        cell.flag = Flags.MAZE;
        //////////console.log(visited);
        var directions = shuffle(cell.directions());
        ////////console.log(directions);

        directions.forEach(function(direction) {
            var neighbourCell = cell.neighbour(direction);

            if (!visited[neighbourCell.i][neighbourCell.j]) {
                visited[neighbourCell.i][neighbourCell.j] = true;
                visited[cell.i][cell.j] = true;
                ////////console.log(direction);
                cell.breakWall(direction);
                this.__carveFrom(grid, neighbourCell, visited)
            }
        }, this);
    }, 

    __findBeginCell: function(grid) {
        for (var i = 0; i < grid.columnCount; i++) {
            for (var j = 0; j < grid.rowCount; j++) {
            var cell = grid.cellAt(i, j);    
            if (cell.kept) {
                    return cell;
                }
            }
        }


    }

}