/*global angular */
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
 * @name publicSourcedataApp.directive:sdTag
 * @description
 * # sdTag
 */
angular.module('publicSourcedataApp')
  .directive('sdTag', ['$filter','$document','$window', function ($filter,$document,$window) {
    return {
		restrict: 'E',
		link: function(scope,element){

			function offset(elm) {
			  try {return elm.offset();} catch(e) {}
			  var rawDom = elm[0];
			  var _x = 0;
			  var _y = 0;
			  var body = document.documentElement || document.body;
			  var scrollX = window.pageXOffset || body.scrollLeft;
			  var scrollY = window.pageYOffset || body.scrollTop;
			  _x = rawDom.getBoundingClientRect().left + scrollX;
			  _y = rawDom.getBoundingClientRect().top + scrollY;
			  return { left: _x, top: _y };
			}


			function onClickAction($event){
				if($event.target.tagName != 'SD-TAG'){
					if($('#sdTag-popover')[0]){
						$('#sdTag-popover')[0].remove();

					}
					angular.element($window).off('click', onClickAction);
				}
			}

			var tag_id = element.attr('id').replace("sdTag","");
			var tags = $filter('filter')(scope.panel.figure.panels,{panel_id:scope.panel.current_panel_id})[0].tags;
			angular.forEach(tags,function(paperTag){
				if(paperTag.id == tag_id){
					angular.element(element).removeAttr('class');
					angular.element(element).attr('popover-placement','top');
					angular.element(element).attr('popover-title',(paperTag.external_names && paperTag.external_names.length && paperTag.external_names[0]) ? paperTag.external_names[0] : paperTag.text + "("+paperTag.type+")");
					angular.element(element).attr('popover-html',"<dl><dt>External ids</dt><dd>"+$filter('printExternalIds')(paperTag)+"</dd><dt>External names</dt><dd>"+$filter('printExternalNames')(paperTag)+"</dd><dt>Taxon</dt><dd>"+$filter('printTaxon')(paperTag)+"</dd></dl>");
					// angular.element(element).attr('popover-trigger','mouseenter');
					angular.element(element).attr('popover-animation', 'false');
					angular.element(element).attr('popover-popup-delay','500');
					if(paperTag.role) element.addClass(paperTag.role);
					if(paperTag.type) element.addClass(paperTag.type);
					if(paperTag.category) element.addClass(paperTag.category);
					// $compile(angular.element(element.contents()))(scope);
					element.css('cursor','pointer');
					element.bind('click',function(){
						if($('#sdTag-popover')[0]){
							$('#sdTag-popover')[0].remove();
						}
						var position = offset(element);
						var left = position.left - 50;
						var top = position.top - 205;
						var body = $document.find('body').eq(0);
						var popover = angular.element("<dl id = 'sdTag-popover'><dt>External ids</dt><dd>"+$filter('printExternalIds')(paperTag)+"</dd><dt>External names</dt><dd>"+$filter('printExternalNames')(paperTag)+"</dd><dt>Taxon</dt><dd>"+$filter('printTaxon')(paperTag)+"</dd></dl>");
						popover.css('position','absolute');
						popover.css('left',left+"px");
						popover.css('top',top+"px");
						popover.css('height','200px');
						popover.css('width','140px');
						popover.css('border','1px solid rgba(0, 0, 0, .2)');
						popover.css('border-radius','6px');
						popover.css('background-color','white');
						popover.css('box-shadow','0 5px 10px rgba(0, 0, 0, .2)');
						popover.css('z-index','1000');
						popover.css('padding','9px');
						body.append(popover);

						angular.element($window).on('click', onClickAction);

					});
				}
			});
		}
    };
  }
])
	
.directive('displayEntity',[function(){
  return {
		templateUrl:'views/partials/displayEntity.html',
		scope:{tag:'=',sep:'=',extra:'=', from:'='},
		restrict: 'E',
		link: function(scope,element){
			
			// console.info(scope.tag);
			scope.tag.showRawText = !scope.tag.label || (scope.tag.paper_raw_text && scope.tag.paper_raw_text.toLowerCase().indexOf(scope.tag.label.toLowerCase())==-1);
			// console.info("enti",scope.tag,scope.sep,scope.extra);
		}
	}
}]);

