/*global angular */
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
 * @name publicSourcedataApp.directive:jsonLd
 * @description
 * # sdTag
 */
angular.module('publicSourcedataApp')
.directive('jsonld', ['$filter', '$sce', function($filter, $sce) {
  return {
    restrict: 'E',
    template: function() {
      return '<script type="application/ld+json" ng-bind-html="onGetJson()"></script>';
    },
    scope: {
      json: '=json'
    },
    link: function(scope, element, attrs) {
      scope.onGetJson = function() {
        return $sce.trustAsHtml($filter('json')(scope.json));
      }
    },
    replace: true
  };
}])
.directive('srcdatajsonld', ['$filter', '$sce', function($filter, $sce) {
  return {
    restrict: 'E',
    template: function() {
      return '<script type="application/ld+json" ng-bind-html="onGetSourceDataJson()"></script>';
    },
    link: function(scope, element, attrs) {
      scope.onGetSourceDataJson = function() {
				var jsondata = {
					"@context": "http://schema.org",
					"@type": "Organization",
					"url": "https://sourcedata.io",
					"logo": "https://search.sourcedata.io/images/sourcedata_icon-color.png",
					"email": "sourcedata@embo.org"
				}

        return $sce.trustAsHtml($filter('json')(jsondata));
      }
    },
    replace: true
  };
}]);
