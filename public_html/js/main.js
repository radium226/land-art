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

require(['domReady', 'paper', 'art/grid', 'art/size', 'art/config', 'art/position', 'art/direction', 'art/axis', 'art/postStrategy', 'art/predicate', 'art/flag', 'art/shape'], function(domReady, paper, Grid, Size, Config, Position, Direction, Axis, PostStrategy, Predicate, Flag, Shape) {
    domReady(function() {
        var canvas = document.getElementById('maze');
        paper.setup(canvas);
        var path = new paper.Path();
        
        var config = new Config();
        var grid = new Grid(new Size(10, 10));
        
        /*grid.cellAt(new Position(1, 1)).breakWall(Direction.NORTH);
        grid.postAt(new Position(0, 0)).remove();
        
        var mirroredGrid = grid.mirror(Axis.NORTH_SOUTH);
        grid = grid.assemble(Direction.SOUTH, mirroredGrid);
        
        grid = grid.split(3, PostStrategy.ADD_WALL_END_POST_ONLY);
        
        grid = grid.assemble(Direction.EAST, grid);
        
        grid = grid.assemble(Direction.WEST, grid);
        
        grid = grid.assemble(Direction.NORTH, grid); */

	var point = new paper.Point(10, 10);
        
        var outerCircle = Shape.circle(point, 200);
        outerCircle.addTo(path, function(shape) {
            shape.fillColor = "#EEEEFF";
        });
        
        var innerCircle = Shape.circle(point, 100);
        innerCircle.addTo(path, function(shape) {
            shape.fillColor = "#FFFFEE";
        });
        
        grid.filterAndVisitCells(Predicate.cellBetweenCircles(innerCircle, outerCircle, point, config, 1), function(cell) {
            cell.flags.set(Flag.IN_CIRCLE);
        });
        
        grid.drawAt(path, config, point);
        
        paper.view.draw();
    });
});
