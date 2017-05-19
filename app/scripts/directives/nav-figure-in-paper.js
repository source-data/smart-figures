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
* @ngdoc directive
* @name publicSourcedataApp.directive:navFigureInPaper
* @description
* # navFigureInPaper
*/
angular.module('publicSourcedataApp')

//----- navigate in previous/next figure --- Doesnt' work
.directive('navFigureInPaper', ['_',function (_) {
	return {
		scope: {panel: '='},
		template: '<a ng-show="title" href="{{href}}" title="{{title}}" ng-class="class" ></a>',
		restrict: 'A',
		link: function postLink(scope, element, attrs) {

			var figIdx = _.findIndex(scope.panel.paper.figures,function(figure){return figure.label == scope.panel.figure.label;});
			var idx = (attrs.action=='previous')? (figIdx==0) ? null : figIdx-1: (figIdx==scope.panel.paper.figures.length-1)?null:figIdx+1;
			if(idx !=null){
				scope.href = "#/panel/" + scope.panel.paper.figures[idx].panel_id;
				scope.title = scope.panel.paper.figures[idx].label;
				scope.class= (attrs.action=='previous')? "glyphicon glyphicon-chevron-left": "glyphicon glyphicon-chevron-right";
			}

		}
	};
}]);
