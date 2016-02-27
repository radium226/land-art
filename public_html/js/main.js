require.config({

    baseUrl: 'js',

    paths: {
        underscore: 'lib/underscore',
        ancestry: 'lib/ancestry',
        paper:  'lib/paper'
    },

    shim: {
        'paper': {
            exports: 'paper'
        },
        'underscore': {
            exports: '_'
        }
    }

});

require(['domReady', 'underscore', 'paper', 'art/grid', 'art/size', 'art/config', 'art/position', 'art/direction', 'art/axis', 'art/postStrategy', 'art/predicate', 'art/flag', 'art/shape', 'art/maze', 'art/forest', 'art/scissors'], function(domReady, _, paper, Grid, Size, Config, Position, Direction, Axis, PostStrategy, Predicate, Flag, Shape, Maze, Forest, Scissors) {
    function generateAndDrawGrid(widthAndHeightInPixels, path, gridSpecs) {
        var gridPoint = new paper.Point(5, 5);

        var randomSeed = gridSpecs.randomSeed;

        var config = new Config(randomSeed);

        var gladeColumnAndRowCount = gridSpecs.gladeColumnAndRowCount;
        var forestColumnAndRowCount = gridSpecs.forestColumnAndRowCount;
        var mazeColumnAndRowCount = gridSpecs.mazeColumnAndRowCount;
        var postsPerCellInMaze = gridSpecs.postsPerCellInMaze;
        var postSpecs = gridSpecs.postSpecs;
        var postHeight = 10;

       //
        var unsplitSouthEastColumnAndRowCount = (gladeColumnAndRowCount + forestColumnAndRowCount + mazeColumnAndRowCount) / postsPerCellInMaze;

        var unsplitSouthEastGridCellWidthAndHeightInPixels = widthAndHeightInPixels / unsplitSouthEastColumnAndRowCount / 2;
        var mazeCircleRadius = unsplitSouthEastGridCellWidthAndHeightInPixels * (gladeColumnAndRowCount + forestColumnAndRowCount + mazeColumnAndRowCount)  / postsPerCellInMaze;
        var forestCircleRadius = unsplitSouthEastGridCellWidthAndHeightInPixels * (gladeColumnAndRowCount + forestColumnAndRowCount)  / postsPerCellInMaze;
        var gladeCircleRadius = unsplitSouthEastGridCellWidthAndHeightInPixels * gladeColumnAndRowCount  / postsPerCellInMaze;

        var southEastPoint = gridPoint.add(new paper.Point(widthAndHeightInPixels / 2, widthAndHeightInPixels / 2));
        var unsplitSouthEastGrid = new Grid(new Size(unsplitSouthEastColumnAndRowCount, unsplitSouthEastColumnAndRowCount), postHeight);
        unsplitSouthEastGrid.visitPosts(function(post) {
           post.remove();
        });

        unsplitSouthEastGrid.visitCells(function(cell) {
           cell.breakAllWalls();
        });

        var unsplitSouthEastGridConfig = config.modify({
            cell: {
                size: new Size(unsplitSouthEastGridCellWidthAndHeightInPixels, unsplitSouthEastGridCellWidthAndHeightInPixels)
            }
        });

        var mazeCircle = Shape.circle(southEastPoint, mazeCircleRadius);
        /*mazeCircle.addTo(path, function(shape) {
            shape.fillColor = "#EEEEFF";
        });*/

        var forestCircle = Shape.circle(southEastPoint, forestCircleRadius);
        /*forestCircle.addTo(path, function(shape) {
            shape.fillColor = "#FFFFEE";
        });*/

        var gladeCircle = Shape.circle(southEastPoint, gladeCircleRadius);
        /*gladeCircle.addTo(path, function(shape) {
            shape.fillColor = "#FFEEFF";
        });*/

        unsplitSouthEastGrid.filterAndVisitCells(Predicate.cellBetweenCircles(forestCircle, mazeCircle, southEastPoint, unsplitSouthEastGridConfig, 3), function(cell) {
            cell.flags.set(Flag.MAZE);
            cell.buildAllWalls();
        });

        Maze.carve(unsplitSouthEastGrid);

        unsplitSouthEastGrid.visitPosts(function(post) {
           if (post.isWallEnd()) {
               post.add();
           }
        });


        var southEastGrid = unsplitSouthEastGrid.split(postsPerCellInMaze, PostStrategy.ADD_WALL_END_POST_ONLY);
        var southEastGridConfig = config.modify({
            cell: {
                size: new Size(unsplitSouthEastGridCellWidthAndHeightInPixels / postsPerCellInMaze, unsplitSouthEastGridCellWidthAndHeightInPixels / postsPerCellInMaze)
            }
        });

        southEastGrid.filterAndVisitCells(Predicate.cellBetweenCircles(Shape.circle(southEastPoint, mazeCircleRadius - southEastGridConfig.cell.size.width), Shape.circle(southEastPoint, mazeCircleRadius), southEastPoint, southEastGridConfig, 2), function(cell) {
            if (!cell.flags.isSet(Flag.MAZE)) {
                _.forEach(cell.surroundingPosts(), function(post) {
                   post.add();
                });
            }
        });



        var southWestGrid = southEastGrid.mirror(Axis.NORTH_SOUTH);
        var southGrid = southWestGrid.assemble(Direction.EAST, southEastGrid);

        /*southEastGrid.filterAndVisitPosts(Predicate.postOnOrOutsideCircle(mazeCircle, southEastPoint, southEastGridConfig), function(post) {
            var o = _.groupBy(post.surroundingCells(), function(cell) {
                return (_.any(cell.surroundingCells(), function(cell) {return cell.flags.isSet(Flag.MAZE)})) ? "flaggedMaze" : "notFlaggedMaze";
            });

            var flaggedMaze = (_.isUndefined(o.flaggedMaze)) ? [] : o.flaggedMaze;
            var notFlaggedMaze = (_.isUndefined(o.notFlaggedMaze)) ? [] : o.notFlaggedMaze;
            if (notFlaggedMaze.length > 0 && flaggedMaze.length > 0) {
                console.log(o);
                post.add();
            }
        });*/

        var northGrid = southGrid.mirror(Axis.EAST_WEST);
        var grid = northGrid.assemble(Direction.SOUTH, southGrid);

        grid.filterAndVisitPosts(Predicate.postBetweenCircles(gladeCircle, forestCircle, gridPoint, southEastGridConfig), function(post) {
            post.flags.set(Flag.FOREST);
        });

        Forest.plant(grid);

        Scissors.cut(grid, postSpecs);

        grid.drawAt(path, southEastGridConfig.modify({
          cell: {
            size: new Size((widthAndHeightInPixels - 10) / grid.size.height, (widthAndHeightInPixels - 10) / grid.size.width)
          }
        }), gridPoint);

        return grid;
    }

    function buttonCallback(widthAndHeightInPixels, path) {
      return function() {
        var randomSeed = $('#randomSeed').val();
        Math.seedrandom(randomSeed);
        var postSpecs = JSON.parse($('#postSpecs').val());
        var gladeColumnAndRowCount = parseInt($('#gladeColumnAndRowCount').val()) * 2;
        var forestColumnAndRowCount = parseInt($('#forestColumnAndRowCount').val()) * 2;
        var mazeColumnAndRowCount = parseInt($('#mazeColumnAndRowCount').val()) * 2;
        var postsPerCellInMaze = parseInt($('#postsPerCellInMaze').val());
        var gridSpecs = {
          gladeColumnAndRowCount: gladeColumnAndRowCount, //,
          forestColumnAndRowCount: forestColumnAndRowCount, //$('#forestColumnAndRowCount').val(),
          mazeColumnAndRowCount: mazeColumnAndRowCount, //$('#mazeColumnAndRowCount').val(),
          postsPerCellInMaze: postsPerCellInMaze, //$('#postsPerCellInMaze').val(),
          postSpecs: postSpecs,
          randomSeed: randomSeed
        };
        console.log('Generating and drawing... ');
        var grid = generateAndDrawGrid(widthAndHeightInPixels, path, gridSpecs);
        console.log('Done! ');
        var postCount = grid.filterAndCountPosts(Predicate.postFlagged(Flag.ADDED));
        $('#postCount').val(postCount);
      }
    }

    domReady(function() {
        // On initialise le canvas et PaperJS
        var mazeCanvas = $('#maze');
        var widthAndHeightInPixels = 100 * (Math.ceil(mazeCanvas.width() / 100) - 1);
        mazeCanvas.css({
          height: widthAndHeightInPixels + "px",
          width: widthAndHeightInPixels + "px"
        });
        paper.setup(mazeCanvas.get(0));
        var path = new paper.Path();

        $('#generateAndDrawGrid').click(function() {
            paper.project.activeLayer.removeChildren();
            paper.view.draw();
            return buttonCallback(widthAndHeightInPixels, path)();
            paper.view.draw();
        });


    });
});
