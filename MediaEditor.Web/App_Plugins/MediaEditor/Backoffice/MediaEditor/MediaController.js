app.requires.push('ngTable');
app.requires.push('angularFileUpload');

angular.module("umbraco").controller("MediaEditorController",
    function ($scope, $window, $http, $routeParams, $route, $filter, $q, dialogService, ngTableParams, FileUploader, $templateCache) {

        console.log("Loaded MediaEditorController...");

        if (Umbraco.Sys.ServerVariables.isDebuggingEnabled) {
            // cache templates as Umbraco clears template cache when debugging is enabled
            $templateCache.put('ng-table/filters/select-multiple.html', '<select ng-options="data.id as data.title for data in column.data" multiple ng-multiple="true" ng-model="params.filter()[name]" ng-show="filter==\'select-multiple\'" class="filter filter-select-multiple form-control" name="{{column.filterName}}"> </select>');
            $templateCache.put('ng-table/filters/select.html', '<select ng-options="data.id as data.title for data in column.data" ng-model="params.filter()[name]" ng-show="filter==\'select\'" class="filter filter-select form-control" name="{{column.filterName}}"> </select>');
            $templateCache.put('ng-table/filters/text.html', '<input type="text" name="{{column.filterName}}" ng-model="params.filter()[name]" ng-if="filter==\'text\'" class="input-filter form-control"/>');
            $templateCache.put('ng-table/header.html', '<tr> <th ng-repeat="column in $columns" ng-class="{ \'sortable\': parse(column.sortable), \'sort-asc\': params.sorting()[parse(column.sortable)]==\'asc\', \'sort-desc\': params.sorting()[parse(column.sortable)]==\'desc\' }" ng-click="sortBy(column, $event)" ng-show="column.show(this)" ng-init="template=column.headerTemplateURL(this)" class="header {{column.class}}"> <div ng-if="!template" ng-show="!template" ng-bind="parse(column.title)"></div> <div ng-if="template" ng-show="template"><div ng-include="template"></div></div> </th> </tr> <tr ng-show="show_filter" class="ng-table-filters"> <th ng-repeat="column in $columns" ng-show="column.show(this)" class="filter"> <div ng-repeat="(name, filter) in column.filter"> <div ng-if="column.filterTemplateURL" ng-show="column.filterTemplateURL"> <div ng-include="column.filterTemplateURL"></div> </div> <div ng-if="!column.filterTemplateURL" ng-show="!column.filterTemplateURL"> <div ng-include="\'ng-table/filters/\' + filter + \'.html\'"></div> </div> </div> </th> </tr>');
            $templateCache.put('ng-table/pager.html', '<div class="ng-cloak ng-table-pager"> <div ng-if="params.settings().counts.length" class="ng-table-counts btn-group pull-right"> <button ng-repeat="count in params.settings().counts" type="button" ng-class="{\'active\':params.count()==count}" ng-click="params.count(count)" class="btn btn-default"> <span ng-bind="count"></span> </button> </div> <ul class="pagination ng-table-pagination"> <li ng-class="{\'disabled\': !page.active}" ng-repeat="page in pages" ng-switch="page.type"> <a ng-switch-when="prev" ng-click="params.page(page.number)" href="">&laquo;</a> <a ng-switch-when="first" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a> <a ng-switch-when="page" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a> <a ng-switch-when="more" ng-click="params.page(page.number)" href="">&#8230;</a> <a ng-switch-when="last" ng-click="params.page(page.number)" href=""><span ng-bind="page.number"></span></a> <a ng-switch-when="next" ng-click="params.page(page.number)" href="">&raquo;</a> </li> </ul> </div> ');
        }


        $scope.feedback = {};
        $scope.feedback.message = "Loading...";

        var mediarootId = $routeParams.id;

        var dataUrl = "/umbraco/backoffice/MediaEditor/MediaEditor/GetMedias?mediaId="+mediarootId;
        var data;

        // Ajax request to controller for data-
        $http.get(dataUrl).success(function (data) {

            $scope.tableParams = new ngTableParams({
                page: 1,            // show first page
                count: 25,          // count per page
                sorting: {
                    Name: 'desc'     // initial sorting
                },
                filter: {
                    Message: ''       // initial filter
                }
            }, {
                total: data.length,
                getData: function ($defer, params) {

                    var filteredData = params.filter() ?
                            $filter('filter')(data, params.filter()) :
                            data;

                    var orderedData = params.sorting() ?
                            $filter('orderBy')(filteredData, params.orderBy()) :
                            data;

                    params.total(orderedData.length);

                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));

                    if (orderedData.length > 0) {
                        $scope.feedback.message = '';
                    } else {
                        $scope.feedback.message = 'No medias found matching your criteria';
                    }

                }
            })

        }).error(function (data, status, headers, config) {
            $scope.feedback.message = "Error retrieving media data for " + $routeParams.id + " :\n" + data.ExceptionMessage;
        });


        // Reload page
        $scope.reload = function () {
            //$route.params
            $route.reload();
        }

        //UPLOAD
        var uploader = $scope.uploader = new FileUploader({
            url: '/umbraco/backoffice/MediaEditor/MediaEditor/Upload'
        });

        // FILTERS

        uploader.filters.push({
            name: 'customFilter',
            fn: function (item /*{File|FileLikeObject}*/, options) {
                return this.queue.length < 10;
            }
        });

        // CALLBACKS

        uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
            console.info('onWhenAddingFileFailed', item, filter, options);
        };
        uploader.onAfterAddingFile = function (fileItem) {
            fileItem.url = fileItem.url +"?id="+ document.getElementById("uploaditem").value;
            console.info('onAfterAddingFile', fileItem);
        };
        uploader.onAfterAddingAll = function (addedFileItems) {
            console.info('onAfterAddingAll', addedFileItems);
        };
        uploader.onBeforeUploadItem = function (item) {
            console.info('onBeforeUploadItem', item);
        };
        uploader.onProgressItem = function (fileItem, progress) {
            console.info('onProgressItem', fileItem, progress);
        };
        uploader.onProgressAll = function (progress) {
            console.info('onProgressAll', progress);
        };
        uploader.onSuccessItem = function (fileItem, response, status, headers) {
            console.info('onSuccessItem', fileItem, response, status, headers);
        };
        uploader.onErrorItem = function (fileItem, response, status, headers) {
            console.info('onErrorItem', fileItem, response, status, headers);
        };
        uploader.onCancelItem = function (fileItem, response, status, headers) {
            console.info('onCancelItem', fileItem, response, status, headers);
        };
        uploader.onCompleteItem = function (fileItem, response, status, headers) {
            console.info('onCompleteItem', fileItem, response, status, headers);
        };
        uploader.onCompleteAll = function () {
            console.info('onCompleteAll');
        };

        console.info('uploader', uploader);


    });


  