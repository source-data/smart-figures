'use strict';
/************************ LICENCE ***************************
 *    This file is part of <SourceData SmartFigure frontend code to search and navigate the SourceData resource>
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
 * @name publicSourcedataApp.controller:PanelCtrl
 * @description
 * # PanelCtrl
 * Controller of the publicSourcedataApp
 */
angular.module('publicSourcedataApp')
    .controller('PanelCtrl', ['$scope', '$location', '$filter', '$timeout', '$rootScope', 'panel', 'Search', 'Filter', 'ENV', 'Restangular', 'localStorageService', 'Navigation', '_', 'Authentication','$uibModal', function ($scope, $location, $filter, $timeout, $rootScope, panel, Search, Filter, ENV, Restangular, localStorageService, Navigation, _, Authentication,$uibModal) {


        //-M------ MAIN ------//
        $scope.inIFrame = (window.self !== window.top);
        $scope.serverURL = ENV.serverURL;
        $scope.panel = panel;
				$scope.view = 'panel'; //panel, downstream, upstream

				$scope.viewFullFigure = viewFullFigure;
				$scope.setPanel = setPanel;
				$scope.search = search;
				$scope.newSearch = newSearch;
				$scope.downloadPanel = downloadPanel;
				
				$scope.advanceCarousel = advanceCarousel;
				$scope.changeSimilarScope = changeSimilarScope;
				$scope.jumpToSlide = jumpToSlide;
				
				// $scope.explore = explore;
				$scope.back = back;

				// =======  INIT FUNCTIONS  ===== //
				
        function formatPanel() {
					var panelIdx = _.findIndex($scope.panel.figure.panels, function (p) { return p.panel_id == $scope.panel.current_panel_id; });
					if (panelIdx>-1){
						
						var p = $scope.panel.figure.panels[panelIdx];
						_.extend($scope.panel,p);
						$scope.panel.currentPanelIdx = panelIdx;
						$scope.tags = $scope.panel.tags;
						$scope.panel.highlight_entities = {status:false,enable:($scope.tags.length)};
						if ($scope.panel.highlight_entities.enable){$scope.panel.highlight_entities.status = true;}
						$scope.assayed_tags = $filter('uniqueTagTexts')(_.filter($scope.panel.tags,function(t){return t.role =='assayed';}));
						$scope.intervention_tags = $filter('uniqueTagTexts')(_.filter($scope.panel.tags,function(t){return t.role =='intervention';}));
						if ($scope.assayed_tags[0]) $scope.assayed_tags[0].$show = true;
						if ($scope.intervention_tags[0]) $scope.intervention_tags[0].$show = true;
					}
					
					console.info(angular.copy($scope.panel.plain()));
				}
				
				function getNbRelationByTag(){

	        angular.forEach(_.uniq($scope.tags, function (t) { return ((t.role =='intervention' || t.role=='assayed') && t.type + ":" + t.text); }), function (tag) {
						// console.info(tag);
						tag.relations = {intervention:0,assayed:0};
						var rest;
						var type = (tag.type) ? (tag.type == 'gene' || tag.type == 'protein') ? 'gene,protein' : tag.type : "";
						var tagQuery = (type) ? tag.text +"::" + type : tag.text;
						rest = Restangular.one('nbRelation', tagQuery.replace("/", "##")).get();
						rest.then(function (data) {
							tag.relations = data.plain();
						});
					});
				}
				
				function getSimilarPanels(){
					$scope.similar = {limit:3,index:0,panels:{paper:[],global:[],total:0},filtered_panels:[],scope:'global',show:false,currentIdx:0,listContainer:[]};
					$scope.carousel = {};
	        
	        Restangular.one('panel', panel.current_panel_id).get({get_similar: true}).then(function (data) {
						_.forEach(data,function(p){
							p.scope = (p.paper.paper_id==$scope.panel.paper.paper_id) ? 'paper' : 'global';
							$scope.similar.panels[p.scope].push(p);
							$scope.similar.panels.total++;
						});
						$scope.similar.scope = ($scope.similar.panels.global.length) ? 'global' : 'paper';
						$scope.similar.show = true;
						
						var scopes = ['paper','global'];
						_.forEach(scopes,function(s){							
							_.forEach($scope.similar.panels[s],function(p,idx){
								p.position = idx+1;
								p.leftOffset =220*idx;
								p.positionFromEnd = $scope.similar.panels[s].length - idx;
							});
						});						
	        });
				}
				
				function init(){
					
	        formatPanel();

					$scope.assayBadges = _.map(_.filter($scope.tags,function(t){return t.category == "assay" && t.external_names;}),function(t){return t.external_names});
										
					var figIdx = _.findIndex($scope.panel.paper.figures, function (figure) { return figure.label == $scope.panel.figure.label; });
	        $scope.panel.nextPreviousFig = {
	            'previous': (figIdx === 0) ? null : figIdx - 1,
	            'next': (figIdx === $scope.panel.paper.figures.length - 1) ? null : figIdx + 1
	        };


	        //-M------ MAIN ------//
	        $scope.view = 'panel';
	        if ($location.search().intervention) $scope.view = 'downstream';
	        else if ($location.search().assayed) $scope.view = 'upstream';
	        $scope.searchParams = Search.searchParams;
	        $scope.searchParams.result = null;
	        $scope.searchParams.done = false;

	        $scope.currentTag = {};
					

	        //-M------ MAIN : search ------//
	        search();
					
					$timeout(function(){
						getNbRelationByTag();
						getSimilarPanels();
					});	
				}
				init();
				
					
				// =======  SIMILAR PANELS  ===== //
				
				function changeSimilarScope(scope){
					$scope.similar.scope = scope;
					$scope.similar.currentIdx = 0;
					var slider = document.querySelector(".relatedDataCarouselInnerContainer ul");
					slider.style.transform = "translateX(0px)";	
				}
			
				function jumpToSlide(index){
					var slider = document.querySelector(".relatedDataCarouselInnerContainer ul");
					var smartIdx = Math.floor(index/3)*3;
					var smartOffset = $scope.similar.panels[$scope.similar.scope][smartIdx].leftOffset;
					$scope.similar.currentIdx = index;
					slider.style.transform = "translateX(-" + smartOffset + "px)";	
				}
				
				function advanceCarousel(direction){
					var slider = document.querySelector(".relatedDataCarouselInnerContainer ul");
					var carouselItemCount = $scope.similar.panels[$scope.similar.scope].length;
					var carouselItemData = $scope.similar.panels[$scope.similar.scope];
					var smartOffset=0;
					if (direction === 1){ 
						if (carouselItemCount < 4){ smartOffset = 0; }
						else{
							if ($scope.similar.currentIdx<carouselItemCount-3){					
								var interval = (Math.floor(parseFloat($scope.similar.currentIdx) / 3) * 3)+3;
								$scope.similar.currentIdx = interval;
							}
							smartOffset = carouselItemData[$scope.similar.currentIdx].leftOffset;
						}
					}

					else if (direction === -1){ // i.e. moving backwards
						if (carouselItemCount < 4 || $scope.similar.currentIdx<3){
							smartOffset = 0;
						}
						else{
							var interval = (Math.floor(parseFloat($scope.similar.currentIdx) / 3) * 3)-3;
							$scope.similar.currentIdx = interval;
							smartOffset = carouselItemData[interval].leftOffset;
						}
					}
					slider.style.transform = "translateX(-" + smartOffset + "px)";					
				}

				
				
        //-F------ NEW SEARCH------//
				function newSearch() {
            Search.searchParams.result = '';
            Search.searchParams.summaryResult = '';
            Search.searchParams.done = false;
            Search.searchParams.generic = '';
            Search.searchParams.genericType = '';
            Search.searchParams.intervention = '';
            Search.searchParams.interventionType = '';
            Search.searchParams.assayed = '';
            Search.searchParams.assayedType = '';
            Search.searchParams.uniqueJournals = '';
            $location.path("/");
        };


        //-F------ Change panel => reload this page ------//
				function setPanel(panel_id) {
					$location.search({});
            $location.path('panel/' + panel_id);
        };
				
				function viewFullFigure(){
					
				  var modalInstance = $uibModal.open({
				       templateUrl: '/views/partials/full_figure.html',
				       controller: 'FullFigureCtrl',
				       controllerAs: 'vm',
				       resolve: {
				         panel: function () {
				           return $scope.panel.plain();
				         }
				       }
				     });

			     modalInstance.result.then(function (panel_id) {
						 if (panel_id){
							 $location.path('/panel/'+panel_id);
						 }
			     }, function () { });					
				}

				
				function back(){
					$scope.view = 'panel';
					$location.search({});
				}


        //-F------ SEARCH ------//
				function search() {
					if (!angular.equals($location.search(), {})) {
						Search.searchParams.loading = true;
						$scope.result_papers = null;
						$scope.searching = true;
						var tag = "";
						$scope.cas='';
						if ($location.search().intervention) {
							$scope.cas = 'intervention'; $scope.view = 'downstream'; tag = $location.search().intervention;
						}
						else if ($location.search().assayed) {
							$scope.cas = 'assayed'; $scope.view = 'upstream'; tag = $location.search().assayed;
						}
						if (tag) {
							var parts = tag.split(":");
							var type = (parts.length == 2) ? parts[0] : "";
							var text = (parts.length == 2) ? parts[1] : parts[0];
						}
						var p = _.filter($scope.panel.figure.panels, function (p) { return p.panel_id == $scope.panel.current_panel_id; })[0];
						var paperTag = _.filter(p.tags, function (t) { return t.text == text && (t.type == type || !type); })[0];

						if (paperTag){
							paperTag.display_ext_ids = [];
							_.forEach(paperTag.external_ids,function(extid,index){
								paperTag.display_ext_ids.push({id:extid,url:paperTag.external_urls[index] + extid});
							});
							$scope.currentTag = paperTag;
							
						} 
						Search.search().then(function () {
							Search.searchParams.loading = false;
							$scope.searching = false;
						});
					}
					else {
						$scope.view = 'panel';
						$scope.searchParams.result = null;
					}
        };

        //-O------ ON ROUTE UPDATE ------//
        $scope.$on('$routeUpdate', function () {
            search();
        });
        $scope.$on('$routeChangeSuccess', function () {
             search();
         });


				function downloadPanel(panel_doc_id) {
					if (panel_doc_id) { self.location.href = $scope.serverURL + "index.php/panel/" + $scope.panel.current_panel_id + "/" + panel_doc_id + "/export?authdata=" + Authentication.currentUser.authdata; }
					else { self.location.href = $scope.serverURL + "index.php/panel/" + $scope.panel.current_panel_id + "/export?authdata=" + Authentication.currentUser.authdata; }
				};

    }])
		
		
	.controller('FullFigureCtrl',['$scope','$uibModalInstance','ENV','panel','$timeout',function($scope,$uibModalInstance,ENV,panel,$timeout){
			var vm = this;
			vm.panel = panel;
			vm.serverURL = ENV.serverURL;
			
			$timeout(function(){
				var figure_elt = document.getElementById('full_figure_'+vm.panel.figure.figure_id);
				var ratio = (figure_elt.clientWidth/vm.panel.figure.width)*1.05;
				vm.dpanels = [];
				_.forEach(vm.panel.figure.panels,function(p){
					var np = {panel_id:p.panel_id,class:'otherPanelLink',style:{top:((p.coords.topleft_y)*ratio+20)+"px",left:((p.coords.topleft_x)*ratio+20)+"px",height:(p.coords.bottomright_y-p.coords.topleft_y)*ratio+"px",width:(p.coords.bottomright_x-p.coords.topleft_x)*ratio+"px"}};
					if (+np.panel_id == +vm.panel.current_panel_id){np.class="currentPanelLink";}
					vm.dpanels.push(np);
				});
			});
			
			vm.goto = function(panel_id){
				$uibModalInstance.close(panel_id);
			}

			vm.close = function(){
				$uibModalInstance.close();
			}
			
			
			
		}]);
