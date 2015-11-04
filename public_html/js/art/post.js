"use strict";

define(['underscore', 'paper', 'art/flags', 'art/config', 'art/direction', 'art/flag'], function(_, paper, Flags, Config, Direction, Flag) {
    
    var Post = function(position) {
        this.position = position;
        this.grid = undefined;
        this.flags = new Flags();
    };
    
    Post.prototype = {
        
        bindTo: function(grid) {
            this.grid = grid;
            return this;
        }, 
        
        drawAt: function(path, config, point) {
            var circle = config.post.circleAt(point, this);
            config.post.shape(circle, this);
            path.add(circle);
        }, 
        
        surroundingCell: function(northSouthDirection, eastWestDirection) {
            return this.grid.__surroundingCellAt(this.position, northSouthDirection, eastWestDirection);
        }, 
        
        isWallEnd: function() {
            return this.grid.__isWallEndAt(this.position);
        }, 
        
        remove: function() {
            this.grid.__removePost(this.position);
        }, 
        
        add: function() {
            this.grid.__addPost(this.position);
        }, 
        
        isAdded: function() {
            return this.flags.isSet(Flag.ADDED);
        },
        
        isRemoved: function() {
            return this.flags.isSet(Flag.REMOVED);
        }, 
        
        copy: function() {
            return _.clone(this);
        }, 
        
        unboundCopy: function() {
            var post = this.copy();
            post.grid = undefined;
            return post;
        }
        
    };
    
    return Post;
    
});
