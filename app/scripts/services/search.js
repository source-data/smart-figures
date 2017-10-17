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
			intervention: '',
			interventionType: '',
			assayed: '',
			assayedType: '',
			generic: '',
			genericType: '',
			advanced: true,
			motif: 'scale',
			result:'',
			summaryResult:'',
			navbarResult:'result',
			path: '',
			size: 0,
			limit: 20, // number of items to return
			done: false,
			loading: false,
			action: '' //connect or downstream or upstream,
		},
		//-F------ PROPOSE TAGS ------//
		proposeTags: function(value,type){
			var rest = Restangular.one('tags',value).get({'type':type});
			return rest;
		},

		//-F------ GET Categories ------//
		getCategories: function(){
			return categories;
		},

		getSummary: function(){
			var _this = this;
			var sum = {hypothesis:''};
			sum.cas = (_this.searchParams.result.direct.length) ? 'direct' : (_this.searchParams.result.shortestPath.length)?'shortestPath':null;
			if(_this.searchParams.generic){
				sum.hypothesis = "<b>" + ((_this.searchParams.genericType) ? _this.searchParams.generic + " ("+_this.searchParams.genericType+")" : _this.searchParams.generic) + "</b>";
			}
			else{
				if(_this.searchParams.interventionType) sum.hypothesis = "influence of <b>" + ((_this.searchParams.intervention) ? _this.searchParams.intervention + " ("+_this.searchParams.interventionType+")" : _this.searchParams.interventionType + " components ") + "</b>";
				else if(_this.searchParams.intervention) sum.hypothesis = "influence of <b>" + _this.searchParams.intervention + "</b>";
				if(sum.hypothesis && (_this.searchParams.assayedType || _this.searchParams.assayed)) sum.hypothesis += " on ";
				if(_this.searchParams.assayedType) sum.hypothesis += "<b>" + ((_this.searchParams.assayed) ? _this.searchParams.assayed + " ("+_this.searchParams.assayedType+")" : _this.searchParams.assayedType + " components ") + "</b>";
				else if(_this.searchParams.assayed) sum.hypothesis += "<b>" + _this.searchParams.assayed + "</b>";
			}

			if(sum.cas =='direct'){
				sum.papers = _this.searchParams.displayedResult.length;
				sum.panels = [];
				_.forEach(_this.searchParams.displayedResult,function(paper){
					_.forEach(paper.hypos,function(hypo){
						_.forEach(hypo.panels,function(p){
							if(!_.includes(sum.panels,p.panel_id)) sum.panels.push(p.panel_id);
						})
					})
				});

				sum.paper_sing = (sum.papers>1) ? ' papers' : ' paper' ;
				sum.panel_sing = (sum.panels.length>1) ? ' distinct experiments' : ' distinct experiment';
				sum.phrase = sum.papers + sum.paper_sing + " ("+sum.panels.length+ sum.panel_sing +")" +" found where " + sum.hypothesis + " is measured.";
			}
			else if(sum.cas =='shortestPath'){
				sum.papers = _this.searchParams.result.shortestPath.length;
				sum.phrase = "One path of " + sum.papers + " steps found where " + sum.hypothesis + " is measured.";

			}
			else if(!sum.cas){
				sum.phrase = "No papers found where " + sum.hypothesis + " is measured.";
			}
			_this.searchParams.summary = sum;
			return sum;
		},

		//-F------ FROM LOCATION GET PARAMETERS and DO THE SEARCH ------//
		search: function () {

			function getPaperExperimentalAssays(){
				_.forEach(_this.searchParams.result.direct,function(paper){
					paper.assays = [];
					_.forEach(paper.hypos,function(hypo){
						_.forEach(hypo.panels,function(p){
							_.forEach(p.assays,function(a){
								var idx = _.findIndex(paper.assays,function(pa){return pa.external_id == a.external_id;});
								if(idx<0){ paper.assays.push(a); }
							});
						})
					})
				})
			}

			var _this = this;
			_this.searchParams.loading = true;
			_this.searchParams.result = '';
			if(!angular.equals($location.search(),{})){
				angular.forEach(categories,function(cat){
					if(!$location.search()[cat]){
						_this.searchParams[cat] = '';
						_this.searchParams[cat+"Type"] = '';
						return;
					}
					var parts = $location.search()[cat].split(":");
					_this.searchParams[cat+"Type"] = (parts.length==2) ? parts[0] : '';
					_this.searchParams[cat] = (parts.length==2) ? parts[1] : parts[0];
				});
			}
			var intervention = (_this.searchParams.interventionType) ? _this.searchParams.interventionType+":"+_this.searchParams.intervention : _this.searchParams.intervention;
			var assayed = (_this.searchParams.assayedType) ? _this.searchParams.assayedType+":"+_this.searchParams.assayed : _this.searchParams.assayed;
			var generic = (_this.searchParams.genericType) ? _this.searchParams.genericType+":"+_this.searchParams.generic : _this.searchParams.generic;
			var rest;

			if(abortSearch){
				console.log('aborting');
				// abortSearch.resolve();
				// $timeout.cancel(abortSearch);
			}
			abortSearch = $q.defer();



			if(generic){
				console.log('generic');
				rest = Restangular.one('generic',generic.replace("/","##")).withHttpConfig({timeout: abortSearch.promise}).get({motif:_this.searchParams.motif, limit: _this.searchParams.limit});
				_this.advanced = false;
			}
			else if(intervention && assayed){
				console.log("IA");
				rest = Restangular.one('intervention',intervention.replace("/","##")).withHttpConfig({timeout: abortSearch.promise}).one('assayed',assayed).get({motif:_this.searchParams.motif, limit: _this.searchParams.limit});
			}
			else if(intervention){
				console.log("I");
				rest = Restangular.one('intervention',intervention.replace("/","##")).withHttpConfig({timeout: abortSearch.promise}).get({motif:_this.searchParams.motif, limit: _this.searchParams.limit});
			}
			else if(assayed){
				console.log("A");
				rest = Restangular.one('assayed',assayed.replace("/","##")).withHttpConfig({timeout: abortSearch.promise}).get({motif:_this.searchParams.motif, limit: _this.searchParams.limit});
			}

			if(rest){
				return rest.then(function(data){

					_this.searchParams.summary = {};
					_this.searchParams.result = data.results;
					_this.searchParams.displayedResult = angular.copy(_this.searchParams.result.direct);
					_this.searchParams.path = data.path;
					_this.searchParams.size = data.size;
					_this.searchParams.action = data.action;
					_this.searchParams.summaryResult = data.summary;
					_this.searchParams.done = true;

					getPaperExperimentalAssays();
					_this.getSummary();


					if(data.results.direct.length && !data.results.shortestPath.length){
						Restangular.one('fetchResult',data.path).get({action:data.action,intervention:data.summary.tagsI.join(";"),assayed:data.summary.tagsA.join(";")}).then(function(dataFull){
							_.forEach(dataFull.results.direct, function(fullPaper,fullPaperIdx){
								if(_this.searchParams.result.direct[fullPaperIdx].paper_id == fullPaper.paper_id)  {
									if(_this.searchParams.result.direct[fullPaperIdx].hypos.length == fullPaper.hypos.length){
										angular.merge(_this.searchParams.result.direct[fullPaperIdx].hypos,fullPaper.hypos);
									}
									else{
										_this.searchParams.result.direct[fullPaperIdx].hypos = fullPaper.hypos;
									}
								}
							});

							getPaperExperimentalAssays();

							// angular.merge(_this.searchParams.result,dataFull.results);
							$rootScope.$broadcast('UPDATE.RESULTS');
							_this.searchParams.displayedResult = angular.copy(_this.searchParams.result.direct);
							_this.searchParams.summaryResult = dataFull.summary;
							_this.searchParams.done = true;
							_this.searchParams.loading = false;
						});
					}
					else{
						_this.searchParams.done = true;
						_this.searchParams.loading = false;
					}

				});
			}
		},
		abortSearch: function(){
			if(abortSearch){
				$timeout.cancel(abortSearch);
				abortSearch.resolve();
			}
		}
	};
}]);
