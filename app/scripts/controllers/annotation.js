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
* @name publicSourcedataApp.controller:PanelCtrl
* @description
* # PanelCtrl
* Controller of the publicSourcedataApp
*/
angular.module('publicSourcedataApp')
.controller('AnnotationCtrl',['$scope', '$location', '$filter', '$timeout','$rootScope', 'Search','Filter', 'ENV', 'Restangular','localStorageService','Navigation','_','Authentication','toastr', function ($scope, $location, $filter, $timeout, $rootScope, Search, Filter, ENV, Restangular,localStorageService,Navigation,_,Authentication,toastr) {

	$scope.panel = {panel_id: 996,format:'pubannotation',annotation:{}};

	
	$scope.panel_list = [23363, 25305, 14058, 20969, 28816, 22163, 22574, 19595, 24396, 14497, 21536, 14404, 14057, 20012, 14101, 20024, 16158, 15149, 15543, 14106, 19126, 14025, 14062, 25938, 28812, 15863, 18175, 26676, 16162, 17977, 20050, 21437, 20029, 14053, 21524, 17715, 21529, 14573, 18765,18497, 19178, 15866, 13452, 14033, 15144, 15822, 25705, 27355, 15867, 25500];
	
	
	$scope.reset = function(){
		$scope.panel.annotation = {};	
	}
	
	$scope.routeUpdate = function(panel){
		if(panel){
			$scope.panel.panel_id = panel;
		}
		$location.search({panel:$scope.panel.panel_id});
	}

	
	$scope.getPanelPubtator = function(){
		$scope.panel.$wait = true;
		$scope.panel.annotation = {};	
		Restangular.one('panel',$scope.panel.panel_id).get({format:$scope.panel.format}).then(function(data){
			if(typeof(data)=='string' && data.indexOf('ERROR')>-1 && data.indexOf('ERROR')<4){
				if(data.indexOf('permission denied')>-1){
				 toastr.error("ERROR: permission denied"); 					
				}
				else{
				 toastr.error("this panel doesn't exist");
				}
				$scope.panel.$wait = false;
				return; 
			 }
			$scope.panel.annotation.format = angular.copy($scope.panel.format);
			if($scope.panel.format=='pubtator'){
				$scope.panel.annotation.output = data;				
			}
			if($scope.panel.format=='pubannotation'){	
				$scope.panel.annotation.text = data.text;
				$scope.panel.annotation.output = JSON.stringify(data.plain(),null,3);
				$scope.panel.annotation.tags = [];
				_.forEach(data.denotations,function(d){
					var place = d.span[0];
					var tag = data.text.substring(place.begin-1,place.end);
					$scope.panel.annotation.tags.push({tag:tag,id:d.obj,begin:+place.begin});
				});
			}
			$scope.panel.$wait = false;
		},function(){console.info('error?');});
	}
	
	
	
	var url = $location.search();
	if(url.panel){
		$scope.panel.panel_id = url.panel;
		$scope.getPanelPubtator();
	}


}]);
