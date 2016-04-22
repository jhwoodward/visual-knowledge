  angular.module("neograph.models.predicate",[])
  .factory("predicateFactory",function(){
      
      function Predicate(data){
          
        Object.assign(this,data);
        
    }
        
    Predicate.prototype.setDirection = function(direction){
        this.direction = direction;
        return this;
    };
 
    Predicate.prototype.toString = function(){
        if (this.direction==="in" && !this.symmetrical){
             if (this.reverse){//use reverse if present
                return this.reverse.replace(/_/g, ' ').toLowerCase();
            }
            else{
                var lookup = this.lookup.toUpperCase();
                if (lookup === "CREATED" || lookup==="CREATES")
                    return "created by";
                else if (lookup === "INFLUENCES")
                    return "influenced by";
                else if (lookup === "INSPIRES")
                    return "inspired by";
                else if (lookup === "ANTICIPATES")
                    return "anticipated by";
                else if (lookup === "DEVELOPS")
                    return "developed by";
                else if (lookup === "DEPICTS")
                    return "depicted by";
                else if (lookup === "TYPE_OF")
                    return "type(s)";
                else
                    return "(" + this.lookup.replace(/_/g, ' ').toLowerCase() + ")";
            }
        }
        
       // if (!this.isDirectional || !this.direction || this.direction === "out") {
       return this.lookup.replace(/_/g, ' ').toLowerCase();
       
        
    };
    
    Predicate.prototype.flip = function () {
    
        if (!this.isDirectional) {
            return;
        }
        if (this.direction === "in") {
            this.setDirection("out");
        }
        else {
            this.setDirection("in");
        }
        return this;

    };

    return {
        create:function(data){
            return new Predicate(data);
        }
    }
        
      
  });
  
  
  