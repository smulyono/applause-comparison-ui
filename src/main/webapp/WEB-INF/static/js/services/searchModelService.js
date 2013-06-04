
// Utilize service as singleton class for the Model
angservices.service('searchModelService', function($rootScope, $q, utilService, applauseService, APPLAUSE_CONFIG){
    // Search Result Model
    this.totalSearchCount = 0;
    this.searchCount = 0;
    this.searchStart = 0;
    if (APPLAUSE_CONFIG.SEARCH_SIZE != undefined){
        this.searchStop  = APPLAUSE_CONFIG.SEARCH_SIZE;
        this.searchSize  = APPLAUSE_CONFIG.SEARCH_SIZE;
    } else {
        this.searchStop  = 15;
        this.searchSize  = 15;
    }
    this.searchQuery = '';
    // -----------------------

    this.rowdata_dirty = {};
    this.rowdata = {};

    this.rowdata_array = [];

    this.appIdsToFind = [];

    var serviceScope = this;

    this.setRowData = function(newobj){
        if (newobj != undefined){
            this.rowdata = utilService.clone(newobj);
            this.rowdata_array = $.map(this.rowdata, function (value, key) { return value; });
            $rootScope.$broadcast('search data changed');
        }
    };

    this.getRowData = function(){
        return utilService.clone(this.rowdata);
    };

    this.getRowDataArray = function(){
        return utilService.clone(this.rowdata_array);
    };

    this.removeRowData = function(appId){
        serviceScope.rowdata_dirty = serviceScope.getRowData();
        if (serviceScope.rowdata_dirty[appId] != undefined){
            delete serviceScope.rowdata_dirty[appId];
        }
        serviceScope.setRowData(serviceScope.rowdata_dirty);
    };


    /*
     * @param Array of Application Id
     */
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
            }
        );
    };

    this.__populateDataFullInfoSuccessResponse = function(response){
        angular.forEach(response, function(obj, key){
            if (obj.data.success && obj.data.appId == undefined
                ){
                var appId = applauseService.parseAppIdFromAppInfoShortURL(obj.config.url);
                if (serviceScope.rowdata_dirty[appId] != undefined){
                    var urlstring = applauseService.viewApplicationURL(appId);
                    var newobj = {price : obj.data.data.price, view_url : urlstring};
                    angular.extend(serviceScope.rowdata_dirty[appId], newobj);
                }
            } else

            if (obj.data.success &&
                // for attributes, it only populate the application
                // which already retrieved earlier
                serviceScope.rowdata_dirty[obj.data.appId] != undefined){
                var newobj = { applause_score: obj.data.data['applause-score'], description : obj.data.data.description};
                angular.extend(serviceScope.rowdata_dirty[obj.data.appId], newobj);
            }
        });
        serviceScope.setRowData(serviceScope.rowdata_dirty);
    };

    /*
     * @param Array of Application Id
     */
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
        this.searchQuery = queryKey;

        var query_promise = applauseService.searchApp(this.searchQuery, this.searchStart, this.searchStop);

        // get all of the application info first
        $q.all(query_promise).then(this.__populateDataSuccessResponse,
            function(errvalue){
                console.log('ERROR :: ' + errvalue);
            }
        );
    };

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

        var query_promise = applauseService.searchApp(this.searchQuery, this.searchStart, this.searchStop);

        // get all of the application info first
        $q.all(query_promise).then(this.__populateDataSuccessResponse,
            function(errvalue){
                console.log('ERROR :: ' + errvalue);
            }
        );
    }

    this.__populateDataSuccessResponse = function(response){
        // iterate the results
        angular.forEach(response, function(obj, key){
            if (obj.success){
                angular.forEach(obj.data.apps, function(tobj, tkey){
                    var newobj = {};
                    newobj[tobj.app_id] = tobj;
                    angular.extend(serviceScope.rowdata_dirty, newobj);
                });
                serviceScope.totalSearchCount = obj.data.total;
                serviceScope.searchCount = obj.data.count;
                serviceScope.searchStart = obj.data.start;
            }
        });

        // run both query
        serviceScope.__populateDataFullInfo();
    };

});
