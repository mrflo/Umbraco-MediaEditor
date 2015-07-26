app.requires.push('ngTable');
app.requires.push('angularFileUpload');

angular.module("umbraco").controller("MediaEditorController",
    function ($scope, $window, $http, $routeParams, $route, $filter, $q, dialogService, ngTableParams, FileUploader) {

        console.log("Loaded MediaEditorController...");
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


  