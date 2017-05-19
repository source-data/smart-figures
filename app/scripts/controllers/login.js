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
*****************************************************************/	/**
	 * @ngdoc controller
	 * @name sibwebApp.controller:LoginCtrl
	 * @description
	 * # initController to reset localStorage
	 * # gets User. Location to setnewpassword if 'is_password_reset' = Y
	 * Controller of the sibwebApp
	 */

    angular
        .module('publicSourcedataApp')
        .controller('LoginCtrl', LoginController);

    LoginController.$inject = ['$location', 'Authentication', 'toastr','siteTitle'];
    function LoginController($location, Authentication, toastr, siteTitle) {
        var vm = this;
        vm.login = login;
		vm.siteTitle = siteTitle.name;

        (function initController() {
            // reset login status
            // Authentication.clearCredentials();
        })();


		//////
	/**
	 * @ngdoc function
	 * @name sibwebApp.controller:LoginCtrl:login
	 * @description
	 * # sends username and password to backend for authentication.
	 * # gets User. Location to setnewpassword if 'is_password_reset' = Y
	 * Controller of the sibwebApp
	 */

        function login() {
            Authentication.login(vm.username, vm.password).then(
				function (user) {
                    Authentication.setCredentials(user.user_id, vm.username, user.api_key, user.permissions);
					if(user.is_password_reset == 'Y'){
						$location.path('/setnewpassword').replace();
					}
					else if(user.is_active == 'N'){
						$location.path('/validationRequired').replace();
					}
					else if(user.is_active == 'R'){
						toastr.error("This account has been rejected.","Permission denied");
					}
                    else $location.path('/search');
                }
            );
        }
    }

})();
