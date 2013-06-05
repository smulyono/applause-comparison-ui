
/*
 * Utilize service as singleton class for the View Page Model. This is the data model
 *    from the application comparison.
 *
 * @author : Sanny Mulyono <smulyono@me.com -- http://smulyono.github.io/>
 */
angservices.service('viewModelService', function($rootScope, $q, utilService, applauseService){
    // holds the rowdata during the change process / in-progress, when data is stil being populated
    // we don't want it to be visible by end-user
    this.rowdata_dirty = {};

    // Current Model for the Application Comparison Data
    // {
    //    <appID> : {
    //                  category : <category>,
    //                  ratings  : <ratings> ,
    //                  description: <description>,
    //                  title    : <title> ,
    //                  price    : <price> ,
    //                  ... other application Info Attributes
    //                  attributes : { <make a full copy of the response>
    //                                 satisfaction : {
    //                                                  score : <score>, signals : []
    //                                                },
    //                                  privacy    : {score : <score>, signals: [] },
    //                                  elegance    : {score : <score>, signals: [] },
    //                                  content    : {score : <score>, signals: [] },
    //                                  interoperability    : {score : <score>, signals: [] },
    //                                  pricing    : {score : <score>, signals: [] },
    //                                  stability    : {score : <score>, signals: [] },
    //                                  performance    : {score : <score>, signals: [] },
    //                                  security    : {score : <score>, signals: [] },
    //                                  usability    : {score : <score>, signals: [] },
    //                                }
    //               },
    //    ...
    // }
    this.rowdata = {};

    // Limit number of application can be seen in view comparison
    this.MAX_APPLICATION = 5;

    // variable scope
    var serviceScope = this;

    // Determine whether model are allowed to add more application for comparison
    // will do the check based on MAX_APPLICATION
    this.canAddMoreApp = function(){
        // try to see whether another application can be added for comparison view
        var map_array = $.map(this.rowdata, function (value, key) { return value; });
        if (map_array.length >= this.MAX_APPLICATION){
            return false;
        } else {
            return true;
        }
    };

    // broadcast for any error / failures
    this.failProcess = function(){
        $rootScope.$broadcast("data error");
    };

    // Setter for the rowdata or the Current Model. Also notify the child scope
    // for any data model changes.
    // @param newboj, Object which represent as the new Current Model
    this.setRowData = function(newobj){
        if (newobj != undefined){
            // create cloned data of the newobj
            this.rowdata = utilService.clone(newobj);
            $rootScope.$broadcast('data changed');
        }
    };

    // Setter for populating new added application in current Model. Also notify
    // the child scope by calling the setRowData
    this.appendRowData = function(newobj){
        if (newobj != undefined && serviceScope.canAddMoreApp()){
            var temp_rowdata = serviceScope.getRowData();
            angular.extend(temp_rowdata, newobj);
            serviceScope.setRowData(temp_rowdata);
        }
        // If they cannot add more app, usually because of race condition
        if (newobj != undefined && !serviceScope.canAddMoreApp()){
            // still do the broadcast to allow child scope to do refresh
            $rootScope.$broadcast('data changed');
        }
    };

    // Getter for the rowdata or the Current Model
    this.getRowData = function(){
        // return the cloned rowdata object
        return utilService.clone(this.rowdata);
    };

    // Removing application from comparisons and data model.
    // @param appId, Application ID
    this.removeRowData = function(appId){
        // get the current data
        serviceScope.rowdata_dirty = serviceScope.getRowData();
        if (serviceScope.rowdata_dirty[appId] != undefined){
            // make sure the application ID is exist, then
            // delete them
            delete serviceScope.rowdata_dirty[appId];
        }
        // update the current data model
        serviceScope.setRowData(serviceScope.rowdata_dirty);
    };

    // Checks whether application ID is already in the Data Model , which
    // means part of the application being compared
    // @param appId, application ID
    // @return boolean
    this.existAppId = function(appId){
        if (serviceScope.rowdata[appId] != undefined){
            return true;
        } else {
            return false;
        }
    };

    // This method needs to be safe from multiple client request
    // so we created new object as their separated isolated scope
    this.populateData = function(appIds){
        var vargc = new prepareDirtyData(appIds);
    };

    var prepareDirtyData = function(TappId){
        var childScope = this;
        childScope.applicationId = TappId;
        childScope.rowdata_dirty = {};

        // Prepare to populate data model with application to compared
        // @param appIds, array of String which contains the application ID
        this.populateData = function(appIds){
            var dataload = [];
            childScope.rowdata_dirty = {};

            // Since the Applause API didn't allow us to pick up all of the attributes along
            // with the Applause score togehter, so we will pick up the information in
            // 2nd request at __populateDataAttributes
            for (var indexApp in appIds){
                dataload.push(applauseService.appInfo(appIds[indexApp]));
            }

            // get all of the application info first
            $q.all(dataload).then(this.__populateDataSuccessResponse,
                function(errvalue){
                    // when it reach error, then notify user
                    console.log('ERROR :: ' + errvalue);
                    serviceScope.failProcess();
                }
            );
        };

        // Callback after GET HTTP Request to Applause API
        // @param response object
        this.__populateDataSuccessResponse = function(response){
            var found_appId = [];
            // iterate the results
            angular.forEach(response, function(obj, key){
                if (obj.data.success &&
                    childScope.rowdata_dirty[obj.data.appId] == undefined){
                    // make sure that this application is new and not yet in data model
                    var newobj = {};
                    newobj[obj.data.appId] = obj.data.data;
                    angular.extend(childScope.rowdata_dirty, newobj);
                    found_appId.push(obj.data.appId);
                }
            });
            childScope.__populateDataAttributes(found_appId);
        };

        // Call for another GET Request to Applause API to retrieve
        // detailed application information
        // @param appIds, application ID
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
                    // when error happens, notify user about the problem
                    console.log('ERROR :: ' + errvalue);
                    serviceScope.failProcess();
                }
            );
        };

        // Callback from GET Request to Applause API, will process the response object
        // to identify application attributes and put them into data model
        // @param response object
        this.__populateDataAttributesSuccessResponse = function(response){
            angular.forEach(response, function(obj, key){
                if (obj.data.success &&
                    // for attributes, it only populate the application
                    // which already retrieved earlier
                    childScope.rowdata_dirty[obj.data.appId] != undefined){
                    // prepare view_url attributes value
                    var urlstring = applauseService.viewApplicationURL(obj.data.appId);
                    // prepare attributes property which copies the attributes object from the source
                    //
                    var newobj = {attributes : obj.data.data.attributes, view_url : urlstring };
                    angular.extend(childScope.rowdata_dirty[obj.data.appId], newobj);
                }
            });
            // All operation done, make the rowdata_dirty as the current data model and
            // notify the child scope for this data changes.
            serviceScope.appendRowData(childScope.rowdata_dirty);
        };

        // call the population methods
        childScope.populateData(childScope.applicationId);

    }; // end of prepare dity object

});
