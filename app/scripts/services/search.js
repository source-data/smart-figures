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
* @name publicSourcedataApp.search
* @description
* # search
* Factory in the publicSourcedataApp.
*/
angular.module('publicSourcedataApp')
.factory('Search', ['Restangular','$location','$rootScope', '$q', '$timeout','$filter', function (Restangular, $location, $rootScope,$q, $timeout,$filter) {
	var categories = ['intervention','assayed','generic'];
	var abortSearch;
	// Public API here
	return {
		searchParams: {
			counter:0,
			intervention: '',
			interventionType: '',
			assayed: '',
			assayedType: '',
			generic: '',
			genericType: '',
			advanced: true,
			motif: 'scale',
			result:'',
			cas:'',
			summaryResult:'',
			navbarResult:'result',
			path: '',
			size: 0,
			limit: 20, // number of items to return
			done: false,
			loading: false,
			history:[]
		},
	
		//-F------ PROPOSE TAGS ------//
		proposeTags: function(searchParams,cas){
			var params = {cas:cas,
										generic:{value:searchParams['generic'], type:searchParams['genericType']},
										intervention:{value:searchParams['intervention'],type:searchParams['interventionType']},
										assayed:{value:searchParams['assayed'],type:searchParams['assayedType']}
									};
			var rest = Restangular.all('tags').getList(params);
			// var rest = Restangular.one('tags',value).get({type:type,other:searchParams});
			return rest;
		},

		//-F------ GET Categories ------//
		getCategories: function(){
			return categories;
		},

		getSearchHypothesis: function(){
			var _this = this;
			var hypothesis = '';
			if (_this.searchParams.generic){
				hypothesis = "<b>" + ((_this.searchParams.genericType) ? _this.searchParams.generic + " ("+_this.searchParams.genericType+")" : _this.searchParams.generic) + "</b>";
			}
			else{
				if (_this.searchParams.interventionType) hypothesis = "influence of <b>" + ((_this.searchParams.intervention) ? _this.searchParams.intervention + " ("+_this.searchParams.interventionType+")" : _this.searchParams.interventionType + " components ") + "</b>";
				else if (_this.searchParams.intervention) hypothesis = "influence of <b>" + _this.searchParams.intervention + "</b>";
				if (hypothesis && (_this.searchParams.assayedType || _this.searchParams.assayed)) hypothesis += " on ";
				if (_this.searchParams.assayedType) hypothesis += "<b>" + ((_this.searchParams.assayed) ? _this.searchParams.assayed + " ("+_this.searchParams.assayedType+")" : _this.searchParams.assayedType + " components ") + "</b>";
				else if (_this.searchParams.assayed) hypothesis += "<b>" + _this.searchParams.assayed + "</b>";
			}
			return hypothesis;
		},
		
		getSummary: function(first){
			var _this = this;
			var sum = {hypothesis:''};
			sum.cas = _this.cas;
			
			sum.hypothesis = _this.getSearchHypothesis();

			if (_this.cas=='direct'){
				sum.nb_papers = _this.searchParams.result.nb.total.papers;
				sum.nb_panels = _this.searchParams.result.nb.total.panels ;
				sum.paper_sing = (sum.nb_papers>1) ? ' papers' : ' paper' ;
				sum.panel_sing = (sum.nb_panels>1) ? ' distinct experiments' : ' distinct experiment';
				sum.phrase = sum.nb_papers + sum.paper_sing + " ("+sum.nb_panels+ sum.panel_sing +")" +" found where " + sum.hypothesis + " is measured.";
				sum.nb_inter = _this.searchParams.result.intervention.length;
				sum.nb_assay = _this.searchParams.result.assayed.length;
				// var inter_sing = (sum.nb_inter>1) ? ' perturbed ' : ' perturbed ';
				// var assay_sing = (sum.nb_assay>1) ? ' measured entities' : ' measured entity';
				sum.nb_phrase = sum.nb_inter + " perturbed and " + sum.nb_assay +" measured entities";
			}
			else if (_this.cas=='path'){
				sum.path_sing = (_this.searchParams.result.path.nb>1) ? ' paths' : ' path';
				sum.min_path_length = _.min(_.keys(_this.searchParams.result.path.paths));
				sum.phrase = "<b>"+_this.searchParams.result.path.nb+"</b>" + sum.path_sing +" of at least <b>" + sum.min_path_length + "</b> steps found where " + sum.hypothesis + " is measured.";
			}
			else{
				sum.phrase = "No papers found where " + sum.hypothesis + " is measured.";
			}

			_this.searchParams.summary = sum;
			return sum;
		},

		formatPath: function(){
			var _this = this;
			var new_path = {nb:0,paths:{}};
			_.forEach(_this.searchParams.result.path,function(p){
				new_path.nb++;
				var pathLength = p.length;
				if(!new_path.paths[pathLength]){
					new_path.paths[pathLength] = [];
				}
				new_path.paths[pathLength].push(p);
			});
			return new_path;
		},

		formatInterventionAssayed: function(tags){
			var ret = [];
			var tab = _.groupBy(tags,'label');
			_.forEach(tab,function(t,idx){
				ret.push({list:_.values(t),label:idx});
			});
			return ret;
		},
		
		getSmPaperResults :function(){
			var _this = this;

			_.forEach(_this.searchParams.result.direct,function(p){
				p.firstHypos = [];
				p.followedHypos = [];
				_.forEach(p.hypos,function(h,idx){
					var sens = (_this.searchParams.direction=='intervention') ? 'target' : 'source';
					var shortHypos = {
						type:h[sens].type,
						label:h[sens].label
					};
					if (!shortHypos.label){
						shortHypos.label = h[sens].paper_raw_text;						
					}
					else if (h[sens].paper_raw_text && shortHypos.label.toLowerCase().indexOf(h[sens].paper_raw_text.toLowerCase())!=0){
						shortHypos.label += " ("+h[sens].paper_raw_text+")";
					}
					
						
					shortHypos.panel_id = h.panels[0].panel_id;
					if (idx<3){ p.firstHypos.push(shortHypos); }
					else { p.followedHypos.push(shortHypos);}
				});
			});
		},
		 
		formatResult: function(data,resetPagination){
			console.info(data.plain());
			
			var _this = this;
			console.info(_this.searchParams);
			_this.cas = data.cas;
			_this.searchParams.result = data.plain();
			_this.searchParams.result.direct = _.values(_this.searchParams.result.direct);
			_this.searchParams.result.displayedResult = angular.copy(_this.searchParams.result.direct);
			if (!data.nb){
				return;
			}
			var split_filename = data.filename.split("_");
			var hist = {date:split_filename.shift()};
			split_filename.pop();
			hist.request = split_filename.join("_");
			_this.searchParams.history.push(hist);
			
			if (_this.cas=='direct'){		
				// _.forEach(_this.searchParams.result.direct,function(paper){
				// 	paper.hypos = _.values(paper.hypos);
				// });
				// console.info(angular.copy(_this.searchParams.result.direct));
				_this.searchParams.result.intervention = _this.formatInterventionAssayed(data.intervention);
				_this.searchParams.result.assayed = _this.formatInterventionAssayed(data.assayed);
				if (data.filters.status){
					_this.searchParams.result.filters = data.filters;
				}		
				if (_this.searchParams.pagination){
					_this.searchParams.pagination.totalItems = _this.searchParams.result.nb.total.papers;				
				}
				else{
					_this.searchParams.pagination = {totalItems : _this.searchParams.result.nb.total.papers,currentPage:1,itemsPerPage:20,maxSize:2};
				}
				_this.getSmPaperResults();
			
			}
			else{
				_this.searchParams.result.path = _this.formatPath();
			}
			_this.searchParams.summary = {};
			_this.getSummary(true);
			_this.searchParams.done = true;
			console.info(angular.copy(_this.searchParams.result.filters));
		},

		//-F------ FROM LOCATION GET PARAMETERS and DO THE SEARCH ------//
		search: function () {

			var _this = this;
			var url = $location.search();
			_this.searchParams.loading = true;
			_this.searchParams.result = {};			
			_this.searchParams.summary = '';
			
			
			if (!angular.equals(url,{})){
				angular.forEach(categories,function(cat){
					if(!url[cat]){
						_this.searchParams[cat] = '';
						_this.searchParams[cat+"Type"] = '';
						return;
					}
					var parts = url[cat].split("::");
					_this.searchParams[cat] = parts[0];
					_this.searchParams[cat+"Type"] = (parts.length==2) ? parts[1] : '';
				});
			}
			var intervention = (_this.searchParams.interventionType) ? _this.searchParams.intervention + "::" + _this.searchParams.interventionType : _this.searchParams.intervention;
			var assayed = (_this.searchParams.assayedType) ? _this.searchParams.assayed + "::" + _this.searchParams.assayedType : _this.searchParams.assayed;
			var generic = (_this.searchParams.genericType) ? _this.searchParams.generic + "::" + _this.searchParams.genericType : _this.searchParams.generic;
			var params = {motif:_this.searchParams.motif, limit: _this.searchParams.limit};
			
			var rest;

			if (abortSearch){
				console.log('aborting');
				// abortSearch.resolve();
				// $timeout.cancel(abortSearch);
			}
			abortSearch = $q.defer();

			if(generic){
				rest = Restangular.one('generic',generic.replace("/","##")).withHttpConfig({timeout: abortSearch.promise}).get(params);
				_this.advanced = false;
			}
			else if (intervention && assayed){ rest = Restangular.one('intervention',intervention.replace("/","##")).withHttpConfig({timeout: abortSearch.promise}).one('assayed',assayed).get(params); }
			else if (intervention){ _this.searchParams.direction='intervention';rest = Restangular.one('intervention',intervention.replace("/","##")).withHttpConfig({timeout: abortSearch.promise}).get(params); }
			else if (assayed){ _this.searchParams.direction='assayed';rest = Restangular.one('assayed',assayed.replace("/","##")).withHttpConfig({timeout: abortSearch.promise}).get(params); }

			if (rest){
				// console.info("SEARCH");
				return rest.then(function(data){			
					_this.searchParams.counter++;
					_this.formatResult(data);
					
					if (_this.cas =='direct'){
						if (data.status<2){
							// console.info("FORMAT_RESULTS");
							Restangular.one('formatResults',data.filename).get().then(function(data2){
								// console.info(data2);
								_this.searchParams.result.filename_formatted = data2.filename;
								_this.searchParams.result.filters = data2.filters;
								_this.searchParams.result.status = 2;
							});
						}
					}
				});
			}
		},

		fetch: function(){
			var _this = this;
			var formatted_filename = angular.copy(_this.searchParams.result.filename_formatted);
			if (formatted_filename.indexOf('raw')>-1){formatted_filename = formatted_filename.replace('raw','formatted');}
			console.info("FETCH",formatted_filename);
			var params_filters = (_this.searchParams.active_filters) ? JSON.stringify(_this.searchParams.active_filters) : null;
			if (_this.searchParams.previous && !_.isEqual(params_filters,_this.searchParams.previous.filters)){
				_this.searchParams.pagination.currentPage=1;
			}
			Restangular.one('fetch',formatted_filename).get({filters:params_filters,pagination:_this.searchParams.pagination}).then(function(data){
				_this.formatResult(data);
				_this.searchParams.previous = {filters:params_filters,pagination:JSON.stringify(_this.searchParams.pagination)};
				// $rootScope.$broadcast('fetch.finished');
			});
		},

		abortSearch: function(){
			if(abortSearch){
				$timeout.cancel(abortSearch);
				abortSearch.resolve();
			}
		}
	};
}]);
