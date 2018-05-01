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
* @name publicSourcedataApp.directive:directSearchResult
* @description
* # directSearchResult
*/
angular.module('publicSourcedataApp')
.directive('directSearchResult', ['ENV','$location','_', function (ENV,$location,_) {
	return {
		scope:{result:'=',index:'='},
		restrict: 'E',
		templateUrl: function(elem,attrs){
			return ENV.baseURL+'views/partials/'+attrs.type+'SearchResult.html';
		},
		link: function postLink(scope, element, attrs) {
			// console.info(scope.result);
			scope.result.showDetails = false;
			var processPanelCollection = function(){
				_.map(scope.result.hypos,function(hypo,idx){
					if(scope.index==0 && idx==0){
						hypo.show = false;
					}
					scope.result.hypos[idx].carouselIndex = 0;
					scope.result.hypos[idx].collections = [];
					var collection = [];
					for(var i = 0; i < scope.result.hypos[idx].panels.length; i++){
						collection.push(scope.result.hypos[idx].panels[i]);
						if(collection.length==3){
							scope.result.hypos[idx].collections.push(collection);
							collection = [];
						}
					}
					if(collection.length) scope.result.hypos[idx].collections.push(collection);
				});
			};
			processPanelCollection();
			
			// scope.$on('UPDATE.RESULTS',function(){
			// 	processPanelCollection();
			// });

			
			scope.type = attrs.type;
			scope.serverURL = ENV.serverURL;
			scope.baseURL = ENV.baseURL;
			scope.repeatFilter = {display: true};
			
			scope.showAll = function(){
				scope.repeatFilter = '';
			};
			
			scope.loadPanel = function(panel_id){
				$location.search({});
				$location.path("panel/"+panel_id);
			};
		}
	};
}])

.directive('pathSearchResultOld', ['ENV', '$location', function (ENV, $location) {
	return {
		scope:{step:'='},
		restrict: 'E',
		templateUrl: function(){
			return ENV.baseURL+'views/partials/pathSearchResult.html';
		},
		link: function postLink(scope, element, attrs) {
			console.info(scope.step);
			scope.first = (attrs.first == 'true');
			scope.serverURL = ENV.serverURL;
			scope.baseURL = ENV.baseURL;
			angular.forEach(scope.step.papers,function(paper,idx){
				scope.step.papers[idx].carouselIndex = 0;
				scope.step.papers[idx].panelCollections = [];
				var collection = [];
				for(var i = 0; i < paper.panels.length; i++){
					collection.push(paper.panels[i]);
					if(collection.length==2){
						scope.step.papers[idx].panelCollections.push(collection);
						collection = [];
					}
				}
				if(collection.length) scope.step.papers[idx].panelCollections.push(collection);
			});


			scope.newSearch = function(step){
			$location.search({"intervention":step.left,"assayed":step.right});
			$location.path("/search");

			};

			scope.loadPanel = function(panel_id){
				$location.search({});
				$location.path("panel/"+panel_id);

			};
		}
	};
}])

.directive('pathSearchResult', ['ENV', '$location', function (ENV, $location) {
	return {
		scope:{paths:'='},
		restrict: 'E',
		templateUrl: function(){
			return ENV.baseURL+'views/partials/pathSearchResult.html';
		},
		link: function postLink(scope, element, attrs) {

			scope.serverURL = ENV.serverURL;
			scope.baseURL = ENV.baseURL;
		
		console.info(scope.paths);
			scope.newSearch = function(step){
			// $location.search({"intervention":step.left,"assayed":step.right});
			// $location.path("/search");

			};

			scope.loadPanel = function(panel_id){
				$location.search({});
				$location.path("panel/"+panel_id);

			};
		}
	};
}])

.directive('listSearchResult', ['ENV', '$location', '$timeout','Navigation', function (ENV, $location,$timeout,Navigation) {
	return {
		scope:{result:'='},
		restrict: 'E',
		templateUrl: function(){
			return ENV.baseURL+'views/partials/listSearchResult.html';
		},
		link: function postLink(scope, element, attrs) {
			scope.view = attrs.view;
			scope.serverURL = ENV.serverURL;
			scope.baseURL = ENV.baseURL;
			scope.repeatFilter = {display: true};
			
			scope.showAll = function(){
				scope.repeatFilter = '';
			};
			
			scope.loadPanel = function(hypo){
				// Navigation.addLink(hypo);
				$location.search({});
				$location.path("panel/"+hypo.panels[0].panel_id);

			};
		}
	};
}])

