
/*
 * description
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
        $scope.currentPage = 1;
        $scope.totalPages = 0;
        // ----------------------

        $scope.$on("search data changed", function(){
            $scope.loading = false;
            $scope.rowdata = searchModelService.getRowDataArray();
            $scope.searchResults();
        });

        // receive notification from view model page that data has changed
        $scope.$on("data changed", function(){
            $scope.addloading = false;
        });

        $scope.isAppExists = function(appid){
            return viewModelService.existAppId(appid);
        };

        $scope.isAppAdding = function(appid){
            var retval = false;
            if (this.addingAppId[appid] != undefined){
                retval = true;
            }

            if ($scope.isAppExists(appid) && retval){
                retval = false;
                delete this.addingAppId[appid];
            }
            return retval;
        };

        $scope.removeApp = function(appid){
            viewModelService.removeRowData(appid);
        };

        $scope.allowToAddApp = function(){
            return viewModelService.canAddMoreApp();
        };

        $scope.addApp = function(appid){
            if ($scope.allowToAddApp()){
                $scope.addloading = true;
                $scope.addingAppId[appid] = appid;
                viewModelService.populateData([appid]);
            }
        };

        $scope.previousPage = function(){
            if ($scope.currentPage > 1){
                $scope.currentPage--;
            }
        };

        $scope.nextPage = function(){
            if ($scope.currentPage < $scope.totalPages){
                $scope.currentPage++;
            }
        };

        $scope.changePage = function(newpagenumber){
            $scope.currentPage = newpagenumber;
        };

        $scope.prepareNavigation = function(){
            $scope.currentPage = 1;

            // make sure that shownresult is number
            $scope.shownResult = $scope.shownResult * 1;

            $scope.searchTotalCount = searchModelService.totalSearchCount;
            $scope.searchCount = $scope.rowSearchData.length;
            $scope.totalPages = Math.floor($scope.searchCount / $scope.shownResult);
            var modulus = $scope.searchCount % $scope.shownResult;
            if (modulus > 0){
                $scope.totalPages += 1;
            }

            var startrecord = 0;
            var endrecord = 0 + $scope.shownResult;
            $scope.filteredData = [];
            $scope.existingPage = [];
            for (var indexpage = 1; indexpage <= $scope.totalPages; indexpage++){
                $scope.filteredData[indexpage] = $scope.rowSearchData.slice(startrecord, endrecord);
                startrecord = endrecord ;
                endrecord += $scope.shownResult;
                $scope.existingPage.push(indexpage);
            }
            // release memory of the rowSearchData
            $scope.rowSearchData.length = 0;
        };

        $scope.sortBy = function(fieldname){
            $scope.orderField = fieldname;
            $scope.orderDescending = !$scope.orderDescending;
            $scope.searchResults();
        };

        $scope.searchResults = function(){
            if ($scope.query != undefined) {
                $scope.rowSearchData = $filter('filter')($scope.rowdata, function(row){
                    if (row.title.toLowerCase().indexOf($scope.query.toLowerCase()) >= 0 ||
                        row.description.toLowerCase().indexOf($scope.query.toLowerCase()) >= 0
                        ) {
                        return true;
                    } else {
                        return false;
                    }
                });
            } else {
                $scope.rowSearchData = utilService.clone($scope.rowdata);
            }
            // handle the ordering
            if ($scope.orderField != undefined){
                $scope.rowSearchData = $filter('orderBy')($scope.rowSearchData, $scope.orderField, $scope.orderDescending);
            }
            $scope.prepareNavigation();
        };

        $scope.queryUpdate = function(){
            $scope.loading = true;
            searchModelService.populateData($scope.keyQuery);
        };

        $scope.loadMoreResults = function(){
            $scope.loading = true;
            searchModelService.populateMore();
        };

        var initialization = function(){
            $scope.addloading = false;
            $scope.addingAppId = {};
            $scope.keyQuery = 'facebook';
            $scope.queryUpdate();
        }();
    }
);
