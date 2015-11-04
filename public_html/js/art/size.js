define(['underscore', 'paper', 'art/position'], function(_, paper, Position) {
    "use strict";
    
    var Size = function(width, height) {
        this.width = width;
        this.height = height;
    };

    Size.prototype = {

        divide: function(times) {
            return new Size(this.width / times, this.height / times);
        }, 
        
        isEqualTo: function(that) {
            return _.isEqual(this, that);
        }, 
        
        toPaper: function() {
            return new paper.Size(this.width, this.height);
        }, 
        
        multiply: function(times) {
            return new Size(this.width * times, this.height * times);
        }, 
        
        forEachPosition: function(callback, inclusive, context) {
            _.forEach(_.range(0, this.width + (inclusive ? 1 : 0)), function(i) {
                _.forEach(_.range(0, this.height + (inclusive ? 1 : 0)), function(j) {
                    var position = new Position(i, j);
                    _.bind(callback, context)(position);
                }, this);
            }, this);
        }

    };
    
    return Size;
});
