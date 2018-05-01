'use strict';
/**
 * @ngdoc service
 * @name publicSourcedataApp.filter
 * @description
 * # filter
 * Factory in the publicSourcedataApp.
 */
angular.module('publicSourcedataApp')
    .factory('Filter', ['_','$rootScope','$filter','Search', function (_, $rootScope , $filter, Search) {
        return {

            filtercollection : { //responsible for rendering filter divs
            subitems : [{}]
            },

            multiple : { // all multiple select values
                selectedjournal : [],
                selectedauthor : [],
                selectedyear : [],
                selectedassay : [],
                selectedorganism : []
            },

            filters : [ //used for synchronising and separating scope of divs and ui-select list
            {name:'journal',type:0,value:0},
            {name:'author',type:0,value:0},
            {name:'year',type:0,value:0},
            {name:'assay',type:0,value:0},
            {name:'organism',type:0,value:0}
            ],

            selections : [],
            journal : [],
            author : [],
            year : [],
            assay : [],
            organism : [],

            //------- default category of new filter div ------//
            newFilterType : function (filters) {
                var _this=this;
                var currFilter = {name:null,type:null,value:null};
                var keepGoing = true;
                angular.forEach(filters, function (f) {
                    if(keepGoing){
                        if(f.value == 0){
                            currFilter = f;
                            keepGoing = false;
                        }
                    }
                });

                _this.selections = [];
                _this.selections.push(currFilter);
                return currFilter;
            },

            trackSelections : function (currFilt){
                var _this = this;
                if(_this.selections.length>0){
                    angular.forEach(_this.selections, function(sel){
                        var typeName = 'selected'+sel.name ;
                        _this.multiple[typeName] = [];
                    });
                }
                _this.selections = [];
                _this.selections.push(currFilt);
                return _this.apply(currFilt.name);
            },

            //------- list of categories available for filter auto-complete ------//
            init: function () {
							var _this = this;
							if (Search.searchParams.result !== null){
                	_this.journal = _this.getListOfjournal(Search.searchParams.result.direct);
                	_this.author = _this.getListOfauthor(Search.searchParams.result.direct);
                	_this.year = _this.getListOfyear(Search.searchParams.result.direct);
                	_this.assay = _this.getListOfassay(Search.searchParams.result.direct);
                	_this.organism = _this.getListOforganism(Search.searchParams.result.direct);
							}
							else {
								_this.journal = null;
								_this.author = null;
								_this.year = null;
								_this.assay = null;
								_this.organism = null;
							}
            },

            getListOfassay: function(results){
                var listOfAssays = [];
                _.forEach(_.map(results,function(paper){return paper.hypos}),function(hypos){
                    _.forEach(_.map(hypos,function(hypo){return hypo.panels}),function(panel){
                        _.forEach(_.map(panel,function(panelInfo){return panelInfo.assays}),function(assay){
                            _.forEach(_.map(assay,function(assayInfo){return assayInfo}),function(ass){
                                if(!_.includes(listOfAssays,ass.external_name)){ listOfAssays.push(ass.external_name)}
                            });
                        });
                    });
                });
                return $filter('orderBy')(listOfAssays)
            },
            getListOforganism: function(results){
                var listOfOrganisms = [];
                _.forEach(_.map(results,function(paper){return paper.hypos}),function(hypos){
									// console.info(hypos);
                    _.forEach(_.map(hypos,function(hypo){return hypo.panels}),function(panel){
                        _.forEach(_.map(panel,function(panelInfo){return panelInfo.taxon.name}),function(taxon){
                            if(!_.includes(listOfOrganisms,taxon)){ listOfOrganisms.push(taxon)}
                        });
                    });
                });
                return $filter('orderBy')(listOfOrganisms)
            },
            getListOfauthor: function(results){
                var listOfAuthors = [];
                _.forEach(_.map(results,function(paper){return paper.authors}),function(all_authors){
									if (all_authors){										
                    _.forEach(all_authors.split(','),function(auth){
                        if(!_.includes(listOfAuthors,auth)){ listOfAuthors.push(auth); }
                    });
									}
                });
                return $filter('orderBy')(listOfAuthors)
            },
            getListOfyear: function(results){
                var listOfYears = [];
                var regex_four_digit = new RegExp('[0-9]{4}');
                _.forEach(_.map(results,function(paper){return paper.date}),function(date){
                    if(regex_four_digit.test(date)){
                        if(!_.includes(listOfYears,regex_four_digit.exec(date)[0])){
                            listOfYears.push(regex_four_digit.exec(date)[0]);
                        }
                    }
                });
                return $filter('orderBy')(listOfYears)
            },
            getListOfjournal: function(results){
                var listOfJournals = [];
                _.forEach(_.map(results,function(paper){return paper.journal_title}),function(j){
                    if(!_.includes(listOfJournals,j)){ listOfJournals.push(j); }
                });
                return $filter('orderBy')(listOfJournals)
            },


            //------- filtering methods------//
            apply : function (currFilt) {
                var _this = this;
                var filtersArePresent = false;
                angular.forEach(_this.multiple, function (f) {
                    if(f.length>0){filtersArePresent = true;}
                });
                if(!filtersArePresent){
                    _this.init();
                    return Search.searchParams.result.direct;
                }else{
                    return _this.revisitFilters(currFilt);
                }
            },

            revisitFilters : function(currFilt){ // update filters
                var _this = this;
                var filteredresult = Search.searchParams.result.direct; //start from complete list of results
                var allyears = [];
                var allauthors = [];
                var alljournals = [];
                var all = [];
                var typesOfFilters = [0,0,0,0,0];

                    if(_this.multiple.selectedjournal.length > 0){
                        typesOfFilters[0]=1;
                        angular.forEach(_this.multiple.selectedjournal, function (v) {
                            var filterByJournal = $filter('filter')(filteredresult,{journal_title:v},true);
                            alljournals = _this.keepUnique(filterByJournal,alljournals);
                        });
                    }if(_this.multiple.selectedauthor.length > 0){
                        typesOfFilters[1]=1;
                        angular.forEach(_this.multiple.selectedauthor, function (v) {
                            var filterByAuthor = $filter('filter')(filteredresult,{authors:v});
                            allauthors = _this.keepUnique(filterByAuthor,allauthors);
                        });
                    }if(_this.multiple.selectedyear.length > 0){
                        typesOfFilters[2]=1;
                        angular.forEach(_this.multiple.selectedyear, function (d) {
                            var filterByYear = $filter('filter')(filteredresult,{date:d});
                            allyears = _this.keepUnique(filterByYear,allyears);
                        });
                    }if(typesOfFilters[0]+typesOfFilters[1]+typesOfFilters[2] > 0){
                        all = alljournals.concat(allauthors).concat(allyears);
                        var count = typesOfFilters[0]+typesOfFilters[1]+typesOfFilters[2];
                        filteredresult =  _this.coappearingEntries(all, count);
                    }if(_this.multiple.selectedassay.length > 0){
                        typesOfFilters[3]=1;
                        var res = _this.filterPanels(filteredresult);
                        filteredresult = res[0];
                        all = all.concat(res[1]);
                    }if( _this.multiple.selectedorganism.length > 0){
                        typesOfFilters[4]=1;
                        var res = _this.filterPanels(filteredresult);
                        filteredresult = res[0];
                        all = all.concat(res[1]);
                    }
                _this.revisitLists(all, currFilt);
                return filteredresult;
            },

            revisitLists : function (result, currFilt) { // update auto suggestion lists
                var _this = this;
                // keep only unique papers
                var seen = {};
                var uniqueRes = result.filter(function(item){
                    if(seen.hasOwnProperty(item.paper_id)){
                        return false;
                    }else{
                        seen[item.paper_id] = true;
                        return true;
                    }
                });

                var updates = ['journal','author','year','assay'];
                // var updates = ['journal','author','year','assay','organism'];
                var i = 0;

                angular.forEach(updates,function(name){
                    var typeName = 'selected'+name ;
                    var functionName = 'getListOf'+name;
                        if(_this.filters[i].value != 0 && _this.multiple[typeName].length == 0){
                            if(currFilt==name){
                                _this[name] = _this[functionName](uniqueRes);
                            }else {
                                uniqueRes = Search.searchParams.result.direct;
                                _this[name] = _this[functionName](uniqueRes);
                            }
                        }
                    i = i+1;
                });
                if(_this.filtercollection.subitems.length == 1){ // if there is only one filter, reset
                    uniqueRes = Search.searchParams.result.direct;
                }
                i=0;
                angular.forEach(updates,function(name){
                    var functionName = 'getListOf'+name;
                    if(currFilt != name){
                        _this[name] = _this[functionName](uniqueRes);
                    }
                    i = i+1;
                });
                $rootScope.$broadcast('filters.updated',{});
            },

            coappearingEntries : function(data, count){
                var results = [];
                angular.forEach(data, function (d) {
                    if(_.countBy(results,'paper_id')[d.paper_id] == undefined && _.countBy(data,'paper_id')[d.paper_id] == count){
                        results = results.concat(d);
                    }
                });
                return results;
            },
            keepUnique : function (data, type) {
                angular.forEach(data, function (entry) {
                    if(_.countBy(type,'paper_id')[entry.paper_id] == undefined){
                        type = type.concat(entry);
                    }
                });
                return type;
            },
            filterPanels : function (results) {
                var _this = this;
                var hypos = [];
                var papers = [];
                var filterTypes = 0;
                if(_this.multiple.selectedassay.length > 0){
                    filterTypes = filterTypes+1;
                    angular.forEach(results,function(paper){
                        hypos = _this.filterAssayPanels(paper);
                        if(hypos.length>0){
                            var modifiedPaper = angular.copy(paper);
                            modifiedPaper.hypos = hypos;
                            papers.push(modifiedPaper);
                        }
                    });
                }if(_this.multiple.selectedorganism.length > 0){
                    filterTypes = filterTypes+1;
                    if(_this.multiple.selectedassay.length > 0){
                        results = angular.copy(papers);
                    }
                    angular.forEach(results,function(paper){
                        hypos = _this.filterTaxonPanels(paper);
                        if(hypos.length>0){
                            var modifiedPaper = angular.copy(paper);
                            modifiedPaper.hypos = hypos;
                            papers.push(modifiedPaper);
                        }
                    });
                }
                var papersCoap =  _this.coappearingEntries(papers, filterTypes);
                return [papersCoap,papers];
            },
            filterAssayPanels : function (paper) {
                var _this = this;
                var allpanels = [];
                var allhypos = [];
                var listOfAssays = [];
                    _.forEach(paper.hypos,function(hypo){
                        _.forEach(hypo.panels,function(panel){
                            _.forEach(panel.assays,function(assay){
                                if(!_.includes(listOfAssays,assay.external_name)){
                                        listOfAssays.push(assay.external_name);
                                }
                            });
                            var common = $.grep(listOfAssays, function(ass) {
                                return $.inArray(ass, _this.multiple.selectedassay ) !== -1;
                            });
                            if(common.length > 0){
                                allpanels.push(panel);
                            }
                            listOfAssays = [];
                        });
                        if(allpanels.length > 0){
                            allhypos.push(hypo);
                            allpanels = [];
                        }
                    });
                return allhypos;
            },
            filterTaxonPanels : function (paper) {
                var _this = this;
                var allpanels = [];
                var allhypos = [];
                var listOfOrg = [];
                _.forEach(paper.hypos,function(hypo){
                    _.forEach(hypo.panels,function(panel){
                            if(panel.taxon.name != null && !_.includes(listOfOrg,panel.taxon.name)){
                                listOfOrg.push(panel.taxon.name);
                            }
                        var common = $.grep(listOfOrg, function(taxon) {
                            return $.inArray(taxon, _this.multiple.selectedorganism ) !== -1;
                        });
                        if(common.length > 0){
                            allpanels.push(panel);
                        }
                        listOfOrg = [];
                    });
                    if(allpanels.length > 0){
                        allhypos.push(hypo);
                        allpanels = [];
                    }
                });
                return allhypos;
            },

            removeAll : function () {
                var _this = this;
                _this.filtercollection.subitems = [{}];
                angular.forEach(_this.multiple, function (m) {
                    m.length = 0;
                });
                angular.forEach(_this.filters, function (f) {
                    f.value = 0;
                });
                _this.selections = [];
                _this.journal = [];
                _this.author = [];
                _this.year = [];
                _this.assay = [];
                _this.organism = [];
            }

        }
    }]);
