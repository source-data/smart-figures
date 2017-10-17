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
 * @ngdoc overview
 * @name publicSourcedataApp
 * @description
 * # publicSourcedataApp
 *
 * Main module of the application.
 */
angular
	.module('publicSourcedataApp', [
		'ngAnimate',
		'ngCookies',
		'ngResource',
		'ngRoute',
		'ngSanitize',
		'ngTouch',
		'restangular',
		'ui.bootstrap',
		'angular-carousel',
		'angular-clipboard',
		'LocalStorageModule',
		'config',
		'toastr',
		'thirdparties',
		'ui.select'
	])
	.config(function($sceDelegateProvider) {
	  $sceDelegateProvider.resourceUrlWhitelist([
	    // Allow same origin resource loads.
	    'self',
	    // Allow loading from our assets domain.  Notice the difference between * and **.
	    '**'
	  ]);

	})
	.config(function ($routeProvider,ENV) {
		$routeProvider
			.when('/', {
				templateUrl: ENV.baseURL+'views/main.html',
				controller: 'MainCtrl',
				reloadOnSearch: false,
				access:{
					loginRequired: true,
					permissions: ['active'],
					permissionCheckType: 'one'
				}

			})
			.when('/panel/:panel_id', {
				templateUrl: ENV.baseURL+'views/panel.html',
				controller: 'PanelCtrl',
				resolve: {
					panel: function(Restangular, $route) {
						return Restangular.one("panel",$route.current.params.panel_id).get();
					}
				},
				reloadOnSearch: false,
				access:{
					loginRequired: true,
					permissions: ['active'],
					permissionCheckType: 'one'
				}

			})
			.when('/paper/:pmcid/figure/:figure_id', {
				templateUrl: ENV.baseURL+'views/figure.html',
				controller: 'FigureCtrl',
				resolve: {
					figure: function(Restangular,$route){
						return Restangular.one('paper',$route.current.params.pmcid).one('figure',$route.current.params.figure_id).get();
					}
				},
				access:{
					loginRequired: true,
					permissions: ['active'],
					permissionCheckType: 'one'
				}

			})
			.when('/doi/:doi1/:doi2/figure/:figureIdx',{
				templateUrl: ENV.baseURL+'views/figure.html',
				controller: 'FigureCtrl',
				resolve: {
					figure: function(Restangular,$route){
						return Restangular.one('paper',$route.current.params.doi1+":"+$route.current.params.doi2).one('figure',$route.current.params.figureIdx).get();
					}
				},
				access:{
					loginRequired: true,
					permissions: ['active'],
					permissionCheckType: 'one'
				}
			})


			// ====================================
			// = Used when embedding smart figure =
			// ====================================

			.when('/paper/:doi1/:doi2/figure/:figureIdx/panel/:panelIdx',{
				templateUrl: ENV.baseURL+'views/figure.html',
				controller: 'FigureCtrl',
				resolve: {
					figure: function(Restangular,$route){
						return Restangular.one('paper',$route.current.params.doi1+":"+$route.current.params.doi2).one('figure',$route.current.params.figureIdx).one('panel',$route.current.params.panelIdx).get();
					}
				},
				access:{
					loginRequired: true,
					permissions: ['active'],
					permissionCheckType: 'one'
				}
			})
			.when('/doi/:doi1/:doi2/figure/:figureIdx/panel/:panelIdx',{
				templateUrl: ENV.baseURL+'views/figure.html',
				controller: 'FigureCtrl',
				resolve: {
					figure: function(Restangular,$route){
						return Restangular.one('paper',$route.current.params.doi1+":"+$route.current.params.doi2).one('figure',$route.current.params.figureIdx).one('panel',$route.current.params.panelIdx).get();
					}
				},
				access:{
					loginRequired: true,
					permissions: ['active'],
					permissionCheckType: 'one'
				}
			})

			.when('/about', {
				templateUrl: ENV.baseURL+'views/about.html',
				controller: 'AboutCtrl',
				access:{
					loginRequired: true,
					permissions: ['active'],
					permissionCheckType: 'one'
				}
			})
			.when('/api', {
				templateUrl: ENV.baseURL+'views/documentation.html',
				controller: 'DocCtrl',
				access:{
					loginRequired: true,
					permissions: ['active'],
					permissionCheckType: 'one'
				}
			})
			.when('/annotation', {
				templateUrl: ENV.baseURL+'views/annotation.html',
				controller: 'AnnotationCtrl',
				access:{
					loginRequired: true,
					permissions: [],
					permissionCheckType: 'one'
				},
				pageKey: 'TEST'
			})
			.when('/test', {
				templateUrl: ENV.baseURL+'views/test.html',
				controller: 'TestCtrl',
				access:{
					loginRequired: true,
					permissions: ['admin'],
					permissionCheckType: 'one'
				}

			})
			.when('/login', {
				templateUrl: ENV.baseURL+'views/login.html',
				controller: 'LoginCtrl',
				controllerAs: 'vm',
				access:{
					loginRequired: false,
					permissions: [],
					permissionCheckType: 'one'
				},
				pageKey: 'HOME'

			})
			.when('/register', {
				templateUrl: ENV.baseURL+'views/register.html',
				controller: 'RegisterCtrl',
				controllerAs: 'vm',
				access:{
					loginRequired: false,
					permissions: [],
					permissionCheckType: 'one'
				}
			})
			.when('/activation/:param', {
				templateUrl: ENV.baseURL+'views/activation.html',
				controller: 'RegisterCtrl',
				controllerAs: 'vm',
				access:{
					loginRequired: false,
					permissions: [],
					permissionCheckType: 'one'
				}
			})
			.when('/reject/:param', {
				templateUrl: ENV.baseURL+'views/activation.html',
				controller: 'RegisterCtrl',
				controllerAs: 'vm',
				access:{
					loginRequired: false,
					permissions: [],
					permissionCheckType: 'one'
				}
			})
			.when('/validationRequired', {
				templateUrl: ENV.baseURL+'views/validationrequired.html',
				controller: 'ValidationrequiredCtrl',
				controllerAs: 'vm',
				access:{
					loginRequired: true,
					permissions: [],
					permissionCheckType: 'one'
				},
				resolve: {
					loggedUser: function(User,Authentication){
						return User.GetByAuthdata(Authentication.currentUser.authdata);
					}
				},
				pageKey: 'HOME'
			})
			.when('/setnewpassword', {
				templateUrl: ENV.baseURL+'views/setnewpassword.html',
				controller: 'SetnewpasswordCtrl',
				controllerAs: 'vm',
				access:{
					loginRequired: true,
					permissions: ['active'],
					permissionCheckType: 'one'
				},
				pageKey: 'HOME'

			})

			.when('/forgetPassword', {
				templateUrl: ENV.baseURL+'views/forgetpassword.html',
				controller: 'ForgetpasswordCtrl',
				controllerAs: 'vm',
				access:{
					loginRequired: false,
					permissions: [],
					permissionCheckType: 'one'
				},
				pageKey: 'HOME'
			})
			.when('/list', {
				templateUrl: ENV.baseURL+'views/list.html',
				controller: 'ListCtrl',
				access:{
					loginRequired: true,
					permissions: [],
					permissionCheckType: 'one'
				},
				pageKey: 'LIST'
			})

			// used for web_components //
			.when('/form', {
				templateUrl: ENV.baseURL+'views/form.html',
				controller: 'FormCtrl',
				access:{
					loginRequired: false,
					permissions: [],
					permissionCheckType: 'one'
				},
				pageKey: ''
			})
			.otherwise({
				redirectTo: '/'
			});
	})
	.constant('siteTitle',{name:'SourceData'})
	.config(function (localStorageServiceProvider) {
		localStorageServiceProvider
			.setPrefix('SourceData')
			.setStorageType('sessionStorage')
			.setNotify(true, true);
	})
	.config(function(RestangularProvider,ENV) {
		RestangularProvider.setBaseUrl(ENV.serverURL+'index.php');
		// RestangularProvider.setRequestSuffix('.json');
		//RestangularProvider.setDefaultHttpFields({cache: ENV.httpCache});

		RestangularProvider.setDefaultHttpFields({cache: true});
	})
	.config(['$compileProvider','ENV', function ($compileProvider,ENV) {
		$compileProvider.debugInfoEnabled(ENV.debugInfoEnabled);
	}])
	.config(function($locationProvider,ENV){
		if(window.location.href.indexOf('sourcedata') > -1 || (window.location.href.indexOf('localhost') > -1 && ENV.debugInfoEnabled)){
			$locationProvider.html5Mode({
				enabled: true,
				requireBase: false
			});
		}
		else{
			console.log('no html5 mode');
			$locationProvider.html5Mode({
				enabled: false,
				requireBase: false
			});
		}
		$locationProvider.baseHref = ENV.baseHref;
	})
	.run(function($rootScope, $location, localStorageService, $http,Authentication,Authorization,ENV) {
			// keep user logged in after page refresh
			Authentication.currentUser = localStorageService.get('currentUser') || {};
			if (Authentication.currentUser.username !== undefined) {
				$http.defaults.headers.common['Authorization'] = 'Basic ' + Authentication.currentUser.authdata; // jshint ignore:line
			}
			else{
				Authentication.setCredentials(10,'public_search',"cHVibGljX3NlYXJjaDpCNnNGRWN1N1BhUzE=",["active"]);
			}
			$rootScope.$on('$routeChangeStart', function (event,next) {
				var authorised;
				if (next.access !== undefined) {
					authorised = Authorization.authorize(next.access.loginRequired,
						next.access.permissions,
						next.access.permissionCheckType);
					if(!authorised){
						if(Authentication.currentUser.username){
							$location.path('/permissionDenied').replace(); // replace is to avoid storing in browser history stack
						}
						else{
							$location.path('/login');
						}
					}
				}
			});

			$rootScope.$on("$routeChangeSuccess",
				function (angularEvent,	currentRoute) {
					var pageKey = currentRoute.pageKey;
					$(".pagekey").toggleClass("active", false);
					$(".pagekey_" + pageKey).toggleClass("active", true);
				});
			$rootScope.showHeader = ($location.absUrl().indexOf('sourcedata') > -1 || ($location.absUrl().indexOf('localhost') > -1 && ENV.debugInfoEnabled));
			console.log("showHeader:"+ENV.debugInfoEnabled+" => ");
			console.info($location.absUrl());
			$rootScope.baseURL = ENV.baseURL;
		}
	)
	.run(function ($window,Restangular,toastr,$log){
		Restangular.setErrorInterceptor(
			function(response) {
				if (response.status == 401) {
					toastr.info("Login required... ");
					$window.location.href='/login';
				} else if (response.status == 404) {
					$log.error("Resource not available...");
				} else if(response.status == 500) {
					$log.error(response.data);
				} else if(response.status == 501) {
					toastr.error(response.data.message,response.data.title);
				} else {
					toastr.warning("Response received with HTTP error code: " + response.status );
				}
				return false; // stop the promise chain
			}
		);
	});
