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
                    title: "SourceData SmartFigure Search",
                    content: "<p>Welcome to the SmartFigure search engine from SourceData.</p><p>SourceData helps you to find figures showing data on many different types of cell, gene, molecule or structure. We refer to these as entities.</p><p>In this example, we'll look for data on the question 'Does insulin affect glucose?'.</p> <p>Press 'Next' to continue.</p>",
                    animation: true,
                    backdrop:true,
                    backdropPadding:5
                  },
                  {
                    element: ".sdform-adv-btn-interv",
                    title: "Perturbation",
                    placement: "top",
                    content: "This input box is for the independent variable: the entity that was manipulated in a study. We call these 'perturbations'. In this case, we're interested in insulin.",
                    animation: true,
                    backdrop:true,
                    backdropPadding:5,
                    onShown: function(tour){ $scope.searchParams.intervention="insulin"; $scope.$apply(); }
                  },
                  {
                    element: ".sdform-adv-interv-input-group-btn",
                    title: "Choose the perturbation element type",
                    placement: "bottom",
                    content: "Here, you can specify the type of entity that interests you. To search all entity types, just choose 'Any Type', but in our case, we know we want a molecule.",
                    animation: true,
                    backdrop:true,
                    backdropPadding:{top:5, right:7, bottom:5, left:10},
                    onShown: function(tour){ $scope.searchParams.interventionType = "molecule"; $scope.$apply(); }
                  },
                  {
                    element: ".sdform-adv-btn-assay",
                    title: "Measured entity",
                    placement: "top",
                    content: "This input box is for the dependent variable: the measured entity in the study. For this example, we enter 'glucose'.",
                    animation: true,
                    backdrop:true,
                    backdropPadding:5,
                    onShown: function(tour){ $scope.searchParams.assayed="glucose"; $scope.$apply(); }
                  },
                  {
                    element: ".sdform-adv-btn-assay-input-group-btn",
                    title: "Choose the assayed element type",
                    placement: "bottom",
                    content: "Just like the perturbations, you can narrow down your search to only certain entity types. Here, we choose to look at molecules again.",
                    animation: true,
                    backdrop:true,
                    backdropPadding:{top:5, right:7, bottom:5, left:10},
                    onShown: function(tour){ $scope.searchParams.assayedType = "molecule"; $scope.$apply();}
                  },
                  {
                    element: ".sdform-adv-btn-go",
                    title: "Click here to search",
                    placement: "top",
                    content: "Now you can perform your search and answer the question 'Does glucose affect insulin?'. End the tour and click this button to see the results.",
                    animation: true,
                    backdrop:true,
                    backdropPadding: 5
                  }
                ]
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
                          content: "Here you can see one of the relationships that were tested in this paper. The perturbation is shown in red and the measured entity is shown in blue.",
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
                          content: "You can add one or more filters if you only want results from specific journals, authors, years, assays or organisms.",
                          animation: true,
                          backdrop:true,
                          backdropPadding:5,
                      },
                  ]
              });
      
      
                  resultsTour.init();
                  resultsTour.start();
              }                    

          },0);
      }
    };

  })
  ;
