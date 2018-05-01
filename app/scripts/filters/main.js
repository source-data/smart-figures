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
 * @name publicSourcedataApp.filter:main
 * @function
 * @description
 * # main
 * Filter in the publicSourcedataApp.
 */
angular.module('publicSourcedataApp')
.filter('splitDot', function () {
  return function (input) {
	return input.replace(/\.\s+/g,".<br>");
  };
})
.filter('displayCategory', function () {
  return function (array,input) {
		if(array.length){			
			var tmp = _.filter(array,function(type){return type.value == input;});
			return tmp[0].print;
		}
  };
})
.filter('displayImg', function () {
    return function (array,input) {
			if(array.length){				
        var tmp = _.filter(array,function(type){return type.value == input;});
        return tmp[0].value;
			}
    };
})
.filter('filterTypes', function () {
  return function (array,current) {
		if(array.length){			
      return _.filter(array,function(d){return d.type==0 || d.name==current.name;});
		}
  };
})
.filter('availableFilterTypes', function () {
  return function (list, current,idx) {
		if (!list || !current){return false;}
		var current_filter_type = (idx!==undefined) ? current[idx].type : null;
		var used_filters = _.map(current,'type');
		var available_filters = _.filter(list,function(t){
			return (!_.includes(used_filters,t) || (current_filter_type && current_filter_type ==t)) && t!='status';
		});
		return available_filters;
  };
})

.filter('unique', ['_',function(_) {
	return function (arr, field) {
	    return _.uniq(arr, function(a) { return a[field]; });
	};
}]);
