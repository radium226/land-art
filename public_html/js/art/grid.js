"use strict";

define(['underscore', 'art/post', 'art/cell', 'art/position'], function(_, Post, Cell, Position) {
    
    var Grid = function(size) {
        this.size = size;
        
        this.posts = this.__init(true, function(position) {
            return new Post(position).bindTo(this);
        });
        
        this.cells = this.__init(false, function(position) {
            return new Cell(position).bindTo(this);
        });
        
    };
    
    Grid.prototype = {
        
        __init: function(inclusive, callback) {
            var offset = inclusive ? +1 : 0;
            return _.map(_.range(0, this.size.width + offset), function(i) {
                return _.map(_.range(0, this.size.height + offset), function(j) {
                    return _.bind(callback, this)(new Position(i, j));
                }, this);
             }, this);
        }, 
        
        __visit: function(items, callback) {
            _.each(items, function(itemsOfColumn, i) {
               _.each(itemsOfColumn, function(item, j) {
                   callback(item);
               });
           });
        }, 
        
        __isPositionOufOfRange: function(inclusive, position) {
            var i = position.i; 
            var j = position.j;
            var offset = inclusive ? +1 : 0;
            return i < 0 || j < 0 || i >= this.size.width + offset || j >= this.size.height + offset;
        },
        
        postAt: function(position) {
            return this.__isPositionOufOfRange(true, position) ? undefined : this.posts[position.i][position.j];
        }, 
        
        cellAt: function(position) {
            return this.__isPositionOufOfRange(false, position) ? undefined: this.cells[position.i][position.j];
        }, 
        
        visitCells: function(callback) {
            this.__visit(this.cells, function(cell) {
                callback(cell);
            });
        }, 
        
        visitPosts: function(callback) {
            this.__visit(this.posts, function(post) {
                callback(post);
            });
        }
        
    };
    
    return Grid;
});
