"use strict";

define(['underscore', 'art/direction'], function(_, Direction) {
    
    var Axis = function(directions) {
        
        this.directions = directions;
        
    };
    
    Axis.prototype = {
        
        isEqualTo: function(that) {
            return _.isEqual(this, that);
        },
        
        isDefinedBy: function(direction) {
            return !_.isUndefined(
                    _.find(this.directions, function(axisDirection) {
                        return axisDirection.isEqualTo(direction);
                    })
                );
        }, 
        
        mirror: function(direction) {
            var mirroredDirection = direction;
            if (!this.isDefinedBy(direction)) {
                var perpendicularAxis = _.find(Axis.all(), function(that) {
                    return !this.isEqualTo(that);
                }, this);
                
                mirroredDirection = _.find(perpendicularAxis.directions, function(axisDirection) {
                    return !axisDirection.isEqualTo(direction);
                });
            }
            return mirroredDirection;           
        }, 
        
        perpendicular: function() {
            return _.find(Axis.all(), function(that) {
                return !this.isEqualTo(that);
            }, this);
        }
        
    };
    
    Axis.NORTH_SOUTH = new Axis([Direction.NORTH, Direction.SOUTH]);
    Axis.EAST_WEST = new Axis([Direction.EAST, Direction.WEST]);
    
    Axis.all = function() {
        return [Axis.NORTH_SOUTH, Axis.EAST_WEST];
    };
    
    return Axis;
});
