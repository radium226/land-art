require.config({
    
    baseUrl: 'js', 
   
    paths: {
        underscore: 'lib/underscore', 
        ancestry: 'lib/ancestry', 
        paper:  'lib/paper'
    }, 

    shim:{
        'paper': {
            exports: 'paper'
        }, 
        'underscore': {
            exports: '_'
        },
    }
   
});

require(['domReady', 'underscore', 'paper', 'art/grid', 'art/size', 'art/config', 'art/position', 'art/direction', 'art/axis', 'art/postStrategy', 'art/predicate', 'art/flag', 'art/shape', 'art/maze', 'art/forest'], function(domReady, _, paper, Grid, Size, Config, Position, Direction, Axis, PostStrategy, Predicate, Flag, Shape, Maze, Forest) {
    domReady(function() {
        var canvas = document.getElementById('maze');
        paper.setup(canvas);
        var path = new paper.Path();
        
        
        
        /*grid.cellAt(new Position(1, 1)).breakWall(Direction.NORTH);
        grid.postAt(new Position(0, 0)).remove();
        
        var mirroredGrid = grid.mirror(Axis.NORTH_SOUTH);
        grid = grid.assemble(Direction.SOUTH, mirroredGrid);
        
        grid = grid.split(3, PostStrategy.ADD_WALL_END_POST_ONLY);
        
        grid = grid.assemble(Direction.EAST, grid);
        
        grid = grid.assemble(Direction.WEST, grid);
        
        grid = grid.assemble(Direction.NORTH, grid); */

        
        var config = new Config();
        
        var widthAndHeightInPixels = 500;
       
       
        var gridPoint = new paper.Point(50, 50);
        
        var gladeColumnAndRowCount = 4;
        var forestColumnAndRowCount = 8;
        var mazeColumnAndRowCount = 8;
        var postsPerCellInMaze = 2;
       
       //
        var unsplitSouthEastColumnAndRowCount = (gladeColumnAndRowCount + forestColumnAndRowCount + mazeColumnAndRowCount) / postsPerCellInMaze;
        
        var unsplitSouthEastGridCellWidthAndHeightInPixels = widthAndHeightInPixels / unsplitSouthEastColumnAndRowCount / 2;
        var mazeCircleRadius = unsplitSouthEastGridCellWidthAndHeightInPixels * (gladeColumnAndRowCount + forestColumnAndRowCount + mazeColumnAndRowCount)  / postsPerCellInMaze;
        var forestCircleRadius = unsplitSouthEastGridCellWidthAndHeightInPixels * (gladeColumnAndRowCount + forestColumnAndRowCount)  / postsPerCellInMaze;
        var gladeCircleRadius = unsplitSouthEastGridCellWidthAndHeightInPixels * gladeColumnAndRowCount  / postsPerCellInMaze;
        
        var southEastPoint = gridPoint.add(new paper.Point(widthAndHeightInPixels / 2, widthAndHeightInPixels / 2));
        var unsplitSouthEastGrid = new Grid(new Size(unsplitSouthEastColumnAndRowCount, unsplitSouthEastColumnAndRowCount)); 
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

        grid.drawAt(path, southEastGridConfig, gridPoint);
        

        /*var size = 20;
        var splitFactor = 2;
        var outerRadius = config.cell.size.width * (size / 2);
        var innerRadius = outerRadius - (corridorCountForMaze * config.cell.size.width);

        var southEastGrid = new Grid(new Size(size / 2, size / 2));

	var southEastOuterCircle = Shape.circle(new paper.Point(0, 0), outerRadius);
        outerCircle.addTo(path, function(shape) {
            shape.fillColor = "#EEEEFF";
        });
        
        var southEastInnerCircle = Shape.circle(new paper.Point(0, 0), innerRadius);
        innerCircle.addTo(path, function(shape) {
            shape.fillColor = "#FFFFEE";
        });
        
        southEastGrid.filterAndVisitCells(Predicate.cellBetweenCircles(southEastInnerCircle, southEastOuterCircle, new paper.Point(0, 0), config, 2), function(cell) {
            cell.flags.set(Flag.MAZE);
        });
        
        Maze.carve(southEastGrid);
        //southEastGrid.drawAt(path, config, new paper.Point(0, 0));
        
        var southWestGrid = southEastGrid.mirror(Axis.NORTH_SOUTH);
        var southGrid = southWestGrid.assemble(Direction.EAST, southEastGrid);
        var northGrid = southGrid.mirror(Axis.EAST_WEST);
        var grid = northGrid.assemble(Direction.SOUTH, southGrid);
        
        
        Shape.circle(new paper.Point(config.cell.size.width * size / 2 * splitFactor, config.cell.size.height * size / 2 * splitFactor), outerRadius * splitFactor).addTo(path, function(shape) {
            shape.fillColor = "#FFEEEE";
        });
        
        var mazeAndForestBoundaryCircle = Shape.circle(new paper.Point(config.cell.size.width * size / 2 * splitFactor, config.cell.size.height * size / 2 * splitFactor), innerRadius * splitFactor);
        mazeAndForestBoundaryCircle.addTo(path, function(shape) {
            shape.fillColor = "#EEFFFF";
        });
        
        var forestAndGladeBoundaryCirlce = Shape.circle(new paper.Point(config.cell.size.width * size / 2 * splitFactor, config.cell.size.height * size / 2 * splitFactor), innerRadius * splitFactor);
        forestAndGladeBoundaryCirlce
        
        var splitGrid = grid.split(splitFactor, PostStrategy.ADD_WALL_END_POST_ONLY);
        splitGrid.filterAndVisitCells(function(cell) {
            return cell.flags.isSet(Flag.MAZE);
        }, function (cell) {
            _.forEach(cell.surroundingPosts(), function(post) {
               post.flags.set(Flag.MAZE); 
            });
        });
        
        
        splitGrid.filterAndVisitCells()
        
        splitGrid.filterAndVisitCells(Predicate.cellBetweenCircles(Shape.circle(new paper.Point(config.cell.size.width * size / 2 * splitFactor, config.cell.size.height * size / 2 * splitFactor), innerRadius * splitFactor), Shape.circle(new paper.Point(config.cell.size.width * size / 2 * splitFactor, config.cell.size.height * size / 2 * splitFactor), outerRadius * splitFactor), new paper.Point(0, 0), config, 1), function(cell) { 
            _.forEach(cell.surroundingPosts(), function(post) {
               post.flags.set(Flag.MAZE);
               if (!cell.flags.isSet(Flag.MAZE)) {
                   post.add();
               }
            });
        });
                
        splitGrid.filterAndVisitPosts(Predicate.postInsideCircle(Shape.circle(new paper.Point(config.cell.size.width * size / 2 * splitFactor, config.cell.size.height * size / 2 * splitFactor), innerRadius * splitFactor), new paper.Point(0, 0), config), function(post) {
            if (!post.flags.isSet(Flag.MAZE)) {
                post.flags.set(Flag.FOREST);
                if (_.shuffle([0, 1, 2])[0] == 0) {
                    post.add();
                } else {
                    post.remove();
                }
            }
        });
                
        splitGrid.drawAt(path, config, new paper.Point(0, 0)); */
        
        var postCount = grid.filterAndCountPosts(Predicate.postFlagged(Flag.ADDED));
        console.log(postCount);
        var postCountInput = document.getElementById('postCount');
        postCountInput.value = postCount;
        
        paper.view.draw();
    });
});
