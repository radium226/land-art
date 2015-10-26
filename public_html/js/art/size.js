define(['underscore'], function(_) {
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
        }

    };
    
    return Size;
});
