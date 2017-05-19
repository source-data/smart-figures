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
.directive('graphHistory', ['ENV','$location','d3','_','Navigation', function (ENV,$location,d3,_,Navigation) {
	return {
		scope:{'graph':'='},
		restrict: 'EA',
		link: function postLink(scope, elm) {

			// -W----- Reload Graph
			scope.$watch('graph',function(){
					render();
			});

			// -F----- SetupDim
			var setupDim = function(dim,nbNodes){
				dim.svgHeight = 37*nbNodes;
				dim.widthData = dim.svgWidth*0.9;
				dim.heightData = dim.svgHeight*0.9;
				dim.intervalY = 32;
				return dim;
			};

			// -F----- on Mouse Over Link
			var onMouseOverLink = function(action,link){
				if(action==="on"){
					d3.select("#tooltipImg").attr('src', ENV.serverURL+"file.php?panel_id="+link.panels[0]);
					var left=d3.event.pageX+5;
					var topCoord = d3.event.pageY - 12;
					d3.select("#tooltip").style('opacity',1).style("left", left + "px").style("top", topCoord + "px");
					d3.selectAll('.linkPath').style('opacity','0.6');
					d3.selectAll('.nodes').style('opacity','0.6');
					d3.select("#link"+link.source+"::"+link.target).style('stroke-width',2);
					d3.select("#text"+link.source+"::"+link.target).style('font-size',12);
				}
				else if(action==='click'){
					d3.select("#tooltip").style('opacity',1e-6).style("left","0px").style("top", "0px");
					$location.path("/panel/"+link.panels[0]);
					scope.$apply();
				}
				else{
					d3.select("#tooltipImg").attr('src', '');
					d3.select("#tooltip").style('opacity',1e-6).style("left","0px").style("top", "0px");
					d3.selectAll('.linkPath').style('opacity','1');
					d3.selectAll('.nodes').style('opacity','1');
					d3.select("#link"+link.source+"::"+link.target).style('stroke-width',1);
					d3.select("#text"+link.source+"::"+link.target).style('font-size',9);
				}
			};

			// -F----- render
			var render = function(){

				var graph = Navigation.graph;

				var dim = {'svgWidth':parentWidth};
				dim = setupDim(dim,graph.nodes.length);

				var rangeIdx = [_.min(graph.nodes,function(n){return n.idx;}).idx,_.max(graph.nodes,function(n){return n.idx;}).idx];
				var scale = d3.scale.linear().domain(rangeIdx).range([10,dim.widthData-10]);


					d3.select('.svgGraphHistory').remove();
					var svg = d3.select(elm[0])
					.append('svg')
					.attr('height', dim.svgHeight)
					.attr('width', dim.svgWidth)
					.attr('class', 'svgGraphHistory');

					_.forEach(graph.links,function(l){
						l.x1 = scale(graph.nodes[l.source].idx)+10;
						l.y1 = l.source*dim.intervalY;
						l.x2 = scale(graph.nodes[l.target].idx)-10;
						l.y2 = l.target*dim.intervalY;
						l.panelX = l.x1 + (l.x2 - l.x1)*0.5;
						l.panelY = l.y1 + (l.y2-l.y1)*0.5;
					});

					//----- TOOLTIP
					var tooltip;
					if(d3.select('#tooltip').empty()){
						tooltip = d3.select('body').append("div").attr("class", "graphTooltip").attr('id','tooltip').style("opacity", 1e-6);
						tooltip.append('h4').append('text').attr('id','tooltipText').text('');
						tooltip.append('img').attr('id','tooltipImg').attr('class','img-responsive').style('display','initial');
					}
					else{ tooltip = d3.select('#tooltip');}

					var data = svg.append('g').attr('class','groupData').attr('transform', 'translate(10,20)');

					//----- LINKS
					var links = data.selectAll('links').data(graph.links).enter().append('g').attr('class',function(l){return 'linkPath groupLink_'+l.source+'_'+l.target;});

					links.append('path').attr('d',function(l){
						var path;
						if(l.source == l.target){
							if(l.cas == 'assayed'){
								path = 'M'+l.x1+','+l.y1+' C'+(l.x1-15)+','+(l.y1+35)+' '+(l.x2+15)+','+(l.y2+35)+' ' + l.x2+','+l.y2;
							}
							else{
								path = 'M'+l.x2+','+l.y2+' C'+(l.x2-15)+','+(l.y2+35)+' '+(l.x1+15)+','+(l.y1+35)+' ' + l.x1+','+l.y1;
							}
						}
						else{
							if(l.source<l.target){
								path =  'M'+l.x1+','+l.y1+' C'+(l.x1+5)+','+(l.y1-15)+' '+(l.x2-15)+','+(l.y2+5)+' ' + l.x2+','+l.y2;
							}
							else{
								path =  'M'+l.x1+','+l.y1+' C'+(l.x1+5)+','+(l.y1+15)+' '+(l.x2-15)+','+(l.y2-5)+' ' + l.x2+','+l.y2;
							}
						}
						return path;
					})
					.attr('stroke',function(d){return (Navigation.currentPanelId == d.panels[0])?'#0000FF':'#3D2E00';})
					.attr('id',function(d){return "link"+d.source+"::"+d.target;}).attr('stroke-width',1).attr('fill','none')
					.attr('class','cursor-pointer')
					.on('mouseover',function(d){onMouseOverLink('on',d);})
					.on('click',function(d){onMouseOverLink('click',d);})
					.on('mouseout',function(d){onMouseOverLink('out',d);});

					links.append('text').text(function(l){return l.panels[0];}).attr('x',function(l){return l.panelX;}).attr('y',function(l){return l.panelY;}).attr('font-size',9)
					.attr('fill',function(d){return (Navigation.currentPanelId == d.panels[0])?'#0000FF':'#3D2E00';})
					.attr('id',function(d){return "text"+d.source+"::"+d.target;})
					.on('mouseover',function(d){onMouseOverLink('on',d);})
					.on('click',function(d){onMouseOverLink('click',d);})
					.on('mouseout',function(d){onMouseOverLink('out',d);});

			//----- NODES
			var nodes = data.selectAll('nodes').data(graph.nodes).enter().append('g')
				.attr('transform',function(n,i){return 'translate('+scale(n.idx)+','+i*dim.intervalY+')';})
				.attr('class','nodes')
				.attr('id',function(n,i){return 'nodeId_'+i;});
				var textNode = nodes.append('g');
					textNode.append('text').text(function(n){return n.tag.text;}).attr('font-size','11').attr('x',-10).attr('y',-12).attr('id',function(n,i){return 'textNodeIdx_'+i;});
				var circleNode = nodes.append('g')
					.on('mouseover',function(n,i){
						d3.select('#textNodeIdx_'+i).style('font-size','14');
						d3.selectAll('.linkPath').style('opacity','0.3');
						d3.selectAll('.nodes').style('opacity','0.3');
						d3.select('#circleNode_'+i).attr('stroke-width',2);
						d3.select('#nodeId_'+i).style('opacity','1');})
					.on('mouseout',function(n,i){
						d3.select('#textNodeIdx_'+i).style('font-size','11');
						d3.selectAll('.linkPath').style('opacity','1');
						d3.selectAll('.nodes').style('opacity','1');
						d3.select('#circleNode_'+i).attr('stroke-width',1);
						d3.select('#nodeId_'+i).style('opacity','1');});
				circleNode.append('circle').attr('r',10).attr('id',function(n,i){return 'circleNode_'+i;})
					.attr('stroke','firebrick')
					.attr('fill','white');
				circleNode.append("svg:image").attr("xlink:href", function(n){var colorImg ='intervention';return 'images/icon_'+n.tag.type+'_'+colorImg+'.png';}).attr("width", 14).attr("height", 14).attr('x',-7).attr('y',-8);
			};

		var parentWidth = elm.parent()[0].offsetWidth;
		}
	};
}]);