"use strict";

define(['underscore', 'paper', 'art/flag', 'art/direction', 'art/position'], function(_, paper, Flag, Direction, Position) {
   
    var Maze = function() {
        
    };
    
    Maze.prototype = {

        __carve: function(grid) {
            var visited = new Array(grid.size.width);
            for (var i = 0; i < grid.size.width; i++) {
                visited[i] = new Array(grid.size.height);
                for (var j = 0; j < grid.size.height; j++) {
                    visited[i][j] = false;
                }
            }
            
            this.__carveFrom(grid, this.__findBeginCell(grid), visited);
        }, 

        __carveFrom: function(grid, cell, visited) {
            //////////console.log(visited);
            var directions = _.shuffle(this.__availableDirections(cell));
            ////////console.log(directions);

            _.forEach(directions, function(direction) {
                var neighbourCell = cell.neighbour(direction);

                if (!visited[neighbourCell.position.i][neighbourCell.position.j]) {
                    visited[neighbourCell.position.i][neighbourCell.position.j] = true;
                    visited[cell.position.i][cell.position.j] = true;
                    cell.breakWall(direction);
                    this.__carveFrom(grid, neighbourCell, visited); 
                }
            }, this);
        }, 
        
        __availableDirections: function(cell) {
            return _.filter(Direction.all(), function(direction) {
                var neighbourCell = cell.neighbour(direction);
                return !_.isUndefined(neighbourCell) && neighbourCell.flags.isSet(Flag.MAZE);
            });
        }, 

        __findBeginCell: function(grid) {
            for (var i = 0; i < grid.size.width; i++) {
                for (var j = 0; j < grid.size.height; j++) {
                var cell = grid.cellAt(new Position(i, j));    
                if (cell.flags.isSet(Flag.MAZE)) {
                        return cell;
                    }
                }
            }

        }

    };
    
    Maze.carve = function(grid) {
        var maze = new Maze();
        maze.__carve(grid);
    };
    
    return Maze;
    
});