.directive('smSearchResult', ['ENV', '$location', '$timeout','Search', function (ENV, $location,$timeout,Search) {
	return {
		scope:{tag:'=',view:'='},
		restrict: 'E',
		templateUrl: function(){
			return ENV.baseURL+'views/partials/smSearchResult.html';
		},
		link: function postLink(scope, element, attrs) {
			scope.serverURL = ENV.serverURL;
			scope.baseURL = ENV.baseURL;
			scope.searchParams = Search.searchParams;
			
			scope.setPanel = function(hypo){
				$timeout(function(){
				$location.path("panel/"+hypo);					
				});
				$location.search({});
			};
		}
	}
}])

.directive('navTagSidebar',['ENV','$location',function(ENV,$location){
	return {
		scope:{tags:'=',cas:'=',panel:'=',view:'='},
		restrict: 'EA',
		templateUrl: function(){
			return ENV.baseURL+'views/partials/navTagSidebar.html';
		},
		link: function postLink(scope, element, attrs) {
		
			scope.explore = explore;
			scope.mouseOver = mouseOver;
			scope.mouseOut = mouseOut;
			scope.popovPlacement = (scope.cas=='intervention') ? 'right' : 'left';
			scope.move = (scope.cas=='intervention') ? 'previous' : 'next';
			
			function mouseOver(where,tag){

				if (where == scope.cas){
					tag.invertColor = true;
				}
			}
			function mouseOut(tag){
				tag.invertColor = false;
			}
						
			function explore(tag, direction, perform) { // tag button is clickable only when view !== "panel" => use of perform to abort the function.
					// if (!perform) return;
					tag.display_ext_ids = [];
					_.forEach(tag.external_ids,function(extid,index){
						tag.display_ext_ids.push({id:extid,url:tag.external_urls[index] + extid});
					});
          scope.currentTag = tag;

          var type;
					var params;
					var newloc = {};
          if (direction == 'downstream') {
              type = (tag.type) ? (tag.type == 'gene' || tag.type == 'protein') ? 'gene,protein:' : tag.type + ":" : "";
							type =  (tag.type) ? (tag.type == 'gene' || tag.type == 'protein') ? '::gene,protein:' : '::'+tag.type : "";
							newloc.intervention = tag.text + type;
							newloc.assayed = null;
          }
          else if (direction == 'upstream') {
              type = (tag.type) ? (tag.type == 'gene' || tag.type == 'protein') ? 'gene,protein:' : tag.type + ":" : "";
							type =  (tag.type) ? (tag.type == 'gene' || tag.type == 'protein') ? '::gene,protein:' : '::'+tag.type : "";
							newloc.intervention = null;
							newloc.assayed = tag.text + type;							
          }
          else {
						newloc.intervention = null;
						newloc.assayed = null;				
          }
					$location.search(newloc);
          scope.view = (direction) ? direction : 'panel';
      };
		
		
		}	
	}	
}])

.directive('sdPanel',['$timeout', 'ENV', function($timeout, ENV){
	return {
		scope:{panel:'='},
		restrict: 'E',
		templateUrl: ENV.baseURL+'views/partials/sdPanel.html',
		link: function postlink(scope){
			scope.serverURL = ENV.serverURL;
			scope.highlight_entities = {status:false,enable:(scope.panel.figure.panels[scope.panel.currentPanelIdx].tags.length)};
			if (scope.highlight_entities.enable) scope.highlight_entities.status = true;
			console.info(scope.highlight_entities);
			// console.info(scope.panel.figure.panels[scope.panel.currentPanelIdx].tags.length);
		}
	};
}])
.directive('searchSummary',['$timeout', 'ENV','$filter','_','$location', function($timeout, ENV,$filter,_,$location){
	return {
		scope:{result:'='},
		restrict: 'EA',
		templateUrl: ENV.baseURL+'views/partials/searchSummary.html',
		link: function prelink(scope){
			scope.serverURL = ENV.serverURL;

			scope.showMore = {'state':false,'tag':{}};

			scope.showMoreAction = function(tag,direction){
				scope.showMore.state = !scope.showMore.state;
				if(scope.showMore.state){
					scope.showMore.tag = tag;
					scope.showMore.tag.to = _.values(scope.showMore.tag.to);
					scope.showMore.tag.role = (direction =='downstream')?'intervention':'assayed';
					scope.showMore.tag.antiRole = (direction =='upstream')?'intervention':'assayed';
				}
			};

			scope.goTo = function(from,to){
				$location.search(from.role,from.type+":"+from.text);
				$location.search(from.antiRole,to.type+":"+to.text);
				$location.search('generic',null);
			};
		}
	};
}])
;
