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
    .controller('PanelCtrl', ['$scope', '$location', '$filter', '$timeout', '$rootScope', 'panel', 'Search', 'Filter', 'ENV', 'Restangular', 'localStorageService', 'Navigation', '_', 'Authentication', function ($scope, $location, $filter, $timeout, $rootScope, panel, Search, Filter, ENV, Restangular, localStorageService, Navigation, _, Authentication) {


        //-M------ MAIN ------//
        $scope.inIFrame = (window.self !== window.top);
        $scope.serverURL = ENV.serverURL;
        $scope.panel = panel;

        formatPanel();
        function formatPanel() {
            var panelIdx = _.findIndex($scope.panel.figure.panels, function (p) {
                return p.panel_id == $scope.panel.current_panel_id;
            });
            var p = $scope.panel.figure.panels[panelIdx];
            $scope.panel.currentPanelIdx = panelIdx;
        }

        $scope.tags = _.filter(panel.figure.panels, function (p) {
            return p.panel_id == panel.current_panel_id;
        })[0].tags;

        angular.forEach(_.uniq($scope.tags, function (t) {
            return t.type + ":" + t.text;
        }), function (tag) {
            tag.nbResults = 0;
            var rest;
            var type = (tag.type) ? (tag.type == 'gene' || tag.type == 'protein') ? 'gene,protein' : tag.type : "";
            var tagQuery = (type) ? type + ":" + tag.text : tag.text;
            if (tag.role == 'assayed') {
                rest = Restangular.one('nbIntervention', tagQuery.replace("/", "##")).get();
            }
            else if (tag.role == 'intervention') {
                rest = Restangular.one('nbAssayed', tagQuery.replace("/", "##")).get();
            }
            if (rest) rest.then(function (data) {
                angular.forEach($scope.tags, function (t, tidx) {
                    if (t.type == tag.type && t.text == tag.text) {
                        $scope.tags[tidx].nbResults = +data;
                    }
                });
            });
        });

        $scope.assayBadges = [];
        angular.forEach($scope.tags, function (t) {
            if (t.category == "assay" && t.external_names) {
                $scope.assayBadges.push(t.external_names);
            }
        });


        var figIdx = _.findIndex($scope.panel.paper.figures, function (figure) {
            return figure.label == $scope.panel.figure.label;
        });
        $scope.panel.nextPreviousFig = {
            'previous': (figIdx === 0) ? null : figIdx - 1,
            'next': (figIdx === $scope.panel.paper.figures.length - 1) ? null : figIdx + 1
        };
        $scope.similarLimit = 3;
        $scope.carouselIndex = 0;
        $scope.similarPanels = [];
        $scope.similarCollections = [];
        $scope.similarSearchScope = 'global';
        $scope.showSimilarPanels = Navigation.showSimilarPanels;

        //-F------ TOGGLE SHOW SIMILAR PANELS------//
        $scope.toggleShowSimilarPanels = function () {
            Navigation.showSimilarPanels = !Navigation.showSimilarPanels;
            $scope.showSimilarPanels = !$scope.showSimilarPanels;
        };

        //-F------ GET SIMILAR COLLECTION------//
        $scope.getSimilarCollections = function (searchScope) {
            $scope.similarSearchScope = searchScope;
            $scope.similarCollections = [];
            $scope.carouselIndex = 0;
            var visiblePanels = $filter('similarSearchFilter')($scope.similarPanels, {
                similarSearchScope: searchScope,
                paper_id: panel.paper.paper_id
            });
            visiblePanels = $filter('limitTo')(visiblePanels, $scope.similarLimit);
            var collection = [];
            for (var i = 0; i < visiblePanels.length; i++) {
                collection.push(visiblePanels[i]);
                if (collection.length == 3) {
                    $scope.similarCollections.push(collection);
                    collection = [];
                }
            }
            if (collection.length) $scope.similarCollections.push(collection);
        };

        //-M------ MAIN : similar panels ------//
        Restangular.one('panel', panel.current_panel_id).get({get_similar: true}).then(function (data) {
            $scope.similarPanels = data;
            _.map($scope.similarPanels, function (panel, idx) {
                $scope.similarPanels[idx].paper.showTitle = false;
            });

            // if no similar panels found in this paper, show global search by default
            // $scope.similarSearchScope = ($filter('similarSearchFilter')($scope.similarPanels,{similarSearchScope:'paper',paper_id: panel.paper.paper_id}).length) ? "paper" : "global";
            $scope.similarSearchScope = ($filter('similarSearchFilter')($scope.similarPanels, {
                similarSearchScope: 'global',
                paper_id: panel.paper.paper_id
            }).length) ? "global" : "paper";
            $scope.getSimilarCollections($scope.similarSearchScope);
        });

        //-F------ SET SIMILAR INDEX : when use?? ------//
        $scope.setSimilarIndex = function (cnt) {
            $scope.carouselIndex += cnt;
            $scope.test += cnt;
        };

        //-M------ MAIN ------//
        $scope.view = 'panel';
        $scope.panelHistoryView = 'panel';
        if ($location.search().intervention) $scope.view = 'downstream';
        else if ($location.search().assayed) $scope.view = 'upstream';
        $scope.searchParams = Search.searchParams;
        $scope.searchParams.result = null;
        $scope.searchParams.done = false;

        // history
        Navigation.currentPanelId = panel.current_panel_id;
        if (Navigation.graph.nodes.length) {
            $scope.graph = Navigation.graph;
        }
        else {
            if (localStorageService.get('graph')) {
                Navigation.graph = localStorageService.get('graph');
                $scope.graph = Navigation.graph;
            }
        }

        $scope.panelHistoryView = 'panel';
        $scope.currentTag = {};

        //-F------ CHANGE VIEW : PANEL, SUMMARY or HISTORY-----//
        $scope.changePanelHistoryView = function (cas) {
            if (cas == 'history') $scope.closeNav();
            $scope.panelHistoryView = cas;
        };

        //-F------ show SIMILAR PANELS------//
        $scope.showAllSimilarPanels = function () {
            $scope.similarLimit = $scope.similarPanels.length;
            $scope.getSimilarCollections($scope.similarSearchScope);
        };

        //-F------ Change panel => reload this page ------//
        $scope.setPanel = function (panel_id) {
            Filter.removeAll();
            $location.path('panel/' + panel_id);
        };

        //-F------ SET SEARCH FORM => change location search => on route update------//
        $scope.setSearchForm = function (tag, direction, perform) { // tag button is clickable only when view !== "panel" => use of perform to abort the function.
            if (!perform) return;
            $scope.currentTag = tag;
            var type;
            if (direction == 'downstream') {
                type = (tag.type) ? (tag.type == 'gene' || tag.type == 'protein') ? 'gene,protein:' : tag.type + ":" : "";
                $location.search('intervention', type + tag.text);
                $location.search('assayed', null);
            }
            else if (direction == 'upstream') {
                type = (tag.type) ? (tag.type == 'gene' || tag.type == 'protein') ? 'gene,protein:' : tag.type + ":" : "";
                // type = (tag.type) ? tag.type+":" : "";
                $location.search('assayed', type + tag.text);
                $location.search('intervention', null);
            }
            else {
                $location.search('assayed', null);
                $location.search('intervention', null);
            }
            Navigation.addSuppLink(tag, direction);
            Filter.removeAll();
            $scope.view = direction;
        };

        //-W------ WATCH VIEW => go to left or right or center ------//
        var x = -31.25;
        $scope.$watch('view', function (n) {
            x = -31.25;
            if (n == 'upstream') {
                x = 0;
            }
            else if (n == 'downstream') {
                x = -62.5;
            }
            $('#sliderContainer')[0].style.transform = 'translate(' + x + '%,0)';
        });

        //-M------ MAIN ------//
        $timeout(function () {
            $('#sliderContainer')[0].style.transform = 'translate(' + x + '%,0)';
        });

        //-F------ CLOSE NAV ------//
        $scope.closeNav = function () {
            $scope.view = 'panel';
            $location.search({});
        };


        //-F------ SEARCH ------//
        var search = function () {
            if (!angular.equals($location.search(), {})) {
                var tag = "";
                var cas;
                if ($location.search().intervention) {
                    cas = 'intervention';
                    $scope.view = 'downstream';
                    tag = $location.search().intervention;
                }
                else if ($location.search().assayed) {
                    cas = 'assayed';
                    $scope.view = 'upstream';
                    tag = $location.search().assayed;
                }
                if (tag) {
                    var parts = tag.split(":");
                    var type = (parts.length == 2) ? parts[0] : "";
                    var text = (parts.length == 2) ? parts[1] : parts[0];
                }
                var p = _.filter($scope.panel.figure.panels, function (p) {
                    return p.panel_id == $scope.panel.current_panel_id;
                })[0];
                var paperTag = _.filter(p.tags, function (t) {
                    return t.text == text && (t.type == type || !type);
                })[0];
                if (paperTag) $scope.currentTag = paperTag;
                Search.search().then(function () {
                    Filter.removeAll();
                    Filter.init();  // initiate filters to populate auto-complete
                });
            }
            else {
                $scope.view = 'panel';
                $scope.searchParams.result = null;
                Filter.removeAll();
                Filter.init();
            }
        };

        //-M------ MAIN : search ------//
        search();

        //-O------ ON ROUTE UPDATE ------//
        $scope.$on('$routeUpdate', function () {
            search();
        });
        $scope.$on('$routeChangeSuccess', function () {
            search();
        });

        //-O------ ON NAVIGATION UPDATE ------//
        $scope.$on('navigation.updated', function () {
            $scope.graph = Navigation.graph;
            localStorageService.set('graph', Navigation.graph);
        });

        //-F------ CLEAR GRAPH HISTORY------//
        $scope.clearHistory = function () {
            $scope.panelHistoryView = 'panel';
            Navigation.initGraph();
        };

        //-F------ NEW SEARCH------//
        $scope.newSearch = function () {
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


//==================== SUMMARY VIEW ===============================//

        // ====== HAS EXT ID AND SAME EXT ID ==========
        var hasExtIdANDsameExternalId = function (tag1, tag2, sameStatus) {

            if (!tag1.external_id || !tag2.external_id) return false;
            var filterExtId1 = _.filter(tag1.external_id, function (tag1Ext) {
                return tag1Ext.status != 'rejected' && tag1Ext.status != 'deleted';
            });
            var filterExtId2 = _.filter(tag2.external_id, function (tag2Ext) {
                return tag2Ext.status != 'rejected' && tag2Ext.status != 'deleted';
            });

            if (!filterExtId1.length || !filterExtId2.length) return false;

            var extIdTag1 = _.map(filterExtId1, function (tag1Ext) {
                return tag1Ext.database_id + '-' + tag1Ext.id + ((sameStatus) ? ('-' + tag1Ext.status) : '');
            });
            var extIdTag2 = _.map(filterExtId2, function (tag2Ext) {
                return tag2Ext.database_id + '-' + tag2Ext.id + ((sameStatus) ? ('-' + tag2Ext.status) : '');
            });

            var diff = _.difference(extIdTag1, extIdTag2);

            return (diff.length) ? false : true;
        };

        // ====== GET CONDENSED TAGS ========== used in tag_list
        var getCondensedTags = function (allTags, sameRole, sameStatus, sameExternalStatus) {
            if (!sameRole) sameRole = false;
            if (!sameStatus) sameStatus = false;
            if (!sameExternalStatus) sameExternalStatus = false;
            var condensedTags = [];
            var sameTags = {};

            angular.forEach(angular.copy($scope.tags), function (tag) {

                var already = false;
                if (condensedTags.length > 0) {
                    angular.forEach(condensedTags, function (cTag, cTagIdx) {

                        //condition to condense c1 : same external id or c2 : same text-taxon-no extid + c3 : same type and role + c4 : same status
                        //c1 = same external ids.
                        var c1 = hasExtIdANDsameExternalId(cTag, tag, sameExternalStatus);

                        //c2 = same text AND (same taxon OR no taxon) and no external ids
                        var c2 = false;
                        var c2_text = cTag.text.toLowerCase() == tag.text.toLowerCase();
                        var c2_taxon = (cTag.taxon && tag.taxon && cTag.taxon.tax_id == tag.taxon.tax_id) || ((!cTag.taxon || !cTag.taxon.tax_id) && (!tag.taxon || !tag.taxon.tax_id));
                        var c2_external_id = ((!cTag.external_id || !cTag.external_id.length) && (!tag.external_id || !tag.external_id.length));
                        c2 = c2_text && c2_taxon && c2_external_id;

                        //c3 : same type/category and role
                        var c3SameTandR = (tag.type && cTag.type == tag.type && cTag.role == tag.role) || (tag.category && cTag.category == tag.category);
                        if (!sameRole) c3SameTandR = (tag.type && cTag.type == tag.type) || (tag.category && cTag.category == tag.category);

                        //c4 : same tag status
                        var c4SameStatus = true;
                        if (sameStatus) c4SameStatus = (tag.status == cTag.status);

                        if (c4SameStatus && c3SameTandR && (c1 || c2)) {
                            if (!cTag.futurText) cTag.futurText = [cTag.text];
                            if (_.map(cTag.futurText, function (t) {
                                    return t.toLowerCase()
                                }).indexOf(tag.text.toLowerCase()) < 0) cTag.futurText.push(tag.text);
                            if (sameTags[cTag.id]) {
                                sameTags[cTag.id].nb += 1;
                                sameTags[cTag.id].ids.push(tag.paper_tag_id);
                                if (cTag.panel_label != tag.panel_label && sameTags[cTag.id].panels.indexOf(tag.panel_label) < 0)sameTags[cTag.id].panels.push(tag.panel_label);
                            }
                            else {
                                var panels = [];
                                if (cTag.panel_label != tag.panel_label) panels.push(tag.panel_label);
                                sameTags[cTag.id] = {
                                    'nb': 2,
                                    'ids': [cTag.paper_tag_id, tag.paper_tag_id],
                                    'panels': panels
                                };
                            }
                            var newIsDefault = false;
                            angular.forEach(tag.external_id, function (tagExtId) {
                                if (tagExtId.status == 'default') newIsDefault = true;
                            });
                            if (newIsDefault) {
                                sameTags[tag.id] = sameTags[cTag.id];
                                delete sameTags[cTag.id];
                                condensedTags[cTagIdx] = tag;
                            }
                            if (tag.status == 'created' && condensedTags[cTagIdx].status != 'created') condensedTags[cTagIdx].status = tag.status;
                            already = true;
                        }
                    });
                }
                if (!already) {
                    condensedTags.push(tag);
                }
            });
            if (sameTags) {
                angular.forEach(condensedTags, function (ctag) {
                    if (ctag.futurText && ctag.futurText.length > 1) ctag.text = ctag.futurText.join(", ");
                    if (sameTags[ctag.id]) {
                        ctag.condensedIds = sameTags[ctag.id].ids;
                        ctag.condensedPanels = sameTags[ctag.id].panels;
                        ctag.condensedNumber = sameTags[ctag.id].nb;
                    }
                    if (!ctag.condensedNumber) ctag.condensedNumber = 1;
                    if (ctag.status == 'validated') ctag.approved = true;
                });
            }

            return condensedTags;
        };

        //-F------ HAS EXT ID AND SAME EXT ID => get condensed tag && summary view -----//
        var hasExtIdANDsameExternalId_old = function (tag1, tag2) {
            if (!tag1.external_id || !tag2.external_id) return false;
            if (tag1.external_id.length < 1 || tag2.external_id.length < 1) return false;
            // if(tag1.external_id.length !== tag2.external_id.length) return false;
            else {
                if (angular.equals(tag1.external_id, tag2.external_id)) return true;
                else {
                    var found1 = null, found2 = null;
                    angular.forEach(tag1.external_id, function (extId1) {
                        if (extId1.status == 'rejected' || extId1.status == 'deleted') found1 = true;
                        else {
                            found1 = false;
                            angular.forEach(tag2.external_id, function (extId2) {
                                if (extId1.id == extId2.id) found1 = true;
                            });
                        }
                    });
                    angular.forEach(tag2.external_id, function (extId2) {
                        if (extId2.status == 'rejected' || extId2.status == 'deleted') found2 = true;
                        else {
                            found2 = false;
                            angular.forEach(tag1.external_id, function (extId1) {
                                if (extId1.id == extId2.id) found2 = true;
                            });
                        }
                    });
                    if (found1 && found2) return true;
                }
                return false;
            }
        };

        //-F------  GET CONDENSED TAG => summary View ------//
        var getCondensedTags_old = function () {
            var condensedTags = [];
            var sameTags = {};
            angular.forEach(angular.copy($scope.tags), function (tag) {
                var already = false;
                if (condensedTags.length > 0) {
                    angular.forEach(condensedTags, function (cTag, cTagIdx) {
                        //condition to condense
                        var c1 = hasExtIdANDsameExternalId(cTag, tag);
                        var c2 = false;
                        var c4SameStatus = true;
                        c2 = cTag.text == tag.text && (cTag.taxon && cTag.taxon.tax_id == tag.taxon.tax_id) && !cTag.external_id.length && !tag.external_id.length;

                        var c3SameTandR = (tag.type && cTag.type == tag.type && cTag.role == tag.role) || (tag.category && cTag.category == tag.category);
                        c3SameTandR = (tag.type && cTag.type == tag.type) || (tag.category && cTag.category == tag.category);

                        if (c4SameStatus && c3SameTandR && (c1 || c2)) {
                            if (!cTag.futurText) cTag.futurText = [cTag.text];
                            if (cTag.futurText.indexOf(tag.text) < 0) cTag.futurText.push(tag.text);
                            if (sameTags[cTag.id]) {
                                sameTags[cTag.id].nb += 1;
                                sameTags[cTag.id].ids.push(tag.paper_tag_id);
                                if (cTag.panel_label != tag.panel_label && sameTags[cTag.id].panels.indexOf(tag.panel_label) < 0)sameTags[cTag.id].panels.push(tag.panel_label);
                            }
                            else {
                                sameTags[cTag.id] = {'nb': 2, 'ids': [cTag.paper_tag_id, tag.paper_tag_id]};
                            }
                            var newIsDefault = false;
                            if (newIsDefault) {
                                sameTags[tag.id] = sameTags[cTag.id];
                                delete sameTags[cTag.id];
                                condensedTags[cTagIdx] = tag;
                            }
                            if (tag.status == 'created' && condensedTags[cTagIdx].status != 'created') condensedTags[cTagIdx].status = tag.status;
                            already = true;
                        }
                    });
                }
                if (!already) {
                    condensedTags.push(tag);
                }
            });
            if (sameTags) {
                angular.forEach(condensedTags, function (ctag) {
                    if (ctag.futurText && ctag.futurText.length > 1) ctag.text = ctag.futurText.join(", ");
                    if (sameTags[ctag.id]) {
                        ctag.condensedIds = sameTags[ctag.id].ids;

                        ctag.condensedPanels = sameTags[ctag.id].panels;
                        ctag.condensedNumber = sameTags[ctag.id].nb;
                    }
                    if (!ctag.condensedNumber) ctag.condensedNumber = 1;
                    if (ctag.status == 'validated') ctag.approved = true;
                });
            }

            return condensedTags;
        };

        //-F------ GET SUMMARY VIEW------//
        var getSummaryView = function (currentTags) {
            var summaryView = {
                component: [],
                experiment: [],
                intervention: [],
                reporter: [],
                normalizing: [],
                assayed: [],
                assay: [],
                trash: []
            };
            angular.forEach(currentTags, function (tag) {
                if (tag.external_id) {
                    tag.tooltipContent = (tag.external_id.length > 1) ? "<ul style='padding:0 0 0 10px;margin:0'>" : "";
                    angular.forEach(tag.external_id, function (extId, idx) {
                        if (extId) {
                            var id = $filter('tagExtId')(tag, idx);
                            tag.tooltipContent += (tag.external_id.length > 1) ? "<li>" + id + "</li>" : id;
                        }
                    });
                    tag.tooltipContent += (tag.external_id.length > 1) ? "</ul>" : "";
                }
                else tag.tooltipContent = '';
                if (tag.status != 'rejected' && tag.role == "component")    summaryView.component.push(tag);
                if (tag.status != 'rejected' && tag.role == "experiment")    summaryView.experiment.push(tag);
                if (tag.status != 'rejected' && tag.role == "intervention")    summaryView.intervention.push(tag);
                if (tag.status != 'rejected' && tag.role == "reporter")    summaryView.reporter.push(tag);
                if (tag.status != 'rejected' && tag.role == "normalizing")    summaryView.normalizing.push(tag);
                if (tag.status != 'rejected' && tag.role == "assayed")    summaryView.assayed.push(tag);
                if (tag.status != 'rejected' && !tag.role && tag.category)    summaryView.assay.push(tag);
                if (tag.status == 'rejected')    summaryView.trash.push(tag);
            });
            summaryView.assay = _.uniq(summaryView.assay, function (tag) {
                return tag.tooltipContent + tag.text;
            });
            summaryView.component = _.uniq(summaryView.component, function (tag) {
                return tag.tooltipContent + tag.text;
            });
            summaryView.experiment = _.uniq(summaryView.experiment, function (tag) {
                return tag.tooltipContent + tag.text;
            });
            summaryView.intervention = _.uniq(summaryView.intervention, function (tag) {
                return tag.tooltipContent + tag.text;
            });
            summaryView.reporter = _.uniq(summaryView.reporter, function (tag) {
                return tag.tooltipContent + tag.text;
            });
            summaryView.normalizing = _.uniq(summaryView.normalizing, function (tag) {
                return tag.tooltipContent + tag.text;
            });
            summaryView.assayed = _.uniq(summaryView.assayed, function (tag) {
                return tag.tooltipContent + tag.text;
            });
            summaryView.trash = _.uniq(summaryView.trash, function (tag) {
                return tag.tooltipContent + tag.text;
            });
            return summaryView;

        };

        //-M------ MAIN => summary view------//
        var panelTags = getCondensedTags();
        $scope.summaryView = getSummaryView(panelTags);

        $scope.downloadPanel = function (panel_doc_id) {
            if (panel_doc_id) {
                self.location.href = $scope.serverURL + "/index.php/panel/" + $scope.panel.current_panel_id + "/" + panel_doc_id + "/export?authdata=" + Authentication.currentUser.authdata;
            }
            else {
                self.location.href = $scope.serverURL + "/index.php/panel/" + $scope.panel.current_panel_id + "/export?authdata=" + Authentication.currentUser.authdata;
            }
        };

//------- FILTERS ------//
        $scope.searchParams.displayedResult = Search.searchParams.displayedResult;

        $scope.addNewFilterItem = function () {
            Filter.filtercollection.subitems.push({});
            $rootScope.$broadcast('new.filter', {});
        };
        $scope.removeFilterItem = function (i, type, currFilt) {
            Filter.filters[type].value = 0;
            Filter.filters[type].type = 0;
            Filter.filtercollection.subitems.splice(i, 1);
            var result = Filter.apply(currFilt);
            $scope.searchParams.displayedResult = result;
        };

        //adjust displayed results when adding or removing filter
        $scope.applyFilter = function (currFilt) {
            var result = Filter.apply(currFilt);
            $scope.searchParams.displayedResult = result;
            $scope.searchParams.summary = Search.getSummary();
        };
        $scope.filtercollection = Filter.filtercollection;

        $scope.trackSelections = function (currFilt) {
            $scope.searchParams.displayedResult = Filter.trackSelections(currFilt);
        };


    }]);
