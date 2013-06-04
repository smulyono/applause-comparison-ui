/*
 * Main Angular Module Application
 *
 * @author : Sanny Mulyono <smulyono@me.com -- http://smulyono.github.io/>
 */
'use strict';

// Angular Module initialization
var angmodule = angular.module("me.smulyono.cs2302applause",
    ["me.smulyono.cs2302applause.controllers",
     "me.smulyono.cs2302applause.services"]
    );

// Pass in the Constant for Applause Service
angmodule.constant("APPLAUSE_CONFIG",
        { API_KEY  : 'kO6fsE2kCfD644oxlzBHrEeqNRoTGkuB',
          EXCLUDE_ATTRIBTUES : [],
          SEARCH_SIZE : 15
        }
);

// Main init Module
angmodule.run(function($rootScope){
    // main initialization
    $rootScope.searchAppsHtmlURL = '/html/searchApps.html';
});
