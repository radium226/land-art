"use strict";

define(['underscore', 'paper', 'art/post', 'art/cell', 'art/position', 'art/direction', 'art/cartesian', 'art/axis', 'art/flag', 'art/size'], function(_, paper, Post, Cell, Position, Direction, cartesian, Axis, Flag, Size) {
    
    var Grid = function(size) {
        
        this.size = size;
        
        this.posts = this.__init(true, function(position) {
            var post = new Post(position).bindTo(this);
            post.flags.set(Flag.ADDED);
            return post;
        });
        
        this.cells = this.__init(false, function(position) {
            return new Cell(position).bindTo(this);
        });
        
    };
    
    Grid.prototype = {
        
        __init: function(inclusive, callback) {
            var offset = inclusive ? +1 : 0;
            return _.map(_.range(0, this.size.width + offset), function(i) {
                return _.map(_.range(0, this.size.height + offset), function(j) {
                    return _.bind(callback, this)(new Position(i, j));
                }, this);
             }, this);
        }, 
        
        __visit: function(items, callback) {
            _.each(items, function(itemsOfColumn, i) {
               _.each(itemsOfColumn, function(item, j) {
                   callback(item);
               });
           });
        }, 
        
        __isPositionOufOfRange: function(inclusive, position) {
            var i = position.i; 
            var j = position.j;
            var offset = inclusive ? +1 : 0;
            return i < 0 || j < 0 || i >= this.size.width + offset || j >= this.size.height + offset;
        },
        
        postAt: function(position) {
            return this.__isPositionOufOfRange(true, position) ? undefined : this.posts[position.i][position.j];
        }, 
        
        __addPost: function(position) {
            this.posts[position.i][position.j].flags.set(Flag.ADDED).unset(Flag.REMOVED);
        }, 
        
        __removePost: function(position) {
            this.posts[position.i][position.j].flags.set(Flag.REMOVED).unset(Flag.ADDED);
        }, 
        
        cellAt: function(position) {
            return this.__isPositionOufOfRange(false, position) ? undefined: this.cells[position.i][position.j];
        }, 
        
        visitCells: function(callback) {
            this.__visit(this.cells, function(cell) {
                callback(cell);
            });
        }, 
        
        filterAndVisitPosts: function(predicate, callback) {
            this.visitPosts(function(post) {
                if (predicate(post)) {
                    callback(post);
                }
            });
        },
        
        filterAndVisitCells: function(predicate, callback) {
            this.visitCells(function(cell) {
                if (predicate(cell)) {
                    callback(cell);
                }
            });
        },
        
        visitPosts: function(callback) {
            this.__visit(this.posts, function(post) {
                callback(post);
            });
        }, 
        
        drawAt: function(path, config, coordinates) {
            this.visitCells(function(cell) {
                cell.drawAt(path, config, coordinates);
            });
            
            this.visitPosts(function(post) {
                if (!_.isNull(post)) {
                    post.drawAt(path, config, coordinates); 
                }
            });
            
            var rectangle = new paper.Path.Rectangle(coordinates, new paper.Size(this.size.width * config.cell.size.width, this.size.height * config.cell.size.height));
            config.grid.shape(rectangle);
            path.add(rectangle);
        }, 
        
        split: function(times, postStrategy) {
            
            var splitGridSize = this.size.multiply(times);
            var splitGrid = new Grid(splitGridSize);           
            
            for (var i = 0; i < this.size.width; i++) {
                for (var j = 0; j < this.size.height; j++) {
                    var splitCells = _.map(this.cellAt(new Position(i, j)).__split(times), function(columnSplitCells) {
                        return _.map(columnSplitCells, function(splitCell) {
                            return splitCell.bindTo(splitGrid);
                        });
                    });
                    
                    for (var a = 0; a < times; a++) {
                        for (var b = 0; b < times; b++) {
                            splitGrid.cells[i * times + a][j * times + b] = splitCells[a][b];
                        }
                    }
                }
            }
            
            // On fix le problème lié au rafraichissement des Posts
            _.forEach(splitGrid.cells, function(columnCells) {
                _.forEach(columnCells, function(cell) {
                    var directionsOfWallsToBuild = _.map(cell.walls, function(wall) { return wall.direction; });
                    _.forEach(directionsOfWallsToBuild, function(direction) {
                       cell.buildWall(direction);
                    });

                    var directionsOfWallsToBreak = Direction.complementary(directionsOfWallsToBuild);
                    _.forEach(directionsOfWallsToBreak, function(direction) {
                       cell.breakWall(direction);
                    });
                }, this);
            }, this);
            
            postStrategy(splitGrid);
            
            return splitGrid;
        }, 
        
        __surroundingCellAt: function(postPosition) {
            var leftOffset = 0;
            var topOffset = 0;

            for (var k = 1; k < arguments.length; k++) {
                var direction = arguments[k];
                switch (direction) {    
                    case Direction.NORTH: 
                        topOffset = -1;
                        break; 
                    case Direction.SOUTH: 
                        topOffset = 0;
                        break;
                    case Direction.EAST:
                        leftOffset = 0;
                        break;
                    case Direction.WEST: 
                        leftOffset = -1;
                        break;
                }
            }

            return this.cellAt(postPosition.translate(new Position(leftOffset, topOffset)));
        }, 
        
        __isWallEndAt: function(postPosition) {
            return _.any(cartesian(Axis.NORTH_SOUTH.directions, Axis.EAST_WEST.directions), function(directions) {
                var northSouthDirection = directions[0];
                var eastWestDirection = directions[1];
                
                var surroundingCell = this.__surroundingCellAt(postPosition, northSouthDirection, eastWestDirection);
                var end = false;
                if (!_.isUndefined(surroundingCell)) {
                    end = (surroundingCell.hasWall(northSouthDirection.opposite()) || surroundingCell.hasWall(eastWestDirection.opposite()));
                }
                return end;
                
            }, this);
        }, 
        
        __copyAndBindCellAt: function(cell, position) {
            var copiedCell = cell.unboundCopy().bindTo(this);
            copiedCell.position = position;
            this.cells[position.i][position.j] = copiedCell;
        }, 
        
        __copyAndBindPostAt: function(post, position) {
            var copiedPost = post.unboundCopy().bindTo(this);
            copiedPost.position = position;
            this.posts[position.i][position.j] = copiedPost;
        }, 
        
        assemble: function(direction, that) {
            return Grid.__assemble(this, direction, that);
        }, 
        
        mirror: function(axis) {
            switch (axis) {
                case Axis.NORTH_SOUTH:
                    var width = this.size.width;
                    var height = this.size.height;
                    var mirroredGrid = new Grid(new Size(width, height));
                    this.size.forEachPosition(function(position) {
                        var mirroredCellPosition = new Position(width - position.i - 1, position.j);
                        var mirroredPostPosition = new Position(width - position.i, position.j);
                        if (position.i !== width && position.j !== height) {
                            var cell = this.cellAt(position);
                            mirroredGrid.__copyAndBindCellAt(cell, mirroredCellPosition);
                            mirroredGrid.cellAt(mirroredCellPosition).mirror(axis);
                        }
                        
                        mirroredGrid.__copyAndBindPostAt(this.postAt(position), mirroredPostPosition);
                    }, true, this);
                    return mirroredGrid;
                    break
                case Axis.EAST_WEST: 
                    var width = this.size.width;
                    var height = this.size.height;
                    var mirroredGrid = new Grid(new Size(width, height));
                    this.size.forEachPosition(function(position) {
                        var mirroredCellPosition = new Position(position.i, height - position.j - 1);
                        var mirroredPostPosition  = new Position(position.i, height - position.j);
                        if (position.i !== width && position.j !== height) {
                            var cell = this.cellAt(position);
                            mirroredGrid.__copyAndBindCellAt(cell, mirroredCellPosition);
                            mirroredGrid.cellAt(mirroredCellPosition).mirror(axis);
                        }
                        mirroredGrid.__copyAndBindPostAt(this.postAt(position), mirroredPostPosition);
                    }, true, this);
                    return mirroredGrid;
                    break;
            }
            
        }, 
                
        filterAndCountPosts: function(predicate) {
            return _.filter(_.flatten(this.posts), predicate).length;
        }
        
    };
    
    Grid.__assemble = function(oneGrid, direction, otherGrid) {
        switch (direction) {
            case Direction.NORTH: 
                return Grid.__assemble(otherGrid, Direction.SOUTH, oneGrid);
                break;
                
            case Direction.SOUTH:
                var height = oneGrid.size.height + otherGrid.size.height;
                var width = Math.min(oneGrid.size.width, otherGrid.size.width);
                
                var assembledGrid = new Grid(new Size(width, height));
                for (var i = 0; i <= assembledGrid.size.width; i++) {
                    for (var j = 0; j <= oneGrid.size.height; j++) {
                        if (i !== assembledGrid.size.width && j !== oneGrid.size.height) {
                            var cell = oneGrid.cellAt(new Position(i, j));
                            assembledGrid.__copyAndBindCellAt(cell, new Position(i, j));
                        }
                        var post = oneGrid.postAt(new Position(i, j));
                        assembledGrid.__copyAndBindPostAt(post, new Position(i, j));
                    }
                }
                
                for (var i = 0; i <= assembledGrid.size.width; i++) {
                    for (var j = 0; j <= otherGrid.size.height; j++) {
                        if (i !== assembledGrid.size.width && j !== otherGrid.size.height) {
                            var cell = otherGrid.cellAt(new Position(i, j));
                            assembledGrid.__copyAndBindCellAt(cell, new Position(i , oneGrid.size.height + j));
                        }
                        var post = otherGrid.postAt(new Position(i, j));
                        assembledGrid.__copyAndBindPostAt(post, new Position(i, oneGrid.size.height + j));
                    }
                }
                
                return assembledGrid;
                break;
                
            case Direction.WEST: 
                return Grid.__assemble(otherGrid, Direction.EAST, oneGrid);
                break;
                
            case Direction.EAST:
                var width = oneGrid.size.width + otherGrid.size.width;
                var height = Math.min(oneGrid.size.height, otherGrid.size.height);
                
                var assembledGrid = new Grid(new Size(width, height));
                for (var i = 0; i <= oneGrid.size.width; i++) {
                    for (var j = 0; j <= height; j++) {
                        if (i !== oneGrid.size.width && j !== height) {
                            var cell = oneGrid.cellAt(new Position(i, j));
                            assembledGrid.__copyAndBindCellAt(cell, new Position(i, j));
                        }
                        var post = oneGrid.postAt(new Position(i, j));
                        assembledGrid.__copyAndBindPostAt(post, new Position(i, j));
                    }
                }
                
                for (var i = 0; i <= otherGrid.size.width; i++) {
                    for (var j = 0; j <= height; j++) {
                        if (i !== otherGrid.size.width && j !== height) {
                            var cell = otherGrid.cellAt(new Position(i, j));
                            assembledGrid.__copyAndBindCellAt(cell, new Position(oneGrid.size.width + i , j));
                        }
                        var post = otherGrid.postAt(new Position(i, j));
                        assembledGrid.__copyAndBindPostAt(post, new Position(oneGrid.size.width + i, j));
                    }
                }
                
                return assembledGrid;
                break;
        }
    };
    
    return Grid;
});
