"use strict";

define(['underscore', 'paper', 'art/predicate', 'art/flag'], function(_, paper, Predicate, Flag) {
   
    var Forest = function() {
        
    };
    
    Forest.prototype = {

        __plant: function(grid) {
            grid.filterAndVisitPosts(Predicate.postFlagged(Flag.FOREST), function(post) {
                if(_.shuffle([0, 1, 2])[0] < 2) {
                    post.add();
                }
            });
        }

    };
    
    Forest.plant = function(grid) {
        var forest = new Forest();
        forest.__plant(grid);
    };
    
    return Forest;
    
});