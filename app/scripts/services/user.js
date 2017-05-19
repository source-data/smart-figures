/*global angular*/
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
	/**
	 * @ngdoc service
	 * @name sibwebApp.User
	 * @description
	 * # User
	 * Factory in the sibwebApp. Create, Delete, Update, Get Users.
	 */



    angular
        .module('publicSourcedataApp')
        .factory('User', UserService);

    UserService.$inject = ['Restangular'];
    function UserService(Restangular) {
        var service = {};

		var users = Restangular.all('user');

        service.GetAll = GetAll;
        service.GetById = GetById;
        service.GetByAuthdata = GetByAuthdata;
        service.Create = Create;
        service.Update = Update;
        service.Delete = Delete;
		service.resetPassword = resetPassword;

        return service;

        function GetAll() {
            return users.getList().then(handleSuccess, handleError('Error getting all users'));
        }

        function GetById(id) {
            return users.get(id).then(handleSuccess, handleError('Error getting user by id'));
        }

        function GetByAuthdata(authdata) {
			return Restangular.one("user",authdata).get().then(handleSuccess, handleError('Error getting user by username'));
        }

		function resetPassword(email){
			return Restangular.all('resetpass').post({email: email});
		}

        function Create(user) {
            return users.post(user).then(handleSuccess, handleError('Error creating user'));
        }

        function Update(user) {
            return user.put().then(handleSuccess, handleError('Error updating user'));
        }

        function Delete(id) {
            return users.get(id).remove().then(handleSuccess, handleError('Error deleting user'));
        }

        // private functions

        function handleSuccess(data) {
            return data;
        }

        function handleError(error) {
            return function () {
                return { success: false, message: error };
            };
        }
    }

})();
