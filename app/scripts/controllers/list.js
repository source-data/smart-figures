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
 * @name publicSourcedataApp.controller:ListCtrl
 * @description
 * # ListCtrl
 * Controller of the publicSourcedataApp
 */
angular.module('publicSourcedataApp')
  .controller('ListCtrl', ['$scope','Restangular','ENV', '$location', function ($scope, Restangular, ENV, $location) {

	  $scope.publications = [];

	  Restangular.all('listPublications').getList().then(function(data){
		  $scope.publications = data;
		  $scope.serverURL = ENV.serverURL;
	  });

	  $scope.currentPaper ='';
	  $scope.figureToShow = 0;

	  $scope.loadPaper = function(paper){
		  $location.search({});
			
			var figures = _.orderBy(paper.figures, function(f){return f.figure_label})
			var panel_id = _.first(_.filter(figures, "first_panel_id")).first_panel_id
			if (panel_id) $location.path("panel/"+panel_id);

	  };
  
  }]);
