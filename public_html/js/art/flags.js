define(['underscore'], function(_) {
    "use strict";
    
    var Flags = function() {
        this.__value = 0;
        
    };
    
    Flags.prototype = {
      
        set: function(flag) {
            this.__value = this.__value | flag.__value;
            return this;
        }, 
        
        unset: function(flag) {
            this.__value = this.__value & ~flag.__value;
            return this;
        }, 
        
        isSet: function(flag) {
            return (this.__value & flag.__value) == flag.__value;
        }, 
        
        copy: function() {
            return _.clone(this);
        }, 
        
        isLessThan: function (that) {
            return this.__value < that.__value;
        }, 
        
        isEqualTo: function(that) {
            return this.__value == that.__value;
        }, 
        
        isLessThanOrEqualTo: function(that) {
            return this.isLessThan(that) || this.isEqualTo(that);
        }
        
    };

    return Flags;
    
});
