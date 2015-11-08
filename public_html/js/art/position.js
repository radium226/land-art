"use strict";

define(['underscore'], function(_) {
    
    var Position = function(i, j) {
        this.i = i; 
        this.j = j;
    };

    Position.prototype = {
        
        isEqualTo: function(that) {
            return _.isEqual(this, that);
        }, 
        
        translate: function(sizeOrPosition) {
            if (!_.isUndefined(sizeOrPosition.i) && !_.isUndefined(sizeOrPosition.j)) {
                return new Position(this.i + sizeOrPosition.i, this.j + sizeOrPosition.j);
            } else  if (!_.isUndefined(sizeOrPosition.width) && !_.isUndefined(sizeOrPosition.height)) {
                return new Position(this.i + sizeOrPosition.width, this.j + sizeOrPosition.height);
            } else {
                return undefined;
            }
        }
        
    };

    return Position;
});
