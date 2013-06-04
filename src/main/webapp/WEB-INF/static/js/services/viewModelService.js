
// Utilize service as singleton class for the Model
angservices.service('viewModelService', function($rootScope, $q, utilService, applauseService){
    this.rowdata_dirty = {};
    this.rowdata = {};
    this.loading_appIds = [];

    // Number of application can be seen in view comparison
    this.MAX_APPLICATION = 5;

    var serviceScope = this;

    this.canAddMoreApp = function(){
        // try to see whether another application can be added for comparison view
        var map_array = $.map(this.rowdata, function (value, key) { return value; });
        if (map_array.length >= this.MAX_APPLICATION){
            return false;
        } else {
            return true;
        }
    };

    this.setRowData = function(newobj){
        if (newobj != undefined){
            this.rowdata = utilService.clone(newobj);
            $rootScope.$broadcast('data changed');
        }
    };

    this.getRowData = function(){
        return utilService.clone(this.rowdata);
    };

    this.removeRowData = function(appId){
        serviceScope.rowdata_dirty = serviceScope.getRowData();
        if (serviceScope.rowdata_dirty[appId] != undefined){
            delete serviceScope.rowdata_dirty[appId];
        }
        serviceScope.setRowData(serviceScope.rowdata_dirty);
    };

    this.existAppId = function(appId){
        if (serviceScope.rowdata[appId] != undefined){
            return true;
        } else {
            return false;
        }
    };

    // only to be called once the populate data is called
    // will make this as private since no outside will be using
    // it for now.
    /*
     * @param Array of Application Id
     */
    this.__populateDataAttributes = function(appIds){
        var dataload = [];
        // this next request will fill in all of applause attributes, signals, etc
        for (var indexApp in appIds){
            // for this, we pass no versions since only interested on the all versions
            dataload.push(applauseService.appInfoAttributes(appIds[indexApp]));
        }

        // get the attributes information
        $q.all(dataload).then(this.__populateDataAttributesSuccessResponse,
            function(errvalue){
                console.log('ERROR :: ' + errvalue);
            }
        );
    };

    this.__populateDataAttributesSuccessResponse = function(response){
        angular.forEach(response, function(obj, key){
            if (obj.data.success &&
                // for attributes, it only populate the application
                // which already retrieved earlier
                serviceScope.rowdata_dirty[obj.data.appId] != undefined){
                var urlstring = applauseService.viewApplicationURL(obj.data.appId);
                var newobj = {attributes : obj.data.data.attributes, view_url : urlstring };
                angular.extend(serviceScope.rowdata_dirty[obj.data.appId], newobj);
            }
        });
        serviceScope.setRowData(serviceScope.rowdata_dirty);
    };

    /*
     * @param Array of Application Id
     */
    this.populateData = function(appIds){
        var dataload = [];
        serviceScope.rowdata_dirty = serviceScope.getRowData();

        // Since the Applause API didn't allow us to pick up all of the attributes along
        // with the Applause score togehter, so we will pick up the information in
        // 2 requests
        for (var indexApp in appIds){
            dataload.push(applauseService.appInfo(appIds[indexApp]));
        }

        // mark this list as the one which is being loaded
        serviceScope.loading_appIds = appIds;

        // get all of the application info first
        $q.all(dataload).then(this.__populateDataSuccessResponse,
            function(errvalue){
                console.log('ERROR :: ' + errvalue);
            }
        );
    };

    this.__populateDataSuccessResponse = function(response){
        // iterate the results
        angular.forEach(response, function(obj, key){
            if (obj.data.success &&
                serviceScope.rowdata_dirty[obj.data.appId] == undefined){
                var newobj = {};
                newobj[obj.data.appId] = obj.data.data;
                angular.extend(serviceScope.rowdata_dirty, newobj);
            }
        });
        serviceScope.__populateDataAttributes(serviceScope.loading_appIds);
    };

});
