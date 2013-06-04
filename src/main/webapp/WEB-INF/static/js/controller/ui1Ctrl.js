
/*
 * Controller for interacting with the UI-1 (part of the requirement wireframe)
 * http://www.cloudspokes.com/challenges/2302
 *
 * Main Comparison Page Controller
 *
 * @author : Sanny Mulyono <smulyono@me.com -- http://smulyono.github.io/>
 */

angcontroller.controller("ui1Ctrl",
    function($scope, $q, applauseService, viewModelService){
        $scope.title = 'UI1';

        // Main Object to holds all chosen application which will be compared
        $scope.rowdata = {};
        // List of attributes
        $scope.attributes = [];
        // Flag variable to identify the application loading process
        // TRUE when application is still loading or in adding process
        // FALSE when there are no loading application
        $scope.loading = false;

        // Receive notification from viewModelService when there are
        // some process failures.
        $scope.$on("data error", function(){
            // will faill gracefully since there is no data being set so
            // just any existing data
            $scope.loading = false;
            $scope.dataerror = true;
        });

        // Receive notification from viewModelService when the main data
        // is being changed from other system (e.g SearchModelService which
        // used in Search Modal)
        $scope.$on("data changed", function(){
            // list of application Ids are changing
            $scope.rowdata = viewModelService.getRowData();

            // try to initialize the attributes list
            for (var indexkey in $scope.rowdata){
                if ($scope.rowdata[indexkey] != undefined && $scope.attributes.length <= 0){
                    // first attributes which needs to be shown first
                    $scope.attributes = ['applause-score'];
                    // parse all attributes and put them into array $scope.attributes
                    applauseService.retrieveAttributes($scope.rowdata[indexkey].attributes, $scope.attributes);
                }
                // only needs to do this on the first iteration
                break;
            }
            $scope.loading = false;
            $scope.dataerror = false;
        });

        // removing specific application from the View / Comparison View
        $scope.removeApplication = function(appId){
            viewModelService.removeRowData(appId);
        };

        // Reload the comparison application with 5 static application for starter
        $scope.reloadApp = function(){
            // 5 Application ID which will be initially fetched
            var initialAppId = [
                '304878510',    // skype
                '284882215',    // facebook
                '333903271',    // twitter
                'bdc7ae24-9051-474c-a89a-2b18f58d1317',    // Linkedin
                '389801252'     // instagram
            ];
            // Mark the loading process, so UI can notify user
            $scope.loading = true;
            // Populate data
            viewModelService.populateData(initialAppId);
        };

        // Initialization Method
        var initialization = function(){
            $scope.reloadApp();
        }();
    }
);
