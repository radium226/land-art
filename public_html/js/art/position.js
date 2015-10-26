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
        
        translate: function(size) {
            return new Position(this.i + size.width, this.j + size.height);
        }
        
    };

    return Position;
});
