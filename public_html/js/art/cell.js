"use strict";

define(['underscore', 'art/flags', 'art/size'], function(_, Flags, Size) {
    
    var Cell = function(position) {
        this.position = position;
        this.grid = undefined;
        
        this.flags = new Flags();
        
    };
    
    Cell.prototype = {
        
        bindTo: function(grid) {
            this.grid = grid;
            return this;
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
        }
        
    };
    
    return Cell;
});
