define([], function() {
    "use strict";
    
    var Flags = function() {
        
        this.__value = 0;
        
    };
    
    Flags.prototype = {
      
        set: function(flag) {
            this.__value = this.__value | flag.__value;
        }, 
        
        unset: function(flag) {
            this.__value = this.__value & ~flag.__value;
        }, 
        
        isSet: function(flag) {
            return (this.__value & flag.__value) == flag.__value;
        }
        
    };

    return Flags;
    
});
