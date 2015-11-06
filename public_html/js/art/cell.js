"use strict";

define(['underscore', 'paper', 'art/flags', 'art/size', 'art/config', 'art/position', 'art/direction', 'art/wall', 'art/axis', 'art/flag'], function(_, paper, Flags, Size, Config, Position, Direction, Wall, Axis, Flag) {
    
    var Cell = function(position) {
        this.position = position;
        this.grid = undefined;
        
        this.flags = new Flags();
        
        this.walls = _.map(Direction.all(), function(direction) {
            return new Wall(direction).bindTo(this);
        }, this);
        
    };
    
    Cell.prototype = {
        
        bindTo: function(grid) {
            this.grid = grid;
            return this;
        }, 
        
        hasWall: function(direction) {
            return _.find(this.walls, function(wall) {
                return wall.direction.isEqualTo(direction);
            });
        },
        
        neighbour: function() {
            var leftOffset = 0;
            var topOffset = 0;

            for (var k = 0; k < arguments.length; k++) {
                var direction = arguments[k];
                switch (direction) {    
                    case Direction.NORTH: 
                        topOffset = -1;
                        break; 
                    case Direction.SOUTH: 
                        topOffset = +1;
                        break;
                    case Direction.EAST:
                        leftOffset = +1;
                        break;
                    case Direction.WEST: 
                        leftOffset = -1;
                        break;
                }
            }
            var i = this.position.i + leftOffset;
            var j = this.position.j + topOffset;

            return this.grid.cellAt(new Position(i, j));
        },
        
        surroundingPosts: function () {
            var offsets = [0, 1];
            
            var surroundingPositions = _.map(offsets, function(width) {
               return _.map(offsets, function(height) {
                   return this.position.translate(new Size(width, height));
               }, this);
            }, this);
            
            var surroundingPosts =  _.map(_.flatten(surroundingPositions), function(position) {
                return this.grid.postAt(position);
            }, this);
            
            return surroundingPosts;
        }, 
        
        drawAt: function(path, config, point) {
            var walls = _.filter(this.walls, function(wall) {
                var keep = false;
                switch (wall.direction) {
                    case Direction.NORTH: 
                        var northNeighbour = this.neighbour(Direction.NORTH);
                        keep = _.isUndefined(northNeighbour) || northNeighbour.flags.isLessThanOrEqualTo(this.flags);
                        break;
                        
                    case Direction.WEST: 
                        var westNeighbour = this.neighbour(Direction.WEST);
                        keep = _.isUndefined(westNeighbour) || westNeighbour.flags.isLessThanOrEqualTo(this.flags);
                        break;
                        
                    case Direction.SOUTH: 
                        var southNeighbour = this.neighbour(Direction.SOUTH);
                        keep = _.isUndefined(southNeighbour) || southNeighbour.flags.isLessThan(this.flags);
                        break;
                    
                    case Direction.EAST: 
                        var eastNeighbour = this.neighbour(Direction.EAST);
                        keep = _.isUndefined(eastNeighbour)|| eastNeighbour.flags.isLessThan(this.flags);
                        break;
                }
                return keep;
            }, this);
            
            var x = point.x + this.position.i * config.cell.size.width;
            var y = point.y + this.position.j * config.cell.size.height;

            /*var rectangle = new paper.Path.Rectangle(new paper.Point(x, y), config.cell.size);
            config.cell.shape(rectangle, this);
            path.add(rectangle);*/
            
            _.map(walls, function(wall) {
                wall.drawAt(path, config, point);
            }, this);
        }, 
        
        addPost: function(northSouthDirection, eastWestDirection) {
            var leftOffset = 0; 
            var topOffset = 0; 
            var directions = [northSouthDirection, eastWestDirection]; 
            for (var k = 0; k < directions.length; k++) {
                switch (directions[k]) {
                    case Direction.NORTH: 
                        
                        break;
                    case Direction.SOUTH: 
                        topOffset = 1;
                        break;
                    case Direction.EAST: 
                        leftOffset = 0;
                        break;
                    case Direction.WEST:
                        
                        break;
                }
            }
            var offsetPosition = new Position(leftOffset, topOffset);
            this.grid.__addPost(this.position.translate(offsetPosition));
        }, 
        
        removePost: function(northSouthDirection, eastWestDirection) {
            var leftOffset = 0; 
            var topOffset = 0; 
            var directions = [northSouthDirection, eastWestDirection]; 
            for (var k = 0; k < directions.length; k++) {
                switch (directions[k]) {
                    case Direction.NORTH: 

                        break;
                    case Direction.SOUTH: 
                        topOffset = 1;
                        break;
                    case Direction.EAST: 
                        leftOffset = 0;
                        break;
                    case Direction.WEST:
                        
                        break;
                }
            }
            var offsetPosition = new Position(leftOffset, topOffset);
            this.grid.__removePost(this.position.translate(offsetPosition));
        }, 
        
        breakWall: function(direction) {
            this.__removeWall(direction);
            var neighbourCell = this.neighbour(direction); 
            if (!_.isUndefined(neighbourCell)) {
                neighbourCell.__removeWall(direction.opposite());
            }
            
            /*_.map(direction.axis().perpendicular().directions, function(perpendicularDirection) {
                this.removePost(direction, perpendicularDirection);
            }, this);*/
        }, 

        buildWall: function(direction) {
            this.__addWall(direction);
            var neighbourCell = this.neighbour(direction); 
            if (!_.isUndefined(neighbourCell)) {
                neighbourCell.__addWall(direction.opposite());
            }
            
            /*_.map(direction.axis().perpendicular().directions, function(perpendicularDirection) {
                this.addPost(direction, perpendicularDirection);
            }, this);*/
        }, 

        __addWall: function(direction) {
            if (!this.hasWall(direction)) {
                this.walls.push(new Wall(direction).bindTo(this));
            }
        }, 

        __removeWall: function(direction) {
            for (var i = 0; i < this.walls.length; i++) {
                var wall = this.walls[i];
                if (wall.direction.isEqualTo(direction)) {
                    this.walls.splice(i, 1);
                    break;
                }
            }
        }, 
        
        copy: function() {
            var cell = _.clone(this);
            
            cell.walls = _.map(cell.walls, function(wall) {
                return _.clone(wall).bindTo(cell);
            });
            
            return cell;
        }, 
        
        unboundCopy: function() {
            var copiedCell = this.copy();
            copiedCell.grid = undefined; 
            return copiedCell;
        }, 
        
        __split: function(times) {
            var cells = new Array(times); 
            for (var i = 0; i < times; i++) {
                cells[i] = new Array(times);
                for (var j = 0; j < times; j++) {
                    cells[i][j] = new Cell(new Position(this.position.i * times + i, this.position.j * times + j));
                    cells[i][j].walls = [];
                    cells[i][j].flags = this.flags.copy();
                }
            }

            for (var k = 0; k < this.walls.length; k++) {
                var wall = this.walls[k];
                var direction = wall.direction;
                switch (direction) {
                    case Direction.NORTH: 
                        for (var i = 0; i < times; i++) {
                            cells[i][0].__addWall(Direction.NORTH);
                        }
                        break;
                    case Direction.SOUTH:
                        for (var i = 0; i < times; i++) {
                            cells[i][times - 1].__addWall(Direction.SOUTH);
                        }
                        break;

                    case Direction.EAST: 
                        for (var j = 0; j < times; j++) {
                            cells[times - 1][j].__addWall(Direction.EAST);
                        }
                        break;
                    case Direction.WEST:
                        for (var j = 0; j < times; j++) {
                            cells[0][j].__addWall(Direction.WEST);
                        }
                        break;
                }
            }

            for (var i = 1; i < times - 1; i++) {
                for (var j = 1; j < times - 1; j++) {
                    cells[i][j].walls = [];
                }
            }

            return cells;
        }, 
        
        breakAllWalls: function() {
            _.forEach(Direction.all(), function(direction) {
                this.breakWall(direction);
            }, this);
        }, 
        
        mirror: function(axis) {
            _.forEach(this.walls, function(wall) {
                wall.mirror(axis);
            });
            
            return this;
        }
        
    };
    
    return Cell;
});
