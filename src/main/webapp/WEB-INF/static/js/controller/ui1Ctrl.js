
/*
 * description
 *
 * @author : Sanny Mulyono <smulyono@me.com -- http://smulyono.github.io/>
 */

angcontroller.controller("ui1Ctrl",
    function($scope, $q, applauseService, viewModelService){
        $scope.title = 'UI1';
        $scope.rowdata = {};
        $scope.attributes = [];

        $scope.loading = false;

        $scope.$on("data changed", function(){
            // list of application Ids are changing
            $scope.rowdata = viewModelService.getRowData();

            // try to initialize the attributes list
            for (var indexkey in $scope.rowdata){
                if ($scope.rowdata[indexkey] != undefined && $scope.attributes.length <= 0){
                    // first attributes which needs to be shown first
                    $scope.attributes = ['applause-score'];
                    applauseService.retrieveAttributes($scope.rowdata[indexkey].attributes, $scope.attributes);
                }
                // only needs to do this once
                break;
            }
            $scope.loading = false;
        });

        // removing specific application
        $scope.removeApplication = function(appId){
            viewModelService.removeRowData(appId);
        };

        var initialization = function(){
            // 5 Application ID which will be initially fetched
            var initialAppId = [
                '304878510',    // skype
                '284882215',    // facebook
                '333903271',    // twitter
                '389801252',    // Instagram
                '310633997'     // Whatsapp
            ];

            $scope.loading = true;
            viewModelService.populateData(initialAppId);

            // -- Simulate Some data ---
            // $scope.rowdata = {'1' :{'title' : 'App -1 ', 'applause-score' : 90, 'attributes' : {'satisfaction' : { 'score':12} , 'privacy' : {'score':40}, 'pricing' : {'score':60}, 'usability' : {'score':100}} }};
            // angular.extend($scope.rowdata,{'2' :{'title' : 'App -2 ', 'applause-score' : 20, 'attributes' : {'satisfaction' : { 'score':12} , 'privacy' : {'score':50}, 'pricing' : {'score':50}, 'usability' : {'score':90}}}});
            // angular.extend($scope.rowdata, {'3' :{'title' : 'App -3 ', 'applause-score' : 40, 'attributes' : {'satisfaction' : { 'score':12} , 'privacy' : {'score':60}, 'pricing' : {'score':40}, 'usability' : {'score':80}}}});
            // angular.extend($scope.rowdata, {'4' :{'title' : 'App -4 ', 'applause-score' : 50, 'attributes' : {'satisfaction' : { 'score':12} , 'privacy' : {'score':70}, 'pricing' : {'score':30}, 'usability' : {'score':70}}}});
            // angular.extend($scope.rowdata, {'5' :{'title' : 'App -5 ', 'applause-score' : 60, 'attributes' : {'satisfaction' : { 'score':12} , 'privacy' : {'score':80}, 'pricing' : {'score':20}, 'usability' : {'score':60}}}});

            // $scope.attributes = ['applause-score','satisfaction', 'privacy','pricing'];
        }();
    }
);
