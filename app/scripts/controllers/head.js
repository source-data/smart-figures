/*jslint node: true, newcap: true */
/*global angular */

'use strict';

angular.module('publicSourcedataApp')

/***--- Main controller ---***/
.controller('headCtrl', ['$scope', '$rootScope', '$location', function($scope, $rootScope, $location) {
	$rootScope.$on('$locationChangeSuccess', function(event){
	    var url = $location.url()
		if (url.indexOf("/panel") === 0){
			$scope.canonicalUrl = url;
		}
		else $scope.canonicalUrl = '';
	})

}]);
