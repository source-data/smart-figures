
'use strict';

angular.module('publicSourcedataApp')
    .directive('filterResults',['ENV','_','Search', 'Filter', '$location', '$timeout', 'tour', 'resultsTour', function (ENV,_,Search,Filter, $location, $timeout, tour, resultsTour) {
        return {
            scope:{parentindex:'=',
                render:'=',
                removeFilterItem:'&',
                addNewFilterItem:'&',
                applyFilter:'&',
                trackSelections:'&'},
            restrict: 'E',
            templateUrl:ENV.baseURL+'views/partials/filterResults.html',
            link:function(scope,element,attributes){
                
                scope.filters = Filter.filters;
                scope.currentFilter = Filter.newFilterType(scope.filters);
                scope.selections = Filter.selections;
                scope.journals = Filter.journal;
                scope.authors = Filter.author;
                scope.years = Filter.year;
                scope.assays = Filter.assay;
                scope.organisms = Filter.organism;

                scope.filtercollection = Filter.filtercollection;
                scope.multiple = Filter.multiple;

                scope.greaterThan = function (val) {
                    return function(item){
                        return item >= val;
                    }
                };

                scope.$on('filters.updated',function(){
                    scope.journals = Filter.journal;
                    scope.authors = Filter.author;
                    scope.years = Filter.year;
                    scope.assays = Filter.assay;
                    scope.organisms = Filter.organism;


                });
                scope.$on('new.filter',function(){
                    Filter.selections = [];
                    scope.selections = [];
                });

                //run the results tour - see thirdParties.js for details
                if(Search.searchParams.displayedResult && Search.searchParams.displayedResult.length>0 && $location.search().resultsTour){ resultsTour.init(tour, scope, $timeout, Search);}

            }
        };
    }])

		.directive('searchPagination',['ENV','_','Search','$filter','$timeout', function (ENV,_,Search,$filter,$timeout) {
			return {
				scope:{},
				restrict: 'E',
				templateUrl:ENV.baseURL+'views/partials/searchPagination.html',
				link:function(scope,element,attributes){
					scope.small_size = (attributes.size && attributes.size=='small');
					scope.position = (attributes.position && attributes.position=='left') ? 'left' : 'right'; 
					scope.pagination_class = {page: (scope.small_size) ? 'pagination-sm' : 'pagination', input:(scope.small_size) ? 'input-sm':''};

					scope.searchParams = Search.searchParams;
					var paginationTimeout = null;
					scope.changePagination = function(){
						$timeout.cancel(paginationTimeout);
						paginationTimeout = $timeout(function(){
							if (scope.searchParams.pagination.itemsPerPage){
								Search.fetch();
							}
						},750);
					}			
				}
			}
		}])

		
		.directive('filtertest',['ENV','_','Search','$filter','$timeout', function (ENV,_,Search,$filter,$timeout) {
	      return {
	          scope:{},
	          restrict: 'E',
	          templateUrl:ENV.baseURL+'views/partials/filterResults2.html',
	          link:function(scope,element,attributes){
							
							$timeout(function(){
								scope.btn_class = (attributes.from=='panel') ? 'btn-sm' : 'btn';
								scope.filters = angular.copy(Search.searchParams.result.filters);
								// scope.filters = Search.searchParams.result.filters;
								scope.active_filters =[];
						
								_.forEach(scope.filters.list,function(filter,filter_name){
									filter.f_values = [];
									_.forEach(filter.values,function(val){
										var display = val;
										if(filter_name=='organisms') display = val['name'] + " ["+val['tax_id']+"]";
										if(filter_name=='assays') display = val['external_name'];
										val = {obj:val,display:display};
										filter.f_values.push(val);
									});
									filter.values = [];
								});
												
								scope.filter_types = _.sortBy(_.keys(scope.filters.list),'idx');
								if(!scope.active_filters.length){
									scope.active_filters = [{type:scope.filter_types[0],values:[]}];
								}
								Search.searchParams.active_filters = scope.active_filters; 
							},100);						
						
							scope.changeFilterType = function(idx){
								scope.active_filters[idx].values = [];
							}
						
							scope.filterAction = function(action,idx){
								if(action=='add'){
									var available_filter_types = $filter('availableFilterTypes')(scope.filter_types,scope.active_filters);
									scope.active_filters.push({type:available_filter_types[0],values:[]});
								}
								else if (action=='remove'){
									scope.active_filters.splice(idx,1);
								
								}
								else if (action=='reset'){
									scope.active_filters = [{type:scope.filter_types[0],values:[]}];
									Search.searchParams.active_filters = scope.active_filters; 
									Search.fetch();
								}
								else if(action=='update'){
									Search.searchParams.active_filters = scope.active_filters; 
									Search.fetch();
								}
							}
						
						}
				}
			}])	
	.directive('filterResults2',['ENV','_','Search','$filter', function (ENV,_,Search,$filter) {
	      return {
	          scope:{},
	          restrict: 'E',
	          templateUrl:ENV.baseURL+'views/partials/filterResults2.html',
	          link:function(scope,element,attributes){
						// scope.active_filters = Search.searchParams.result.active_filters;
						scope.filters = Search.searchParams.result.filters;
						scope.active_filters =[];
						
						
						_.forEach(scope.filters.list,function(filter,filter_name){
							filter.f_values = [];
							_.forEach(filter.values,function(val){
								var display = val;
								if(filter_name=='organisms') display = val['name'] + " ["+val['tax_id']+"]";
								if(filter_name=='assays') display = val['external_name'];
								val = {obj:val,display:display};
								filter.f_values.push(val);
							});
							filter.values = [];
						});
												
						scope.filter_types = _.sortBy(_.keys(scope.filters.list),'idx');
						if(!scope.active_filters.length){
							scope.active_filters = [{type:scope.filter_types[0],values:[]}];
						}
					
						Search.searchParams.active_filters = scope.active_filters; 
						
						scope.changeFilterType = function(idx){
							scope.active_filters[idx].values = [];
						}
						
						scope.filterAction = function(action,idx){
							if(action=='add'){
								var available_filter_types = $filter('availableFilterTypes')(scope.filter_types,scope.active_filters);
								scope.active_filters.push({type:available_filter_types[0],values:[]});
							}
							else if (action=='remove'){
								scope.active_filters.splice(idx,1);
								
							}
							else if (action=='reset'){
								scope.active_filters = [{type:scope.filter_types[0],values:[]}];
								Search.searchParams.active_filters = scope.active_filters; 
								Search.fetch();
							}
							else if(action=='update'){
								Search.searchParams.active_filters = scope.active_filters; 
								Search.fetch();
							}
						}
					
					}
				}
		}])
		;


