
angservices.factory('applauseService', function(APPLAUSE_CONFIG, $http, utilService ){
    var factory = {};
    // Extends the config
    factory.config = angular.extend({
        HOST_URL : 'http://api.applause.com',
        // Some of the category which we don't like to see
        EXCLUDE_CATEGORY : ['title', 'url_img']
    }, APPLAUSE_CONFIG);

    // ==== BEGIN :: ALL HTTP Request which will return promise object =====
    factory.appInfoAttributes = function(appid, versions){
        if (appid == undefined){
            return null;
        }
        if (versions == undefined){
            versions = "^^all^^";
        }
        return $http.get(factory.config.HOST_URL + '/v1/appinfo/apps/' + appid + '/versions/' + versions + '/data.json?apikey=' + factory.config.API_KEY);
    };

    factory.appInfoShort = function(appid){
        if (appid == undefined){
            return null;
        }
        return $http.get(factory.config.HOST_URL + '/v1/appinfo/' + appid + '?apikey=' + factory.config.API_KEY);
    }

    factory.appInfo = function(appid){
        if (appid == undefined){
            return null;
        }
        return $http.get(factory.config.HOST_URL + '/v1/appinfo/apps/' + appid + '/details.json?apikey=' + factory.config.API_KEY);
    };

    factory.searchApp = function(queryKey, lowLimit, highLimit){
        // some default value
        if (lowLimit == undefined){
            lowLimit = 0;
        }
        if (highLimit == undefined){
            highLimit = 20;
        }
        return $http.get(factory.config.HOST_URL + '/app/search?q=' + queryKey + '&start=' + lowLimit + '&limit=' + highLimit);
    };
    // ==== END :: ALL HTTP Request which will return promise object =====

    factory.viewApplicationURL = function(appId){
        return "https://my.applause.com/?app_id=" + appId;
    };

    factory.parseAppIdFromAppInfoShortURL = function(str){
        str = str.replace(factory.config.HOST_URL + '/v1/appinfo/', '');
        str = str.replace('?apikey=' + factory.config.API_KEY, '');
        return str;
    };

    // Some utility to iterate the object of an application and determine the attributes
    // will be used
    factory.retrieveAttributes = function(sourceobj, attributes){
        var retval = attributes;
        // make sure that score is retrieved
        for (var i in sourceobj){
            if (sourceobj[i] &&
                // Not found in exclude attributes
                $.inArray(i, factory.config.EXCLUDE_ATTRIBUTES) == -1){
                retval.push(i);
            }
        }
        // we will pass back the reference object
        return retval;
    };

    return factory;
});
