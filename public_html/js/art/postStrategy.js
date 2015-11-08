"use strict";
    
define(['underscore', 'art/grid', 'art/flag'], function(_, Grid, Flag) {
    
    var PostStrategy = {
        ADD_WALL_END_POST_ONLY: function(grid) {
            grid.visitPosts(function(post) {
                if (post.isWallEnd()) {
                    post.add();
                } else {
                    post.remove();
                }
            });
        }, 
        
        NONE: function(grid) {
            
        }
    };

    return PostStrategy;
    
});
