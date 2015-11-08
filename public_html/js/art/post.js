"use strict";

define(['underscore', 'paper', 'art/flags', 'art/config', 'art/direction', 'art/flag', 'art/cartesian', 'art/axis'], function(_, paper, Flags, Config, Direction, Flag, cartesian, Axis) {
    
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
        
        surroundingCells: function() {
            return _.filter(_.map(cartesian(Axis.NORTH_SOUTH.directions, Axis.EAST_WEST.directions), function(a) {
                return this.surroundingCell(a[0], a[1]);
            }, this), function(cell) {
               return !_.isUndefined(cell);
            });
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
            var that = _.clone(this);
            that.flags = _.clone(this.flags);
            return that;
        }, 
        
        unboundCopy: function() {
            var post = this.copy();
            post.grid = undefined;
            return post;
        }
        
    };
    
    return Post;
    
});
