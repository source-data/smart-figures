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
* @name publicSourcedataApp.navigation
* @description
* # navigation
* Factory in the publicSourcedataApp.
*/
angular.module('publicSourcedataApp')
.factory('Navigation', ['$rootScope','_','Restangular',function ($rootScope,_,Restangular) {
	// Public API here
	return {
		currentPanelId:'',
		graph:{'nodes':[],'links':[],reload:0},
		showSimilarPanels: true,

		//-F------ init graph
		initGraph:function(){
			var _this = this;
			_this.graph={'nodes':[],'links':[]};
			$rootScope.$broadcast('navigation.updated');
		},

		//-F------ ADD in SEARCH LOG
		searchLog: function(newLink){
			var _this = this;
			var source = _this.graph.nodes[newLink.source].tag.condensed;
			var target = _this.graph.nodes[newLink.target].tag.condensed;
			var panels = newLink.panels;
			var newPostLink = {'source':source,'target':target,'panel':panels[0]};
			Restangular.all('links').post(newPostLink);
		},


		//-F------ add link : quand on load un nouveau panel... ------//
		addLink: function(hypo,view){
			var _this = this;

			// _this.currentPanelId = hypo.panels[0].panel_id;
			var tagGraphLeft = {'text': hypo.displayLeft.join(", "),'extText':hypo.externalDisplayLeft,'type':hypo.typeLeft, 'condensed':hypo.typeLeft +"::"+hypo.displayLeft.join(", ").toLowerCase()};
			var tagGraphRight = {'text': hypo.displayRight.join(", "),'extText':hypo.externalDisplayRight,'type':hypo.typeRight, 'condensed':hypo.typeRight +"::"+hypo.displayRight.join(", ").toLowerCase()};

			var nodeLeftIdx = _.findIndex(_this.graph.nodes,function(n){return n.tag.condensed == tagGraphLeft.condensed;});
			var nodeRightIdx = _.findIndex(_this.graph.nodes,function(n){return n.tag.condensed == tagGraphRight.condensed;});

			//If one of nodes exists
			if(nodeLeftIdx<0 && nodeRightIdx>-1){
				nodeLeftIdx = _this.addNode(tagGraphLeft,'intervention',nodeRightIdx);
			}
			if(nodeRightIdx<0 && nodeLeftIdx>-1){
				nodeRightIdx = _this.addNode(tagGraphRight,'assayed',nodeLeftIdx);
			}
			//If no node at all => create both
			if(nodeLeftIdx<0 && nodeRightIdx<0 ){
				if(view=='downstream'){	nodeLeftIdx = _this.addNode(tagGraphLeft,'intervention');}
				nodeRightIdx = _this.addNode(tagGraphRight,'assayed');
				if(view!=='downstream'){nodeLeftIdx = _this.addNode(tagGraphLeft,'intervention');}
			}

			//create link between nodes : if links already exists : add panels if not in list of panels of the links. if not existing : create it and add to graph.links.
			var newLink = {'source':nodeLeftIdx,'target':nodeRightIdx};
			var alreadyLinkIdx = _.findIndex(_this.graph.links,function(l){return l.source ==newLink.source && l.target == newLink.target;});
			if(alreadyLinkIdx<0){
				newLink.panels = [hypo.panels[0].panel_id];
				_this.lastLinkIdx = _this.graph.links.length;
				_this.searchLog(newLink);
				_this.graph.links.push(newLink);
			}
			else{
				if(!_.includes(_this.graph.links[alreadyLinkIdx].panels,hypo.panels[0].panel_id)){
					_this.graph.links[alreadyLinkIdx].panels.push(hypo.panels[0].panel_id);
				}
			}
			$rootScope.$broadcast('navigation.updated');
		},

		//-F------ add link : quand on clique sur what's up/down-stream au sein d'un panel ------//
		addSuppLink:function(tag){
			var _this = this;
			if(_this.graph.nodes.length){
				var tagGraph = {'text': tag.text,'extText':tag.external_names[0],'type':tag.type, 'condensed':tag.type +"::"+ tag.text.toLowerCase()};
				var relativeNodeIdx;
				for(var i=0;i<_this.graph.links.length;i++){
					if(_.includes(_this.graph.links[i].panels,_this.currentPanelId)>0){
						relativeNodeIdx = (tag.role == 'intervention') ? _this.graph.links[i].target :_this.graph.links[i].source;
						break;
					}
				}
				var currentNodeIdx = _this.addNode(tagGraph,tag.role,relativeNodeIdx);

				_.forEach(_this.graph.links,function(l){
					if(_.includes(l.panels,_this.currentPanelId)){
						var newLink = (tag.role=="intervention") ? {'source':currentNodeIdx,'target':l.target} : {'source':l.source,'target':currentNodeIdx};
						var alreadyLinkIdx = _.findIndex(_this.graph.links,function(l2){return l2.source ==newLink.source && l2.target == newLink.target;});
						if(alreadyLinkIdx<0){
							newLink.panels = [_this.currentPanelId];
							_this.searchLog(newLink);
							_this.graph.links.push(newLink);
						}
					}
				});
				$rootScope.$broadcast('navigation.updated');
			}
		},

		//-F------ addNode : crée un noeud...------//
		addNode: function(tagGraph,role,relativeNodeIdx){
			console.info("ici - addNode");
			var _this = this;
			var obj = {'tag':tagGraph,'current':true};
			var currentNodeIdx;

			var dejaOnGraphNodeIdx = _.findIndex(_this.graph.nodes,function(n){ return n.tag.condensed == tagGraph.condensed;});

			if(dejaOnGraphNodeIdx<0){

				//AJOUTE L'INDEX pour le positionnage - nodeIdx pour positionner par rapport aux autres...
				if(relativeNodeIdx!==undefined){ obj.idx = (role=='assayed')? _this.graph.nodes[relativeNodeIdx].idx +1: _this.graph.nodes[relativeNodeIdx].idx -1;}
				else{ obj.idx = (role=='assayed')? 0: -1;} //premiers noeuds du graphe

				obj.nodeIdx = _this.graph.nodes.length;
				_this.graph.nodes.push(obj);
				currentNodeIdx = obj.nodeIdx;
			}
			else{
				currentNodeIdx = dejaOnGraphNodeIdx;
			}
			_.forEach(_this.graph.nodes,function(n,i){ n.current = (i == currentNodeIdx)?true:false;});
			return currentNodeIdx;

		}
	};
}]);
