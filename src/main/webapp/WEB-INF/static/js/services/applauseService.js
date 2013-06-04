/*
 * Service for doing all communication to Applause API
 *
 * @author : Sanny Mulyono <smulyono@me.com -- http://smulyono.github.io/>
 */
angservices.factory('applauseService', function(APPLAUSE_CONFIG, $http, utilService ){
    var factory = {};
    // Extends the configuration passed by application
    factory.config = angular.extend({
        // default value of HOST_URL, endpoint for Applause API
        HOST_URL : 'http://api.applause.com',
        // Search size when doing search API request
        SEARCH_SIZE : 20
    }, APPLAUSE_CONFIG);

    // ==== BEGIN :: ALL HTTP Request which will return promise object =====

    // Do GET request to Appluse to get Application Info specially the score attribtues
    // @param appid, Application ID
    // @param versions, interested version
    // @return promise object
    factory.appInfoAttributes = function(appid, versions){
        if (appid == undefined){
            return null;
        }
        if (versions == undefined){
            versions = "^^all^^";
        }
        return $http.get(factory.config.HOST_URL + '/v1/appinfo/apps/' + appid + '/versions/' + versions + '/data.json?apikey=' + factory.config.API_KEY);
    };

    // Do GET Request to get Application Info, this request will retrieve application price
    // @param appid, Application ID
    // @return promise object
    factory.appInfoShort = function(appid){
        if (appid == undefined){
            return null;
        }
        return $http.get(factory.config.HOST_URL + '/v1/appinfo/' + appid + '?apikey=' + factory.config.API_KEY);
    };

    // Do GET Request to get Application Info, this request will give more detailed information
    //    such as description, applause-score, etc
    // @param appid, Application ID
    // @return promise object
    factory.appInfo = function(appid){
        if (appid == undefined){
            return null;
        }
        return $http.get(factory.config.HOST_URL + '/v1/appinfo/apps/' + appid + '/details.json?apikey=' + factory.config.API_KEY);
    };

    // Do GET Request to search for application
    // @param queryKey, query term for searching the application
    // @param offset, 0-100 value offset for searching the application
    // @param highLimit, 0-100 value of number of apps
    factory.searchApp = function(queryKey, offset, highLimit){
        // some default value
        if (offset == undefined){
            offset = 0;
        }
        if (highLimit == undefined){
            highLimit = factory.config.SEARCH_SIZE;
        }
        return $http.get(factory.config.HOST_URL + '/app/search?q=' + queryKey + '&start=' + offset + '&limit=' + highLimit);
    };

    // ==== END :: ALL HTTP Request which will return promise object =====

    // To view application info in Applause, this method will return
    // the url of Appluse Application Info
    // @param appId, application ID
    // @return String
    factory.viewApplicationURL = function(appId){
        return "https://my.applause.com/?app_id=" + appId;
    };

    // Utility to parse the Application ID from well construction AppInfoShort (@see appInfoShort)
    // @param str, url to parse
    // @return String, application ID
    factory.parseAppIdFromAppInfoShortURL = function(str){
        str = str.replace(factory.config.HOST_URL + '/v1/appinfo/', '');
        str = str.replace('?apikey=' + factory.config.API_KEY, '');
        return str;
    };

    // Some utility to iterate the object of an application and determine the attributes
    // will be used
    // @param sourceobj, Source Object with the Applause attributes
    // @param attributes, array of attributes destination
    // @return array of attributes
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
