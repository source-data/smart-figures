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
.controller('MainCtrl', ['$scope','$rootScope','$location', 'Search', 'Filter', 'tour', function ($scope, $rootScope, $location, Search, Filter, tour ) {
	
	//-BEGIN THE TOUR ON PAGE LOAD---------------//
	angular.element(document).ready(function(){
		console.log("ready!");
		var searchTour = new tour({
			steps: [
				{
					orphan: true,
					title: "SourceData SmartFigure Search",
					content: "<p>Welcome to the SmartFigure search engine from SourceData.</p><p>SourceData helps you search for figures showing specific items - genes, proteins or molecules, for example - we refer to these as entities.</p> <p>Press 'Next' to see a short tour of the application.</p>",
					animation: true,
					backdrop:true,
					backdropPadding:5
				},
				{
					element: ".sdform-adv-btn-interv",
					title: "Perturbation",
					placement: "top",
					content: "This input box is for the independent variable: the entity that was manipulated in a study. We refer to these as perturbations.",
					animation: true,
					backdrop:true,
					backdropPadding:5
				},
				{
					element: ".sdform-adv-interv-input",
					title: "Enter the perturbation here",
					placement: "bottom",
					content: "Type the name of the perturbation here. A list of the available entities that match your input will be available to select.",
					animation: true,
					backdrop:true,
					backdropPadding:{top:5, right:18, bottom:15, left:10}
				},
				{
					element: ".sdform-adv-interv-input-group-btn",
					title: "Choose the perturbation element type",
					placement: "top",
					content: "You can specify the type of entity that interests you using this drop-down box. You can specify that you are searching only for genes, for example.",
					animation: true,
					backdrop:true,
					backdropPadding:{top:5, right:7, bottom:5, left:10}
				},
				{
					element: ".sdform-adv-btn-assay",
					title: "Assay",
					placement: "top",
					content: "This input box is for the dependent variable: the entity that was measured in the study.",
					animation: true,
					backdrop:true,
					backdropPadding:5
				},
				{
					element: ".sdform-adv-btn-assay-input",
					title: "Enter the assayed item here",
					placement: "bottom",
					content: "Type the name of the assay here. A list of the available entities that match your input will be available to select.",
					animation: true,
					backdrop:true,
					backdropPadding:{top:5, right:15, bottom:15, left:10}
				},
				{
					element: ".sdform-adv-btn-assay-input-group-btn",
					title: "Choose the assayed element type",
					placement: "top",
					content: "Just like the perturbations, you can narrow down your search to only certain entity types.",
					animation: true,
					backdrop:true,
					backdropPadding:{top:5, right:7, bottom:5, left:10}
				},
				{
					element: ".sdform-adv-btn-go",
					title: "Click here to search",
					placement: "top",
					content: "Click here to search for figures where the perturbation you entered was performed and the assayed entity was measured.",
					animation: true,
					backdrop:true,
					backdropPadding: 5
				}
			]
		});

		searchTour.init();
		searchTour.start();
	});

	//-F------ FORM SUBMIT => change Location ------//
	$scope.formSubmit = function(){
		angular.forEach(categories,function(cat){
			var type = ($scope.searchParams[cat+"Type"]) ? $scope.searchParams[cat+"Type"]+":" : "";
			if(type+$scope.searchParams[cat] !== $location.search()[cat] || $scope.searchParams.motif !== $location.search().motif){
				$location.search(cat,(type+$scope.searchParams[cat]) ? type+$scope.searchParams[cat] : null);
				$location.search('motif',$scope.searchParams.motif);
			}
		});
	};

	//-F------ SEARCH if $location.search ------//
	var search = function(){
		if(!angular.equals($location.search(),{})){
			$scope.searchParams.loading = true;
			if($location.search().assayed || $location.search().intervention) $scope.searchParams.advanced = true;
			if($location.search().generic) $scope.searchParams.advanced = false;
			Search.search().then(function(){
				$scope.searchParams.hide_input = true;
				$scope.searchParams.loading = false;
				$scope.searchParams.navbarResult = 'result';
				Filter.removeAll();
				Filter.init();
			});
		}else{
			Filter.removeAll();
			Filter.init();
		}
	};

	//-O------ On route UPDATE Search and rm filters ------//
	$scope.$on('$routeUpdate', function(){
        search();
	});
	$scope.$on('$routeChangeSuccess', function(){
		search();
	});


	$scope.searchParams = Search.searchParams;
	$scope.searchParams.displayedResult = Search.searchParams.displayedResult;
	$scope.searchParams.assayedType = ($scope.searchParams.assayedType=='gene,protein') ? '':$scope.searchParams.assayedType;
	$scope.searchParams.interventionType = ($scope.searchParams.interventionType=='gene,protein') ? '':$scope.searchParams.interventionType;
	$scope.searchParams.genericType = ($scope.searchParams.genericType=='gene,protein') ? '':$scope.searchParams.genericType;

	var categories = Search.getCategories();
	search();
	$scope.abortSearch = function(){
		Search.abortSearch();
		$scope.searchParams.loading = false;
	};

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





