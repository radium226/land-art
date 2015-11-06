"use strict";

require.config({
    
    baseUrl: 'js', 
   
    paths: {
        underscore: 'lib/underscore', 
        ancestry: 'lib/ancestry', 
        paper:  'lib/paper', 
        qunit: 'lib/qunit'
    }
    
});

require(['underscore', 'qunit', 'art/direction', 'art/axis', 'art/grid', 'art/size', 'art/position', 'art/flag'], function(_, QUnit, Direction, Axis, Grid, Size, Position, Flag) {
    test("Direction et Axis", function(assert) {
        assert.ok(Direction.SOUTH.defines(Axis.NORTH_SOUTH));
        assert.notOk(Direction.WEST.defines(Axis.NORTH_SOUTH));
        assert.equal(Axis.NORTH_SOUTH.mirror(Direction.NORTH), Direction.NORTH);
        assert.equal(Axis.NORTH_SOUTH.mirror(Direction.EAST), Direction.WEST);
        assert.equal(Direction.NORTH.mirror(Axis.EAST_WEST), Direction.SOUTH);
        assert.ok(Direction.complementary([Direction.NORTH, Direction.EAST, Direction.WEST] == [Direction.SOUTH]));
    });
    
    test("Grid, Cell et Post", function(assert) {
        var grid = new Grid(new Size(10, 10));
        assert.ok(grid.postAt(new Position(10, 10)));
        assert.notOk(grid.cellAt(new Position(10, 10)));
       
        grid.visitCells(function(cell) {
            if (cell.position.isEqualTo(new Position(2, 3))) {
                cell.flags.set(Flag.FOO);
            }
        });
        assert.ok(grid.cellAt(new Position(2, 3)).flags.isSet(Flag.FOO));
       
        grid.visitPosts(function(post) {
            if (post.position.isEqualTo(new Position(1, 5))) {
                post.flags.set(Flag.BAR);
            }
        });
        
        assert.ok(grid.postAt(new Position(1, 5)).flags.isSet(Flag.BAR));
       
    });
    
    test("Cell et Post", function(assert) {
        var grid = new Grid(new Size(3, 3));
        var cell = grid.cellAt(new Position(1, 1));
        var surroundingPosts = cell.surroundingPosts();
        assert.ok(_.find(surroundingPosts, function(surroundingPost) {
            return surroundingPost.position.isEqualTo(new Position(2, 1));
        }));
    });
    
    test("Wall et Post", function(assert) {
        var grid = new Grid(new Size(2, 2));
        grid.visitCells(function(cell) {
            cell.breakAllWalls();
        });
        assert.notOk(grid.postAt(new Position(0, 0)).isWallEnd());
        grid.cellAt(new Position(0, 0)).buildWall(Direction.SOUTH);
        assert.ok(grid.postAt(new Position(1, 1)).isWallEnd());
        
    });
    
    test("Post", function(assert) {
       var grid = new Grid(new Size(2, 2));
       assert.ok(grid.postAt(new Position(1, 1)).isAdded());
       assert.notOk(grid.postAt(new Position(1, 1)).isRemoved());
       
       grid.postAt(new Position(1, 1)).remove();
       assert.ok(grid.postAt(new Position(1, 1)).flags.isSet(Flag.REMOVED));
       assert.notOk(grid.postAt(new Position(1, 1)).flags.isSet(Flag.ADDED));
    });

    // On lance QUnit.
    QUnit.load();
    QUnit.start();
});