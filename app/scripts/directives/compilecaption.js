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
 * @name publicSourcedataApp.directive:compileCaption
 * @description
 * # compileCaption
 */
angular.module('publicSourcedataApp')
.directive('compile', ['$compile', function ($compile) {
	return function(scope, element, attrs) {
		var elementWatch = scope.$watch(
			function(scope) {
				// watch the 'compile' expression for changes
				return scope.$eval(attrs.compile);
			},
			function(value) {
				// when the 'compile' expression changes
				// assign it into the current DOM
				element.html(value);
				// compile the new DOM and link it to the current
				// scope.
				// NOTE: we only compile .childNodes so that
				// we don't get into infinite loop compiling ourselves
				if(value) $compile(element.contents())(scope);
			}
		);

		scope.$on('$destroy',function(){
			elementWatch();
		});

	};
}])
.directive('compileCaption', ['$compile', function ($compile) {
	return function(scope, element, attrs) {
		var watchScope = scope.$watch(
			function(scope) {
				// watch the 'compile' expression for changes
				return scope.$eval(attrs.compileCaption);
			},
			function(value) {
				element.html(value);
				if(value) $compile(element.contents())(scope);
			}
		);
		scope.$on('$destroy',function(){
			watchScope();
		});
	};
}]);
