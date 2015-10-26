define([], function() {
    "use strict";
    
    var Flag = function(value) {
        this.__value = value;
    }
    
    Flag.NONE = new Flag(0);     // 00
    Flag.MAZE = new Flag(1);     // 01
    Flag.UNUSABLE = new Flag(2); // 10
    
    return Flag;
});
