/*jslint node: true, newcap: true */
/*global angular */


(function () {
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
	angular
	.module('publicSourcedataApp')
	.factory('Authentication', Authentication);

	Authentication.$inject = ['$http', 'localStorageService', '$rootScope', '$timeout', 'User','Restangular', 'Base64', 'toastr', '$route'];
	function Authentication($http, localStorageService, $rootScope, $timeout, User,Restangular, Base64, toastr, $route) {
		var service = {
			currentUser: {}
		};

		service.login = login;
		service.setCredentials = setCredentials;
		service.clearCredentials = clearCredentials;
		service.getCredentials = getCredentials;

		return service;

		function login(username, password) {

			/* Use this for real authentication
			----------------------------------------------*/

			return Restangular.all('authenticate').post({username: username, password: password});

		}

		function setCredentials(user_id,username,authdata, permissions,group_id, project_id) {
			var permissionData = Base64.encode(permissions.join(";"));
			$http.defaults.headers.common['Authorization'] = 'Basic ' + authdata; // jshint ignore:line
			service.currentUser = {
				user_id: user_id,
				username: username,
				authdata: authdata,
				permissions: permissionData
			};
			localStorageService.set('currentUser', service.currentUser);

		}

		function clearCredentials() {
			service.currentUser = {};
			localStorageService.remove('currentUser');
			$http.defaults.headers.common.Authorization = 'Basic';
		}

		function getCredentials() {
			var credentials = angular.copy(service.currentUser);
			if(service.currentUser.permissions !== undefined){
				var permissionData = Base64.decode(service.currentUser.permissions);
				credentials.permissions = permissionData.split(";");
			}
			return credentials;
		}

	}

})();