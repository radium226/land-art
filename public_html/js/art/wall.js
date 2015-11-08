"use strict";

define(['underscore', 'paper', 'art/config', 'art/direction'], function(_, paper, Config, Direction) {
    
    var Wall = function(direction) {
        this.direction = direction;
        this.cell = undefined;
    };
    
    Wall.prototype = {
        
        bindTo: function(cell) {
            this.cell = cell;
            return this;
        }, 
        
        opposite: function() {
            this.direction = this.direction.opposite();
        }, 
        
        mirror: function(axis) {
            this.direction = this.direction.mirror(axis);
        }, 
        
        isEqualTo: function(that) {
            return _.isEqual(this, that);
        }, 
        
        drawAt: function(path, config, point) {
            var cellSize = config.cell.size;
            var x = point.x + this.cell.position.i * cellSize.width;
            var y = point.y + this.cell.position.j * cellSize.height;
            
            var beginPoint = null; 
            var endPoint = null; 
            switch(this.direction) {
                case Direction.EAST:
                    beginPoint = new paper.Point(x + cellSize.width, y);
                    endPoint = beginPoint.add(new paper.Point(0, cellSize.height));
                    break;
                    
                case Direction.WEST: 
                    beginPoint = new paper.Point(x, y);
                    endPoint = beginPoint.add(new paper.Point(0, cellSize.height));
                    break;
                    
                case Direction.SOUTH: 
                    beginPoint = new paper.Point(x, y + cellSize.height);
                    endPoint = beginPoint.add(new paper.Point(cellSize.width, 0));
                    break;
                    
                case Direction.NORTH:
                    beginPoint = new paper.Point(x, y);
                    endPoint = beginPoint.add(new paper.Point(cellSize.width, 0));
                    break;
            }
            
            var line = new paper.Path.Line(beginPoint, endPoint);
            config.wall.shape(line, this);
            path.add(line);
        }, 
        
        unboundCopy: function() {
            var wall = _.clone(this);
            this.cell = undefined;
            return wall;
        }
        
    };
    
    return Wall;
});
