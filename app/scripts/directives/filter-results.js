
'use strict';

angular.module('publicSourcedataApp')
    .directive('filterResults',['ENV','_','Search', 'Filter', '$timeout', 'tour', 'resultsTour', function (ENV,_,Search,Filter, $timeout, tour, resultsTour) {
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
                if(Search.searchParams.displayedResult && Search.searchParams.displayedResult.length>0) resultsTour.init(tour, scope, $timeout, Search);

            }
        };
    }]);


