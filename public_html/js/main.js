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

require(['art/axis', 'art/direction'], function(Axis, Direction) {
    console.log(new Direction("NORTH").isEqualTo(Direction.NORTH));
    
    
    console.log(Axis);
    console.log(Axis.NORTH_SOUTH.isDefinedBy(Direction.NORTH));
    console.log(Direction.EAST.defines(Axis.NORTH_SOUTH));
    console.log(Axis.NORTH_SOUTH.mirror(Direction.WEST));
    
    console.log(Direction.NORTH.opposite());
});
