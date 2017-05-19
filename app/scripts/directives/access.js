/*global angular*/
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
	* @ngdoc directive
	* @name sibwebApp.directive:compareTo
	* @description used to compare to models. Used initially to compare password and confirm password
	* # compareTo
	*/
	angular.module('publicSourcedataApp')
	.directive('access',access)
	.directive('loginButton',loginButton);

	access.$digest = ['Authorization','localStorageService'];
	function access(Authorization,localStorageService){
        return {
          restrict: 'A',
			scope: {},
          link: function (scope, element, attrs) {
              var makeVisible = function () {
                      element.removeClass('hidden');
                  },
                  makeHidden = function () {
                      element.addClass('hidden');
                  },
                  determineVisibility = function (resetFirst) {
                      var result;
                      if (resetFirst) {
                          makeVisible();
                      }

                      result = Authorization.authorize(true, roles, attrs.accessPermissionType);
                      if (result) {
                          makeVisible();
                      } else {
                          makeHidden();
                      }
                  },
				  run = function(){
		              if (roles.length > 0) {
		                  determineVisibility(true);
		              }
				  },
                  roles = attrs.access.split(',');

				  run();
		  		scope.$watch(function(){return localStorageService.get('currentUser');},function(n,o){
		  			if(n != o){
		  				run();
		  			}
		  		},true);


          }
        };

	}

	loginButton.$digest = ['Authorization'];
	function loginButton(Authorization){
		return {
			restrict: 'A',
			scope: {},
			link: function(scope,element,attrs){
				element.html((Authorization.authorize(true,['active'],'one')) ? "Logout" : "Login");
			}
		}
	}
})();