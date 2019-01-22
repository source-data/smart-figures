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
 * @ngdoc function
 * @name publicSourcedataApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the publicSourcedataApp
 */
angular.module('publicSourcedataApp')
.controller('AboutCtrl', function ($scope) {
})

.controller('DocCtrl', ['$scope','$location', 'Search','localStorageService','$timeout','Restangular','ENV','Authentication','User','_','Base64', function ($scope,$location, Search,localStorageService,$timeout,Restangular,ENV,Authentication,User,_,Base64) {

	$scope.user = {};
	var loggedUser = Authentication.getCredentials();
	User.GetById(loggedUser.user_id).then(function(user){
		var authdata = Base64.decode(user.api_key);
		user.api_key = authdata.split(":")[1];
		$scope.user.login = user.login;
		$scope.user.api_key = user.api_key;
		$scope.user.baseUrl = (ENV.serverURL.indexOf('http') > -1) ? ENV.serverURL+'index.php': window.location.href.split("#")[0]+ ENV.serverURL+'index.php';
	});

	//-D------ GET DATA ------//
	Restangular.all('documentation').getList().then(function(data){
		$scope.documentation = data[0].category;
		_.forEach($scope.documentation,function(category){
			_.forEach(category,function(doc){
				doc.run = {'status':false,'url':'','response':''};
			});
		});
	});

	//-F------ SHOW - HIDE DOC ------//
	$scope.showDoc = function(cat,doc){
		_.forEach($scope.documentation[cat],function(d){
			if(_.isEqual(d,doc)){
				d.show = (d.show)?false : true;
			}
			else{
				d.show = false;
			}
		});
	};

	//-F------ TRY ------//
	$scope.try = function(doc){
		var rest = null;
		doc.run.status = 'pend';
		var start_url = ENV.serverURL + "index.php/";
		if(doc.name == 'panel'){
			doc.run.url = start_url + doc.name + "/"+doc.parameters.panel_id.value;
			rest = Restangular.one(doc.name,doc.parameters.panel_id.value).get();
			// doc.run.url = start_url + doc.name + "/"+doc.parameters.panel_id.value+"?format="+doc.parameters.format.value;
			// rest = Restangular.one(doc.name,doc.parameters.panel_id.value).get({format:doc.parameters.format.value});
		}
		else if(doc.name == 'figure'){
			doc.run.url = start_url  +"collection/"+doc.parameters.collection_id.value+ "/paper/"+doc.parameters.doi.value+"/figure/"+doc.parameters.figure_idx.value;
			rest = Restangular.one('collection',doc.parameters.collection_id.value).one('paper',doc.parameters.doi.value.replace("/",":")).one('figure',doc.parameters.figure_idx.value).get();
		}
		else if(doc.name == 'paper'){
			doc.run.url = start_url +"collection/"+doc.parameters.collection_id.value +"/"+ doc.name + "/"+doc.parameters.doi.value;
			rest = Restangular.one('collection',doc.parameters.collection_id.value).one(doc.name,doc.parameters.doi.value.replace("/",":")).get();
		}
		else if(doc.name == 'papers'){
			doc.run.url = start_url + doc.name + "/"+doc.parameters.year.value;
			rest = Restangular.one(doc.name,doc.parameters.year.value).get();
		}
		else if(doc.name == 'latest'){
			doc.run.url = start_url+"panels/" + doc.name;
			rest = Restangular.one('panels/latest').get();
		}
		
		else if(doc.name !='shortest'){
			doc.run.url = start_url + doc.name + "/"+doc.parameters.term.value+"?limit="+doc.parameters.limit.value+"&motif="+ doc.parameters.motif.value;
			rest = Restangular.one(doc.name,doc.parameters.term.value).get({motif:doc.parameters.motif.value, limit: doc.parameters.limit.value});
		}
		else{
			doc.run.url = start_url + "intervention/"+doc.parameters.iTerm.value+"/assayed/"+doc.parameters.aTerm.value+"?limit="+doc.parameters.limit.value+"&motif="+ doc.parameters.motif.value;
			rest = Restangular.one('intervention',doc.parameters.iTerm.value).one('assayed',doc.parameters.aTerm.value).get({motif:doc.parameters.motif.value, limit: doc.parameters.limit.value});
		}
		if(rest){
		rest.then(function(data){
			doc.run.status = 'finished';
			if(data.plain){
				doc.run.response = JSON.stringify(data.plain(),null,3);
			}
			else{
				doc.run.response = data;
			}
		});
		}
	};

    //
	// $scope.startTour = function() {
	// 	var tour = new Tour({
	// 		debug:true,
	// 		backdrop:true,
	// 		steps: [
	// 			{
	// 				element: "#step1",
	// 				title: "Title of step 1",
	// 				content: "Content of my step 1"
	// 			},
	// 			{
	// 				element: "#step2",
	// 				title: "Title of step 2",
	// 				content: "Content of my step 2"
	// 			}
	// 		]
	// 	});
	// 	console.info(tour);
	// 	tour.init(); //will only launch tour for the first time! Have to empty cache to see it again
	// 	tour.start();
	// }


}])
	;
