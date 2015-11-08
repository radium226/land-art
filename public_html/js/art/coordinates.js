define([], function() {
    "use strict";
    
    var Coordinates = function(x, y) {
        this.x = x; 
        this.y = y;
    };

    Coordinates.prototype = {

        translate: function(width, height) {
            return new Coordinates(this.x + width, this.y + height);
        }

    };
    
    return Coordinates;
});
