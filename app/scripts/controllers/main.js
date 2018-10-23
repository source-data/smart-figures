'use strict';
/************************ LICENCE ***************************
* 	This file is part of <SourceData SmartFigure frontend code to search and navigate the SourceData resource>
*     Copyright (C) <2016>  EMBO and Swiss Institute of Bioinformatics
*
*     This program is free software: you can redistribute it and/or modify
*     it under the terms of the GNU Affero General Public License as
*     published by the Free Software Foundation, either version 3 of the
*     License, or (at your option) any later version.
*
*     This program is distributed in the hope that it will be useful,
*     but WITHOUT ANY WARRANTY; without even the implied warranty of
*     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*     GNU Affero General Public License for more details.
*
*     You should have received a copy of the GNU Affero General Public License
*    along with this program.  If not, see <http://www.gnu.org/licenses/>
*
*****************************************************************/
/**
* @ngdoc function
* @name publicSourcedataApp.controller:MainCtrl
* @description
* # MainCtrl
* Controller of the publicSourcedataApp
*/
angular.module('publicSourcedataApp')
.controller('MainCtrl', ['$scope','$rootScope','$location', 'Search', 'Filter', 'ENV','$timeout', 'tour', 'searchTour', 
 function ($scope, $rootScope, $location, Search, Filter, ENV,$timeout,  tour, searchTour ) {
	
	// The First Tour Starts Here (see thirdParties.js for details)
	// Tour only begins if the application is opened at the root path
	if($location.path()=="/" && angular.equals($location.search(),{})) searchTour.init(tour, $scope);

	$scope.serverURL = ENV.serverURL;
	
	//-F------ FORM SUBMIT => change Location ------//
	$scope.formSubmit = function(){
		
		console.log('search from main.js');
		
		var url = $location.search();
		angular.forEach(categories,function(cat){
			var type = ($scope.searchParams[cat+"Type"]) ? "::" + $scope.searchParams[cat+"Type"] : "";
			if(type+$scope.searchParams[cat] !== $location.search()[cat] || $scope.searchParams.motif !== $location.search().motif){
				url[cat] = ($scope.searchParams[cat]+type) ? $scope.searchParams[cat]+type : null;
			}
		});
		$location.search(url);
	};

	//-F------ SEARCH if $location.search ------//
	var search = function(){
		if(!angular.equals($location.search(),{})){
			$scope.searchParams.loading = true;
			if ($location.search().assayed || $location.search().intervention) $scope.searchParams.advanced = true;
			if ($location.search().generic) $scope.searchParams.advanced = false;
			Search.search().then(function(){
				$scope.results = Search.searchParams.results;
				$scope.searchParams.hide_input = true;
				$scope.searchParams.loading = false;
				$scope.searchParams.navbarResult = 'result';
				Filter.removeAll();
				Filter.init();
				
			});
		}
		else{
			$scope.searchParams.result = null;
			$scope.searchParams.intervention= '';
			$scope.searchParams.interventionType= '';
			$scope.searchParams.assayed= '';
			$scope.searchParams.assayedType= '';
			$scope.searchParams.generic= '';
			$scope.searchParams.genericType= '';
			$scope.searchParams.advanced= true;
		}
	};
	
	//-F------ ABORT SEARCH ------//
	$scope.abortSearch = function(){
		Search.abortSearch();
		$scope.searchParams.loading = false;
	};

	//-O------ On route UPDATE Search and rm filters ------//
	$scope.$on('$routeUpdate', function(){
		console.info("routeUpdate");
		search();
	});


	//-I------- INIT -----//
	$scope.searchParams = Search.searchParams;
	$scope.searchParams.displayedResult = Search.searchParams.displayedResult;
	$scope.searchParams.assayedType = ($scope.searchParams.assayedType=='gene,protein') ? '' : $scope.searchParams.assayedType;
	$scope.searchParams.interventionType = ($scope.searchParams.interventionType=='gene,protein') ? '' : $scope.searchParams.interventionType;
	$scope.searchParams.genericType = ($scope.searchParams.genericType=='gene,protein') ? '' : $scope.searchParams.genericType;

	var categories = Search.getCategories();
	search();
	

	//------- FILTERS ------//

	//add filter input divs
	$scope.addNewFilterItem = function() {
		Filter.filtercollection.subitems.push({});
		$rootScope.$broadcast('new.filter',{});
	};
	$scope.removeFilterItem = function(i,type,currFilt) {
		Filter.filters[type].value = 0;
		Filter.filters[type].type = 0;
		Filter.filtercollection.subitems.splice(i, 1);
		var result = Filter.apply(currFilt);
		Search.searchParams.displayedResult = result;
		$scope.searchParams.displayedResult = result;
		Search.getSummary();
	};

	//adjust displayed results when adding or removing filter
	$scope.applyFilter = function(currFilt) {
		var result = Filter.apply(currFilt);
		$scope.searchParams.displayedResult = result;
		$scope.searchParams.summary = Search.getSummary();
	};
	$scope.filtercollection = Filter.filtercollection;

	$scope.trackSelections = function(currFilt){
		$scope.searchParams.displayedResult = Filter.trackSelections(currFilt);
	};


}]);





