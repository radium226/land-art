"use strict";

define(['underscore'], function(_) {
   
    return function() {
        return _.reduce(arguments, function(a, b) {
            return _.flatten(_.map(a, function(x) {
                return _.map(b, function(y) {
                   return x.concat([y]); 
                });
            }), true);
        }, [ [] ]);
    };
    
});
   