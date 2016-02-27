"use strict";

define(['underscore', 'paper', 'art/predicate', 'art/flag'], function(_, paper, Predicate, Flag) {

    var Scissors = function() {

    };

    Scissors.prototype = {

        __cut: function(grid, postSpecs) {
          var count = postSpecs.length;
          var gridWidth = grid.size.width;
          var specs = new Array(count);
          for (var i = 0; i < count; i++) {
            specs[i] = {
              min: Math.ceil(i * ((gridWidth + 1) / count)),
              max: Math.ceil((i + 1) * ((gridWidth + 1) / count)),
              postSpec: postSpecs[i],

            };
          }
          grid.visitPosts(function(post) {
            var i = post.position.i;
            var postSpec = _.find(specs, function(spec) {
              return (spec.min <= i && i < spec.max);
            }).postSpec;
            post.height = postSpec.height;
            post.color = postSpec.color;
          })
        }

    };

    Scissors.cut = function(grid, postSpecs) {
        var scissors = new Scissors();
        scissors.__cut(grid, postSpecs);
    };

    return Scissors;

});
