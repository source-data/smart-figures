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
* @name publicSourcedataApp.controller:FormCtrl
* @description
* # FormCtrl
* Controller of the publicSourcedataApp
*/
angular.module('publicSourcedataApp')
.controller('FormCtrl', ['$scope','$location', 'Search', 'Filter','ENV', function ($scope,$location, Search, Filter,ENV ) {

	//-F------ FORM SUBMIT => change Location ------//
	$scope.formSubmit = function(){
		$scope.baseURL = ENV.baseURL;
		var baseurl = 'http://sourcedata.vital-it.ch/public/#/search?';
		var url = baseurl;
		angular.forEach(categories,function(cat){
			var type = ($scope.searchParams[cat+"Type"]) ? $scope.searchParams[cat+"Type"]+":" : "";
			if(type+$scope.searchParams[cat] !== $location.search()[cat] || $scope.searchParams.motif !== $location.search().motif){
				if(type+$scope.searchParams[cat]) url += cat+"="+type+$scope.searchParams[cat]+"&";
			}
		});
		if(url != baseurl){
			url += "motif="+$scope.searchParams.motif;
			self.location.href = url;
		}
	};

	$scope.searchParams = Search.searchParams;
	$scope.searchParams.displayedResult = Search.searchParams.displayedResult;
	$scope.searchParams.assayedType = ($scope.searchParams.assayedType=='gene,protein') ? '':$scope.searchParams.assayedType;
	$scope.searchParams.interventionType = ($scope.searchParams.interventionType=='gene,protein') ? '':$scope.searchParams.interventionType;
	$scope.searchParams.genericType = ($scope.searchParams.genericType=='gene,protein') ? '':$scope.searchParams.genericType;

	var categories = Search.getCategories();
}]);





