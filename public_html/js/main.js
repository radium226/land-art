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

require(['domReady', 'underscore', 'paper', 'art/grid', 'art/size', 'art/config', 'art/position', 'art/direction', 'art/axis', 'art/postStrategy', 'art/predicate', 'art/flag', 'art/shape', 'art/maze'], function(domReady, _, paper, Grid, Size, Config, Position, Direction, Axis, PostStrategy, Predicate, Flag, Shape, Maze) {
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

        var size = 20;
        var splitFactor = 2;
        var outerRadius = config.cell.size.width * (size / 2);
        var innerRadius = outerRadius / 3;

        var southEastGrid = new Grid(new Size(size / 2, size / 2));

	var southEastOuterCircle = Shape.circle(new paper.Point(0, 0), outerRadius);
        /*outerCircle.addTo(path, function(shape) {
            shape.fillColor = "#EEEEFF";
        });*/
        
        var southEastInnerCircle = Shape.circle(new paper.Point(0, 0), innerRadius);
        /*innerCircle.addTo(path, function(shape) {
            shape.fillColor = "#FFFFEE";
        });*/
        
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
        
        Shape.circle(new paper.Point(config.cell.size.width * size / 2 * splitFactor, config.cell.size.height * size / 2 * splitFactor), innerRadius * splitFactor).addTo(path, function(shape) {
            shape.fillColor = "#EEFFFF";
        });
        
        
        
        var splitGrid = grid.split(splitFactor, PostStrategy.ADD_WALL_END_POST_ONLY);
        /*splitGrid.filterAndVisitCells(function(cell) {
            return cell.flags.isSet(Flag.MAZE);
        }, function (cell) {
            _.forEach(cell.surroundingPosts(), function(post) {
               post.flags.set(Flag.MAZE); 
            });
        });*/
        
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
                
        splitGrid.drawAt(path, config, new paper.Point(0, 0));
        
        paper.view.draw();
    });
});
