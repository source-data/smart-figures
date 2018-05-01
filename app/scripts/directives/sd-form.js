
'use strict';

angular.module('publicSourcedataApp')
    .directive('sdForm',['_','ENV','Search', 'Filter','$location','$rootScope', function (_,ENV,Search,Filter, $location,$rootScope) {
			return {
				scope:{searchParams:'=', onFormSubmit:'&'},
				restrict: 'E',
				templateUrl: function(){ return ENV.baseURL+'views/partials/sdForm.html'; },
				link: function(scope,element,attributes){

					scope.baseURL = ENV.baseURL;
					scope.showLogo = ($rootScope.showHeader)? "false" : "true" ;

					//-M------ MAIN ------//
					scope.tagTypes = [
						{value: '', print: 'any type'},
						{value: 'molecule', print: 'small molecule'},
						{value: 'gene', print: 'gene'},
						{value: 'protein', print: 'protein'},
						{value: 'subcellular', print: 'subcellular structure'},
						{value: 'cell', print: 'cell type'},
						{value: 'tissue', print: 'tissue'},
						{value: 'organism', print: 'organism'}
					];

					//-F------ LOAD EXAMPLE ------//
					scope.loadExample = function(cas){
						if (cas=='advanced'){
							scope.searchParams.intervention="insulin";
							scope.searchParams.interventionType="molecule";
							scope.searchParams.assayed="glucose";
							scope.searchParams.assayedType="molecule";
						}else if(cas=='advanced2'){
							scope.searchParams.intervention="glucose";
							scope.searchParams.interventionType="molecule";
							scope.searchParams.assayed="insulin";
							scope.searchParams.assayedType="molecule";
						}else{
							scope.searchParams.generic="insulin";
						}
						scope.onFormSubmit();
					}

					//-F------ RESET FUNCTION------//
					scope.reset = function(){
						scope.searchParams.result = '';
						scope.searchParams.summaryResult = '';
						scope.searchParams.done = false;
						scope.searchParams.generic = '';
						scope.searchParams.genericType = '';
						scope.searchParams.intervention = '';
						scope.searchParams.interventionType = '';
						scope.searchParams.assayed = '';
						scope.searchParams.assayedType = '';
						scope.searchParams.uniqueJournals = '';
						$location.search({});
					};

					//-F------ PROPOSE TAG ------//
					scope.proposeTags = function(category,value){
						var params = JSON.stringify(scope.searchParams);
						var counter = angular.copy(Search.searchParams.counter);
						// console.info(counter);
						// var contraire = (category=='assayed') ? 'intervention' : 'assayed';
						// if ((category=='generic' && scope.searchParams.generic.length>2) || (category != 'generic' && (scope.searchParams[contraire] && scope.searchParams[category].length>1) || (!scope.searchParams[contraire] && scope.searchParams[category].length>2))){
							return Search.proposeTags(scope.searchParams,category).then(function(response){
								var new_counter = Search.searchParams.counter;
								// console.info(new_counter);
								// console.info(params,Search.searchParams);
								if (!scope.searchParams.loading && new_counter==counter){
									return response;
								}
							});
						// }
					};

					//-F------ Set TAG TYPE ------//
					scope.setTagType = function(category,type){
						scope.searchParams[category+"Type"] = type;
					};

					//-F------ Toggle Advanced ------//
					scope.toggleAdvanced = function(){
						scope.searchParams.advanced = !scope.searchParams.advanced;
						scope.searchParams.result = '';
						scope.searchParams.summaryResult = '';
						scope.searchParams.done = false;
						if (scope.searchParams.advanced){
							scope.searchParams.generic = '';
							scope.searchParams.genericType = '';
						}
						else{
							scope.searchParams.intervention = '';
							scope.searchParams.interventionType = '';
							scope.searchParams.assayed = '';
							scope.searchParams.assayedType = '';
						}
						$location.search({});
					};

			}
		};
	}]);


