/*global angular, _*/
(function(){
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
	* @ngdoc filter
	* @name publicSourcedataApp.filter:tagFilters
	* @function
	* @description
	* # tagFilters
	* Filter in the publicSourcedataApp.
	*/
	angular.module('publicSourcedataApp')
	.filter('tagExtId',function(){
		return function(tag,idx){
			if(!tag.external_ids || !tag.external_ids.length) return "";
			var database = tag.external_databases[idx];
			if(database == "Gene Ontology") database = "GO";
			var re = new RegExp(database+":?","i");
			return database + ":" + tag.external_ids[idx].replace(re,"")+" ";
		};
	})
	.filter('printExternalIds', function () {
		return function (tag) {
			var texts = [];
			var url;
			if(tag.external_ids !== undefined && tag.external_ids.length){
				for(var i = 0; i < tag.external_ids.length; i++){
					if(tag.external_ids[i].toLowerCase().indexOf(tag.external_databases[i].toLowerCase()) == -1){
						url = (tag.external_urls && tag.external_urls[i]) ? tag.external_urls[i]+tag.external_ids[i] : "";
						texts.push("<a href = '"+url+"' target = '_blank'>"+tag.external_databases[i]+": "+tag.external_ids[i]+"</a>");
					}
					else{
						url = (tag.external_urls && tag.external_urls[i]) ? tag.external_urls[i]+tag.external_ids[i].split(":")[1] : "";
						texts.push("<a href = '"+url+"' target = '_blank'>"+tag.external_ids[i]+"</a>");
					}

				}
			}
			return texts.join("; ") || 'Not normalized';
		};
	})
	.filter('printExternalNames', function () {
		return function (tag) {
			if(tag.external_names !== undefined && tag.external_names.length){
				return tag.external_names.join("; ");
			}
			return "";
		};
	})
	.filter('printTaxon', function () {
		return function (tag) {
			var texts = "";
			if(tag.external_tax_names !== undefined && tag.external_tax_names.length){
				texts = _.uniq(tag.external_tax_names).join("; ");
			}
			return texts;
		};
	})
	.filter('unique', function () {
		return function (array,filter) {
			var unique = [], keys = [];
			if(!angular.isArray(array)) return array;
			angular.forEach(array,function(entry){
				if(entry.hasOwnProperty(filter) && keys.indexOf(entry[filter]) == -1){
					keys.push(entry[filter]);
					unique.push(entry);
				}
			});
			return unique;
		};
	})
	.filter('firstAuthor',function(){
		return function(author_list){
			if(!author_list){return};
			var authors = author_list.split(/[;,]/);
			return authors[0]+" et al.";
		};
	})
	.filter('uniqueTagTexts',function(){
		return function(tags){
			var unique = [], keys = [];
			if(!angular.isArray(tags)) return tags;
			angular.forEach(tags,function(tag){
				var key = (tag.external_names && tag.external_names[0]) || tag.text;
				if(keys.indexOf(key) == -1){
					keys.push(key);
					unique.push(tag);
				}
			});
			return unique;
		};
	})
	.filter('tagPopover',['$filter',function($filter){
		return function(tag){
			var extIds = $filter('printExternalIds')(tag);
			var taxon = $filter('printTaxon')(tag);
			var popoverHtml = '<dl class="dlPopover"><dt>id</dt><dd>'+tag.tag_id+'</dd><dt>type</dt><dd>'+tag.type+'</dd>';
			if(extIds){ popoverHtml += '<dt>External ids</dt><dd>'+extIds+'</dd>';}
			if(taxon){ popoverHtml += '<dt>Taxon</dt><dd>'+taxon+'</dd>';}
			popoverHtml += '</dl>';
			return popoverHtml;
		};
	}])
	.filter('similarSearchFilter',function(){
		return function(panels,searchScope,paper_id){
			if(searchScope.similarSearchScope !== undefined){
				paper_id = searchScope.paper_id;
				searchScope = searchScope.similarSearchScope;
			}
			if(searchScope == 'global') return panels.filter(function(p){return p.paper.paper_id != paper_id;});
			else{
				return (panels.filter(function(p){return p.paper.paper_id == paper_id;}));
			}
		};
	});

})();

