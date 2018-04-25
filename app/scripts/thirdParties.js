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
*****************************************************************/angular.module('thirdparties', [])
/**
 * provide lodash as '_'
 */
  .service('_', function ($window) {
    return $window._;
  })
/**
 * provide d3 as 'd3'
 */
  .service('d3', function ($window) {
    return $window.d3;
  })
  .service('tour', function ($window){
    return $window.Tour;
  })
  .service('searchTour', function(){
    return {
      init: function(tour, $scope){
          //-BEGIN THE TOUR ON PAGE LOAD---------------//
          angular.element(document).ready(function(){
            // Define the Tour for Search Form
              var searchTour = new tour({
                name: "searchTour",
                steps: [
                  {
                    orphan: true,
                    title: "SourceData Search",
                    content: "<p>Welcome to SourceData Search. Here you can find papers where a specific hypothesis has been tested.</p><p>With SourceData you can search the components of an experiment: cells, genes, molecules, organisms etc - called the experimental <em>entities</em> - and find relationships between them.</p> <p>Press 'Next' to continue.</p>",
                    animation: true,
                    backdrop:true,
                    backdropPadding:5
                  },
                  {
                    element: ".sdform-adv-btn-interv",
                    title: "Perturbation",
                    placement: "top",
                    content: "<p>Enter the name of an entity that was <em>manipulated</em> in the experiment, such as a gene name or cell type</p><p>For example, to ask &quot;How does <em>insulin</em> affect glucose levels?&quot;, enter <em>insulin</em> here" ,
                    animation: true,
                    backdrop:true,
                    backdropPadding:5,
                    onShown: function(tour){ $scope.searchParams.intervention="insulin"; $scope.$apply(); }
                  },
                  {
                    element: ".sdform-adv-btn-assay",
                    title: "Measured entity",
                    placement: "top",
                    content: "<p>Enter the entity that was observed in an experiment - the &quot;measured entity&quot;.</p><p>In our example on insulin and glucose, we want to know how the levels of <em>glucose</em> change when we manipulate insulin.</p>",
                    animation: true,
                    backdrop:true,
                    backdropPadding:5,
                    onShown: function(tour){ $scope.searchParams.assayed="glucose"; $scope.$apply(); }
                  },
                  {
                    element: ".sdform-adv-btn-go",
                    title: "Click here to search",
                    placement: "top",
                    content: "Ready to try it? Now you can perform your search and answer the question &quot;Does <em>insulin</em> affect <em>glucose</em>?&quot;. End the tour and SourceData will perform this search and show you the results.",
                    animation: true,
                    backdrop:true,
                    backdropPadding: 5,
                    onShown: function(tour){
                      window.lastStepReached=true;
                    }
                  }
                ],
                onEnd: function(tour){

                  if(window.lastStepReached){
                    delete window.lastStepReached; 
                    window.location.href = '/?intervention=molecule:insulin&motif=scale&assayed=molecule:glucose&resultsTour';
                  }
                }
              });
              searchTour.init();
              searchTour.start();
          });
      }
    };

  })
  .service('resultsTour', function(){
    return {
      init: function(tour, scope, $timeout, Search){
        $timeout(function(){
          //remove the lastStepReached variable
          if(window.lastStepReached) delete window.lastStepReached;

          //if there are search results and the previous tour is finished
          if(localStorage.getItem("searchTour_end")){
              var resultsTour = new tour({
                  name: "resultsTour",
                  steps: [
                      {
                          element: "direct-search-result:first-of-type .direct-search-res-body",
                          title: "Paper details",
                          placement: "top",
                          content: "Read the details of the paper here, including the abstract, and follow the link to the full published paper.",
                          animation: true,
                          backdrop:true,
                          backdropPadding:5,
                          onShown: function(tour){ Search.searchParams.displayedResult[0].showDetails=true; scope.$apply(); }
                      },
                      {
                          element: "direct-search-result:first-of-type .direct-search-res-list .list-group-item:first-child",
                          title: "Relationships tested in the paper",
                          placement: "top",
                          content: "Here you can see one of the relationships tested in this paper. The perturbation is shown in red and the measured entity is shown in blue.",
                          animation: true,
                          backdrop:true,
                          backdropPadding:{top: 8, right: 44, bottom: 28, left: 8}
                          // onShown: function(tour){ $scope.searchParams.displayedResult[0].showDetails=true; $scope.$apply(); }
                      },
                      {
                          element: "direct-search-result:first-of-type .direct-search-res-assayed button",
                          title: "View the figures",
                          placement: "top",
                          content: "Clicking here will show you the figures in this paper where the specified relationship was reported.",
                          animation: true,
                          backdrop:true,
                          backdropPadding:5,
                          onShown: function(tour){ Search.searchParams.displayedResult[0].hypos[0].show=true; scope.$apply(); }
                      },
                      {
                          element: "direct-search-result:first-of-type  .direct-search-res-container .direct-search-res-carousel",
                          title: "Paper details",
                          placement: "top",
                          content: "You can click any of the figures to open them in a SmartFigure and see more information and related links.",
                          animation: true,
                          backdrop:true,
                          backdropPadding:5,
                      },
                      {
                          element: ".result-filters",
                          title: "Filter your results",
                          placement: "bottom",
                          content: "You can add one or more filters to show experiments where a specific experimental assay or organism was used. You can also filter by authors, years or journal.",
                          animation: true,
                          backdrop:true,
                          backdropPadding:5,
                      },
                      {
                          element: ".result-filters",
                          title: "Filter your results",
                          placement: "top",
                          content: "For example, let's limit the results to just one experimental assay.",
                          animation: true,
                          backdrop:true,
                          backdropPadding:5,
                          onShown: function(tour){ 
                            scope.currentFilter.name = "assay";
                            scope.currentFilter.value = 1;
                            scope.multiple.selectedassay=[scope.assays[0]];
                            scope.applyFilter({currFilt:"assay"});
                            scope.$apply();

                          }                         
                      },
                      {
                          orphan: true,
                          title: "End of Tour",
                          content: "Now you've seen how SourceData lets you search through experimental relationships and find the results you need, it's time to perform your own search.",
                          animation: true,
                          backdrop:true,
                          backdropPadding:5,
                        
                      },
                  ],
                  onEnd: function(tour){
                      window.location.href = '/';
                    
                  }
              });
      
      
                  resultsTour.init();
                  resultsTour.start();
              }                    

          },0);
      }
    };

  })
  ;
