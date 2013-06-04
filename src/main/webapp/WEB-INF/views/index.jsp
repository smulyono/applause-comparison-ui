<%@ page contentType="text/html;charset=UTF-8" language="java"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>

<html lang="en" ng-app="me.smulyono.cs2302applause">
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link
	href="//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/2.3.2/css/bootstrap.min.css"
	rel="stylesheet">
<link
	href="//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/2.3.2/css/bootstrap-responsive.min.css"
	rel="stylesheet">

<title>CS2302 - Applause API</title>
<style>
.topContainer {
	margin-top : 50px;
}

.descriptioninfo {
	padding-left: 45px;
	max-width : 750px;
}

.showImgIcon {
	max-width : 48px;
}

#searchAppsModal{
	width: 70%;
	margin: -50px 0 0 -40%;
}

#searchAppsModal .modal-body {
	max-height : 600px;
}

</style>
</head>

<body>
	<div class="navbar navbar-inverse navbar-fixed-top">
		<div class="navbar-inner">
			<div class="container">
				<button type="button" class="btn btn-navbar" data-toggle="collapse"
					data-target=".nav-collapse">
					<span class="icon-bar"></span> <span class="icon-bar"></span> <span
						class="icon-bar"></span>
				</button>
				<a class="brand" href="#">CS 2302 - Applause Competitive Analysis - ${version}</a>
				<div class="nav-collapse collapse">
					<ul class="nav">
						<li class="active"><a href="#">Home</a></li>
					</ul>
				</div>
				<!--/.nav-collapse -->
			</div>
		</div>
	</div>

	<div class="container topContainer" ng-controller="ui1Ctrl">
		<ul class="breadcrumb">
			<li>Applause Competitive Analysis Part I : List of Apps</li>
		</ul>
		<div class="row-fluid clearfix">
			<div class="pull-right">
				<a href="#searchAppsModal" role="button" class="btn btn-success"
					data-toggle="modal"
					>
					Add Apps
				</a>
			</div>
		</div>
		<br />
		<div class="row-fluid">
			<div class="alert alert-info" ng-show="loading">
				<i class="icon-refresh"></i> Loading data ...
			</div>

			<div class="alert alert-error" ng-show="dataerror">
				<i class="icon-warning-sign"></i> There problem fetching data
				<button class="btn btn-warning" ng-click="reloadApp()">Reload</button>
			</div>
			<table class="table table-bordered table-condensed table-striped row-fluid">
				<tr>
					<th></th>
					<th ng-repeat="(key,value) in rowdata">
						<button class="btn btn-danger pull-right"
							ng-click="removeApplication(key)">
							<i class="icon icon-white icon-remove"></i>
						</button>
						<div class="text-center">
							<img data-ng-src="{{value['img-url']}}" class="showImgIcon" />
						</div>
						<div class="row text-center">
							{{ value.title }}
						</div>
					</th>
				</tr>
				<tr ng-repeat="data in attributes">
					<td>{{data}}</td>
					<td ng-repeat="(key,value) in rowdata">
						<div ng-switch on="data" class="text-center">
							<span ng-switch-when="applause-score">{{value[data]}}</span>
							<span ng-switch-default>
								{{ value.attributes[data].score }}
							</span>
						</div>
					</td>
				</tr>
			</table>
		</div>
	</div>

	<!-- Modal -->
	<div id="searchAppsModal" class="modal hide fade container-fluid" tabindex="-1"
		role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
	  <div class="modal-header">
	    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
	    <h3 id="myModalLabel">Search for Apps</h3>
	  </div>
	  <div class="modal-body">
	  	<ng-include src="searchAppsHtmlURL" />

	  </div>
	  <div class="modal-footer">
	    <button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>
	  </div>
	</div>

	<script
		src="//cdnjs.cloudflare.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
	<script
		src="//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/2.3.2/js/bootstrap.min.js"></script>
	<script
		src="//cdnjs.cloudflare.com/ajax/libs/angular.js/1.1.5/angular.min.js"></script>
	<script
		src="//cdnjs.cloudflare.com/ajax/libs/angular.js/1.1.5/angular-resource.min.js"></script>
	<script
		src="/js/app.js"></script>
	<script
		src="/js/controller.js"></script>
	<script
		src="/js/controller/ui1Ctrl.js"></script>
	<script
		src="/js/controller/ui2Ctrl.js"></script>
	<script
		src="/js/services.js"></script>
	<script
		src="/js/services/applauseService.js"></script>
	<script
		src="/js/services/utilService.js"></script>
	<script
		src="/js/services/viewModelService.js"></script>
	<script
		src="/js/services/searchModelService.js"></script>

</body>
</html>
