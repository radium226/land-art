"use strict";

define(['underscore', 'art/size', 'art/flag', 'paper'], function(_, Size, Flag, paper) {
    var Config = function() {
        this.post.pointAt = _.bind(function(point, post) {
            var x = point.x + post.position.i * this.cell.size.width;
            var y = point.y + post.position.j * this.cell.size.height;
            return new paper.Point(x, y);
        }, this);
        
        this.post.circleAt = _.bind(function(point, post) {
            var centerPoint = this.post.pointAt(point, post);
            var radius = this.post.radius;
            
            var circle = new paper.Path.Circle(centerPoint, radius);
            return circle;
        }, this);
        
        this.modify = function(that) {
            return _.extend(this, that);
        };
    };
    
    Config.prototype = {
        cell: {
            size: new Size(10, 10), 
            shape: function(shape, cell) {
                /*shape.strokeColor = "#EEEEEE";
                shape.strokeWidth = 1;*/
            }
        }, 
        grid: {
            shape: function(shape) {
                shape.strokeColor = "#000000";
                shape.strokeWidth = 1;
                shape.strokeCap = 'round';
                shape.dashArray = [4, 4];
            }
        }, 
        wall: {
            shape: function(shape, wall) {
                /*if (wall.cell.flags.isSet(Flag.MAZE)) {
                    shape.strokeColor = "#00FF00";
                    shape.strokeWidth = 1;
                } else {
                    shape.strokeColor = "#AAAAAA";
                    shape.strokeWidth = 1;
                    shape.strokeCap = 'round';
                    shape.dashArray = [2, 2];
                }*/
            }
        }, 
        post: {
            shape: function(shape, post) {
                if (post.isAdded()) {
                    if (post.flags.isSet(Flag.MAZE) || post.flags.isSet(Flag.FOREST)) {
                        shape.fillColor = "#FF0000";
                    }
                }/* else {
                    shape.fillColor = "#FFCCCC";
                }*/
            }, 
            radius: 2
        }, 
        
        copy: function() {
            return _.clone(this);
        }
    };
    
    return Config;   
});
