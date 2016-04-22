describe("utils",function(){
    
    var utils = {};
    beforeEach(module('neograph.utils'));
     /*
        //or
        angular.mock.module({
            'utils':{
                isPerson:function(){return true;}
            }
        });
        //or
        angular.mock.module(function($provide){ //can inject other services
            $provide.factory('utils',function(){
                return {
                    isPerson: function(){return true;}
                }
            })
        })
        */
    beforeEach(inject(function(_utils_){//angular.mock.inject
            utils = _utils_;
            }));
    
    it('should return true for isPerson Philosopher ',function(){
        console.log(angular.mock.dump(utils.personTypes))
        expect(utils.isPerson("Philosopher")).toBe(true);
    });
    
    it('should return false for isPerson Horse',function(){
        expect(utils.isPerson("Horse")).toBe(false);
    });
      
    
    
});