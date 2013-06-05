
/*
 * Controller for the Search / Add Apps Dialog (UI-2)
 * http://www.cloudspokes.com/challenges/2302
 *
 * @author : Sanny Mulyono <smulyono@me.com -- http://smulyono.github.io/>
 */

angcontroller.controller("ui2Ctrl",
    function($scope, $q, $filter, searchModelService, utilService, viewModelService){
        $scope.title = 'UI 2';
        // -- Sorting Order Information
        $scope.orderField = 'applause_score';
        $scope.orderDescending = true;
        // ---

        // --- Paging Options ----
        $scope.rowSearchData = []; // dirty records used as temporary holder of search result
        $scope.shownResult = 5; // number of records displayed on each page
        $scope.currentPage = 1; // current page shown
        $scope.totalPages = 0;  // number of page
        // ----------------------

        // Receive notification from SearchModelService when the underlying search
        // data process has failed
        $scope.$on("search data error", function(){
            $scope.loading = false;
            $scope.dataerror = true;
        });

        // Receive notification from SearchModelService when the underlying data
        // for the search data has been changed
        $scope.$on("search data changed", function(){
            $scope.loading = false;
            // get the latest search result data
            $scope.rowdata = searchModelService.getRowDataArray();
            // revalidate all paginations and ordering fields information
            $scope.searchResults();
        });

        // receive notification from view model page that data has changed
        // Occur when application is being added from Search Modal Page, then
        // this notification will let us know when the process has finished or
        // application completely added in main comparison page.
        $scope.$on("data changed", function(){
            $scope.addloading = false;
        });

        // Identify whether application already exists on the Main Comparison page
        // Used to identify whether application can be added / removed in the search
        // result
        $scope.isAppExists = function(appid){
            return viewModelService.existAppId(appid);
        };

        // Identify when application is still being added into the Main Comparison page
        $scope.isAppAdding = function(appid){
            var retval = false;
            if (this.addingAppId[appid] != undefined){
                // appid is still being added
                retval = true;
            }

            if ($scope.isAppExists(appid) && retval){
                // Application already exists in main applicaton but we still identify
                // that application is being added. So need to reset them as false.
                retval = false;
                delete this.addingAppId[appid];
            }

            if (retval && !$scope.addloading){
                retval = false;
                delete this.addingAppId[appid];
            }
            return retval;
        };

        // Removing the application from the Main Comparison Page
        $scope.removeApp = function(appid){
            viewModelService.removeRowData(appid);
        };

        // Based on the requirement, there can only 5 application to be added.
        // This function will let application know whether 5 application limit
        // has been reached.
        // Size of application limit can be configured at @see viewModelService
        $scope.allowToAddApp = function(appId){
            var retval = viewModelService.canAddMoreApp();
            // also consider if there is application being added
            if ($scope.addingAppId[appId] == undefined &&
                retval){
                return true;
            }
            return false;
        };

        // Adding specific app from Search Dialog Page to the Main Comparison Page
        $scope.addApp = function(appid){
            if ($scope.allowToAddApp(appid)){
                // If application limit not reached then allow to add application
                $scope.addloading = true;
                $scope.addingAppId[appid] = appid;
                // Utilize viewModelService to add specific application to the
                // main comparison page.
                viewModelService.populateData([appid]);
            }
        };

        // Change the current page (in pagination) to the previous page
        $scope.previousPage = function(){
            if ($scope.currentPage > 1){
                $scope.currentPage--;
            }
        };

        // Change the current page (in pagination) to the next page
        $scope.nextPage = function(){
            if ($scope.currentPage < $scope.totalPages){
                $scope.currentPage++;
            }
        };

        // Change the current page (in pagination) to specific page number
        $scope.changePage = function(newpagenumber){
            $scope.currentPage = newpagenumber;
        };

        // Prepare number of pages and all needed properties for navigation.
        // filteredData also constructed here by slicing rowSearchData (rowData which
        // already filtered) into separate section of page
        $scope.prepareNavigation = function(){
            $scope.currentPage = 1;

            // make sure that shownresult is number
            $scope.shownResult = $scope.shownResult * 1;

            // Determining number of pages needed start from here
            $scope.searchTotalCount = searchModelService.totalSearchCount;
            $scope.searchCount = $scope.rowSearchData.length;
            // determine the preliminary total pages
            $scope.totalPages = Math.floor($scope.searchCount / $scope.shownResult);
            // see if there are modulus
            var modulus = $scope.searchCount % $scope.shownResult;
            if (modulus > 0){
                // so there are more records which is not covered yet, so add another page
                $scope.totalPages += 1;
            }

            var startrecord = 0;
            var endrecord = 0 + $scope.shownResult;
            $scope.filteredData = [];
            $scope.existingPage = [];
            // Start slicing the rowSearchData based on the number of totalPages
            for (var indexpage = 1; indexpage <= $scope.totalPages; indexpage++){
                // put the slice into an array, during pagination this index will be called
                $scope.filteredData[indexpage] = $scope.rowSearchData.slice(startrecord, endrecord);
                startrecord = endrecord ;
                endrecord += $scope.shownResult;
                $scope.existingPage.push(indexpage);
            }
            // release memory of the rowSearchData
            $scope.rowSearchData.length = 0;
        };

        // invoke the data to be sorted by fieldname
        $scope.sortBy = function(fieldname){
            $scope.orderField = fieldname;
            $scope.orderDescending = !$scope.orderDescending;
            // initiate data ordering based on the orderField and orderDescending
            $scope.searchResults();
        };

        // Invoke data filtering and data ordering, based on three data
        // (1) $scope.query
        // (2) $scope.orderField
        // (3) $scope.orderDescending
        // initiate data filtering based on (1)
        // initiate orderby filtering based on (2) and (3)
        $scope.searchResults = function(){
            if ($scope.query != undefined) {
                // filter overall data (rowdata) not just the currentpage but all data
                // available.
                $scope.rowSearchData = $filter('filter')($scope.rowdata, function(row){
                    // Use case insenstive check
                    if (row.title.toLowerCase().indexOf($scope.query.toLowerCase()) >= 0 ||
                        row.description.toLowerCase().indexOf($scope.query.toLowerCase()) >= 0
                        ) {
                        return true;
                    } else {
                        return false;
                    }
                });
            } else {
                // if there are no data filtering needed, then return the data as whole
                $scope.rowSearchData = utilService.clone($scope.rowdata);
            }
            // handle the ordering
            if ($scope.orderField != undefined){
                // OrderBy Filtering
                $scope.rowSearchData = $filter('orderBy')($scope.rowSearchData, $scope.orderField, $scope.orderDescending);
            }
            $scope.prepareNavigation();
        };

        // Do another live query to Applause to get new data
        $scope.queryUpdate = function(){
            $scope.loading = true;
            searchModelService.populateData($scope.keyQuery);
        };

        // With the same query criteria, ask for more record results to Applause
        $scope.loadMoreResults = function(){
            $scope.loading = true;
            searchModelService.populateMore();
        };

        // Initialization Method
        var initialization = function(){
            $scope.addloading = false;
            $scope.addingAppId = {};
            $scope.keyQuery = '';
            $scope.queryUpdate();
        }();
    }
);
