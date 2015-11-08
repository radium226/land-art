"use strict";

define(['paper'], function(paper) {
   
    var Shape = {
        
        circle: function(center, radius) {
            return {
                center: center, 
                radius: radius, 
                addTo: function(path, callback) {
                    var shape = new paper.Path.Circle(center, radius);
                    callback(shape);
                    path.add(shape);
                }
            };
        }
        
    };
    
    return Shape;
    
});