/*
 * Utility Service, methods here are used as Helper or Utility by other Controller
 * and Services
 *
 * @author : Sanny Mulyono <smulyono@me.com -- http://smulyono.github.io/>
 */
angservices.service('utilService', function($rootScope){
    // Standard utility to do deep-clone object
    this.clone = function(sourceobject){
        var cloned = {};
        if (sourceobject instanceof Array){
            cloned = [];
        }
        for (var i in sourceobject){
            if (sourceobject[i] &&
                typeof sourceobject[i] == "object"){
                cloned[i] = this.clone(sourceobject[i]);
            } else {
                cloned[i] = sourceobject[i];
            }
        }
        return cloned;
    };
});
