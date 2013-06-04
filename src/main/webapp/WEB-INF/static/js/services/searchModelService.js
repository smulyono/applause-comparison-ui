
/*
 * Utilize service as singleton class for the Search Model
 *    will holds search model representaion, can be considered as DAO
 *
 * @author : Sanny Mulyono <smulyono@me.com -- http://smulyono.github.io/>
 */
angservices.service('searchModelService', function($rootScope, $q, utilService, applauseService, APPLAUSE_CONFIG){
    // Prepare data which can be retrieved from APPLAUSE_CONFIG
    if (APPLAUSE_CONFIG.SEARCH_SIZE != undefined){
        this.searchStop  = APPLAUSE_CONFIG.SEARCH_SIZE;
        this.searchSize  = APPLAUSE_CONFIG.SEARCH_SIZE;
    } else {
        this.searchStop  = 15;
        this.searchSize  = 15;
    }

    // Number of Total Application from the Search
    this.totalSearchCount = 0;
    // Number of Application which has been retrieved (e.g number of application retrieved)
    this.searchCount = 0;
    // Current query Offset
    this.searchStart = 0;
    // Search Query term
    this.searchQuery = '';

    // -----------------------

    // holds the rowdata during changes, this will be the dirty records so that
    // any changes will not affect the actual data
    this.rowdata_dirty = {};

    // holds all information contains in the search result
    //
    // {
    //    <appid> : { category : <category>,
    //                publisher: <publisher>,
    //                title : <title>,
    //                ... other properties from search result...
    //
    //                applause_score : <applause_score>
    //                price : <price>
    //                view_url : <view_url> <-- added attributes from this application
    //                                          to hold the application view URL
    //               },
    //   ...
    // }
    this.rowdata = {};

    // Representation of rowdata in Array, usefull for presentation
    this.rowdata_array = [];

    // make scope variable
    var serviceScope = this;

    // There is some failure during searching process / fetch
    // then notify other child scope that the latest search data
    // proces has failed
    this.failProcess = function(){
        $rootScope.$broadcast('search data error');
    };

    // Setter for rowdata, during data being set then notification will be sent
    // to all child scope that search data has been changed
    this.setRowData = function(newobj){
        if (newobj != undefined){
            // make a clone of the object
            this.rowdata = utilService.clone(newobj);
            // make array representation using this jQuery
            this.rowdata_array = $.map(this.rowdata, function (value, key) { return value; });
            // broadcast notification
            $rootScope.$broadcast('search data changed');
        }
    };

    // retrieve the current search model data
    this.getRowData = function(){
        // return the cloned data
        return utilService.clone(this.rowdata);
    };

    // retrieve the current search model data in Array representation
    this.getRowDataArray = function(){
        // return cloned array
        return utilService.clone(this.rowdata_array);
    };

    // Do another GET HTTP Request call to Applause to get more information
    // about the application. There will be 2 Applause API call for each application
    // because of some application properties which is not available in other API.
    this.__populateDataFullInfo = function(){
        var dataload = [];
        // this next request will fill in all of applause attributes, signals, etc
        for (var indexApp in serviceScope.rowdata_dirty){
            // for this, we pass no versions since only interested on the all versions
            dataload.push(applauseService.appInfo(indexApp));
            // need another info for the Price
            dataload.push(applauseService.appInfoShort(indexApp));
        }

        // get the attributes information
        $q.all(dataload).then(this.__populateDataFullInfoSuccessResponse,
            function(errvalue){
                console.log('ERROR :: ' + errvalue);
                serviceScope.failProcess();
            }
        );
    };

    // Callback function after GET Request to get more information / properties about
    // application. There will be 2 type of result / response which came from
    // applauseService.appInfo and applauseService.appInfoShort
    //
    this.__populateDataFullInfoSuccessResponse = function(response){
        angular.forEach(response, function(obj, key){
            if (obj.data.success && obj.data.appId == undefined
                // response from AppInfoShort call didn't have appId property
                ){
                // there are no application ID returned by the response, but there are
                // some header information in config property. From the URL, we can identify
                // which application ID is being retrieved
                var appId = applauseService.parseAppIdFromAppInfoShortURL(obj.config.url);
                //
                if (serviceScope.rowdata_dirty[appId] != undefined){
                    // make sure that we are updating of existing application object
                    var urlstring = applauseService.viewApplicationURL(appId);
                    // Added price property
                    // Adding view_url property here
                    var newobj = {price : obj.data.data.price, view_url : urlstring};
                    angular.extend(serviceScope.rowdata_dirty[appId], newobj);
                }
            } else

            if (obj.data.success &&
                // for attributes, it only populate the application
                // which already retrieved earlier
                serviceScope.rowdata_dirty[obj.data.appId] != undefined){
                // Adding applause_score and description property
                var newobj = { applause_score: obj.data.data['applause-score'], description : obj.data.data.description};
                angular.extend(serviceScope.rowdata_dirty[obj.data.appId], newobj);
            }
        });
        // once all data has been loaded, then we can set them to the current rowData object
        // also notify the other child scope.
        serviceScope.setRowData(serviceScope.rowdata_dirty);
    };

    // Start populating data by calling the initial search query to Applause,
    // based on the data then re-processing the response is needed. Once all
    // application retrieved, then do another query for picking up the other
    // attributes needed (@see __populateDataFullInfo)
    //
    // @param queryKey, Search query for retrieving application from Applause
    // @param topLimit, 0-100 value for number of apps to be retrieved
    this.populateData = function(queryKey, topLimit){
        // for query, always start new object
        serviceScope.rowdata_dirty = {};

        // always start with 0
        this.searchStart = 0;

        if (topLimit != undefined){
            this.searchStop = topLimit;
        } else {
            this.searchStop = this.searchSize;
        }

        if (queryKey == undefined){
            queryKey = '';
        }
        // prepare the queryKey for the search parameter
        this.searchQuery = queryKey;

        // create promise object on the GET HTTP Request
        var query_promise = applauseService.searchApp(this.searchQuery, this.searchStart, this.searchStop);

        // get all of the application info first
        $q.all(query_promise).then(this.__populateDataSuccessResponse,
            function(errvalue){
                console.log('ERROR :: ' + errvalue);
                serviceScope.failProcess();
            }
        );
    };

    // Adding more data into the current search mode, by calling another search query to Applause
    // but retaining all other parameter like queryKey. Upon successful, same action will be taken
    // as populateData (@see __populateDataFullInfo)
    this.populateMore = function(){
        // check if this populate more can be done
        if (this.searchQuery == undefined){
            this.searchQuery = '';
        }

        // do another query with the same queryKey
        serviceScope.rowdata_dirty = serviceScope.getRowData();

        // add another search results
        this.searchStart = this.searchStop;
        this.searchStop += this.searchSize;

        // check if it still have more record to fetch
        if (this.totalSearchCount < this.searchStop) {
            // cancel the changes and just return back to user
            $rootScope.$broadcast("data changed");
        }

        // create promise object for GET HTTP Request
        var query_promise = applauseService.searchApp(this.searchQuery, this.searchStart, this.searchSize);

        // get all of the application info first
        $q.all(query_promise).then(this.__populateDataSuccessResponse,
            function(errvalue){
                serviceScope.failProcess();
                console.log('ERROR :: ' + errvalue);
            }
        );
    };

    // Callback function after GET Request to get Search Application Query
    //
    this.__populateDataSuccessResponse = function(response){
        // iterate the results
        angular.forEach(response, function(obj, key){
            if (obj.success){
                // make sure that the response is success
                angular.forEach(obj.data.apps, function(tobj, tkey){
                    var newobj = {};
                    // prepare the first object of application ID, each
                    // application will be represented by it's application ID
                    newobj[tobj.app_id] = tobj;
                    // extends the object to get the new / retrieved value
                    angular.extend(serviceScope.rowdata_dirty, newobj);
                });
                // get some query summary information
                serviceScope.totalSearchCount = obj.data.total;
                serviceScope.searchCount = obj.data.count;
                serviceScope.searchStart = obj.data.start;
            }
        });

        // run another query to get more application properties needed
        serviceScope.__populateDataFullInfo();
    };

});
