/*global angular, console*/
(function(){
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
	* @ngdoc controller
	* @name sibwebApp.controller:UserCtrl
	* @description
	* # UserCtrl
	* Controller of the sibwebApp. View and Edit Users.
	*/
	angular.module('publicSourcedataApp')
	.controller('UserCtrl', UserCtrl);

	UserCtrl.$inject = ['User', 'Authentication','$routeParams', 'toastr', '$filter', '$location','_'];
	function UserCtrl(User,   Authentication, $routeParams, toastr, $filter, $location, _){
		var vm = this;
		vm.getUser = getUser;
		vm.goToUser = goToUser;
		vm.updateUser = updateUser;
		var user_id = $routeParams.user_id;
		var loggedUser = Authentication.getCredentials();
		if(user_id) getUser(user_id);


		///////////////////////

		function getUser(user_id){
			User.GetById(user_id).then(function(user){
				vm.user = user;
				var leader = false;
				if(+loggedUser.user_id !== +user_id && loggedUser.permissions.indexOf('admin') === -1){
					toastr.error('Sorry, you cannot edit this account.','Permission denied');
					$location.path("/users");
				}
			});
		}


		function goToUser(user){
			if(user.canEdit == 'N') return;
			if(user.canEdit == 'Y') $location.path("/user/"+user.user_id);
		}

		function updateUser(){
			User.Update(vm.user).then(function(user){
				vm.user = user;
				toastr.success('Accound updated successfully','Success');
			});
		}
	}
})();
