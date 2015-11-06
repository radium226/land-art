"use strict";

define(['underscore', 'art/direction', 'paper'], function(_, Direction, paper) {

    var Predicate = {
        
        cellInsideCircle: function(circle, gridPoint, config, threshold) {
            return function(cell) {
                var posts = cell.surroundingPosts();
                //var f = lax ? _.any : _.all;
                //console.log(_.filter(_.map(posts, Predicate.postInsideCircle(circle, gridPoint, config, threshold)), function(bool) { return bool; }).length);
                return _.filter(_.map(posts, Predicate.postInsideCircle(circle, gridPoint, config)), function(bool) { return bool; }).length >= threshold;
            };
        }, 
        
        cellOutsideCircle: function(circle, gridPoint, config, threshold) {
            return function(cell) {
                var posts = cell.surroundingPosts();
                return _.filter(_.map(posts, Predicate.postOutsideCircle(circle, gridPoint, config)), function(bool) { return bool; }).length >= threshold;
            };
        }, 
        
        postInsideCircle: function(circle, gridPoint, config) {
            return function (post) {
                return Predicate.__distanceBetween(config.post.pointAt(gridPoint, post), circle.center) < circle.radius;
            };
        }, 
        
        postOutsideCircle: function(circle, gridPoint, config) {
            return function (post) {
                return Predicate.__distanceBetween(config.post.pointAt(gridPoint, post), circle.center) > circle.radius;
            };
        }, 
        
        __or: function(f, g) {
            return function(o) {
                return f(o) || g(o);
            };
        }, 
        
        __and: function(f, g) {
            return function(o) {
                return f(o) && g(o);
            };
        }, 
        
        postOnCircle: function(circle, gridPoint, config) {
            return function (post) {
                return Predicate.__distanceBetween(config.post.pointAt(gridPoint, post), circle.center) == circle.radius;
            };
        }, 
        
        __distanceBetween: function(onePoint, otherPoint) {
            return Math.sqrt(Math.pow(onePoint.x - otherPoint.x, 2) + Math.pow(onePoint.y - otherPoint.y, 2)); 
        }, 
        
        cellBetweenCircles: function(innerCircle, outerCircle, point, config, threshold) {
            return function(cell) {
                return Predicate.cellOutsideCircle(innerCircle, point, config, threshold)(cell) && Predicate.cellInsideCircle(outerCircle, point, config, threshold)(cell);
            };
        }
        
        
        
    };
    
    return Predicate;

});
