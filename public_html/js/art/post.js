"use strict";

define(['underscore', 'art/flags'], function(_, Flags) {
    
    var Post = function(position) {
        this.position = position;
        this.grid = undefined;
        this.flags = new Flags();
    };
    
    Post.prototype = {
        
        bindTo: function(grid) {
            this.grid = grid;
            return this;
        }
        
    };
    
    return Post;
    
});
