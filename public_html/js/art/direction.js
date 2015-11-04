"use strict";

define(['underscore'], function(_) {
    
    var Direction = function(label) {
        
        this.__label = label;
        
    };
    
    Direction.prototype = {
        
        isEqualTo: function(that) {
            return _.isEqual(this, that);
        },
        
        defines: function(axis) {
            return axis.isDefinedBy(this);
        }, 
        
        axis: function() {
            var Axis = require('art/axis');
            
            return _.find(Axis.all(), function(axis) {
                return axis.isDefinedBy(this);
            }, this);
        }, 
        
        opposite: function() {
            var Axis = require('art/axis'); // Pour gérer les dépendances circulaires. 
            
            var axis = _.find(Axis.all(), function(axis) {
                return !this.defines(axis);
            }, this);
            return axis.mirror(this);
        }, 
        
        mirror: function(axis) {
            return axis.mirror(this);
        }
        
    };
    
    Direction.NORTH = new Direction("NORTH");
    Direction.SOUTH = new Direction("SOUTH");
    Direction.EAST = new Direction("EAST");
    Direction.WEST = new Direction("WEST");
    
    Direction.all = function() {
        return [Direction.NORTH, Direction.SOUTH, Direction.EAST, Direction.WEST];
    };
    
    Direction.complementary = function(directions) {
        var complementaryDirections = _.reject(Direction.all(), function(oneDirection) {
            return !_.isUndefined(_.find(directions, function(otherDirection) {
                return oneDirection.isEqualTo(otherDirection);
            }));
        });
        
        return complementaryDirections;
    };
    
    return Direction;
});
