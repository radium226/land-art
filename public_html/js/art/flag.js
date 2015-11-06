"use strict";

define([], function() {
    
    var Flag = function(value) {
        this.__value = value;
    };
    
    Flag.NONE = new Flag(0);        // 0000000
    
    Flag.BUILT = new Flag(1);       // 0000001
    Flag.BROKE = new Flag(2);       // 0000010
    
    Flag.ADDED = new Flag(4);       // 0000100
    Flag.REMOVED = new Flag(16);    // 0001000
    
    Flag.FOO = new Flag(32);        // 0010000
    Flag.BAR = new Flag(64);        // 0100000
    
    Flag.MAZE = new Flag(128); // 1000000
    Flag.FOREST = new Flag(256);
    return Flag;
});
